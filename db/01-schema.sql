CREATE EXTENSION postgis;

CREATE EXTENSION pgcrypto;

CREATE EXTENSION ltree;

CREATE SCHEMA bdms;

CREATE TABLE bdms.config
(
    name_cfg character varying NOT NULL,
    value_cfg character varying,
    PRIMARY KEY (name_cfg)
);

CREATE TABLE bdms.feedbacks
(
    id_feb serial NOT NULL,
    created_feb timestamp with time zone DEFAULT now(),
    user_feb character varying NOT NULL,
    message_feb character varying,
    tag_feb character varying,
    frw_feb boolean DEFAULT false,
    PRIMARY KEY (id_feb)
);

CREATE TABLE bdms.terms
(
    id_tes serial NOT NULL,
    draft_tes boolean NOT NULL DEFAULT TRUE,
    text_tes_en character varying NOT NULL,
    text_tes_de character varying,
    text_tes_fr character varying,
    text_tes_it character varying,
    text_tes_ro character varying,
    creation_tes timestamp with time zone NOT NULL DEFAULT now(),
    expired_tes timestamp with time zone,
    PRIMARY KEY (id_tes)
);

CREATE TABLE bdms.contents (
    id_cnt serial,
    name_cnt character varying NOT NULL,
    draft_cnt boolean NOT NULL DEFAULT true,

    title_cnt_en character varying,
    text_cnt_en character varying,

    title_cnt_de character varying,
    text_cnt_de character varying,

    title_cnt_fr character varying,
    text_cnt_fr character varying,

    title_cnt_it character varying,
    text_cnt_it character varying,

    title_cnt_ro character varying,
    text_cnt_ro character varying,

    creation_cnt timestamp with time zone  DEFAULT now(),
    expired_cnt timestamp with time zone,

    PRIMARY KEY (id_cnt)
);

CREATE TABLE bdms.cantons
(
    gid serial NOT NULL,
    uuid character varying(38),
    datum_aend date,
    datum_erst date,
    erstell_j integer,
    erstell_m character varying(20),
    revision_j integer,
    revision_m character varying(20),
    grund_aend character varying(20),
    herkunft character varying(20),
    herkunft_j integer,
    herkunft_m character varying(20),
    objektart character varying(20),
    revision_q character varying(100),
    icc character varying(20),
    kantonsnum integer,
    see_flaech numeric,
    kantonsfla numeric,
    kt_teil character varying(20),
    name character varying(254),
    einwohnerz integer,
    geom geometry(MultiPolygonZM),
    CONSTRAINT cantons_pkey PRIMARY KEY (gid)
);

CREATE TABLE bdms.municipalities
(
    gid serial NOT NULL,
    uuid character varying(38),
    datum_aend date,
    datum_erst date,
    erstell_j integer,
    erstell_m character varying(20),
    revision_j integer,
    revision_m character varying(20),
    grund_aend character varying(20),
    herkunft character varying(20),
    herkunft_j integer,
    herkunft_m character varying(20),
    objektart character varying(20),
    bezirksnum integer,
    see_flaech numeric,
    revision_q character varying(100),
    name character varying(254),
    kantonsnum integer,
    icc character varying(20),
    einwohnerz integer,
    bfs_nummer integer,
    gem_teil character varying(20),
    gem_flaech numeric,
    shn character varying(20),
    geom geometry(MultiPolygonZM),
    CONSTRAINT municipalities_pkey PRIMARY KEY (gid)
);

CREATE TABLE bdms.codelist (
    id_cli serial NOT NULL,
    geolcode integer,
    schema_cli character varying,
    code_cli character varying NOT NULL,
    text_cli_en character varying NOT NULL,
    description_cli_en character varying NOT NULL,
    text_cli_de character varying,
    description_cli_de character varying,
    text_cli_fr character varying,
    description_cli_fr character varying,
    text_cli_it character varying,
    description_cli_it character varying,
    text_cli_ro character varying,
    description_cli_ro character varying,
    order_cli integer,
    conf_cli json,
    default_cli boolean DEFAULT false,
    path_cli ltree,
    CONSTRAINT codelist_pkey PRIMARY KEY (id_cli)
);

CREATE TABLE bdms.users (
    id_usr serial NOT NULL,
    created_usr timestamp with time zone DEFAULT now(),
    admin_usr boolean DEFAULT false,
    viewer_usr boolean DEFAULT false,
    username character varying NOT NULL,
    password character varying NOT NULL,
    settings_usr character varying,
    firstname character varying,
    middlename character varying,
    lastname character varying,
    disabled_usr timestamp with time zone,
    CONSTRAINT user_pkey PRIMARY KEY (id_usr),
    CONSTRAINT users_username_key UNIQUE (username)
);

CREATE TABLE bdms.terms_accepted (
    id_usr_fk integer NOT NULL,
    id_tes_fk integer NOT NULL,
    accepted_tea timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id_usr_fk, id_tes_fk),
    FOREIGN KEY (id_usr_fk)
        REFERENCES bdms.users (id_usr) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
        NOT VALID,
    FOREIGN KEY (id_tes_fk)
        REFERENCES bdms.terms (id_tes) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
        NOT VALID
);

CREATE TABLE bdms.roles (
    id_rol serial NOT NULL,
    name_rol character varying NOT NULL,
    config_rol json,
    CONSTRAINT roles_pkey PRIMARY KEY (id_rol)
);

CREATE TABLE bdms.workgroups (
    id_wgp serial NOT NULL,
    created_wgp timestamp with time zone DEFAULT now(),
    disabled_wgp timestamp with time zone,
    supplier_wgp boolean DEFAULT FALSE,
    name_wgp character varying NOT NULL,
    settings_wgp json,
    CONSTRAINT workgroups_pkey PRIMARY KEY (id_wgp),
    CONSTRAINT workgroups_name_wgp_key UNIQUE (name_wgp)
);

CREATE TABLE bdms.users_roles (
    id_usr_fk integer NOT NULL,
    id_rol_fk integer NOT NULL,
    id_wgp_fk integer NOT NULL,
    CONSTRAINT users_roles_pkey PRIMARY KEY (id_usr_fk, id_rol_fk, id_wgp_fk),
    CONSTRAINT user_roles_id_usr_fk_fkey FOREIGN KEY (id_usr_fk)
        REFERENCES bdms.users (id_usr) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT users_roles_id_rol_fk_fkey FOREIGN KEY (id_rol_fk)
        REFERENCES bdms.roles (id_rol) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT users_roles_id_wgp_fk_fkey FOREIGN KEY (id_wgp_fk)
        REFERENCES bdms.workgroups (id_wgp) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

CREATE TABLE bdms.files
(
    id_fil serial,
    id_usr_fk integer,
    name_fil character varying NOT NULL,
    hash_fil character varying NOT NULL,
    type_fil character varying NOT NULL,
    uploaded_fil timestamp with time zone DEFAULT now(),
    conf_fil json,
    PRIMARY KEY (id_fil),
    CONSTRAINT files_id_usr_fkey FOREIGN KEY (id_usr_fk)
        REFERENCES bdms.users (id_usr) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

CREATE TABLE bdms.borehole (
    id_bho serial NOT NULL,
    created_by_bho integer,
    created_bho timestamp with time zone DEFAULT now(),
    updated_bho timestamp with time zone DEFAULT now(),
    updated_by_bho integer,
    locked_bho timestamp with time zone,
    locked_by_bho integer,
    id_wgp_fk integer,
    public_bho boolean DEFAULT false,
    kind_id_cli integer,
    location_x_bho double precision,
    location_y_bho double precision,
    srs_id_cli integer,
    elevation_z_bho double precision,
    hrs_id_cli integer,
    total_depth_bho double precision,
    date_bho timestamp with time zone,
    restriction_id_cli integer,
    restriction_until_bho date,
    original_name_bho character varying,
    alternate_name_bho character varying,
    qt_location_id_cli integer,
    qt_elevation_id_cli integer,
    project_name_bho character varying,
    canton_bho integer,
    city_bho integer,
    drilling_method_id_cli integer,
    drilling_date_bho date,
    cuttings_id_cli integer,
    purpose_id_cli integer,
    drilling_diameter_bho double precision,
    status_id_cli integer,
    inclination_bho double precision,
    inclination_direction_bho double precision,
    qt_inclination_direction_id_cli integer,
    qt_depth_id_cli integer,
    top_bedrock_bho double precision,
    qt_top_bedrock_id_cli integer,
    groundwater_bho boolean,
    geom_bho public.geometry(Point,2056),
    remarks_bho character varying,
    lithology_top_bedrock_id_cli integer,
    lithostrat_id_cli integer,
    chronostrat_id_cli integer,
    tecto_id_cli integer,
    import_id integer,
    spud_date_bho date,
    top_bedrock_tvd_bho double precision,
    qt_top_bedrock_tvd_id_cli integer,
    total_depth_tvd_bho double precision,
    qt_total_depth_tvd_id_cli integer,
    reference_elevation_bho double precision,
    qt_reference_elevation_id_cli integer,
    reference_elevation_type_id_cli integer
);

ALTER TABLE ONLY bdms.borehole ALTER COLUMN id_bho SET DEFAULT nextval('bdms.borehole_id_bho_seq'::regclass);

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_pkey PRIMARY KEY (id_bho);

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_canton_bho_fkey FOREIGN KEY (canton_bho) REFERENCES bdms.cantons(gid);

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_chronostrat_id_cli_fkey FOREIGN KEY (chronostrat_id_cli) REFERENCES bdms.codelist(id_cli);

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_city_bho_fkey FOREIGN KEY (city_bho) REFERENCES bdms.municipalities(gid);

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_cuttings_id_cli_fkey FOREIGN KEY (cuttings_id_cli) REFERENCES bdms.codelist(id_cli);

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_hrs_id_cli_fkey FOREIGN KEY (hrs_id_cli) REFERENCES bdms.codelist(id_cli);

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_id_wgp_fk_fkey FOREIGN KEY (id_wgp_fk) REFERENCES bdms.workgroups(id_wgp);

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_kind_id_cli_fkey FOREIGN KEY (kind_id_cli) REFERENCES bdms.codelist(id_cli);

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_lithology_id_cli_fkey FOREIGN KEY (lithology_top_bedrock_id_cli) REFERENCES bdms.codelist(id_cli);

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_lithostrat_id_cli_fkey FOREIGN KEY (lithostrat_id_cli) REFERENCES bdms.codelist(id_cli);

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_locked_by_fkey FOREIGN KEY (locked_by_bho) REFERENCES bdms.users(id_usr) ON DELETE SET NULL;

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_method_id_cli_fkey FOREIGN KEY (drilling_method_id_cli) REFERENCES bdms.codelist(id_cli);

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_purpose_id_cli_fkey FOREIGN KEY (purpose_id_cli) REFERENCES bdms.codelist(id_cli);

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_qt_bore_inc_dir_id_cli_fkey FOREIGN KEY (qt_inclination_direction_id_cli) REFERENCES bdms.codelist(id_cli);

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_qt_elevation_id_cli_fkey FOREIGN KEY (qt_elevation_id_cli) REFERENCES bdms.codelist(id_cli);

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_qt_length_id_cli_fkey FOREIGN KEY (qt_depth_id_cli) REFERENCES bdms.codelist(id_cli);

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_qt_location_id_cli_fkey FOREIGN KEY (qt_location_id_cli) REFERENCES bdms.codelist(id_cli);

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_qt_reference_elevation_id_cli_fkey FOREIGN KEY (qt_reference_elevation_id_cli) REFERENCES bdms.codelist(id_cli) NOT VALID;

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_qt_top_bedrock_id_cli_fkey FOREIGN KEY (qt_top_bedrock_id_cli) REFERENCES bdms.codelist(id_cli);

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_qt_top_bedrock_tvd_id_cli_fkey FOREIGN KEY (qt_top_bedrock_tvd_id_cli) REFERENCES bdms.codelist(id_cli) NOT VALID;

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_qt_total_depth_tvd_id_cli_fkey FOREIGN KEY (qt_total_depth_tvd_id_cli) REFERENCES bdms.codelist(id_cli) NOT VALID;

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_reference_elevation_type_id_cli_fkey FOREIGN KEY (reference_elevation_type_id_cli) REFERENCES bdms.codelist(id_cli) NOT VALID;

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_restriction_id_cli_fkey FOREIGN KEY (restriction_id_cli) REFERENCES bdms.codelist(id_cli);

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_srs_id_cli_fkey FOREIGN KEY (srs_id_cli) REFERENCES bdms.codelist(id_cli);

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_status_id_cli_fkey FOREIGN KEY (status_id_cli) REFERENCES bdms.codelist(id_cli);

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_tecto_id_cli_fkey FOREIGN KEY (tecto_id_cli) REFERENCES bdms.codelist(id_cli);

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_updater_bho_fkey FOREIGN KEY (updated_by_bho) REFERENCES bdms.users(id_usr);



CREATE TABLE bdms.borehole_files
(
    id_bho_fk integer NOT NULL,
    id_fil_fk integer NOT NULL,
    id_usr_fk integer,
    attached_bfi timestamp with time zone DEFAULT now(),
    update_bfi timestamp with time zone DEFAULT now(),
    updater_bfi integer,
    description_bfi character varying,
    public_bfi boolean DEFAULT true,
    PRIMARY KEY (id_bho_fk, id_fil_fk),
    CONSTRAINT borehole_files_id_usr_fkey FOREIGN KEY (id_usr_fk)
        REFERENCES bdms.users (id_usr) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

CREATE TABLE bdms.borehole_codelist
(
    id_bho_fk integer NOT NULL,
    id_cli_fk integer NOT NULL,
    code_cli character varying NOT NULL,
    value_bco character varying NOT NULL,
    CONSTRAINT borehole_codelist_pkey PRIMARY KEY (id_bho_fk, id_cli_fk),
    CONSTRAINT borehole_codelist_id_bho_fk_id_cli_fk_code_cli_key
        UNIQUE (id_bho_fk, id_cli_fk, code_cli),
    CONSTRAINT borehole_codelist_id_cli_fk_fkey FOREIGN KEY (id_cli_fk)
        REFERENCES bdms.codelist (id_cli) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT borehole_codelist_id_bho_fk_fkey FOREIGN KEY (id_bho_fk)
        REFERENCES bdms.borehole (id_bho) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

CREATE TABLE bdms.workflow
(
    id_wkf serial NOT NULL,
    id_bho_fk integer NOT NULL,
    id_usr_fk integer NOT NULL,
    started_wkf timestamp with time zone,
    finished_wkf timestamp with time zone,
    notes_wkf character varying,
    mentions_wkf character varying[],
    id_rol_fk integer,
    CONSTRAINT workflow_pkey PRIMARY KEY (id_wkf),
    CONSTRAINT workflow_id_bho_fk_fkey FOREIGN KEY (id_bho_fk)
        REFERENCES bdms.borehole (id_bho) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT workflow_id_rol_fk_fkey FOREIGN KEY (id_rol_fk)
        REFERENCES bdms.roles (id_rol) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT workflow_id_usr_fk_fkey FOREIGN KEY (id_usr_fk)
        REFERENCES bdms.users (id_usr) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

-- CREATE TABLE bdms.borehole_codelist
-- (
--     id_bho_fk integer NOT NULL,
--     id_cli_fk integer NOT NULL,
--     code_cli character varying NOT NULL,
--     CONSTRAINT borehole_codelist_pkey PRIMARY KEY (id_bho_fk, id_cli_fk, code_cli)
-- );

CREATE TABLE bdms.stratigraphy
(
    id_sty serial NOT NULL,
    id_bho_fk integer,
    primary_sty boolean DEFAULT false,
    date_sty date,
    update_sty timestamp with time zone DEFAULT now(),
    updater_sty integer,
    creation_sty timestamp with time zone DEFAULT now(),
    author_sty integer,
    name_sty character varying,
    import_id integer,
    kind_id_cli integer NOT NULL,
    casng_date_abd_sty date,
    notes_sty character varying,
    casng_id character varying,
    fill_casng_id_sty_fk integer,
    CONSTRAINT stratigraphy_pkey PRIMARY KEY (id_sty),
    CONSTRAINT stratigraphy_author_sty_fkey FOREIGN KEY (author_sty)
        REFERENCES bdms.users (id_usr) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT stratigraphy_id_bho_fk_fkey FOREIGN KEY (id_bho_fk)
        REFERENCES bdms.borehole (id_bho) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT stratigraphy_kind_id_cli_fkey FOREIGN KEY (kind_id_cli)
        REFERENCES bdms.codelist (id_cli) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT stratigraphy_updater_sty_fkey FOREIGN KEY (updater_sty)
        REFERENCES bdms.users (id_usr) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

CREATE TABLE bdms.stratigraphy_codelist
(
    id_sty_fk integer NOT NULL,
    id_cli_fk integer NOT NULL,
    code_cli character varying NOT NULL,
    CONSTRAINT stratigraphy_codelist_pkey PRIMARY KEY (id_sty_fk, id_cli_fk),
    CONSTRAINT stratigraphy_codelist_unique UNIQUE (
        id_sty_fk, id_cli_fk, code_cli
    ),
    CONSTRAINT stratigraphy_codelist_id_cli_fk_fkey FOREIGN KEY (id_cli_fk)
        REFERENCES bdms.codelist (id_cli) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT stratigraphy_codelist_id_sty_fk_fkey FOREIGN KEY (id_sty_fk)
        REFERENCES bdms.stratigraphy (id_sty) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

CREATE TABLE bdms.layer
(
    id_lay serial NOT NULL,
    creation_lay timestamp with time zone DEFAULT now(),
    creator_lay integer NOT NULL,
    update_lay timestamp with time zone DEFAULT now(),
    updater_lay integer NOT NULL,
    undefined_lay boolean DEFAULT false,
    id_sty_fk integer,
    depth_from_lay double precision,
    depth_to_lay double precision,
    lithological_description_lay character varying,
    facies_description_lay character varying,
    last_lay boolean,
    qt_description_id_cli integer,
    lithology_id_cli integer,
    chronostratigraphy_id_cli integer,
    tectonic_unit_id_cli integer,
    symbol_id_cli integer,
    plasticity_id_cli integer,
    consistance_id_cli integer,
    alteration_id_cli integer,
    compactness_id_cli integer,
    soil_state_id_cli integer,
    grain_size_1_id_cli integer,
    grain_size_2_id_cli integer,
    cohesion_id_cli integer,
    uscs_1_id_cli integer,
    uscs_2_id_cli integer,
    uscs_original_lay character varying,
    uscs_determination_id_cli integer,
    kirost_id_cli integer,
    notes_lay character varying,
    lithostratigraphy_id_cli integer,
    humidity_id_cli integer,
    striae_lay boolean,
    unconrocks_id_cli integer,
    lithok_id_cli integer,
    import_id integer,
    instr_kind_id_cli integer,
    instr_status_id_cli integer,
    instr_id_sty_fk integer,
    casng_kind_id_cli integer,
    casng_material_id_cli integer,
    fill_material_id_cli integer,
    instr_id character varying,
    casng_inner_diameter_lay double precision,
    casng_outer_diameter_lay double precision,
    casng_date_spud_lay date,
    casng_date_finish_lay date,
    gradation_id_cli integer,
    fill_kind_id_cli integer,
    uscs_3_id_cli integer,
    lithology_top_bedrock_id_cli integer,
    casng_id character varying,
    CONSTRAINT layer_pkey PRIMARY KEY (id_lay),
    CONSTRAINT layer_alteration_id_cli_fkey FOREIGN KEY (alteration_id_cli)
        REFERENCES bdms.codelist (id_cli) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT layer_casng_kind_id_cli_fkey FOREIGN KEY (casng_kind_id_cli)
        REFERENCES bdms.codelist (id_cli) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT layer_casng_material_id_cli_fkey FOREIGN KEY (casng_material_id_cli)
        REFERENCES bdms.codelist (id_cli) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT layer_chronostratigraphy_id_cli_fkey FOREIGN KEY (chronostratigraphy_id_cli)
        REFERENCES bdms.codelist (id_cli) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT layer_cohesion_id_cli_fkey FOREIGN KEY (cohesion_id_cli)
        REFERENCES bdms.codelist (id_cli) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT layer_compactness_id_cli_fkey FOREIGN KEY (compactness_id_cli)
        REFERENCES bdms.codelist (id_cli) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT layer_consistance_id_cli_fkey FOREIGN KEY (consistance_id_cli)
        REFERENCES bdms.codelist (id_cli) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT layer_creator_lay_fkey FOREIGN KEY (creator_lay)
        REFERENCES bdms.users (id_usr) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT layer_fill_kind_id_cli_fkey FOREIGN KEY (fill_kind_id_cli)
        REFERENCES bdms.codelist (id_cli) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT layer_fill_material_id_cli_fkey FOREIGN KEY (fill_material_id_cli)
        REFERENCES bdms.codelist (id_cli) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT layer_grain_size_1_id_cli_fkey FOREIGN KEY (grain_size_1_id_cli)
        REFERENCES bdms.codelist (id_cli) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT layer_grain_size_2_id_cli_fkey FOREIGN KEY (grain_size_2_id_cli)
        REFERENCES bdms.codelist (id_cli) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT layer_humidity_id_cli_fkey FOREIGN KEY (humidity_id_cli)
        REFERENCES bdms.codelist (id_cli) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT layer_id_sty_fk_fkey FOREIGN KEY (id_sty_fk)
        REFERENCES bdms.stratigraphy (id_sty) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT layer_instr_kind_id_cli_fkey FOREIGN KEY (instr_kind_id_cli)
        REFERENCES bdms.codelist (id_cli) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT layer_instr_status_id_cli_fkey FOREIGN KEY (instr_status_id_cli)
        REFERENCES bdms.codelist (id_cli) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT layer_kirost_id_cli_fkey FOREIGN KEY (kirost_id_cli)
        REFERENCES bdms.codelist (id_cli) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT layer_lithok_id_cli_fkey FOREIGN KEY (lithok_id_cli)
        REFERENCES bdms.codelist (id_cli) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT layer_lithology_id_cli_fkey FOREIGN KEY (lithology_id_cli)
        REFERENCES bdms.codelist (id_cli) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT layer_lithology_top_bedrock_id_cli_fkey FOREIGN KEY (lithology_top_bedrock_id_cli)
        REFERENCES bdms.codelist (id_cli) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT layer_lithostratigraphy_id_cli_fkey FOREIGN KEY (lithostratigraphy_id_cli)
        REFERENCES bdms.codelist (id_cli) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT layer_plasticity_id_cli_fkey FOREIGN KEY (plasticity_id_cli)
        REFERENCES bdms.codelist (id_cli) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT layer_qt_description_id_cli_fkey FOREIGN KEY (qt_description_id_cli)
        REFERENCES bdms.codelist (id_cli) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT layer_soil_state_id_cli_fkey FOREIGN KEY (soil_state_id_cli)
        REFERENCES bdms.codelist (id_cli) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT layer_symbol_id_cli_fkey FOREIGN KEY (symbol_id_cli)
        REFERENCES bdms.codelist (id_cli) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT layer_tectonic_unit_id_cli_fkey FOREIGN KEY (tectonic_unit_id_cli)
        REFERENCES bdms.codelist (id_cli) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT layer_unconrocks_id_cli_fkey FOREIGN KEY (unconrocks_id_cli)
        REFERENCES bdms.codelist (id_cli) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT layer_updater_lay_fkey FOREIGN KEY (updater_lay)
        REFERENCES bdms.users (id_usr) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT layer_uscs_1_id_cli_fkey FOREIGN KEY (uscs_1_id_cli)
        REFERENCES bdms.codelist (id_cli) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT layer_uscs_2_id_cli_fkey FOREIGN KEY (uscs_2_id_cli)
        REFERENCES bdms.codelist (id_cli) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT layer_uscs_3_id_cli_fkey FOREIGN KEY (uscs_3_id_cli)
        REFERENCES bdms.codelist (id_cli) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT layer_uscs_determination_id_cli_fkey FOREIGN KEY (uscs_determination_id_cli)
        REFERENCES bdms.codelist (id_cli) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

CREATE TABLE bdms.layer_codelist
(
    id_lay_fk integer NOT NULL,
    id_cli_fk integer NOT NULL,
    code_cli character varying NOT NULL,
    CONSTRAINT layer_codelist_pkey PRIMARY KEY (id_lay_fk, id_cli_fk, code_cli)
);

CREATE TABLE bdms.events
(
    id_evs serial NOT NULL,
    id_usr_fk integer NOT NULL,
    topic_evs character varying NOT NULL,
    created_evs timestamp with time zone DEFAULT now(),
    payload_evs jsonb,
    PRIMARY KEY (id_evs),
    FOREIGN KEY (id_usr_fk)
        REFERENCES bdms.users (id_usr) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
        NOT VALID
);

CREATE OR REPLACE VIEW bdms.completness AS
 SELECT t.id_bho,
    row_to_json(t.*) AS detail,
    json_build_array(t.original_name, t.alternate_name, t.kind, t.restriction, t.restriction_until, t.location, t.srs, t.qt_location, t.elevation_z, t.qt_elevation, t.hrs, t.canton, t.city) AS arr,
    t.original_name AND t.alternate_name AND t.kind AND t.restriction AND t.restriction_until AND t.location AND t.srs AND t.qt_location AND t.elevation_z AND t.qt_elevation AND t.hrs AND t.canton AND t.city AS complete,
    round(100.0 / 13.0 * (
        CASE
            WHEN t.original_name THEN 1.0
            ELSE 0.0
        END +
        CASE
            WHEN t.alternate_name THEN 1.0
            ELSE 0.0
        END +
        CASE
            WHEN t.kind THEN 1.0
            ELSE 0.0
        END +
        CASE
            WHEN t.restriction THEN 1.0
            ELSE 0.0
        END +
        CASE
            WHEN t.restriction_until THEN 1.0
            ELSE 0.0
        END +
        CASE
            WHEN t.location THEN 1.0
            ELSE 0.0
        END +
        CASE
            WHEN t.srs THEN 1.0
            ELSE 0.0
        END +
        CASE
            WHEN t.qt_location THEN 1.0
            ELSE 0.0
        END +
        CASE
            WHEN t.elevation_z THEN 1.0
            ELSE 0.0
        END +
        CASE
            WHEN t.qt_elevation THEN 1.0
            ELSE 0.0
        END +
        CASE
            WHEN t.hrs THEN 1.0
            ELSE 0.0
        END +
        CASE
            WHEN t.canton THEN 1.0
            ELSE 0.0
        END +
        CASE
            WHEN t.city THEN 1.0
            ELSE 0.0
        END)) AS percentage
   FROM ( SELECT borehole.id_bho,
            borehole.original_name_bho IS NOT NULL AND borehole.original_name_bho::text <> ''::text AS original_name,
            borehole.alternate_name_bho IS NOT NULL AND borehole.alternate_name_bho::text <> ''::text AS alternate_name,
            borehole.kind_id_cli IS NOT NULL AS kind,
            borehole.restriction_id_cli IS NOT NULL AS restriction,
            borehole.restriction_id_cli IS NOT NULL AND (rcl.code_cli::text = 'b'::text AND borehole.restriction_until_bho IS NOT NULL OR rcl.code_cli::text <> 'b'::text AND borehole.restriction_until_bho IS NULL) AS restriction_until,
            borehole.location_x_bho IS NOT NULL AND borehole.location_y_bho IS NOT NULL AS location,
            borehole.srs_id_cli IS NOT NULL AS srs,
            borehole.qt_location_id_cli IS NOT NULL AS qt_location,
            borehole.elevation_z_bho IS NOT NULL AS elevation_z,
            borehole.qt_elevation_id_cli IS NOT NULL AS qt_elevation,
            borehole.hrs_id_cli IS NOT NULL AS hrs,
            borehole.canton_bho IS NOT NULL AS canton,
            borehole.city_bho IS NOT NULL AS city
           FROM bdms.borehole
             LEFT JOIN bdms.codelist rcl ON borehole.restriction_id_cli = rcl.id_cli
          ORDER BY borehole.id_bho) t;

