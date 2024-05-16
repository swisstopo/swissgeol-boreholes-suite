using CsvHelper;
using CsvHelper.Configuration;
using Humanizer;
using System.Globalization;

namespace BDMS.BoreholeGeometryFormat;

public static class Helper
{
    internal static readonly CsvConfiguration CsvConfig = new(new CultureInfo("de-CH"))
    {
        Delimiter = ";",
        IgnoreReferences = true,
        PrepareHeaderForMatch = args => args.Header.Humanize(LetterCasing.Title),
        MissingFieldFound = null,
    };

    internal static string GetCSVHeader<T>()
    {
        var context = new CsvContext(CsvConfig);
        var map = context.AutoMap<T>();
        return string.Join("; ", map.MemberMaps.Select(m => m.Data.Names.FirstOrDefault(m.Data.Member.Name)));
    }

    internal static double ToRadians(double degrees)
    {
        return degrees * Math.PI / 180;
    }
}
