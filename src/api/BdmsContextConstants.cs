namespace BDMS;

/// <summary>
/// <see cref="BdmsContext"/> constants.
/// </summary>
public static class BdmsContextConstants
{
    /// <summary>
    /// The name of the boreholes database.
    /// </summary>
    public const string BoreholesDatabaseName = "bdms";

    /// <summary>
    /// The name of the boreholes database schema.
    /// </summary>
    public const string BoreholesDatabaseSchemaName = "bdms";

    /// <summary>
    /// The highest borehole id produced by the dev seed data. Test state resets
    /// only remove boreholes with an id greater than this value.
    /// </summary>
    public const int MaxSeedBoreholeId = 1002999;
}
