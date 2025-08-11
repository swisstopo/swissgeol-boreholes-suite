﻿using BDMS.Json;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace BDMS.Models;

/// <summary>
/// Represents a stratigraphy entity in the database.
/// </summary>
[Table("stratigraphy_v2")]
public class StratigraphyV2 : IChangeTracking, IIdentifyable
{
    /// <inheritdoc />
    [JsonRequired]
    [Column("id")]
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the foreign key for the <see cref="Borehole"/> associated  with the <see cref="StratigraphyV2"/>.
    /// </summary>
    [JsonRequired]
    [Column("borehole_id")]
    public int BoreholeId { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="Borehole"/> associated  with the <see cref="StratigraphyV2"/>.
    /// </summary>
    public Borehole? Borehole { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="StratigraphyV2"/>'s name.
    /// </summary>
    [JsonRequired]
    [IncludeInExport]
    [Column("name")]
    public string Name { get; set; }

    /// <summary>
    /// Gets or sets the <see cref="StratigraphyV2"/>'s date.
    /// </summary>
    [IncludeInExport]
    [Column("date")]
    public DateTime? Date { get; set; }

    /// <summary>
    /// Gets or sets whether the <see cref="StratigraphyV2"/> is primary.
    /// </summary>
    [IncludeInExport]
    [JsonRequired]
    [Column("is_primary")]
    public bool IsPrimary { get; set; }

    /// <inheritdoc />
    [Column("update")]
    public DateTime? Updated { get; set; }

    /// <inheritdoc />
    [Column("updater")]
    public int? UpdatedById { get; set; }

    /// <inheritdoc />
    public User? UpdatedBy { get; set; }

    /// <inheritdoc />
    [Column("creation")]
    public DateTime? Created { get; set; }

    /// <inheritdoc />
    [Column("creator")]
    public int? CreatedById { get; set; }

    /// <inheritdoc />
    public User? CreatedBy { get; set; }
}
