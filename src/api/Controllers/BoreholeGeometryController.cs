using BDMS.Authentication;
using BDMS.Models;
using CsvHelper;
using CsvHelper.Configuration;
using CsvHelper.Configuration.Attributes;
using CsvHelper.TypeConversion;
using Humanizer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Net;

namespace BDMS.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class BoreholeGeometryController : ControllerBase
{
    private const int MaxFileSize = 210_000_000; // 1024 x 1024 x 200 = 209715200 bytes
    private readonly BdmsContext context;
    private readonly ILogger logger;
    private readonly IBoreholeLockService boreholeLockService;
    private static readonly CsvConfiguration csvConfig = new(new CultureInfo("de-CH"))
    {
        Delimiter = ";",
        IgnoreReferences = true,
        PrepareHeaderForMatch = args => args.Header.Humanize(LetterCasing.Title),
        MissingFieldFound = null,
    };
    private static readonly List<IBoreholeGeometryFormat> geometryFormats = new()
    {
        new XYZ(),
        new AzInc(),
        new PitchRoll(),
    };

    public BoreholeGeometryController(BdmsContext context, ILogger<BoreholeGeometryElement> logger, IBoreholeLockService boreholeLockService)
    {
        this.context = context;
        this.logger = logger;
        this.boreholeLockService = boreholeLockService;
    }

    [HttpGet]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IEnumerable<BoreholeGeometryElement>> GetAsync([FromQuery] int boreholeId)
    {
        return await context.BoreholeGeometry
            .AsNoTracking()
            .Where(g => g.BoreholeId == boreholeId)
            .OrderBy(g => g.Id)
            .ToListAsync().ConfigureAwait(false);
    }

    [HttpDelete]
    [Authorize(Policy = PolicyNames.Viewer)]
    public async Task<IActionResult> DeleteAsync(int boreholeId)
    {
        // Check if associated borehole is locked
        if (await boreholeLockService.IsBoreholeLockedAsync(boreholeId, HttpContext.GetUserSubjectId()).ConfigureAwait(false))
        {
            return Problem("The borehole is locked by another user or you are missing permissions.", statusCode: (int)HttpStatusCode.BadRequest);
        }

        context.BoreholeGeometry.RemoveRange(context.BoreholeGeometry.Where(g => g.BoreholeId == boreholeId));
        await context.SaveChangesAsync().ConfigureAwait(false);
        return Ok();
    }

    [HttpGet("[action]")]
    [Authorize(Policy = PolicyNames.Viewer)]
    public IList<object> GeometryFormats()
    {
        return geometryFormats.Select(f => (object)new
        {
            f.Name,
            f.Key,
            f.CsvHeader,
        }).ToList();
    }

    [HttpPost]
    [Authorize(Policy = PolicyNames.Viewer)]
    [RequestSizeLimit(int.MaxValue)]
    [RequestFormLimits(MultipartBodyLengthLimit = MaxFileSize)]
    public async Task<IActionResult> UploadBoreholeGeometry(int boreholeId, IFormFile geometryFile, [FromForm] string geometryFormat)
    {
        // Check if associated borehole is locked
        if (await boreholeLockService.IsBoreholeLockedAsync(boreholeId, HttpContext.GetUserSubjectId()).ConfigureAwait(false))
        {
            return Problem("The borehole is locked by another user or you are missing permissions.", statusCode: (int)HttpStatusCode.BadRequest);
        }

        var format = geometryFormats.SingleOrDefault(f => f.Key == geometryFormat);
        if (format == null)
        {
            return Problem("Invalid geometry format.", statusCode: (int)HttpStatusCode.BadRequest);
        }

        // convert geometry data to BoreholeGeometry
        IList<BoreholeGeometryElement> boreholeGeometry;
        try
        {
            boreholeGeometry = format.ReadCsv(geometryFile, boreholeId);
        }
        catch (Exception ex) when (ex is HeaderValidationException || ex is ReaderException || ex is TypeConverterException)
        {
            return Problem(ex.Message, statusCode: (int)HttpStatusCode.BadRequest);
        }

        // delete existing geometry data of borehole
        context.BoreholeGeometry.RemoveRange(context.BoreholeGeometry.Where(g => g.BoreholeId == boreholeId));

        // add new geometry data to database
        await context.BoreholeGeometry.AddRangeAsync(boreholeGeometry).ConfigureAwait(false);

        try
        {
            await context.SaveChangesAsync().ConfigureAwait(false);
            return Ok();
        }
        catch (Exception ex)
        {
            var errorMessage = "An error occurred while saving the borehole geometry.";
            logger?.LogError(ex, errorMessage);
            return Problem(errorMessage);
        }
    }

    private interface IBoreholeGeometryFormat
    {
        string Key { get; }
        string Name { get; }
        string CsvHeader { get; }
        IList<BoreholeGeometryElement> ReadCsv(IFormFile file, int boreholeId);
    }

    private static string GetCSVHeader<T>()
    {
        var context = new CsvContext(csvConfig);
        var map = context.AutoMap<T>();
        return string.Join("; ", map.MemberMaps.Select(m => m.Data.Names.FirstOrDefault(m.Data.Member.Name)));
    }

    private static double ToRadians(double degrees)
    {
        return degrees * Math.PI / 180;
    }

    internal sealed class XYZ : IBoreholeGeometryFormat
    {
        public string Key => "XYZ";
        public string Name => "X Y Z";
        private Lazy<string> expectedCsvHeader = new(GetCSVHeader<Geometry>);
        public string CsvHeader => expectedCsvHeader.Value;

        public IList<BoreholeGeometryElement> ReadCsv(IFormFile file, int boreholeId)
        {
            using var reader = new StreamReader(file.OpenReadStream());
            using var csv = new CsvReader(reader, csvConfig);

            var data = csv.GetRecords<Geometry>();
            return ToBoreholeGeometry(data, boreholeId);
        }

        public static List<BoreholeGeometryElement> ToBoreholeGeometry(IEnumerable<Geometry> data, int boreholeId)
        {
            return data.Select(g => new BoreholeGeometryElement
            {
                BoreholeId = boreholeId,
                X = g.X,
                Y = g.Y,
                Z = g.Z,
            }).ToList();
        }

        public sealed class Geometry
        {
            public double X { get; set; }
            public double Y { get; set; }
            public double Z { get; set; }
        }
    }

    internal sealed class AzInc : IBoreholeGeometryFormat
    {
        public string Key => "AzInc";
        public string Name => "Azimuth Inclination";
        private Lazy<string> expectedCsvHeader = new(GetCSVHeader<Geometry>);
        public string CsvHeader => expectedCsvHeader.Value;

        public IList<BoreholeGeometryElement> ReadCsv(IFormFile file, int boreholeId)
        {
            using var reader = new StreamReader(file.OpenReadStream());
            using var csv = new CsvReader(reader, csvConfig);

            var data = csv.GetRecords<Geometry>().ToList();

            // convert degrees to radians
            foreach (var entry in data)
            {
                entry.Azimuth = ToRadians(entry.Azimuth);
                entry.Inclination = ToRadians(entry.Inclination);
            }

            return XYZ.ToBoreholeGeometry(ConvertToXYZ(data), boreholeId);
        }

        public static List<XYZ.Geometry> ConvertToXYZ(IList<Geometry> data)
        {
            List<XYZ.Geometry> result = new(data.Count);
            result.Add(new XYZ.Geometry { X = 0, Y = 0, Z = 0 });

            for (int i = 1; i < data.Count; i++)
            {
                var a = data[i - 1];
                var b = data[i];

                // change in measured depth
                double deltaMD = b.MeasuredDepth - a.MeasuredDepth;

                // Dogleg Severity Angle
                double beta = Math.Acos(Math.Cos(b.Inclination - a.Inclination) - (Math.Sin(a.Inclination) * Math.Sin(b.Inclination) * (1 - Math.Cos(b.Azimuth - a.Azimuth))));

                // ratio factor
                double ratioFactor = beta == 0 ? 1 : (2 / beta) * Math.Tan(beta / 2);

                // half delta measured depth multiplied by ratio factor
                double factor = (deltaMD / 2) * ratioFactor;

                // change in easting, northing and elevation
                double deltaN = factor * ((Math.Sin(a.Inclination) * Math.Cos(a.Azimuth)) + (Math.Sin(b.Inclination) * Math.Cos(b.Azimuth)));
                double deltaE = factor * ((Math.Sin(a.Inclination) * Math.Sin(a.Azimuth)) + (Math.Sin(b.Inclination) * Math.Sin(b.Azimuth)));
                double deltaTVD = factor * (Math.Cos(a.Inclination) + Math.Cos(b.Inclination));

                var previous = result[i - 1];
                result.Add(new XYZ.Geometry
                {
                    X = previous.X + deltaE,
                    Y = previous.Y + deltaN,
                    Z = previous.Z + deltaTVD,
                });
            }

            return result;
        }

        public sealed class Geometry
        {
            [Name("MD_m")]
            public double MeasuredDepth { get; set; }
            [Name("HAZI_deg")]
            public double Azimuth { get; set; }
            [Name("DEVI_deg")]
            public double Inclination { get; set; }
        }
    }

    internal sealed class PitchRoll : IBoreholeGeometryFormat
    {
        public string Key => "PitchRoll";
        public string Name => "Pitch Roll";
        private Lazy<string> expectedCsvHeader = new(GetCSVHeader<Geometry>);
        public string CsvHeader => expectedCsvHeader.Value;

        public IList<BoreholeGeometryElement> ReadCsv(IFormFile file, int boreholeId)
        {
            using var reader = new StreamReader(file.OpenReadStream());
            using var csv = new CsvReader(reader, csvConfig);

            var data = csv.GetRecords<Geometry>().ToList();

            // convert degrees to radians
            foreach (var entry in data)
            {
                entry.Pitch = ToRadians(entry.Pitch);
                entry.Roll = ToRadians(entry.Roll);
                entry.MagneticRotation = ToRadians(entry.MagneticRotation);
            }

            return XYZ.ToBoreholeGeometry(AzInc.ConvertToXYZ(ConvertToAzInc(data)), boreholeId);
        }

        public static IList<AzInc.Geometry> ConvertToAzInc(IEnumerable<Geometry> data)
        {
            return data.Select(d =>
            {
                var result = new AzInc.Geometry() { MeasuredDepth = d.MeasuredDepth };

                var alpha = d.MagneticRotation; // rotation around z ayis (down)
                var beta = d.Pitch; // rotation around y axis (north)
                var gamma = d.Roll; // rotation around x axis (east)

                // unit vector tangential to the borehole path
                var x = (Math.Cos(alpha) * Math.Sin(beta) * Math.Cos(gamma)) + (Math.Sin(alpha) * Math.Sin(gamma));
                var y = (Math.Sin(alpha) * Math.Sin(beta) * Math.Cos(gamma)) - (Math.Cos(alpha) * Math.Sin(gamma));
                var z = Math.Cos(beta) * Math.Cos(gamma);

                result.Azimuth = Math.Atan2(y, x);
                result.Inclination = Math.Acos(z);

                return result;
            }).ToList();
        }

        public sealed class Geometry
        {
            [Name("Kabellaenge")]
            public double MeasuredDepth { get; set; }
            public double Roll { get; set; }
            public double Pitch { get; set; }
            [Name("Magnetische Rotation")]
            public double MagneticRotation { get; set; }
        }
    }
}
