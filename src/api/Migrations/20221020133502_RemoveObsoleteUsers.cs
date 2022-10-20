using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

public partial class RemoveObsoleteUsers : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
UPDATE bdms.borehole SET updated_by_bho = NULL WHERE updated_by_bho IN (SELECT id_usr FROM bdms.users WHERE username IN ('BRS', 'editor', 'franzi', 'Nadine', 'Raphael', 'St. Gallen', 'test', 'test_VD', 'ZH_AWEL-Toth'));
UPDATE bdms.stratigraphy SET author_sty = NULL WHERE author_sty IN (SELECT id_usr FROM bdms.users WHERE username IN ('BRS', 'editor', 'franzi', 'Nadine', 'Raphael', 'St. Gallen', 'test', 'test_VD', 'ZH_AWEL-Toth'));
UPDATE bdms.stratigraphy SET updater_sty = NULL WHERE updater_sty IN (SELECT id_usr FROM bdms.users WHERE username IN ('BRS', 'editor', 'franzi', 'Nadine', 'Raphael', 'St. Gallen', 'test', 'test_VD', 'ZH_AWEL-Toth'));

-- Set admin user as updater/creator because NULL values are not allowed
UPDATE bdms.layer SET updater_lay = (SELECT id_usr FROM bdms.users WHERE username = 'admin') WHERE updater_lay IN (SELECT id_usr FROM bdms.users WHERE username IN ('BRS', 'editor', 'franzi', 'Nadine', 'Raphael', 'St. Gallen', 'test', 'test_VD', 'ZH_AWEL-Toth'));
UPDATE bdms.layer SET creator_lay = (SELECT id_usr FROM bdms.users WHERE username = 'admin') WHERE creator_lay IN (SELECT id_usr FROM bdms.users WHERE username IN ('BRS', 'editor', 'franzi', 'Nadine', 'Raphael', 'St. Gallen', 'test', 'test_VD', 'ZH_AWEL-Toth'));

DELETE FROM bdms.workflow WHERE id_usr_fk IN (SELECT id_usr FROM bdms.users WHERE username IN ('BRS', 'editor', 'franzi', 'Nadine', 'Raphael', 'St. Gallen', 'test', 'test_VD', 'ZH_AWEL-Toth'));
DELETE FROM bdms.files WHERE id_usr_fk IN (SELECT id_usr FROM bdms.users WHERE username IN ('BRS', 'editor', 'franzi', 'Nadine', 'Raphael', 'St. Gallen', 'test', 'test_VD', 'ZH_AWEL-Toth'));
DELETE FROM bdms.borehole_files WHERE id_usr_fk IN (SELECT id_usr FROM bdms.users WHERE username IN ('BRS', 'editor', 'franzi', 'Nadine', 'Raphael', 'St. Gallen', 'test', 'test_VD', 'ZH_AWEL-Toth'));
DELETE FROM bdms.users WHERE username IN ('BRS', 'editor', 'franzi', 'Nadine', 'Raphael', 'St. Gallen', 'test', 'test_VD', 'ZH_AWEL-Toth');");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
