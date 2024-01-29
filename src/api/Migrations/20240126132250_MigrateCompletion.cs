using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;

/// <inheritdoc />
public partial class MigrateCompletion : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Create a completion for each borehole and migrate all casing layers to the casing table.
        // Delete all casing, backfill and instrumentation layers.
        // Delete all stratigraphy entries for casing, backfill and instrumentation layers.
        // At the time of migration no instrumentation or backfill layers had to be migrated.
        migrationBuilder.Sql(@"
DO $$          
DECLARE
	currentStratigraphyRow bdms.stratigraphy%ROWTYPE;
	currentLayerRow bdms.layer%ROWTYPE;
    bhoId INT;
	newCompletionId INT;
BEGIN
	DROP TABLE IF EXISTS bho_completion_link_temp;
	CREATE TEMPORARY TABLE bho_completion_link_temp (
		id SERIAL PRIMARY KEY,
		bho_id INT,
		completion_id INT NULL
	);
	
	-- Insert all bho ids which need to have a completion
	INSERT INTO bho_completion_link_temp (bho_id)
	SELECT
		id_bho_fk
	FROM
		bdms.stratigraphy
	WHERE
		kind_id_cli in (3002,3003,3004)
	group by id_bho_fk;
	
	-- Create a completion for each borehole
    WHILE (SELECT count(*) FROM bho_completion_link_temp WHERE completion_id is null) > 0
    LOOP
        SELECT bho_id INTO bhoId FROM bho_completion_link_temp WHERE completion_id is null ORDER BY bho_id LIMIT 1;
		
		INSERT INTO bdms.completion(borehole_id, is_primary, name, kind_id, notes, abandon_date, creator, creation, updater, update)
        VALUES (bhoId, true, NULL, 16000000, 
				NULL, NULL, 1, CURRENT_TIMESTAMP AT TIME ZONE 'UTC'
			   ,NULL, NULL) 
        RETURNING id INTO newCompletionId;
		
		Update bho_completion_link_temp
		Set completion_id = newCompletionId
		Where bho_id = bhoId;
	END LOOP;
	
	-- Loop through all layers to migrate. If it's a casing layer, migrate it to the casing table and allocate it to the borehole's completion.
	-- Investigations shown, that at the time of migration no instrumentaion not backfill had to be migrated.
	WHILE (SELECT Count(*) FROM bdms.layer join bdms.stratigraphy on bdms.layer.id_sty_fk = bdms.stratigraphy.id_sty where bdms.stratigraphy.kind_id_cli in (3002,3003,3004)) > 0
    LOOP
        SELECT * INTO currentLayerRow 
		FROM bdms.layer 
		where id_lay = (SELECT bdms.layer.id_lay FROM bdms.layer join bdms.stratigraphy on bdms.layer.id_sty_fk = bdms.stratigraphy.id_sty where bdms.stratigraphy.kind_id_cli in (3002,3003,3004) LIMIT 1)
		LIMIT 1;
		
		SELECT * INTO currentStratigraphyRow FROM bdms.stratigraphy where id_sty = currentLayerRow.id_sty_fk LIMIT 1;
	
		IF currentStratigraphyRow.kind_id_cli = 3002 THEN
			INSERT INTO bdms.casing(completion_id, name, from_depth, to_depth, kind_id, material_id, inner_diameter, outer_diameter, date_start, date_finish, notes, creator, creation, updater, update)
			VALUES ((Select completion_id from bho_completion_link_temp where bho_id = currentStratigraphyRow.id_bho_fk LIMIT 1),
									COALESCE(currentLayerRow.casng_id, ''), COALESCE(currentLayerRow.depth_from_lay, 0), COALESCE(currentLayerRow.depth_to_lay, 0), COALESCE(currentLayerRow.casng_kind_id_cli, 25000107), 
									25000115, COALESCE(currentLayerRow.casng_inner_diameter_lay, 0), COALESCE(currentLayerRow.casng_outer_diameter_lay, 0),
									DATE '0001-01-01', DATE '0001-01-01',currentLayerRow.notes_lay,
									1, CURRENT_TIMESTAMP AT TIME ZONE 'UTC'
									,NULL, NULL);
		END IF;
		
		RAISE NOTICE 'delete layer %', currentLayerRow.id_lay;
		Delete from bdms.layer where id_lay = currentLayerRow.id_lay;
	END LOOP;
	
	Delete from bdms.stratigraphy where kind_id_cli = 3003;
	Delete from bdms.stratigraphy where kind_id_cli = 3004;
	Delete from bdms.stratigraphy where kind_id_cli = 3002;
END $$;

DROP TABLE IF EXISTS bho_completion_link_temp;

");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
