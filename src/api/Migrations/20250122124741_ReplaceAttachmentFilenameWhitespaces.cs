using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations
{
    /// <inheritdoc />
    public partial class ReplaceAttachmentFilenameWhitespaces : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE bdms.files
                SET name_fil = REPLACE(name_fil, ' ', '_'); ");
        }
    }
}
