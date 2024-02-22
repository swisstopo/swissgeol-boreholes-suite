namespace BDMS.Models;

public static class ILayerCodeExtensions
{
    public static void ResetLayerIds(this IEnumerable<ILayerCode> layerCodes)
    {
        foreach (var layerCode in layerCodes)
        {
            layerCode.LayerId = 0;
        }
    }
}
