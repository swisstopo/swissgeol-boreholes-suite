-- =============================================================================
-- As part of the docker-entrypoint initialization, this script deletes non-free
-- and non-published boreholes and several other data which are not needed in
-- the public view of the database.
-- =============================================================================

-- Insert default workgroup 'Default'
INSERT INTO bdms.workgroups(id_wgp, name_wgp)
VALUES (1, 'Default')
ON CONFLICT (id_wgp)
DO UPDATE SET name_wgp = EXCLUDED.name_wgp;

-- Update existing boreholes to default workgroup
UPDATE bdms.borehole SET id_wgp_fk = 1 WHERE id_wgp_fk <> 1;
DELETE FROM bdms.workgroups WHERE id_wgp <> 1;

-- Insert default anonymous user to enable anonymous access
INSERT INTO bdms.users(admin_usr, username, firstname, lastname, subject_id)
VALUES (false, 'Anonymous', 'Anonymous', 'Anonymous', 'sub_anonymous');

-- Update and disable existing users
UPDATE bdms.users
SET admin_usr = false,
    username = 'Anonymous',
    firstname = 'Anonymous',
    lastname = 'Anonymous',
    disabled_usr = NOW()
WHERE username <> 'Anonymous';

-- Purge attachments
DELETE FROM bdms.borehole_files WHERE true;
DELETE FROM bdms.files WHERE true;

-- Purge non-free and non-published boreholes
DELETE FROM bdms.borehole WHERE id_bho NOT IN (
    SELECT DISTINCT id_bho FROM bdms.borehole
    JOIN bdms.codelist ON codelist.id_cli = borehole.restriction_id_cli
    JOIN bdms.workflow ON workflow.id_bho_fk = borehole.id_bho
    JOIN bdms.roles ON roles.id_rol = workflow.id_rol_fk
    WHERE codelist.schema_cli = 'restriction'
      AND codelist.code_cli = 'f' -- restriction: free
      AND roles.name_rol = 'PUBLIC' -- publication status: published
);

-- Purge workflow data
DELETE FROM bdms.workflow
WHERE id_rol_fk NOT IN (
    SELECT id_rol FROM bdms.roles WHERE name_rol = 'PUBLIC'
);

-- Purge specific borehole fields
UPDATE bdms.borehole
SET original_name_bho = NULL
WHERE original_name_bho <> NULL;

SELECT COUNT(*) AS "Free/Published Boreholes" FROM bdms.borehole;
