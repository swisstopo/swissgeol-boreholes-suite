using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BDMS;

/// <summary>
/// Provides methods to assert the status code of an <see cref="IActionResult"/>.
/// </summary>
internal static class ActionResultAssert
{
    /// <summary>
    /// Asserts that the <see cref="IActionResult"/> is Ok (200).
    /// </summary>
    internal static void IsOk(IActionResult? actionResult)
        => AssertActionResult(actionResult, StatusCodes.Status200OK);

    /// <summary>
    /// Asserts that the <see cref="IActionResult"/> is BadRequest (400).
    /// </summary>
    internal static void IsBadRequest(IActionResult? actionResult)
        => AssertActionResult(actionResult, StatusCodes.Status400BadRequest);

    /// <summary>
    /// Asserts that the <see cref="IActionResult"/> is Unauthorized (400).
    /// </summary>
    internal static void IsUnauthorized(IActionResult? actionResult)
        => AssertActionResult(actionResult, StatusCodes.Status401Unauthorized);

    /// <summary>
    /// Asserts that the <see cref="IActionResult"/> is NotFound (404).
    /// </summary>
    internal static void IsNotFound(IActionResult? actionResult)
        => AssertActionResult(actionResult, StatusCodes.Status404NotFound);

    /// <summary>
    /// Asserts that the <see cref="IActionResult"/> is InternalServerError (500).
    /// </summary>
    internal static void IsInternalServerError(IActionResult? actionResult)
        => AssertActionResult(actionResult, StatusCodes.Status500InternalServerError);

    private static void AssertActionResult(IActionResult? currentActionResult, int expectedStatusCode)
    {
        var statusCodeResult = currentActionResult as IStatusCodeActionResult;
        Assert.AreEqual(expectedStatusCode, statusCodeResult.StatusCode, "Unexpected StatusCode of action result.");
    }
}
