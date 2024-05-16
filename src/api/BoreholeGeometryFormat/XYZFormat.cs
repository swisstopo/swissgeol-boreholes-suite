using BDMS.Models;
using CsvHelper;

namespace BDMS.BoreholeGeometryFormat;

/// <summary>
/// Accepts a CSV file with XYZ values that can be used directly without conversion.
/// </summary>
internal sealed class XYZFormat : IBoreholeGeometryFormat
{
    public string Key => "XYZ";
    public string Name => "X Y Z";
    private Lazy<string> expectedCsvHeader = new(Helper.GetCSVHeader<Geometry>);
    public string CsvHeader => expectedCsvHeader.Value;

    public IList<BoreholeGeometryElement> ReadCsv(IFormFile file, int boreholeId)
    {
        using var reader = new StreamReader(file.OpenReadStream());
        using var csv = new CsvReader(reader, Helper.CsvConfig);

        var data = csv.GetRecords<Geometry>();
        return ToBoreholeGeometry(data, boreholeId);
    }

    /// <summary>
    /// Convert <see cref="Geometry"/> data to <see cref="BoreholeGeometryElement"/> data that can be
    /// written to the Database.
    /// </summary>
    /// <param name="data">The <see cref="Geometry"/> data.</param>
    /// <param name="boreholeId">The borehole this geometry belongs to.</param>
    public static List<BoreholeGeometryElement> ToBoreholeGeometry(IEnumerable<Geometry> data, int boreholeId)
    {
        return data
            .Select(g => new BoreholeGeometryElement
            {
                BoreholeId = boreholeId,
                X = g.X,
                Y = g.Y,
                Z = g.Z,
            })
            .ToList();
    }

    internal sealed class Geometry
    {
        public double X { get; set; }
        public double Y { get; set; }
        public double Z { get; set; }
    }
}
