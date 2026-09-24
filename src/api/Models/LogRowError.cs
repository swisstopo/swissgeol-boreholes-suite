namespace BDMS.Models;

/// <summary>
/// Why a parsed row cannot be imported as written.
/// </summary>
/// <param name="MessageKey">The translation key explaining the problem.</param>
/// <param name="Values">The placeholder values the translation needs.</param>
public record LogRowError(string MessageKey, Dictionary<string, string>? Values = null);
