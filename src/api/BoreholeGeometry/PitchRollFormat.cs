using BDMS.Models;
using CsvHelper;
using CsvHelper.Configuration.Attributes;
using NetTopologySuite.Utilities;

namespace BDMS.BoreholeGeometry;

/// <summary>
/// Accepts a CSV file where every data point has a Pitch, Roll and Yaw angle.
/// </summary>
internal sealed class PitchRollFormat : IBoreholeGeometryFormat
{
    public string Key => "PitchRoll";

    public string Name => "Pitch Roll";

    private Lazy<string> expectedCsvHeader = new(CsvConfigHelper.GetCsvHeader<Geometry>);

    public string CsvHeader => expectedCsvHeader.Value;

    public IList<BoreholeGeometryElement> ReadCsv(IFormFile file, int boreholeId)
    {
        using var reader = new StreamReader(file.OpenReadStream());
        using var csv = new CsvReader(reader, CsvConfigHelper.CsvConfig);

        var data = csv.GetRecords<Geometry>().ToList();

        // Convert degrees to radians
        foreach (var entry in data)
        {
            entry.PitchRad = Degrees.ToRadians(entry.PitchRad);
            entry.RollRad = Degrees.ToRadians(entry.RollRad);
            entry.YawRad = Degrees.ToRadians(entry.YawRad);
        }

        return XYZFormat.ToBoreholeGeometry(AzIncFormat.ConvertToXYZ(ConvertToAzInc(data)), boreholeId);
    }

    /// <summary>
    /// Convert the <see cref="Geometry"/> data to <see cref="AzIncFormat.Geometry"/> data by
    /// calculating the Azimuth and Inclination of a the vector tangential to the borehole.
    /// </summary>
    /// <param name="data">The <see cref="Geometry"/> data.</param>
    public static IList<AzIncFormat.Geometry> ConvertToAzInc(IEnumerable<Geometry> data)
    {
        return data.Select(d =>
        {
            var result = new AzIncFormat.Geometry() { MeasuredDepth = d.MeasuredDepth };

            var alpha = d.YawRad; // Rotation around z axis (down)
            var beta = d.PitchRad; // Rotation around y axis (north)
            var gamma = d.RollRad; // Rotation around x axis (east)

            // Unit vector tangential to the borehole path
            var x = (Math.Cos(alpha) * Math.Sin(beta) * Math.Cos(gamma)) + (Math.Sin(alpha) * Math.Sin(gamma));
            var y = (Math.Sin(alpha) * Math.Sin(beta) * Math.Cos(gamma)) - (Math.Cos(alpha) * Math.Sin(gamma));
            var z = Math.Cos(beta) * Math.Cos(gamma);

            result.AzimuthRad = Math.Atan2(y, x);
            result.InclinationRad = Math.Acos(z);
            result.Azimuth = Radians.ToDegrees(result.AzimuthRad);
            result.Inclination = Radians.ToDegrees(result.InclinationRad);

            return result;
        }).ToList();
    }

    internal sealed class Geometry
    {
        [Name("MD_m")]
        public double MeasuredDepth { get; set; }

        [Name("Roll_deg")]
        public double RollRad { get; set; }

        [Name("Pitch_deg")]
        public double PitchRad { get; set; }

        [Name("Yaw_deg")]
        public double YawRad { get; set; }
    }
}
