using BDMS.Models;
using NetTopologySuite.Mathematics;
using NetTopologySuite.Utilities;

namespace BDMS;

public static class BoreholeGeometryExtensions
{
    /// <summary>
    /// Get the TVD of <paramref name="depthMD"/> according to the <paramref name="geometry"/> if the geometry exists.
    /// </summary>
    /// <param name="geometry">The list of <see cref="BoreholeGeometryElement"/> representing the borehole's path geometry.</param>
    /// <param name="depthMD">The measured depth (MD) at which to calculate the TVD.</param>
    /// <returns>The TVD at <paramref name="depthMD"/> if the geometry exists; otherwise <see langword="null"/>.</returns>
    internal static double? GetTVDIfGeometryExists(this List<BoreholeGeometryElement>? geometry, double? depthMD)
    {
        if (geometry == null || geometry.Count < 2)
        {
            if (depthMD != null && depthMD >= 0)
            {
                // Return the depthMD unchanged as if the borehole is perfectly vertical and infinitely long.
                return depthMD;
            }
        }
        else if (depthMD != null)
        {
            try
            {
                return geometry.GetDepthTVD(depthMD.Value);
            }
            catch (ArgumentOutOfRangeException)
            {
                // Exception is ignored so that the method returns null in case the input was invalid.
            }
        }

        return null;
    }

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
            if (Math.Abs(factor - 1) < 1e-14 || factor > 1)
            {
                // Difference of measured and actual distance between coordinates is small or distance between coordinates is larger than measured distance (rounding errors)
                // Calculate as a straight segment
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

    /// <summary>
    /// Get the measured depth of the <paramref name="depthTvd"/> according to the <paramref name="geometry"/>.
    /// </summary>
    /// <remarks>If there are multiple possible measured depths for a given TVD, the first is returned.</remarks>
    /// <exception cref="ArgumentOutOfRangeException">The <paramref name="geometry"/> does not reach <paramref name="depthTvd"/>.</exception>
    internal static double GetDepthMD(this List<BoreholeGeometryElement> geometry, double depthTvd)
    {
        var upperIndex = 1;
        while (upperIndex < geometry.Count)
        {
            var depthMD = InterpolateDepthMD(geometry, depthTvd, upperIndex);
            if (depthMD.HasValue)
            {
                return depthMD.Value;
            }

            upperIndex++;
        }

        throw new ArgumentOutOfRangeException(nameof(depthTvd));
    }

    /// <summary>
    /// Get the measured depth at the corresponding <paramref name="depthTvd"/> between the points <paramref name="geometry"/>[<paramref name="upperIndex"/> - 1] and <paramref name="geometry"/>[<paramref name="upperIndex"/>].
    /// If the <paramref name="depthTvd"/> does not intersect the segment between the two points, <see langword="null" /> is returned.
    /// </summary>
    /// <remarks>The segment is approximated by a straight line and therefore produces inaccurate results on circular segments.</remarks>
    internal static double? InterpolateDepthMD(List<BoreholeGeometryElement> geometry, double depthTvd, int upperIndex)
    {
        var a = geometry[upperIndex - 1];
        var b = geometry[upperIndex];

        var t = (depthTvd - a.Z) / (b.Z - a.Z);
        if (t >= 0 && t <= 1)
        {
            return a.MD + (t * (b.MD - a.MD));
        }
        else
        {
            return null;
        }
    }

    private static readonly IComparer<BoreholeGeometryElement> geometryMDComparer = Comparer<BoreholeGeometryElement>.Create((a, b) => a.MD.CompareTo(b.MD));

    internal static Vector3D ToVector3D(this BoreholeGeometryElement element)
        => new Vector3D(element.X, element.Y, element.Z);

    /// <summary>
    /// Calculate the unit vector in the direction of the borehole.
    /// </summary>
    internal static Vector3D ToVector3D(double azimuth, double inclination)
        => new Vector3D(Math.Sin(inclination) * Math.Sin(azimuth), Math.Sin(inclination) * Math.Cos(azimuth), Math.Cos(inclination));
}
