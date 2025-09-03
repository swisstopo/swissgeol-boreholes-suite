using BDMS.Models;

namespace BDMS.BoreholeGeometry;

/// <summary>
/// Geometry format with method to read and convert the input CSV file to <see cref="BoreholeGeometryElement"/>s.
/// </summary>
public interface IBoreholeGeometryFormat
{
    /// <summary>
    /// Key to identify this <see cref="IBoreholeGeometryFormat"/>.
    /// </summary>
    string Key { get; }

    /// <summary>
    /// The expected header of the input CSV file.
    /// </summary>
    string CsvHeader { get; }

    /// <summary>
    /// Convert the provided CSV file into a List of <see cref="BoreholeGeometryElement"/>.
    /// </summary>
    /// <param name="file">The input CSV file.</param>
    /// <param name="boreholeId">The id of the borehole this geometry belongs to.</param>
    /// <returns></returns>
    IList<BoreholeGeometryElement> ReadCsv(IFormFile file, int boreholeId);
}
