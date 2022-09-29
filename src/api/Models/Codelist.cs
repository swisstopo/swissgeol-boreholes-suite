using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BDMS.Models;
[Table("codelist")]
public partial class Codelist
{
    [Key]
    [Column("id_cli")]
    public int Id { get; set; }
    [Column("geolcode")]
    public int? Geolcode { get; set; }
    [Column("schema_cli")]
    public string? Schema { get; set; }
    [Column("code_cli")]
    public string Code { get; set; }
    [Column("text_cli_en")]
    public string TextEn { get; set; }
    [Column("description_cli_en")]
    public string DescriptionEn { get; set; }
    [Column("text_cli_de")]
    public string? TextDe { get; set; }
    [Column("description_cli_de")]
    public string? DescriptionDe { get; set; }
    [Column("text_cli_fr")]
    public string? TextFr { get; set; }
    [Column("description_cli_fr")]
    public string? DescriptionFr { get; set; }
    [Column("text_cli_it")]
    public string? TextIt { get; set; }
    [Column("description_cli_it")]
    public string? DescriptionIt { get; set; }
    [Column("text_cli_ro")]
    public string? TextRo { get; set; }
    [Column("description_cli_ro")]
    public string? DescriptionRo { get; set; }
    [Column("order_cli")]
    public int? Order { get; set; }
    [Column("conf_cli")]
    public string? Conf { get; set; }
    [Column("default_cli")]
    public bool? Default { get; set; }
}
