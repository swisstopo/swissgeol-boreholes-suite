using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BDMS.Migrations;
#pragma warning disable CA1505

/// <inheritdoc />
public partial class AddLOGCodelists : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(@"
            SELECT setval('bdms.codelist_id_cli_seq', (SELECT MAX(id_cli) FROM bdms.codelist));
            INSERT INTO bdms.codelist(
                schema_cli, code_cli, text_cli_en, text_cli_de, text_cli_fr, text_cli_it, order_cli
            ) VALUES
                ('log_convenyance_method','','WL','WL','WL','WL',10),
                ('log_convenyance_method','','LWD','LWD','LWD','LWD',20),
                ('log_convenyance_method','','PCL','PCL','PCL','PCL',30),
                ('log_convenyance_method','','Other','Anderes','Autre','Altro',40),
                ('log_convenyance_method','','Unknown','Unbekannt','Inconnu','Sconosciuto',50);

            INSERT INTO bdms.codelist(
                schema_cli, code_cli, text_cli_en, text_cli_de, text_cli_fr, text_cli_it, order_cli
            ) VALUES
                ('log_borehole_status','','OH','OH','OH','OH',10),
                ('log_borehole_status','','CH','CH','CH','CH',20),
                ('log_borehole_status','','OH & CH','OH & CH','OH & CH','OH & CH',30),
                ('log_borehole_status','','Other','Anderes','Autre','Altro',40),
                ('log_borehole_status','','Unknown','Unbekannt','Inconnu','Sconosciuto',50);

            INSERT INTO bdms.codelist(
                schema_cli, code_cli, text_cli_en, text_cli_de, text_cli_fr, text_cli_it, order_cli
            ) VALUES
                ('log_data_package','','Rush data (WL)','Rush Daten (WL)','Données rush (WL)','Dati rush (WL)',10),
                ('log_data_package','','Field data (WL)','Felddaten (WL)','Données de terrain (WL)','Dati di terreno (WL)',20),
                ('log_data_package','','Final data (WL)','Finale Daten (WL)','Données finales (WL)','Dati finali (WL)',30),
                ('log_data_package','','Real-Time data (LWD)','Echtzeitdaten (LWD)','Données en temps réel (LWD)','Dati in tempo reale (LWD)',40),
                ('log_data_package','','Memory data (LWD)','Memory Daten (LWD)','Données enregistrées (LWD)','Dati registrati (LWD)',50),
                ('log_data_package','','Processed data','Prozessierte Daten','Données traitées','Dati processati',60),
                ('log_data_package','','Interpreted data','Interpretierte Daten','Données interprétées','Dati interpretati',70),
                ('log_data_package','','Composite','Komposit','Composite','Composito',80),
                ('log_data_package','','Report','Bericht','Rapport','Rapporto',90),
                ('log_data_package','','Other ','Anderer','Autre','Altro',100),
                ('log_data_package','','Not specified','Keine Angabe','Sans indication','Senza indicazioni',110);

            INSERT INTO bdms.codelist(
                schema_cli, code_cli, text_cli_en, text_cli_de, text_cli_fr, text_cli_it, order_cli
            ) VALUES
                ('log_pass_type','','Main','Main','Principal','Principale',10),
                ('log_pass_type','','Repeat','Repeat','Répétition','Ripeti',20),
                ('log_pass_type','','Main & repeat','Main & repeat','Principal & répétition','Principale & ripeti',30),
                ('log_pass_type','','Downlog','Downlog','En descente','Downlog',40),
                ('log_pass_type','','Stationary','Stationär','Stationnaire','Stazionario',50),
                ('log_pass_type','','Other ','Anderer','Autre','Altro',60),
                ('log_pass_type','','Not specified','Keine Angabe','Sans indication','Senza indicazioni',70);

            INSERT INTO bdms.codelist(
                schema_cli, code_cli, text_cli_en, text_cli_de, text_cli_fr, text_cli_it, order_cli
            ) VALUES
                ('log_depth_type','','MD','MD','MD','MD',10),
                ('log_depth_type','','TVD','TVD','TVD','TVD',20),
                ('log_depth_type','','MD & TVD','MD & TVD','MD & TVD','MD & TVD',30),
                ('log_depth_type','','Other ','Anderer','Autre','Altro',40),
                ('log_depth_type','','Not specified','Keine Angabe','Sans indication','Senza indicazioni',50);

            INSERT INTO bdms.codelist(
                schema_cli, code_cli, text_cli_en, text_cli_de, text_cli_fr, text_cli_it, order_cli
            ) VALUES
                ('log_tool_type','CAL','Caliper','Kaliper','Caliper','Calibro',10),
                ('log_tool_type','GYRO','Gyroscope and inclinometer','Gyroskop und Inklinometer','Gyroscope et inclinomètre','Giroscopio e inclinometro',20),
                ('log_tool_type','GR','Gamma Ray','Gamma Ray','Rayons gamma','Raggi gamma',30),
                ('log_tool_type','SGR','Spectral Gamma Ray','Spectral Gamma Ray','Rayons gamma spectraux','Raggi gamma spettrale',40),
                ('log_tool_type','DT','Sonic (monopole & dipole)','Sonic (Monopol & Dipol)','Sonique (monopôle & dipôle)','Sonic (monopolo e dipolo)',50),
                ('log_tool_type','RHOB','Density','Dichte','Densité','Densità',60),
                ('log_tool_type','PEF','Photoelectric Factor','Photoelektrischer Absorptionsfaktor','Facteur photoélectrique','Fattore fotoelettrico',70),
                ('log_tool_type','NPHI','Neutron Porosity','Neutronenporosität','Porosité neutron','Porosità neutronica',80),
                ('log_tool_type','SIGMA','Sigma (Thermal Neutron Capture Cross-Section)','Sigma (Thermischer Neutroneneinfang-Querschnitt)','Sigma (section efficace de capture des neutrons thermiques)','Sigma (Sezione di cattura neutronica termica)',90),
                ('log_tool_type','SP','Spontaneous Potential','Spontanpotential','Potentiel spontané','Potenziale spontaneo',100),
                ('log_tool_type','RES','Resistivity (Laterolog / Induction / Array)','Resistivität (Laterolog / Induktion / Array)','Résistivité (latérolog / induction / array)','Resistività (laterolog / induzione / array)',110),
                ('log_tool_type','MRES','Microresistivity','Mikroresistivität','Micro-résistivité','Microresistività',120),
                ('log_tool_type','DIE','Dielectric','Dielektrik','Diélectrique','Dielettrica',130),
                ('log_tool_type','ECS','Elemental Capture Spectroscopy','Elemental Capture Spektroskopie','Spectroscopie de capture neutronique','Spettroscopia di cattura elementare',140),
                ('log_tool_type','NMR','Nuclear Magnetic Resonance','Kernmagnetische Resonanzspektroskopie','Diagraphie par résonance magnétique nucléaire','Risonanza magnetica nucleare',150),
                ('log_tool_type','RBI','Resistivity Borehole Imager','Resistivität-Bohrlochsonde','Outil d’imagerie de résistivité de forage','strumento di imaging di resistività della perforazione',160),
                ('log_tool_type','ABI','Acoustic Borehole Imager','Akustische-Bohrlochsonde','Outil d’imagerie acoustique de forage','Strumento di imaging acustico della perforazione',170),
                ('log_tool_type','OBI','Optical Borehole Imager','Optische Bohrlochkamera','Caméra optique de forage','Camera ottica della perforazione',180),
                ('log_tool_type','TEMP','Temperature','Temperatur','Température','Temperatura',190),
                ('log_tool_type','PLT','Production logging tools','Produktionslog-Sonden','Outils de diagraphies de production','Strumenti di logging di produzione della perforazione',200),
                ('log_tool_type','CBL','Cement Bond Log','Cement Bond Log','Log d’adhérence du ciment','Log di aderenza del cemento',210),
                ('log_tool_type','USIT / USI','Ultrasonic Cement and Casing Imager','Ultraschall-Zement- und Verrohrungsbohrlochsonde','Outil d’imagerie ultrasonique du ciment et du tubage','Strumento di imaging ultrasonico del cemento e della tubazione',220),
                ('log_tool_type','PNL','Pulsed neutron logging tools','Puls-Neutronensonden','Outils de diagraphie neutronique pulsée','Strumenti di logging neutronico impulsato',230),
                ('log_tool_type','','Other ','Anderer','Autre','Altro',240),
                ('log_tool_type','','Not specified','Keine Angabe','Sans indication','Senza indicazioni',250);
        ");
    }
}
#pragma warning restore CA1505
