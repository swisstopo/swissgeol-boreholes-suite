using Microsoft.EntityFrameworkCore;

namespace BDMS.Controllers;

/// <summary>
/// Resets admin user settings and codelist configuration to their initial state.
/// Shared between <see cref="UserController.ResetAllSettings"/> and <see cref="TestResetController"/>.
/// </summary>
public class UserSettingsResetService(BdmsContext context)
{
    /// <summary>
    /// Resets admin user settings and codelist configuration in the current <see cref="BdmsContext"/>.
    /// If a transaction is already open on the context, the statements run inside it.
    /// </summary>
    public void Reset()
    {
        // Reset admin settings to initial state
        context.Database.ExecuteSqlRaw("UPDATE bdms.users SET settings_usr = null;");
        context.Database.ExecuteSqlRaw("UPDATE bdms.users SET settings_usr = '{{\"filter\": {{\"custom\": {{\"borehole_identifier\": true, \"project_name\": true, \"landuse\": true, \"alternate_name\": true, \"canton\": true, \"city\": true}}, \"restriction\": true, \"restriction_until\": true, \"extended\": {{ \"original_name\": true, \"method\": true, \"status\": true}}, \"kind\": true, \"elevation_z\": true, \"length\": true, \"drilling_date\": true, \"zoom2selected\": true}}, \"boreholetable\": {{ \"orderby\": \"original_name\", \"direction\": \"ASC\"}}, \"eboreholetable\": {{ \"orderby\": \"original_name\", \"direction\": \"ASC\"}}, \"map\": {{ \"explorer\": {{ }}, \"editor\": {{ }} }}, \"appearance\": {{ \"explorer\": 1}}}}' WHERE username = 'admin';");

        // Reset codelist settings to initial state
        context.Database.ExecuteSqlRaw("UPDATE bdms.codelist SET conf_cli = '{{\"text\": \"lithology_id_cli\", \"color\": \"lithostratigraphy\", \"title\": \"lithostratigraphy_id_cli\", \"fields\": {{\"color\": true, \"notes\": true, \"debris\": true, \"striae\": true, \"uscs_1\": true, \"uscs_2\": true, \"uscs_3\": true, \"geology\": true, \"cohesion\": true, \"humidity\": true, \"jointing\": true, \"lithology\": true, \"alteration\": true, \"plasticity\": true, \"soil_state\": true, \"compactness\": true, \"consistance\": true, \"description\": true, \"grain_shape\": true, \"lit_pet_deb\": true, \"grain_size_1\": true, \"grain_size_2\": true, \"tectonic_unit\": true, \"uscs_original\": true, \"description_quality\": true, \"grain_granularity\": true, \"lithostratigraphy\": true, \"organic_component\": true, \"chronostratigraphy\": true, \"further_properties\": true, \"uscs_determination\": true}}, \"textNS\": \"lithology_con\", \"colorNS\": \"lithostratigraphy\", \"pattern\": \"lithology\", \"titleNS\": \"custom.chro_str_top_bedrock\", \"patternNS\": \"lithology_con\"}}' WHERE conf_cli IS NOT NULL and schema_cli = 'layer_kind';");
    }
}