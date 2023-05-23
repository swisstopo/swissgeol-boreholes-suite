using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

public partial class ChangeHydrogeologySchemaNames : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            UPDATE bdms.codelist
            SET schema_cli = 'observation_reliability'
            WHERE schema_cli = 'observ101';

            UPDATE bdms.codelist
            SET schema_cli = 'wateringress_quantitiy'
            WHERE schema_cli = 'waing101';

            UPDATE bdms.codelist
            SET schema_cli = 'wateringress_condition'
            WHERE schema_cli = 'waing102';

            UPDATE bdms.codelist
            SET schema_cli = 'groundwaterlevel_kind'
            WHERE schema_cli = 'gwlme101';

            UPDATE bdms.codelist
            SET schema_cli = 'hydrotest_kind'
            WHERE schema_cli = 'htest101';

            UPDATE bdms.codelist
            SET schema_cli = 'hydrotest_flowdirection'
            WHERE schema_cli = 'htest102';

            UPDATE bdms.codelist
            SET schema_cli = 'hydrotest_evaluationmethod'
            WHERE schema_cli = 'htest103';

            UPDATE bdms.codelist
            SET schema_cli = 'hydrotest_result'
            WHERE schema_cli = 'htestres101';

            UPDATE bdms.codelist
            SET schema_cli = 'fieldmeasurement_type'
            WHERE schema_cli = 'field101';

            UPDATE bdms.codelist
            SET schema_cli = 'fieldmeasurement_parameter'
            WHERE schema_cli = 'field102';");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
