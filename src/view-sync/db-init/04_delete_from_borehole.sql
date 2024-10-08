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

INSERT INTO bdms.users_roles(id_usr_fk, id_rol_fk, id_wgp_fk)
VALUES ((SELECT id_usr FROM bdms.users WHERE subject_id = 'sub_anonymous'),
        (SELECT id_rol FROM bdms.roles WHERE name_rol = 'VIEW'),
        (SELECT id_wgp FROM bdms.workgroups WHERE name_wgp = 'Default'));

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
    SELECT id_bho FROM bdms.borehole
    JOIN bdms.codelist ON codelist.id_cli = borehole.restriction_id_cli
    JOIN bdms.workflow ON workflow.id_bho_fk = borehole.id_bho
    JOIN bdms.roles ON roles.id_rol = workflow.id_rol_fk
    WHERE workflow.id_wkf IN (SELECT MAX(id_wkf) FROM bdms.workflow GROUP BY id_bho_fk)
      AND finished_wkf IS NOT NULL -- get latest publication status
      AND roles.name_rol = 'PUBLIC' -- publication status: published
      AND codelist.schema_cli = 'restriction'
      AND codelist.code_cli = 'f' -- restriction: free
);

-- Purge workflow data
DELETE FROM bdms.workflow
WHERE id_rol_fk NOT IN (
    SELECT id_rol FROM bdms.roles WHERE name_rol = 'PUBLIC'
);

-- Purge specific borehole fields
UPDATE bdms.borehole
SET original_name_bho = NULL
WHERE original_name_bho IS NOT NULL;

SELECT COUNT(*) AS "Free/Published Boreholes" FROM bdms.borehole;
