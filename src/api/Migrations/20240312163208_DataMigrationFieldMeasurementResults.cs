using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class DataMigrationFieldMeasurementResults : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"INSERT INTO bdms.fieldmeasurement_result (
                sample_type,
                parameter,
                value,
                fieldmeasurement_id,
                creator,
                creation,
                updater,
                update
            )
            SELECT
                fm.sample_type,
                fm.parameter,
                fm.value,
                fm.id,
                ob.creator,
                ob.creation,
                ob.updater,
                ob.update
            FROM bdms.field_measurement fm
            JOIN bdms.observation ob ON fm.id = ob.id");
    }
}
