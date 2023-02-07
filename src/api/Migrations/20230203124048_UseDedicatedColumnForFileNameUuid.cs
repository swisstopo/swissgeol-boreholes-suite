using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

public partial class UseDedicatedColumnForFileNameUuid : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            ALTER TABLE bdms.files ADD COLUMN IF NOT EXISTS name_uuid_fil text NULL;
            UPDATE bdms.files SET name_uuid_fil = conf_fil::json->>'key';
            ALTER TABLE bdms.files DROP COLUMN IF EXISTS conf_fil;
        ");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
