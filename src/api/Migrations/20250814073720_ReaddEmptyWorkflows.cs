using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;
#pragma warning disable CA1505

/// <inheritdoc />
public partial class ReaddEmptyWorkflows : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // add missing default value for general column
        migrationBuilder.AlterColumn<bool>(
            name: "general",
            schema: "bdms",
            table: "tab_status",
            type: "boolean",
            nullable: false,
            defaultValue: false,
            oldClrType: typeof(bool),
            oldType: "boolean",
            oldNullable: false);

        migrationBuilder.Sql("""
        DO
        $$
        DECLARE
          borehole_cursor CURSOR FOR SELECT id_bho FROM bdms.borehole;

          v_borehole_id bdms.borehole.id_bho%TYPE;
          v_tab_status_reviewed_id bdms.tab_status.tab_status_id%TYPE;
          v_tab_status_published_id bdms.tab_status.tab_status_id%TYPE;
        BEGIN

         DELETE FROM bdms.workflow;
         DELETE FROM bdms.workflow_change;
         DELETE FROM bdms.tab_status;
          -- Loop through each borehole
          FOR borehole_record IN borehole_cursor LOOP
            -- Insert into tab_status and capture the generated IDs
            INSERT INTO bdms.tab_status DEFAULT VALUES
            RETURNING tab_status_id INTO v_tab_status_reviewed_id;

            INSERT INTO bdms.tab_status DEFAULT VALUES
            RETURNING tab_status_id INTO v_tab_status_published_id;

            -- Now insert into workflow table with borehole_id and the two tab_status IDs
            v_borehole_id := borehole_record.id_bho;
            INSERT INTO bdms.workflow (borehole_id, has_requested_changes, reviewed_tabs_id, published_tabs_id, status)
            VALUES (v_borehole_id, FALSE, v_tab_status_reviewed_id, v_tab_status_published_id, 0 /* draft */);
          END LOOP;
        END;
        $$;
        """);
    }
}
#pragma warning restore CA1505
