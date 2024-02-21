using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class RenameCodesInJoinTables : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            UPDATE bdms.layer_codelist SET code_cli = 'uscs_type' WHERE code_cli = 'mcla101';
            UPDATE bdms.layer_codelist SET code_cli = 'debris' WHERE code_cli = 'mcla107';
            UPDATE bdms.layer_codelist SET code_cli = 'organic_components' WHERE code_cli = 'mlpr108';
            UPDATE bdms.layer_codelist SET code_cli = 'grain_shape' WHERE code_cli = 'mlpr110';
            UPDATE bdms.layer_codelist SET code_cli = 'colour' WHERE code_cli = 'mlpr112';
            UPDATE bdms.layer_codelist SET code_cli = 'grain_angularity' WHERE code_cli = 'mlpr115';");
    }
}
