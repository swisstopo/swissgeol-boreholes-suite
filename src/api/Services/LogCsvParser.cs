using BDMS.Models;
using CsvHelper;
using System.Globalization;

namespace BDMS.Services;

/// <summary>
/// Reads the import CSVs into rows.
///
/// Reading and judging are kept apart: the parser decides only what a row says and whether its
/// own values can be read, never whether it may be written. What a row means against the stored
/// data is the classifier's question.
///
/// The parser reads text, never bytes: which encoding an upload carries is decided once, by
/// <see cref="CsvEncoding"/>, before a reader reaches here.
/// </summary>
public static class LogCsvParser
{
    private static readonly string[] requiredRunColumns = ["RunNumber", "FromDepth", "ToDepth"];
    private static readonly string[] requiredFileColumns = ["RunNumber", "Name"];

    /// <summary>
    /// Names the columns the log runs CSV has to carry and does not.
    /// </summary>
    /// <param name="csv">The CSV to read the header of.</param>
    /// <returns>The missing column names, empty when the header is complete.</returns>
    public static IReadOnlyList<string> MissingRunColumns(TextReader csv) => MissingColumns(csv, requiredRunColumns);

    /// <summary>
    /// Names the columns the log files CSV has to carry and does not.
    /// </summary>
    /// <param name="csv">The CSV to read the header of.</param>
    /// <returns>The missing column names, empty when the header is complete.</returns>
    public static IReadOnlyList<string> MissingFileColumns(TextReader csv) => MissingColumns(csv, requiredFileColumns);

    private static IReadOnlyList<string> MissingColumns(TextReader csv, string[] required)
    {
        using var parser = new CsvReader(csv, CsvConfigHelper.CsvReadConfig);

        if (!parser.Read() || !parser.ReadHeader()) return required;

        var header = parser.HeaderRecord ?? [];
        return required
            .Where(column => !header.Any(h => string.Equals(h?.Trim(), column, StringComparison.OrdinalIgnoreCase)))
            .ToList();
    }

    /// <summary>
    /// Reads the log runs CSV.
    /// </summary>
    /// <param name="csv">The CSV to read.</param>
    /// <param name="codelists">The codelists the text values are resolved against.</param>
    /// <param name="boreholeId">The borehole the runs belong to.</param>
    /// <returns>One row per line, in file order.</returns>
    public static IReadOnlyList<LogRunRow> ParseRuns(TextReader csv, IReadOnlyList<Codelist> codelists, int boreholeId)
    {
        var rows = new List<LogRunRow>();
        using var parser = new CsvReader(csv, CsvConfigHelper.CsvReadConfig);

        parser.Read();
        parser.ReadHeader();

        var rowIndex = 0;
        while (parser.Read())
        {
            rowIndex++;
            var errors = new List<LogRowError>();
            var runNumber = parser.GetField<string>("RunNumber")?.Trim() ?? string.Empty;
            if (string.IsNullOrWhiteSpace(runNumber))
            {
                errors.Add(new LogRowError("importErrorRunNumberRequired"));
            }

            var fromDepth = ReadDouble(parser, "FromDepth", errors, "importErrorFromDepthRequired", required: true);
            var toDepth = ReadDouble(parser, "ToDepth", errors, "importErrorToDepthRequired", required: true);
            var bitSize = ReadDouble(parser, "BitSize", errors, "importErrorInvalidNumberFormat");

            var row = new LogRunRow
            {
                RowIndex = rowIndex,
                RunNumber = runNumber,
                LogRun = new LogRun
                {
                    BoreholeId = boreholeId,
                    RunNumber = runNumber,
                    FromDepth = fromDepth ?? 0,
                    ToDepth = toDepth ?? 0,
                    BitSize = bitSize,
                    BoreholeStatusId = ReadCodelistId(parser, "BoreholeStatus", LogSchemas.LogBoreholeStatusSchema, codelists, errors),
                    ConveyanceMethodId = ReadCodelistId(parser, "ConveyanceMethod", LogSchemas.LogConveyanceMethodSchema, codelists, errors),
                    RunDate = ReadDate(parser, "RunDate", errors),
                    ServiceCo = parser.GetField<string>("ServiceCo"),
                    Comment = parser.GetField<string>("Comment"),
                },
            };

            foreach (var error in errors) row.Errors.Add(error);
            rows.Add(row);
        }

        return rows;
    }

    /// <summary>
    /// Reads the log files CSV.
    /// </summary>
    /// <param name="csv">The CSV to read.</param>
    /// <param name="codelists">The codelists the text values are resolved against.</param>
    /// <returns>One row per line, in file order.</returns>
    public static IReadOnlyList<LogFileRow> ParseFiles(TextReader csv, IReadOnlyList<Codelist> codelists)
    {
        var rows = new List<LogFileRow>();
        using var parser = new CsvReader(csv, CsvConfigHelper.CsvReadConfig);

        parser.Read();
        parser.ReadHeader();

        var rowIndex = 0;
        while (parser.Read())
        {
            rowIndex++;
            var errors = new List<LogRowError>();

            var runNumber = parser.GetField<string>("RunNumber")?.Trim() ?? string.Empty;
            var fileName = BuildFileName(parser, errors);

            var row = new LogFileRow
            {
                RowIndex = rowIndex,
                RunNumber = runNumber,
                FileName = fileName,
                LogFile = new LogFile
                {
                    Name = fileName,
                    PassTypeId = ReadCodelistId(parser, "PassType", LogSchemas.LogPassTypeSchema, codelists, errors),
                    Pass = ReadInt(parser, "Pass", errors),
                    DataPackageId = ReadCodelistId(parser, "DataPackage", LogSchemas.LogDataPackageSchema, codelists, errors),
                    DepthTypeId = ReadCodelistId(parser, "DepthType", LogSchemas.LogDepthTypeSchema, codelists, errors),
                    DeliveryDate = ReadDate(parser, "DeliveryDate", errors),
                    Public = ReadPublic(parser, errors),
                    LogFileToolTypeCodes = ReadToolTypeCodes(parser, codelists, errors),
                },
            };

            foreach (var error in errors) row.Errors.Add(error);
            rows.Add(row);
        }

        return rows;
    }

    private static string BuildFileName(CsvReader parser, List<LogRowError> errors)
    {
        var name = parser.GetField<string>("Name")?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(name))
        {
            errors.Add(new LogRowError("importErrorFileNameRequired"));
            return string.Empty;
        }

        var extension = parser.GetField<string>("Extension")?.Trim() ?? string.Empty;
        var fullName = string.IsNullOrWhiteSpace(extension) ? name : $"{name}.{extension}";

        // Spaces are read differently across the systems the files travel through, so the stored
        // name never carries one.
        return fullName.Replace(" ", "_", StringComparison.OrdinalIgnoreCase);
    }

    private static double? ReadDouble(CsvReader parser, string column, List<LogRowError> errors, string messageKey, bool required = false)
    {
        var value = parser.GetField<string>(column);
        if (string.IsNullOrWhiteSpace(value))
        {
            if (required) errors.Add(new LogRowError(messageKey));
            return null;
        }

        if (double.TryParse(value, CsvConfigHelper.CsvReadConfig.CultureInfo, out var parsed)) return parsed;

        errors.Add(new LogRowError(messageKey, new() { ["value"] = value }));
        return null;
    }

    private static int? ReadInt(CsvReader parser, string column, List<LogRowError> errors)
    {
        var value = parser.GetField<string>(column);
        if (string.IsNullOrWhiteSpace(value)) return null;

        if (int.TryParse(value, CsvConfigHelper.CsvReadConfig.CultureInfo, out var parsed)) return parsed;

        errors.Add(new LogRowError("importErrorInvalidNumberFormat", new() { ["value"] = value }));
        return null;
    }

    private static DateOnly? ReadDate(CsvReader parser, string column, List<LogRowError> errors)
    {
        var value = parser.GetField<string>(column);
        if (string.IsNullOrWhiteSpace(value)) return null;

        if (DateOnly.TryParse(value, CsvConfigHelper.CsvReadConfig.CultureInfo, DateTimeStyles.None, out var parsed)) return parsed;

        errors.Add(new LogRowError("importErrorInvalidDateFormat", new() { ["value"] = value }));
        return null;
    }

    private static int? ReadCodelistId(CsvReader parser, string column, string schema, IReadOnlyList<Codelist> codelists, List<LogRowError> errors)
    {
        var value = parser.GetField<string>(column);
        if (string.IsNullOrWhiteSpace(value)) return null;

        var match = codelists.FirstOrDefault(c =>
            c.Schema == schema &&
            (string.Equals(c.En, value, StringComparison.OrdinalIgnoreCase) ||
             string.Equals(c.De, value, StringComparison.OrdinalIgnoreCase) ||
             string.Equals(c.Fr, value, StringComparison.OrdinalIgnoreCase) ||
             string.Equals(c.It, value, StringComparison.OrdinalIgnoreCase)));

        if (match != null) return match.Id;

        errors.Add(new LogRowError("importErrorUnknownCodelistValue", new() { ["fieldName"] = column, ["value"] = value }));
        return null;
    }

    private static List<LogFileToolTypeCodes> ReadToolTypeCodes(CsvReader parser, IReadOnlyList<Codelist> codelists, List<LogRowError> errors)
    {
        var value = parser.GetField<string>("LogFileToolTypeCodes");
        if (string.IsNullOrWhiteSpace(value)) return [];

        var result = new List<LogFileToolTypeCodes>();
        foreach (var code in value.Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries))
        {
            var match = codelists.FirstOrDefault(c =>
                c.Schema == LogSchemas.LogToolTypeSchema &&
                string.Equals(c.Code, code, StringComparison.OrdinalIgnoreCase));

            if (match == null)
            {
                errors.Add(new LogRowError("importErrorUnknownToolTypeCode", new() { ["code"] = code }));
            }
            else
            {
                result.Add(new LogFileToolTypeCodes { CodelistId = match.Id });
            }
        }

        return result;
    }

    private static bool ReadPublic(CsvReader parser, List<LogRowError> errors)
    {
        var value = parser.GetField<string>("Public");
        if (string.IsNullOrWhiteSpace(value)) return false;

        switch (value.Trim().ToUpperInvariant())
        {
            case "YES" or "JA" or "OUI" or "SÌ" or "SI":
                return true;
            case "NO" or "NEIN" or "NON":
                return false;
            default:
                errors.Add(new LogRowError("importErrorUnknownPublicValue", new() { ["value"] = value }));
                return false;
        }
    }
}
