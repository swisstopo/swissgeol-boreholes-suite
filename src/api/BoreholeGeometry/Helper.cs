﻿using BDMS.Models;
using CsvHelper;
using CsvHelper.Configuration;
using Humanizer;
using NetTopologySuite.Mathematics;
using NetTopologySuite.Utilities;
using System.Globalization;

namespace BDMS.BoreholeGeometry;

public static class Helper
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

    private static readonly IComparer<BoreholeGeometryElement> geometryMDComparer = Comparer<BoreholeGeometryElement>.Create((a, b) => a.MD.CompareTo(b.MD));

    /// <summary>
    /// Get the TVD of <paramref name="depthMD"/> according to the <paramref name="geometry"/>.
    /// </summary>
    /// <exception cref="ArgumentOutOfRangeException"><paramref name="depthMD"/> is outside of the <paramref name="geometry"/>.</exception>
    internal static double GetDepthTVD(this List<BoreholeGeometryElement> geometry, double depthMD)
    {
        // Binary search data points next to depthMD
        int index = geometry.BinarySearch(new BoreholeGeometryElement() { MD = depthMD }, geometryMDComparer);

        // Exactly on a data point
        if (index >= 0)
        {
            return geometry[index].Z;
        }

        int upperIndex = ~index;
        if (upperIndex == 0 || upperIndex == geometry.Count)
        {
            throw new ArgumentOutOfRangeException(nameof(depthMD));
        }

        return InterpolateDepthTVD(geometry, depthMD, upperIndex);
    }

    /// <summary>
    /// Interpolate the TVD at <paramref name="depthMD"/> using the <paramref name="geometry"/>.
    /// The <paramref name="depthMD"/> must be between <paramref name="geometry"/>[<paramref name="upperIndex"/>]
    /// and <paramref name="geometry"/>[<paramref name="upperIndex"/> - 1].
    /// </summary>
    private static double InterpolateDepthTVD(List<BoreholeGeometryElement> geometry, double depthMD, int upperIndex)
    {
        var a = geometry[upperIndex - 1];
        var b = geometry[upperIndex];
        var ab = b.ToVector3D() - a.ToVector3D();
        var distance = ab.Length();
        var halfDistance = distance / 2;
        var deltaMD = b.MD - a.MD;

        // Calculate dogleg beta and direction vector at a
        double beta;
        Vector3D aDirection;
        if (a.HAZI.HasValue && a.DEVI.HasValue && b.HAZI.HasValue && b.DEVI.HasValue)
        {
            var aIncRad = Degrees.ToRadians(a.DEVI.Value);
            var aAziRad = Degrees.ToRadians(a.HAZI.Value);
            var bIncRad = Degrees.ToRadians(b.DEVI.Value);
            var bAziRad = Degrees.ToRadians(b.HAZI.Value);

            beta = Math.Acos(Math.Cos(bIncRad - aIncRad) - (Math.Sin(aIncRad) * Math.Sin(bIncRad) * (1 - Math.Cos(bAziRad - aAziRad))));
            aDirection = ToVector3D(aAziRad, aIncRad);
        }
        else
        {
            // Azimuth and Inclination are missing
            // Approximate direction with vector from previous to next point
            aDirection = (b.ToVector3D() - geometry[Math.Max(upperIndex - 2, 0)].ToVector3D()).Normalize();

            var factor = distance / deltaMD;
            if (Math.Abs(factor - 1) < 1e-14)
            {
                beta = 0;
            }
            else
            {
                // Inverse function of a 4th order Taylor series approximation of the function
                // f(x) = ((2 * sin(x / 2)) / x) - factor
                beta = 2.8284271247461903 * Math.Sqrt(5 - (2.23606797749979 * Math.Sqrt((6 * factor) - 1)));
            }
        }

        if (beta == 0)
        {
            // Straight segment, use linear interpolation
            return a.Z + ((depthMD - a.MD) / deltaMD * (b.Z - a.Z));
        }
        else
        {
            var radius = halfDistance / Math.Sin(beta / 2);
            var m = halfDistance / Math.Tan(beta / 2);

            // Unit vectors along and perpendicular to vector between data points
            var i = ab.Normalize();
            var j = i.Cross(aDirection.Cross(i)).Normalize();

            var alpha = ((depthMD - a.MD) / deltaMD * beta) - (beta / 2);
            var x = (Math.Sin(alpha) * radius) + halfDistance;
            var y = (Math.Cos(alpha) * radius) - m;

            return a.Z + (x * i.Z) + (y * j.Z);
        }
    }

    internal static Vector3D ToVector3D(this BoreholeGeometryElement element)
        => new Vector3D(element.X, element.Y, element.Z);

    /// <summary>
    /// Calculate the unit vector in the direction of the borehole.
    /// </summary>
    internal static Vector3D ToVector3D(double azimuth, double inclination)
        => new Vector3D(Math.Sin(inclination) * Math.Sin(azimuth), Math.Sin(inclination) * Math.Cos(azimuth), Math.Cos(inclination));
}
