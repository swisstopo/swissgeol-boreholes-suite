using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class AddGrainSizeRangeCodes : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
        INSERT INTO bdms.codelist(geolcode, ""schema"", code, text_en, text_de, text_fr, text_it, ""order"")
        VALUES
            (21109002, 'grain_size', 'f-m', 'fine-medium', 'fein-mittel', 'fin-moyen', 'fine-medio', 23),
            (21109008, 'grain_size', 'f-c', 'fine-coarse', 'fein-grob', 'fin-grossier', 'fine-grossolano', 26),
            (21109004, 'grain_size', 'm-c', 'medium-coarse', 'mittel-grob', 'moyen-grossier', 'medio-grossolano', 35);
        ");
    }
}
