namespace BDMS.Uploads;

/// <summary>
/// What reading back the metadata an upload was created with found.
///
/// An upload that is not there and an upload that no longer says what it is for are answered
/// differently, so they cannot be told apart by a missing result alone.
/// </summary>
public enum StoredMetadataResult
{
    /// <summary>Nothing is stored under the id the request names.</summary>
    NoSuchUpload,

    /// <summary>The upload is stored, but what it was created for cannot be read back from it.</summary>
    Unreadable,

    /// <summary>What the upload was created for was read.</summary>
    Read,
}
