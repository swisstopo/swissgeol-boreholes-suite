using BDMS.Models;
using CsvHelper;
using CsvHelper.Configuration.Attributes;
using NetTopologySuite.Utilities;

namespace BDMS.BoreholeGeometry;

/// <summary>
/// Accepts a CSV file where every data point has an Azimuth and Inclination.
/// </summary>
internal sealed class AzIncFormat : IBoreholeGeometryFormat
{
    public string Key => "AzInc";

    private Lazy<string> expectedCsvHeader = new(CsvConfigHelper.GetCsvHeader<Geometry>);

    public string CsvHeader => expectedCsvHeader.Value;

    public IList<BoreholeGeometryElement> ReadCsv(IFormFile file, int boreholeId)
    {
        using var reader = new StreamReader(file.OpenReadStream());
        using var csv = new CsvReader(reader, CsvConfigHelper.CsvReadConfig);

        var data = csv.GetRecords<Geometry>().ToList();

        // Convert degrees to radians
        foreach (var entry in data)
        {
            entry.AzimuthRad = Degrees.ToRadians(entry.Azimuth);
            entry.InclinationRad = Degrees.ToRadians(entry.Inclination);
        }

        return XYZFormat.ToBoreholeGeometry(ConvertToXYZ(data), boreholeId);
    }

    /// <summary>
    /// Convert <see cref="Geometry"/> data to <see cref="XYZFormat.Geometry"/> data using the
    /// <see href="https://www.drillingformulas.com/minimum-curvature-method/">Minimum Curvature</see> algorithm.
    /// </summary>
    /// <param name="data">The <see cref="Geometry"/> data.</param>
    public static List<XYZFormat.Geometry> ConvertToXYZ(IList<Geometry> data)
    {
        List<XYZFormat.Geometry> result = new(data.Count);

        if (data.Count > 0)
        {
            result.Add(
                new XYZFormat.Geometry
                {
                    X = 0,
                    Y = 0,
                    Z = 0,
                    MeasuredDepth = data[0].MeasuredDepth,
                    Azimuth = data[0].Azimuth,
                    Inclination = data[0].Inclination,
                });
        }

        for (int i = 1; i < data.Count; i++)
        {
            var a = data[i - 1];
            var b = data[i];

            // Change in measured depth
            double deltaMD = b.MeasuredDepth - a.MeasuredDepth;

            // Dogleg Severity Angle
            double beta = Math.Acos(Math.Cos(b.InclinationRad - a.InclinationRad) - (Math.Sin(a.InclinationRad) * Math.Sin(b.InclinationRad) * (1 - Math.Cos(b.AzimuthRad - a.AzimuthRad))));

            // Ratio factor
            double ratioFactor = beta == 0 ? 1 : (2 / beta) * Math.Tan(beta / 2);

            // Half delta measured depth multiplied by ratio factor
            double factor = (deltaMD / 2) * ratioFactor;

            // Change in easting, northing and elevation
            double deltaN = factor * ((Math.Sin(a.InclinationRad) * Math.Cos(a.AzimuthRad)) + (Math.Sin(b.InclinationRad) * Math.Cos(b.AzimuthRad)));
            double deltaE = factor * ((Math.Sin(a.InclinationRad) * Math.Sin(a.AzimuthRad)) + (Math.Sin(b.InclinationRad) * Math.Sin(b.AzimuthRad)));
            double deltaTVD = factor * (Math.Cos(a.InclinationRad) + Math.Cos(b.InclinationRad));

            var previous = result[i - 1];
            result.Add(new XYZFormat.Geometry
            {
                X = previous.X + deltaE,
                Y = previous.Y + deltaN,
                Z = previous.Z + deltaTVD,
                MeasuredDepth = b.MeasuredDepth,
                Azimuth = b.Azimuth,
                Inclination = b.Inclination,
            });
        }

        return result;
    }

    internal sealed class Geometry
    {
        [Name("MD_m")]
        public double MeasuredDepth { get; set; }

        [Name("HAZI_deg")]
        public double Azimuth { get; set; }

        [Name("DEVI_deg")]
        public double Inclination { get; set; }

        [Ignore]
        public double AzimuthRad { get; set; }

        [Ignore]
        public double InclinationRad { get; set; }
    }
}
