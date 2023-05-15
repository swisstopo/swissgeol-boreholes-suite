using BDMS.Models;

namespace BDMS;

/// <summary>
/// The HydroCodeLookup static class provides mappings between <see cref="Hydrotest.TestKindId"/> identifiers
/// and compatible geolcodes for hydrotest results, flow directions, and evaluation methods.
/// </summary>
/// <remarks>
/// The mappings are used to ensure the compatibility of test results, flow directions,
/// and evaluation methods with specific test kinds.
/// </remarks>
public static class HydroCodeLookup
{
    /// <summary>
    /// Gets a dictionary that maps a <see cref="Hydrotest.TestKindId"/>   identifier to a list of compatible geolcodes for the <see cref="HydrotestResult.Parameter"/> of a <see cref="HydrotestResult"/>.
    /// </summary>
    public static Dictionary<int, List<int>> HydrotestResultParameterOptions { get; } = new()
    {
        { 1, new List<int> { 1, 3, 4, 5, 6, 8 } },
        { 2, new List<int> { 1, 3, 4, 5, 6, 8 } },
        { 3, new List<int> { 1, 3, 4, 5, 6, 8 } },
        { 4, new List<int> { 1, 3, 4, 5, 6, 8 } },
        { 5, new List<int> { 1, 3, 5, 6, 8 } },
        { 6, new List<int> { 1, 3, 4, 5, 6, 8 } },
        { 7, new List<int> { 1, 3, 4, 5, 6, 8 } },
        { 8, new List<int> { 1, 3, 5, 7, 8 } },
        { 9, new List<int> { 1, 3, 8 } },
        { 10, new List<int> { 2 } },
        { 11, new List<int> { 1 } },
        { 12, new List<int> { 1 } },
        { 13, new List<int> { 1, 3, 4, 5, 6, 8 } },
        { 14, new List<int> { 1, 3, 4, 5, 6, 8 } },
        { 15, new List<int> { 1, 3, 4, 5, 6, 8 } },
    };

    /// <summary>
    /// Gets a dictionary that maps a <see cref="Hydrotest.TestKindId"/>   identifier to a list of compatible geolcodes for <see cref="Hydrotest"/> flow directions.
    /// </summary>
    public static Dictionary<int, List<int>> HydrotestFlowDirectionOptions { get; } = new()
    {
        { 1, new List<int> { 1, 2, 3 } },
        { 2, new List<int> { 1, 2, 3 } },
        { 3, new List<int> { 1, 2, 3 } },
        { 4, new List<int> { 1, 2, 3 } },
        { 5, new List<int> { 1, 2, 3 } },
        { 6, new List<int> { 1, 2, 3 } },
        { 7, new List<int> { 1, 2, 3 } },
        { 8, new List<int> { 1, 3 } },
        { 10, new List<int> { 1, 3 } },
        { 12, new List<int> { 1, 3 } },
        { 15, new List<int> { 1, 2, 3 } },
    };

    /// <summary>
    /// Gets a dictionary that maps a <see cref="Hydrotest.TestKindId"/>  identifier to a list of compatible geolcodes for <see cref="Hydrotest"/> evaluation methods.
    /// </summary>
    public static Dictionary<int, List<int>> HydrotestEvaluationMethodOptions { get; } = new()
    {
        { 1, new List<int> { 1, 2, 3, 4 } },
        { 2, new List<int> { 1, 2, 3, 4 } },
        { 3, new List<int> { 1, 2, 3, 4 } },
        { 4, new List<int> { 1, 2, 3, 4 } },
        { 5, new List<int> { 2, 3, 4 } },
        { 6, new List<int> { 2, 3, 4 } },
        { 7, new List<int> { 2, 3, 4 } },
        { 8, new List<int> { 2, 3, 4 } },
        { 9, new List<int> { 2, 3, 4 } },
        { 10, new List<int> { 2, 3, 4 } },
        { 15, new List<int> { 1, 2, 3, 4 } },
    };
}
