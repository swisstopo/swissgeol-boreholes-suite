using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class NormalizeCodelistOtherTexts : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            UPDATE bdms.codelist SET text_cli_en = 'other'             WHERE LOWER(TRIM(text_cli_en)) = 'other';
            UPDATE bdms.codelist SET text_cli_en = 'not specified'     WHERE LOWER(TRIM(text_cli_en)) = 'not specified';

            UPDATE bdms.codelist SET text_cli_de = 'anderer'           WHERE LOWER(TRIM(text_cli_de)) = 'anderer';
            UPDATE bdms.codelist SET text_cli_de = 'keine Angabe'      WHERE LOWER(TRIM(text_cli_de)) = 'keine angabe';

            UPDATE bdms.codelist SET text_cli_fr = 'autre'             WHERE LOWER(TRIM(text_cli_fr)) = 'autre';
            UPDATE bdms.codelist SET text_cli_fr = 'sans indication'   WHERE LOWER(TRIM(text_cli_fr)) = 'sans indication';

            UPDATE bdms.codelist SET text_cli_it = 'altro'             WHERE LOWER(TRIM(text_cli_it)) = 'altro';
            UPDATE bdms.codelist SET text_cli_it = 'senza indicazioni' WHERE LOWER(TRIM(text_cli_it)) = 'senza indicazioni';
        ");
    }
}
