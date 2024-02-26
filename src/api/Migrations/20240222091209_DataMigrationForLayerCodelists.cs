using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class DataMigrationForLayerCodelists : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            INSERT INTO bdms.layer_color_codelist (id_lay_fk, id_cli_fk)
            SELECT id_lay_fk, id_cli_fk
            FROM bdms.layer_codelist
            WHERE code_cli = 'colour';

            INSERT INTO bdms.layer_debris_codelist (id_lay_fk, id_cli_fk)
            SELECT id_lay_fk, id_cli_fk
            FROM bdms.layer_codelist
            WHERE code_cli = 'debris';

            INSERT INTO bdms.layer_grain_shape_codelist (id_lay_fk, id_cli_fk)
            SELECT id_lay_fk, id_cli_fk
            FROM bdms.layer_codelist
            WHERE code_cli = 'grain_shape';

            INSERT INTO bdms.layer_grain_angularity_codelist (id_lay_fk, id_cli_fk)
            SELECT id_lay_fk, id_cli_fk
            FROM bdms.layer_codelist
            WHERE code_cli = 'grain_angularity';

            INSERT INTO bdms.layer_organic_component_codelist (id_lay_fk, id_cli_fk)
            SELECT id_lay_fk, id_cli_fk
            FROM bdms.layer_codelist
            WHERE code_cli = 'organic_components';

            INSERT INTO bdms.layer_uscs3_codelist (id_lay_fk, id_cli_fk)
            SELECT id_lay_fk, id_cli_fk
            FROM bdms.layer_codelist
            WHERE code_cli = 'uscs_type';");
    }
}
