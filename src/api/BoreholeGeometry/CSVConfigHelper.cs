﻿using BDMS.Models;
using CsvHelper;
using CsvHelper.Configuration;
using Humanizer;
using NetTopologySuite.Mathematics;
using NetTopologySuite.Utilities;
using System.Globalization;

namespace BDMS.BoreholeGeometry;

public static class CSVConfigHelper
{
    internal static readonly CsvConfiguration CsvConfig = new(new CultureInfo("de-CH"))
    {
        Delimiter = ";",
        IgnoreReferences = true,
        PrepareHeaderForMatch = args => args.Header.Humanize(LetterCasing.Title),
        MissingFieldFound = null,
    };

    /// <summary>
    /// Get the CSV header <see cref="CsvHelper"/> expects to read a class <typeparamref name="T"/>.
    /// Uses the map generated by <see cref="CsvHelper.CsvContext.AutoMap{T}()"/>.
    /// If a property has multiple possible column names only the first is considered.
    /// </summary>
    /// <typeparam name="T">The class to get the header for.</typeparam>
    internal static string GetCSVHeader<T>()
    {
        var context = new CsvContext(CsvConfig);
        var map = context.AutoMap<T>();
        return string.Join("; ", map.MemberMaps
            .Select(m =>
            {
                var name = m.Data.Names.FirstOrDefault(m.Data.Member.Name);
                return m.Data.IsOptional ? $"[{name}]" : name;
            }));
    }
}
