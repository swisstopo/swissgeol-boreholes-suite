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

        // Data backfill: PDFs go through OCR processing, everything else is marked WillNotBeProcessed (= 4).
        // We cannot retroactively distinguish already-OCRed PDFs from never-OCRed ones, so we
        // re-process all PDFs.
        migrationBuilder.Sql(@"
                UPDATE bdms.profile
                SET ocr_status = 4
                WHERE LOWER(type) <> 'application/pdf';
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
