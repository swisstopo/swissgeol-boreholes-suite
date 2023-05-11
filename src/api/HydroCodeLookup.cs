namespace BDMS;

public static class HydroCodeLookup
{
    public static Dictionary<int, List<int>> HydrotestResultOptions { get; } = new()
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
