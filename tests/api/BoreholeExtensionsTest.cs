using BDMS.Models;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BDMS;

[TestClass]
public class BoreholeExtensionsTest
{
    [TestMethod]
    public void IsWithingPreDefinedTolerance()
    {
        var boreholeMaster = new Borehole { TotalDepth = 100, LocationX = 2617360.73, LocationY = 1221773.39, LocationXLV03 = 617360.35, LocationYLV03 = 221773.17 };
        var boreholeWithinSameDepth = new Borehole { TotalDepth = 100, LocationX = 2617360.95, LocationY = 1221773.89, LocationXLV03 = 617360.57, LocationYLV03 = 221773.67 };

        var boreholeWithinNotSameDepth = new Borehole { TotalDepth = 99.9, LocationX = 2617360.95, LocationY = 1221773.89, LocationXLV03 = 617360.57, LocationYLV03 = 221773.67 };
        var boreholeNotWithingSameDepth = new Borehole { TotalDepth = 100, LocationX = 2617333.35, LocationY = 1221764.47, LocationXLV03 = 617332.97, LocationYLV03 = 221764.25 };
        var boreholeNotWithingNotSameDepth = new Borehole { TotalDepth = 100.1, LocationX = 2617333.35, LocationY = 1221764.47, LocationXLV03 = 617332.97, LocationYLV03 = 221764.25 };

        Assert.IsTrue(boreholeMaster.IsWithingPreDefinedTolerance([boreholeWithinSameDepth]));

        Assert.IsFalse(boreholeMaster.IsWithingPreDefinedTolerance([boreholeWithinNotSameDepth]));
        Assert.IsFalse(boreholeMaster.IsWithingPreDefinedTolerance([boreholeNotWithingSameDepth]));
        Assert.IsFalse(boreholeMaster.IsWithingPreDefinedTolerance([boreholeNotWithingNotSameDepth]));
    }

    [TestMethod]
    public void ValidateCasingReferences()
    {
        var casingSanBitter = new Casing { Id = 1 };
        var casingBitterLemon = new Casing { Id = 2 };
        var casingMintExtraction = new Casing { Id = 3 };

        var boreholeValidEmptyCasings = BuildBoreholeWithCasings([]);
        var boreholeValidNullCasings = BuildBoreholeWithCasings(null);
        var boreholeValidSingleCasing = BuildBoreholeWithCasings([casingMintExtraction], null, null, casingMintExtraction);
        var boreholeValidCompleteCasings = BuildBoreholeWithCasings([casingSanBitter, casingBitterLemon, casingMintExtraction], casingMintExtraction, casingSanBitter, casingBitterLemon);
        var boreholeMissingMintExtraction = BuildBoreholeWithCasings([casingBitterLemon], casingSanBitter, casingMintExtraction);
        var boreholeMissingSanBitter = BuildBoreholeWithCasings([], casingSanBitter);

        // Validate single borehole
        Assert.IsTrue(boreholeValidEmptyCasings.ValidateCasingReferences());
        Assert.IsTrue(boreholeValidNullCasings.ValidateCasingReferences());
        Assert.IsTrue(boreholeValidSingleCasing.ValidateCasingReferences());
        Assert.IsTrue(boreholeValidCompleteCasings.ValidateCasingReferences());

        Assert.IsFalse(boreholeMissingMintExtraction.ValidateCasingReferences());
        Assert.IsFalse(boreholeMissingSanBitter.ValidateCasingReferences());

        // Validate a list containing multiple boreholes
        Assert.IsTrue(Enumerable.Empty<Borehole>().ValidateCasingReferences());
        Assert.IsTrue(new List<Borehole> { boreholeValidNullCasings, boreholeValidCompleteCasings }.ValidateCasingReferences());

        Assert.IsFalse(new List<Borehole> { boreholeValidEmptyCasings, boreholeMissingMintExtraction }.ValidateCasingReferences());
        Assert.IsFalse(new List<Borehole> { boreholeMissingSanBitter, boreholeMissingMintExtraction }.ValidateCasingReferences());
    }

    private static Borehole BuildBoreholeWithCasings(
        IEnumerable<Casing>? casingsInCompletions,
        Casing? casingInInstrumentation = null,
        Casing? casingInBackfill = null,
        Casing? casingInObservation = null)
    {
        return new Borehole
        {
            Completions =
            [
                new Completion
                {
                    Casings = casingsInCompletions?.ToList(),
                    Instrumentations =
                    [
                        new Instrumentation
                        {
                            Casing = casingInInstrumentation,
                            CasingId = casingInInstrumentation?.Id,
                        },
                    ],
                    Backfills =
                    [
                        new Backfill
                        {
                            Casing = casingInBackfill,
                            CasingId = casingInBackfill?.Id,
                        },
                    ],
                },
            ],
            Observations =
            [
                new Observation
                {
                    Casing = casingInObservation,
                    CasingId = casingInObservation?.Id,
                },
            ],
        };
    }
}
