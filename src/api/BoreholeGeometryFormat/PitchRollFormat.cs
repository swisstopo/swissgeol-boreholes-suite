using BDMS.Models;
using CsvHelper;
using CsvHelper.Configuration.Attributes;

namespace BDMS.BoreholeGeometryFormat;

/// <summary>
/// Accepts a CSV file where every data point has a Pitch, Roll and Yaw angle.
/// </summary>
internal sealed class PitchRollFormat : IBoreholeGeometryFormat
{
    public string Key => "PitchRoll";
    public string Name => "Pitch Roll";
    private Lazy<string> expectedCsvHeader = new(Helper.GetCSVHeader<Geometry>);
    public string CsvHeader => expectedCsvHeader.Value;

    public IList<BoreholeGeometryElement> ReadCsv(IFormFile file, int boreholeId)
    {
        using var reader = new StreamReader(file.OpenReadStream());
        using var csv = new CsvReader(reader, Helper.CsvConfig);

        var data = csv.GetRecords<Geometry>().ToList();

        // Convert degrees to radians
        foreach (var entry in data)
        {
            entry.Pitch = Helper.ToRadians(entry.Pitch);
            entry.Roll = Helper.ToRadians(entry.Roll);
            entry.MagneticRotation = Helper.ToRadians(entry.MagneticRotation);
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

            var alpha = d.MagneticRotation; // Rotation around z axis (down)
            var beta = d.Pitch; // Rotation around y axis (north)
            var gamma = d.Roll; // Rotation around x axis (east)

            // Unit vector tangential to the borehole path
            var x = (Math.Cos(alpha) * Math.Sin(beta) * Math.Cos(gamma)) + (Math.Sin(alpha) * Math.Sin(gamma));
            var y = (Math.Sin(alpha) * Math.Sin(beta) * Math.Cos(gamma)) - (Math.Cos(alpha) * Math.Sin(gamma));
            var z = Math.Cos(beta) * Math.Cos(gamma);

            result.Azimuth = Math.Atan2(y, x);
            result.Inclination = Math.Acos(z);

            return result;
        }).ToList();
    }

    internal sealed class Geometry
    {
        [Name("Kabellaenge")]
        public double MeasuredDepth { get; set; }
        public double Roll { get; set; }
        public double Pitch { get; set; }
        [Name("Magnetische Rotation")]
        public double MagneticRotation { get; set; }
    }
}
