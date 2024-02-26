namespace BDMS.Models;

/// <summary>
/// Provides extension methods for the <see cref="ILayerCode"/> interface.
/// </summary>
public static class LayerCodeExtensions
{
    /// <summary>
    /// Resets the LayerId of each <see cref="ILayerCode"/> in the provided collection to 0.
    /// </summary>
    /// <param name="layerCodes">The collection of <see cref="ILayerCode"/> objects to reset.</param>
    public static void ResetLayerIds(this IEnumerable<ILayerCode> layerCodes)
    {
        foreach (var layerCode in layerCodes)
        {
            layerCode.LayerId = 0;
        }
    }
}
