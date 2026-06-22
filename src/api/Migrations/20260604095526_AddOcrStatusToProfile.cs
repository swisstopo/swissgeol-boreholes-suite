using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class AddOcrStatusToProfile : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<int>(
            name: "ocr_status",
            schema: "bdms",
            table: "profile",
            type: "integer",
            nullable: false,
            defaultValue: 0);

        // Data backfill: mark existing PDFs as Success (= 2) and everything else as WillNotBeProcessed (= 4).
        // New rows default to Created (= 0) so they go through OCR normally.
        migrationBuilder.Sql(@"
                UPDATE bdms.profile
                SET ocr_status = CASE
                    WHEN LOWER(type) = 'application/pdf' THEN 2
                    ELSE 4
                END;
            ");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "ocr_status",
            schema: "bdms",
            table: "profile");
    }
}
