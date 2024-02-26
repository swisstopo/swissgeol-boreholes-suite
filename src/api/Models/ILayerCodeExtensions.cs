namespace BDMS.Models;

/// <summary>
/// Provides extension methods for the ILayerCode interface.
/// </summary>
public static class ILayerCodeExtensions
{
    /// <summary>
    /// Resets the LayerId of each ILayerCode in the provided collection to 0.
    /// </summary>
    /// <param name="layerCodes">The collection of ILayerCode objects to reset.</param>
    public static void ResetLayerIds(this IEnumerable<ILayerCode> layerCodes)
    {
        foreach (var layerCode in layerCodes)
        {
            layerCode.LayerId = 0;
        }
    }
}
