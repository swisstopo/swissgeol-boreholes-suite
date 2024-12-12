namespace BDMS;
using BDMS.BoreholeGeometry;
using BDMS.Models;

public static class BoreholeGeometryExtensions
{
    public static double? GetTVDIfGeometryExists(this List<BoreholeGeometryElement> geometry, double? depthMD)
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
                // Assuming GetDepthTVD is another extension method or a suitable method of List<BoreholeGeometryElement>
                return geometry.GetDepthTVD(depthMD.Value);
            }
            catch (ArgumentOutOfRangeException)
            {
                // Exception is ignored so that the method returns null in case the input was invalid.
            }
        }

        return null;
    }
}
