using BDMS.Models;

namespace BDMS.Services;

/// <summary>
/// Stages the persistence of the Lithology tab of a stratigraphy. The tab owns three sibling
/// collections (<see cref="Lithology"/>, <see cref="LithologicalDescription"/> and
/// <see cref="FaciesDescription"/>) that are loaded and persisted together. The service only stages
/// changes on the EF change tracker; the calling controller owns the single transactional save so the
/// stratigraphy header and its tab contents commit atomically.
/// </summary>
public interface ILithologyTabContentService
{
    /// <summary>
    /// Attaches the tab's child collections onto an already-staged (Id == 0) <paramref name="stratigraphy"/>
    /// so the controller's single <c>AddAsync</c> cascades the whole subgraph.
    /// </summary>
    Task StageContentForCreateAsync(Stratigraphy stratigraphy, LithologyTabContents contents);

    /// <summary>
    /// Diff-syncs the three child collections of an existing stratigraphy onto the change tracker
    /// (create/update/delete). Does not call <c>SaveChanges</c>.
    /// </summary>
    Task SyncContentAsync(int stratigraphyId, LithologyTabContents contents);

    /// <summary>
    /// Loads the full Lithology tab contents of the given stratigraphy.
    /// </summary>
    Task<LithologyTabContents> LoadContentAsync(int stratigraphyId);

    /// <summary>
    /// Returns true if every child row in <paramref name="contents"/> either has no stratigraphy id yet
    /// or references the given <paramref name="stratigraphyId"/>.
    /// </summary>
    bool ValidateChildStratigraphyIds(LithologyTabContents contents, int stratigraphyId, out string? errorMessage);
}
