using BDMS.Models;
using NetTopologySuite.Mathematics;
using NetTopologySuite.Utilities;

namespace BDMS;

public static class BoreholeGeometryExtensions
{
    /// <summary>
    /// Converts a borehole depth between measured depth (MD) and true vertical depth (TVD).
    /// Assumes a perfectly vertical borehole if the geometry is insufficient of missing. Otherwise the depth conversion is done with the <paramref name="conversion"/> function.
    /// </summary>
    /// <param name="geometry">The list of <see cref="BoreholeGeometryElement"/> representing the borehole's path geometry.</param>
    /// <param name="depth">The depth to convert.</param>
    /// <param name="conversion">The conversion function to use when the geometry is defined.</param>
    /// <returns>The converted depth if a conversion is possible; otherwise <see langword="null"/>.</returns>
    internal static double? ConvertBoreholeDepth(this List<BoreholeGeometryElement>? geometry, double? depth, Func<List<BoreholeGeometryElement>, double, double> conversion)
    {
        if (geometry == null || geometry.Count < 2)
        {
            if (depth != null && depth >= 0)
            {
                // Return the depthMD unchanged as if the borehole is perfectly vertical and infinitely long.
                return depth;
            }
        }
        else if (depth != null)
        {
            try
            {
                return conversion(geometry, depth.Value);
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
        var halfDistance = ab.Length() / 2;
        var deltaMD = b.MD - a.MD;

        var (beta, aDirection) = CalculateDogleg(geometry, upperIndex);

        if (IsCloseToZero(beta))
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
            if (IsCloseToZero(geometry[upperIndex - 1].Z - depthTvd))
            {
                return geometry[upperIndex - 1].MD;
            }
            else if (IsCloseToZero(geometry[upperIndex].Z - depthTvd))
            {
                return geometry[upperIndex].MD;
            }

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
    /// <seealso href="https://math.stackexchange.com/a/3859879">Circle Plane intersection</seealso>
    /// <seealso href="https://math.stackexchange.com/a/3166304">Line circle intersection.</seealso>
    internal static double? InterpolateDepthMD(List<BoreholeGeometryElement> geometry, double depthTvd, int upperIndex)
    {
        var pointA = geometry[upperIndex - 1];
        var pointB = geometry[upperIndex];

        if (IsCloseToZero(pointB.Z - pointA.Z))
        {
            if (IsCloseToZero(pointA.Z - depthTvd))
            {
                // Infinitely many solutions, return the MD at the start point
                return pointA.MD;
            }
            else
            {
                // No intersection
                return null;
            }
        }

        var pointVectorA = pointA.ToVector3D();
        var ab = pointB.ToVector3D() - pointVectorA;
        var deltaMD = pointB.MD - pointA.MD;

        var (beta, aDirection) = CalculateDogleg(geometry, upperIndex);

        if (IsCloseToZero(beta))
        {
            // Straight segment, use linear interpolation
            var t = (depthTvd - pointA.Z) / (pointB.Z - pointA.Z);
            if (t >= 0 && t <= 1)
            {
                return pointA.MD + (t * (pointB.MD - pointA.MD));
            }
            else
            {
                return null;
            }
        }
        else
        {
            var circleNormal = aDirection.Cross(ab).Normalize();
            var radius = (ab.Length() / 2) / Math.Sin(beta / 2);
            var center = pointVectorA + (radius * circleNormal.Cross(aDirection));

            // Calculate intersection line
            var tvdPlaneNormal = new Vector3D(0, 0, 1);
            var normalCrossProduct = tvdPlaneNormal.Cross(circleNormal);
            var linePoint = (((depthTvd * circleNormal) - (circleNormal.Dot(pointVectorA) * tvdPlaneNormal)) / normalCrossProduct.LengthSquare()).Cross(normalCrossProduct);
            var lineDirection = normalCrossProduct.Normalize();

            // Find Circle Line intersection points
            var t = (center - linePoint).Dot(lineDirection);
            var distanceLineToCenterSquared = (center - (linePoint + (lineDirection * t))).LengthSquare();
            var perpendicularDistanceSquared = Math.Pow(radius, 2) - distanceLineToCenterSquared;
            if (perpendicularDistanceSquared < 0)
            {
                return null;
            }

            var perpendicularDistance = Math.Sqrt(perpendicularDistanceSquared);
            var interpolatedDeltaMDs = new Vector3D[]
                {
                    linePoint + (lineDirection * (t - perpendicularDistance)),
                    linePoint + (lineDirection * (t + perpendicularDistance)),
                }
                .Distinct() // There might be only one intersection
                .Where(p => (p - pointVectorA).Cross(ab).Dot(circleNormal) > 0) // Remove circle intersections that do not intersect the arc
                .Select(p => (Math.Acos((center - pointVectorA).Dot(center - p) / Math.Pow(radius, 2)) * deltaMD) / beta) // Calculate the MD delta at the intersection point
                .Order()
                .ToArray();

            if (interpolatedDeltaMDs.Length == 0)
            {
                return null;
            }
            else
            {
                return pointA.MD + interpolatedDeltaMDs[0];
            }
        }
    }

    /// <summary>
    /// Calculate dogleg beta and direction vector at point a.
    /// </summary>
    private static (double Beta, Vector3D ADirection) CalculateDogleg(List<BoreholeGeometryElement> geometry, int upperIndex)
    {
        var pointA = geometry[upperIndex - 1];
        var pointB = geometry[upperIndex];

        double beta;
        Vector3D aDirection;
        if (pointA.HAZI.HasValue && pointA.DEVI.HasValue && pointB.HAZI.HasValue && pointB.DEVI.HasValue)
        {
            var aIncRad = Degrees.ToRadians(pointA.DEVI.Value);
            var aAziRad = Degrees.ToRadians(pointA.HAZI.Value);
            var bIncRad = Degrees.ToRadians(pointB.DEVI.Value);
            var bAziRad = Degrees.ToRadians(pointB.HAZI.Value);

            beta = Math.Acos(Math.Cos(bIncRad - aIncRad) - (Math.Sin(aIncRad) * Math.Sin(bIncRad) * (1 - Math.Cos(bAziRad - aAziRad))));
            aDirection = ToVector3D(aAziRad, aIncRad);
        }
        else
        {
            // Azimuth and Inclination are missing
            // Approximate direction with vector from previous to next point
            aDirection = (pointB.ToVector3D() - geometry[Math.Max(upperIndex - 2, 0)].ToVector3D()).Normalize();

            var ab = pointB.ToVector3D() - pointA.ToVector3D();
            var distance = ab.Length();
            var deltaMD = pointB.MD - pointA.MD;
            var factor = distance / deltaMD;
            if (IsCloseToZero(factor - 1) || factor > 1)
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

        return (beta, aDirection);
    }

    private static bool IsCloseToZero(double d)
    {
        return Math.Abs(d) < 1e-14;
    }

    private static readonly IComparer<BoreholeGeometryElement> geometryMDComparer = Comparer<BoreholeGeometryElement>.Create((a, b) => a.MD.CompareTo(b.MD));

    internal static Vector3D ToVector3D(this BoreholeGeometryElement element)
        => new Vector3D(element.X, element.Y, element.Z);

    /// <summary>
    /// Calculate the unit vector in the direction of the borehole.
    /// </summary>
    internal static Vector3D ToVector3D(double azimuth, double inclination)
        => new Vector3D(Math.Sin(inclination) * Math.Sin(azimuth), Math.Sin(inclination) * Math.Cos(azimuth), Math.Cos(inclination));

    internal static double LengthSquare(this Vector3D v)
        => (v.X * v.X) + (v.Y * v.Y) + (v.Z * v.Z);
}
