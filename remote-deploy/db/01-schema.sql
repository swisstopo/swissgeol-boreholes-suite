--
-- PostgreSQL database dump
--

-- Dumped from database version 11.13
-- Dumped by pg_dump version 11.17

-- Started on 2022-09-21 08:03:51 UTC

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 11 (class 2615 OID 18192)
-- Name: bdms; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA bdms;


--
-- TOC entry 2 (class 3079 OID 18017)
-- Name: ltree; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS ltree WITH SCHEMA public;


--
-- TOC entry 3 (class 3079 OID 17980)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- TOC entry 4 (class 3079 OID 16402)
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


SET default_with_oids = false;

--
-- TOC entry 230 (class 1259 OID 18298)
-- Name: borehole; Type: TABLE; Schema: bdms; Owner: -
--

CREATE TABLE bdms.borehole (
    id_bho integer NOT NULL,
    author_id integer,
    contact_id integer,
    created_bho timestamp with time zone DEFAULT now(),
    update_bho timestamp with time zone DEFAULT now(),
    updater_bho integer,
    locked_at timestamp with time zone,
    locked_by integer,
    id_wgp_fk integer,
    published_bho timestamp with time zone,
    public_bho boolean DEFAULT false,
    kind_id_cli integer,
    location_x_bho double precision,
    location_y_bho double precision,
    srs_id_cli integer,
    elevation_z_bho double precision,
    hrs_id_cli integer,
    length_bho double precision,
    date_bho timestamp with time zone,
    restriction_id_cli integer,
    restriction_until_bho date,
    original_name_bho character varying,
    public_name_bho character varying,
    qt_location_id_cli integer,
    qt_elevation_id_cli integer,
    address_bho character varying,
    landuse_id_cli integer,
    project_name_bho character varying,
    canton_bho integer,
    city_bho integer,
    method_id_cli integer,
    drilling_date_bho date,
    cuttings_id_cli integer,
    purpose_id_cli integer,
    drill_diameter_bho double precision,
    status_id_cli integer,
    bore_inc_bho double precision,
    bore_inc_dir_bho double precision,
    qt_bore_inc_dir_id_cli integer,
    qt_length_id_cli integer,
    top_bedrock_bho double precision,
    qt_top_bedrock_id_cli integer,
    groundwater_bho boolean,
    geom_bho public.geometry(Point,2056),
    mistakes_bho character varying,
    remarks_bho character varying,
    processing_status_id_cli integer,
    national_relevance_id_cli integer,
    lithology_id_cli integer,
    lithostrat_id_cli integer,
    chronostrat_id_cli integer,
    tecto_id_cli integer,
    import_id integer
);


--
-- TOC entry 231 (class 1259 OID 18435)
-- Name: borehole_codelist; Type: TABLE; Schema: bdms; Owner: -
--

CREATE TABLE bdms.borehole_codelist (
    id_bho_fk integer NOT NULL,
    id_cli_fk integer NOT NULL,
    code_cli character varying NOT NULL,
    value_bco character varying NOT NULL
);


--
-- TOC entry 243 (class 1259 OID 29173)
-- Name: borehole_files; Type: TABLE; Schema: bdms; Owner: -
--

CREATE TABLE bdms.borehole_files (
    id_bho_fk integer NOT NULL,
    id_fil_fk integer NOT NULL,
    id_usr_fk integer,
    attached_bfi timestamp with time zone DEFAULT now(),
    update_bfi timestamp with time zone DEFAULT now(),
    updater_bfi integer,
    description_bfi character varying,
    public_bfi boolean DEFAULT true
);


--
-- TOC entry 229 (class 1259 OID 18296)
-- Name: borehole_id_bho_seq; Type: SEQUENCE; Schema: bdms; Owner: -
--

CREATE SEQUENCE bdms.borehole_id_bho_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5743 (class 0 OID 0)
-- Dependencies: 229
-- Name: borehole_id_bho_seq; Type: SEQUENCE OWNED BY; Schema: bdms; Owner: -
--

ALTER SEQUENCE bdms.borehole_id_bho_seq OWNED BY bdms.borehole.id_bho;


--
-- TOC entry 217 (class 1259 OID 18203)
-- Name: cantons; Type: TABLE; Schema: bdms; Owner: -
--

CREATE TABLE bdms.cantons (
    gid integer NOT NULL,
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
    geom public.geometry(MultiPolygonZM)
);


--
-- TOC entry 216 (class 1259 OID 18201)
-- Name: cantons_gid_seq; Type: SEQUENCE; Schema: bdms; Owner: -
--

CREATE SEQUENCE bdms.cantons_gid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5744 (class 0 OID 0)
-- Dependencies: 216
-- Name: cantons_gid_seq; Type: SEQUENCE OWNED BY; Schema: bdms; Owner: -
--

ALTER SEQUENCE bdms.cantons_gid_seq OWNED BY bdms.cantons.gid;


--
-- TOC entry 221 (class 1259 OID 18225)
-- Name: codelist; Type: TABLE; Schema: bdms; Owner: -
--

CREATE TABLE bdms.codelist (
    id_cli integer NOT NULL,
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
    path_cli public.ltree
);


--
-- TOC entry 220 (class 1259 OID 18223)
-- Name: codelist_id_cli_seq; Type: SEQUENCE; Schema: bdms; Owner: -
--

CREATE SEQUENCE bdms.codelist_id_cli_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5745 (class 0 OID 0)
-- Dependencies: 220
-- Name: codelist_id_cli_seq; Type: SEQUENCE OWNED BY; Schema: bdms; Owner: -
--

ALTER SEQUENCE bdms.codelist_id_cli_seq OWNED BY bdms.codelist.id_cli;


--
-- TOC entry 240 (class 1259 OID 18672)
-- Name: completness; Type: VIEW; Schema: bdms; Owner: -
--

CREATE VIEW bdms.completness AS
 SELECT t.id_bho,
    row_to_json(t.*) AS detail,
    json_build_array(t.original_name, t.public_name, t.kind, t.restriction, t.restriction_until, t.location, t.srs, t.qt_location, t.elevation_z, t.qt_elevation, t.hrs, t.canton, t.city) AS arr,
    (t.original_name AND t.public_name AND t.kind AND t.restriction AND t.restriction_until AND t.location AND t.srs AND t.qt_location AND t.elevation_z AND t.qt_elevation AND t.hrs AND t.canton AND t.city) AS complete,
    round(((100.0 / 13.0) * ((((((((((((
        CASE
            WHEN t.original_name THEN 1.0
            ELSE 0.0
        END +
        CASE
            WHEN t.public_name THEN 1.0
            ELSE 0.0
        END) +
        CASE
            WHEN t.kind THEN 1.0
            ELSE 0.0
        END) +
        CASE
            WHEN t.restriction THEN 1.0
            ELSE 0.0
        END) +
        CASE
            WHEN t.restriction_until THEN 1.0
            ELSE 0.0
        END) +
        CASE
            WHEN t.location THEN 1.0
            ELSE 0.0
        END) +
        CASE
            WHEN t.srs THEN 1.0
            ELSE 0.0
        END) +
        CASE
            WHEN t.qt_location THEN 1.0
            ELSE 0.0
        END) +
        CASE
            WHEN t.elevation_z THEN 1.0
            ELSE 0.0
        END) +
        CASE
            WHEN t.qt_elevation THEN 1.0
            ELSE 0.0
        END) +
        CASE
            WHEN t.hrs THEN 1.0
            ELSE 0.0
        END) +
        CASE
            WHEN t.canton THEN 1.0
            ELSE 0.0
        END) +
        CASE
            WHEN t.city THEN 1.0
            ELSE 0.0
        END))) AS percentage
   FROM ( SELECT borehole.id_bho,
            ((borehole.original_name_bho IS NOT NULL) AND ((borehole.original_name_bho)::text <> ''::text)) AS original_name,
            ((borehole.public_name_bho IS NOT NULL) AND ((borehole.public_name_bho)::text <> ''::text)) AS public_name,
            (borehole.kind_id_cli IS NOT NULL) AS kind,
            (borehole.restriction_id_cli IS NOT NULL) AS restriction,
            ((borehole.restriction_id_cli IS NOT NULL) AND ((((rcl.code_cli)::text = 'b'::text) AND (borehole.restriction_until_bho IS NOT NULL)) OR (((rcl.code_cli)::text <> 'b'::text) AND (borehole.restriction_until_bho IS NULL)))) AS restriction_until,
            ((borehole.location_x_bho IS NOT NULL) AND (borehole.location_y_bho IS NOT NULL)) AS location,
            (borehole.srs_id_cli IS NOT NULL) AS srs,
            (borehole.qt_location_id_cli IS NOT NULL) AS qt_location,
            (borehole.elevation_z_bho IS NOT NULL) AS elevation_z,
            (borehole.qt_elevation_id_cli IS NOT NULL) AS qt_elevation,
            (borehole.hrs_id_cli IS NOT NULL) AS hrs,
            (borehole.canton_bho IS NOT NULL) AS canton,
            (borehole.city_bho IS NOT NULL) AS city
           FROM (bdms.borehole
             LEFT JOIN bdms.codelist rcl ON ((borehole.restriction_id_cli = rcl.id_cli)))
          ORDER BY borehole.id_bho) t;


--
-- TOC entry 215 (class 1259 OID 18193)
-- Name: config; Type: TABLE; Schema: bdms; Owner: -
--

CREATE TABLE bdms.config (
    name_cfg character varying NOT NULL,
    value_cfg character varying
);


--
-- TOC entry 250 (class 1259 OID 29733)
-- Name: contents; Type: TABLE; Schema: bdms; Owner: -
--

CREATE TABLE bdms.contents (
    id_cnt integer NOT NULL,
    name_cnt character varying NOT NULL,
    draft_cnt boolean DEFAULT true NOT NULL,
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
    creation_cnt timestamp with time zone DEFAULT now(),
    expired_cnt timestamp with time zone
);


--
-- TOC entry 249 (class 1259 OID 29731)
-- Name: contents_id_cnt_seq; Type: SEQUENCE; Schema: bdms; Owner: -
--

CREATE SEQUENCE bdms.contents_id_cnt_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5746 (class 0 OID 0)
-- Dependencies: 249
-- Name: contents_id_cnt_seq; Type: SEQUENCE OWNED BY; Schema: bdms; Owner: -
--

ALTER SEQUENCE bdms.contents_id_cnt_seq OWNED BY bdms.contents.id_cnt;


--
-- TOC entry 252 (class 1259 OID 37984)
-- Name: events; Type: TABLE; Schema: bdms; Owner: -
--

CREATE TABLE bdms.events (
    id_evs integer NOT NULL,
    id_usr_fk integer NOT NULL,
    topic_evs character varying NOT NULL,
    created_evs timestamp with time zone DEFAULT now(),
    payload_evs jsonb
);


--
-- TOC entry 251 (class 1259 OID 37982)
-- Name: events_id_evs_seq; Type: SEQUENCE; Schema: bdms; Owner: -
--

CREATE SEQUENCE bdms.events_id_evs_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5747 (class 0 OID 0)
-- Dependencies: 251
-- Name: events_id_evs_seq; Type: SEQUENCE OWNED BY; Schema: bdms; Owner: -
--

ALTER SEQUENCE bdms.events_id_evs_seq OWNED BY bdms.events.id_evs;


--
-- TOC entry 248 (class 1259 OID 29220)
-- Name: feedbacks; Type: TABLE; Schema: bdms; Owner: -
--

CREATE TABLE bdms.feedbacks (
    id_feb integer NOT NULL,
    created_feb timestamp with time zone DEFAULT now(),
    user_feb character varying NOT NULL,
    message_feb character varying,
    tag_feb character varying,
    frw_feb boolean DEFAULT false
);


--
-- TOC entry 247 (class 1259 OID 29218)
-- Name: feedbacks_id_feb_seq; Type: SEQUENCE; Schema: bdms; Owner: -
--

CREATE SEQUENCE bdms.feedbacks_id_feb_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5748 (class 0 OID 0)
-- Dependencies: 247
-- Name: feedbacks_id_feb_seq; Type: SEQUENCE OWNED BY; Schema: bdms; Owner: -
--

ALTER SEQUENCE bdms.feedbacks_id_feb_seq OWNED BY bdms.feedbacks.id_feb;


--
-- TOC entry 242 (class 1259 OID 29158)
-- Name: files; Type: TABLE; Schema: bdms; Owner: -
--

CREATE TABLE bdms.files (
    id_fil integer NOT NULL,
    id_usr_fk integer,
    name_fil character varying NOT NULL,
    hash_fil character varying NOT NULL,
    type_fil character varying NOT NULL,
    uploaded_fil timestamp with time zone DEFAULT now(),
    conf_fil json
);


--
-- TOC entry 241 (class 1259 OID 29156)
-- Name: files_id_fil_seq; Type: SEQUENCE; Schema: bdms; Owner: -
--

CREATE SEQUENCE bdms.files_id_fil_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5749 (class 0 OID 0)
-- Dependencies: 241
-- Name: files_id_fil_seq; Type: SEQUENCE OWNED BY; Schema: bdms; Owner: -
--

ALTER SEQUENCE bdms.files_id_fil_seq OWNED BY bdms.files.id_fil;


--
-- TOC entry 238 (class 1259 OID 18532)
-- Name: layer; Type: TABLE; Schema: bdms; Owner: -
--

CREATE TABLE bdms.layer (
    id_lay integer NOT NULL,
    creation_lay timestamp with time zone DEFAULT now(),
    creator_lay integer NOT NULL,
    update_lay timestamp with time zone DEFAULT now(),
    updater_lay integer NOT NULL,
    undefined_lay boolean DEFAULT false,
    id_sty_fk integer,
    depth_from_lay double precision,
    depth_to_lay double precision,
    description_lay character varying,
    geology_lay character varying,
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
    import_id integer
);


--
-- TOC entry 239 (class 1259 OID 18664)
-- Name: layer_codelist; Type: TABLE; Schema: bdms; Owner: -
--

CREATE TABLE bdms.layer_codelist (
    id_lay_fk integer NOT NULL,
    id_cli_fk integer NOT NULL,
    code_cli character varying NOT NULL
);


--
-- TOC entry 237 (class 1259 OID 18530)
-- Name: layer_id_lay_seq; Type: SEQUENCE; Schema: bdms; Owner: -
--

CREATE SEQUENCE bdms.layer_id_lay_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5750 (class 0 OID 0)
-- Dependencies: 237
-- Name: layer_id_lay_seq; Type: SEQUENCE OWNED BY; Schema: bdms; Owner: -
--

ALTER SEQUENCE bdms.layer_id_lay_seq OWNED BY bdms.layer.id_lay;


--
-- TOC entry 219 (class 1259 OID 18214)
-- Name: municipalities; Type: TABLE; Schema: bdms; Owner: -
--

CREATE TABLE bdms.municipalities (
    gid integer NOT NULL,
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
    geom public.geometry(MultiPolygonZM)
);


--
-- TOC entry 218 (class 1259 OID 18212)
-- Name: municipalities_gid_seq; Type: SEQUENCE; Schema: bdms; Owner: -
--

CREATE SEQUENCE bdms.municipalities_gid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5751 (class 0 OID 0)
-- Dependencies: 218
-- Name: municipalities_gid_seq; Type: SEQUENCE OWNED BY; Schema: bdms; Owner: -
--

ALTER SEQUENCE bdms.municipalities_gid_seq OWNED BY bdms.municipalities.gid;


--
-- TOC entry 225 (class 1259 OID 18253)
-- Name: roles; Type: TABLE; Schema: bdms; Owner: -
--

CREATE TABLE bdms.roles (
    id_rol integer NOT NULL,
    name_rol character varying NOT NULL,
    config_rol json
);


--
-- TOC entry 224 (class 1259 OID 18251)
-- Name: roles_id_rol_seq; Type: SEQUENCE; Schema: bdms; Owner: -
--

CREATE SEQUENCE bdms.roles_id_rol_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5752 (class 0 OID 0)
-- Dependencies: 224
-- Name: roles_id_rol_seq; Type: SEQUENCE OWNED BY; Schema: bdms; Owner: -
--

ALTER SEQUENCE bdms.roles_id_rol_seq OWNED BY bdms.roles.id_rol;


--
-- TOC entry 235 (class 1259 OID 18483)
-- Name: stratigraphy; Type: TABLE; Schema: bdms; Owner: -
--

CREATE TABLE bdms.stratigraphy (
    id_sty integer NOT NULL,
    id_bho_fk integer,
    primary_sty boolean DEFAULT false,
    date_sty date,
    update_sty timestamp with time zone DEFAULT now(),
    updater_sty integer,
    creation_sty timestamp with time zone DEFAULT now(),
    author_sty integer,
    name_sty character varying,
    import_id integer
);


--
-- TOC entry 236 (class 1259 OID 18510)
-- Name: stratigraphy_codelist; Type: TABLE; Schema: bdms; Owner: -
--

CREATE TABLE bdms.stratigraphy_codelist (
    id_sty_fk integer NOT NULL,
    id_cli_fk integer NOT NULL,
    code_cli character varying NOT NULL
);


--
-- TOC entry 234 (class 1259 OID 18481)
-- Name: stratigraphy_id_sty_seq; Type: SEQUENCE; Schema: bdms; Owner: -
--

CREATE SEQUENCE bdms.stratigraphy_id_sty_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5753 (class 0 OID 0)
-- Dependencies: 234
-- Name: stratigraphy_id_sty_seq; Type: SEQUENCE OWNED BY; Schema: bdms; Owner: -
--

ALTER SEQUENCE bdms.stratigraphy_id_sty_seq OWNED BY bdms.stratigraphy.id_sty;


--
-- TOC entry 245 (class 1259 OID 29191)
-- Name: terms; Type: TABLE; Schema: bdms; Owner: -
--

CREATE TABLE bdms.terms (
    id_tes integer NOT NULL,
    draft_tes boolean DEFAULT true NOT NULL,
    text_tes_en character varying NOT NULL,
    text_tes_de character varying,
    text_tes_fr character varying,
    text_tes_it character varying,
    text_tes_ro character varying,
    creation_tes timestamp with time zone DEFAULT now() NOT NULL,
    expired_tes timestamp with time zone
);


--
-- TOC entry 246 (class 1259 OID 29202)
-- Name: terms_accepted; Type: TABLE; Schema: bdms; Owner: -
--

CREATE TABLE bdms.terms_accepted (
    id_usr_fk integer NOT NULL,
    id_tes_fk integer NOT NULL,
    accepted_tea timestamp with time zone DEFAULT now()
);


--
-- TOC entry 244 (class 1259 OID 29189)
-- Name: terms_id_tes_seq; Type: SEQUENCE; Schema: bdms; Owner: -
--

CREATE SEQUENCE bdms.terms_id_tes_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5754 (class 0 OID 0)
-- Dependencies: 244
-- Name: terms_id_tes_seq; Type: SEQUENCE OWNED BY; Schema: bdms; Owner: -
--

ALTER SEQUENCE bdms.terms_id_tes_seq OWNED BY bdms.terms.id_tes;


--
-- TOC entry 223 (class 1259 OID 18237)
-- Name: users; Type: TABLE; Schema: bdms; Owner: -
--

CREATE TABLE bdms.users (
    id_usr integer NOT NULL,
    created_usr timestamp with time zone DEFAULT now(),
    admin_usr boolean DEFAULT false,
    viewer_usr boolean DEFAULT false,
    username character varying NOT NULL,
    password character varying NOT NULL,
    settings_usr character varying,
    firstname character varying,
    middlename character varying,
    lastname character varying,
    disabled_usr timestamp with time zone
);


--
-- TOC entry 222 (class 1259 OID 18235)
-- Name: users_id_usr_seq; Type: SEQUENCE; Schema: bdms; Owner: -
--

CREATE SEQUENCE bdms.users_id_usr_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5755 (class 0 OID 0)
-- Dependencies: 222
-- Name: users_id_usr_seq; Type: SEQUENCE OWNED BY; Schema: bdms; Owner: -
--

ALTER SEQUENCE bdms.users_id_usr_seq OWNED BY bdms.users.id_usr;


--
-- TOC entry 228 (class 1259 OID 18276)
-- Name: users_roles; Type: TABLE; Schema: bdms; Owner: -
--

CREATE TABLE bdms.users_roles (
    id_usr_fk integer NOT NULL,
    id_rol_fk integer NOT NULL,
    id_wgp_fk integer NOT NULL
);


--
-- TOC entry 233 (class 1259 OID 18457)
-- Name: workflow; Type: TABLE; Schema: bdms; Owner: -
--

CREATE TABLE bdms.workflow (
    id_wkf integer NOT NULL,
    id_bho_fk integer NOT NULL,
    id_usr_fk integer NOT NULL,
    started_wkf timestamp with time zone,
    finished_wkf timestamp with time zone,
    notes_wkf character varying,
    mentions_wkf character varying[],
    id_rol_fk integer
);


--
-- TOC entry 232 (class 1259 OID 18455)
-- Name: workflow_id_wkf_seq; Type: SEQUENCE; Schema: bdms; Owner: -
--

CREATE SEQUENCE bdms.workflow_id_wkf_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5756 (class 0 OID 0)
-- Dependencies: 232
-- Name: workflow_id_wkf_seq; Type: SEQUENCE OWNED BY; Schema: bdms; Owner: -
--

ALTER SEQUENCE bdms.workflow_id_wkf_seq OWNED BY bdms.workflow.id_wkf;


--
-- TOC entry 227 (class 1259 OID 18264)
-- Name: workgroups; Type: TABLE; Schema: bdms; Owner: -
--

CREATE TABLE bdms.workgroups (
    id_wgp integer NOT NULL,
    created_wgp timestamp with time zone DEFAULT now(),
    disabled_wgp timestamp with time zone,
    name_wgp character varying NOT NULL,
    settings_wgp json,
    supplier_wgp boolean DEFAULT false
);


--
-- TOC entry 226 (class 1259 OID 18262)
-- Name: workgroups_id_wgp_seq; Type: SEQUENCE; Schema: bdms; Owner: -
--

CREATE SEQUENCE bdms.workgroups_id_wgp_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5757 (class 0 OID 0)
-- Dependencies: 226
-- Name: workgroups_id_wgp_seq; Type: SEQUENCE OWNED BY; Schema: bdms; Owner: -
--

ALTER SEQUENCE bdms.workgroups_id_wgp_seq OWNED BY bdms.workgroups.id_wgp;


--
-- TOC entry 5458 (class 2604 OID 18301)
-- Name: borehole id_bho; Type: DEFAULT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.borehole ALTER COLUMN id_bho SET DEFAULT nextval('bdms.borehole_id_bho_seq'::regclass);


--
-- TOC entry 5446 (class 2604 OID 18206)
-- Name: cantons gid; Type: DEFAULT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.cantons ALTER COLUMN gid SET DEFAULT nextval('bdms.cantons_gid_seq'::regclass);


--
-- TOC entry 5448 (class 2604 OID 18228)
-- Name: codelist id_cli; Type: DEFAULT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.codelist ALTER COLUMN id_cli SET DEFAULT nextval('bdms.codelist_id_cli_seq'::regclass);


--
-- TOC entry 5483 (class 2604 OID 29736)
-- Name: contents id_cnt; Type: DEFAULT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.contents ALTER COLUMN id_cnt SET DEFAULT nextval('bdms.contents_id_cnt_seq'::regclass);


--
-- TOC entry 5486 (class 2604 OID 37987)
-- Name: events id_evs; Type: DEFAULT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.events ALTER COLUMN id_evs SET DEFAULT nextval('bdms.events_id_evs_seq'::regclass);


--
-- TOC entry 5480 (class 2604 OID 29223)
-- Name: feedbacks id_feb; Type: DEFAULT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.feedbacks ALTER COLUMN id_feb SET DEFAULT nextval('bdms.feedbacks_id_feb_seq'::regclass);


--
-- TOC entry 5471 (class 2604 OID 29161)
-- Name: files id_fil; Type: DEFAULT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.files ALTER COLUMN id_fil SET DEFAULT nextval('bdms.files_id_fil_seq'::regclass);


--
-- TOC entry 5467 (class 2604 OID 18535)
-- Name: layer id_lay; Type: DEFAULT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.layer ALTER COLUMN id_lay SET DEFAULT nextval('bdms.layer_id_lay_seq'::regclass);


--
-- TOC entry 5447 (class 2604 OID 18217)
-- Name: municipalities gid; Type: DEFAULT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.municipalities ALTER COLUMN gid SET DEFAULT nextval('bdms.municipalities_gid_seq'::regclass);


--
-- TOC entry 5454 (class 2604 OID 18256)
-- Name: roles id_rol; Type: DEFAULT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.roles ALTER COLUMN id_rol SET DEFAULT nextval('bdms.roles_id_rol_seq'::regclass);


--
-- TOC entry 5463 (class 2604 OID 18486)
-- Name: stratigraphy id_sty; Type: DEFAULT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.stratigraphy ALTER COLUMN id_sty SET DEFAULT nextval('bdms.stratigraphy_id_sty_seq'::regclass);


--
-- TOC entry 5476 (class 2604 OID 29194)
-- Name: terms id_tes; Type: DEFAULT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.terms ALTER COLUMN id_tes SET DEFAULT nextval('bdms.terms_id_tes_seq'::regclass);


--
-- TOC entry 5450 (class 2604 OID 18240)
-- Name: users id_usr; Type: DEFAULT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.users ALTER COLUMN id_usr SET DEFAULT nextval('bdms.users_id_usr_seq'::regclass);


--
-- TOC entry 5462 (class 2604 OID 18460)
-- Name: workflow id_wkf; Type: DEFAULT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.workflow ALTER COLUMN id_wkf SET DEFAULT nextval('bdms.workflow_id_wkf_seq'::regclass);


--
-- TOC entry 5455 (class 2604 OID 18267)
-- Name: workgroups id_wgp; Type: DEFAULT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.workgroups ALTER COLUMN id_wgp SET DEFAULT nextval('bdms.workgroups_id_wgp_seq'::regclass);


--
-- TOC entry 5513 (class 2606 OID 18444)
-- Name: borehole_codelist borehole_codelist_id_bho_fk_id_cli_fk_code_cli_key; Type: CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.borehole_codelist
    ADD CONSTRAINT borehole_codelist_id_bho_fk_id_cli_fk_code_cli_key UNIQUE (id_bho_fk, id_cli_fk, code_cli);


--
-- TOC entry 5515 (class 2606 OID 18442)
-- Name: borehole_codelist borehole_codelist_pkey; Type: CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.borehole_codelist
    ADD CONSTRAINT borehole_codelist_pkey PRIMARY KEY (id_bho_fk, id_cli_fk);


--
-- TOC entry 5531 (class 2606 OID 29183)
-- Name: borehole_files borehole_files_pkey; Type: CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.borehole_files
    ADD CONSTRAINT borehole_files_pkey PRIMARY KEY (id_bho_fk, id_fil_fk);


--
-- TOC entry 5511 (class 2606 OID 18309)
-- Name: borehole borehole_pkey; Type: CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_pkey PRIMARY KEY (id_bho);


--
-- TOC entry 5493 (class 2606 OID 18211)
-- Name: cantons cantons_pkey; Type: CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.cantons
    ADD CONSTRAINT cantons_pkey PRIMARY KEY (gid);


--
-- TOC entry 5497 (class 2606 OID 18234)
-- Name: codelist codelist_pkey; Type: CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.codelist
    ADD CONSTRAINT codelist_pkey PRIMARY KEY (id_cli);


--
-- TOC entry 5491 (class 2606 OID 18200)
-- Name: config config_pkey; Type: CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.config
    ADD CONSTRAINT config_pkey PRIMARY KEY (name_cfg);


--
-- TOC entry 5539 (class 2606 OID 29743)
-- Name: contents contents_pkey; Type: CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.contents
    ADD CONSTRAINT contents_pkey PRIMARY KEY (id_cnt);


--
-- TOC entry 5541 (class 2606 OID 37993)
-- Name: events events_pkey; Type: CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id_evs);


--
-- TOC entry 5537 (class 2606 OID 29230)
-- Name: feedbacks feedbacks_pkey; Type: CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.feedbacks
    ADD CONSTRAINT feedbacks_pkey PRIMARY KEY (id_feb);


--
-- TOC entry 5529 (class 2606 OID 29167)
-- Name: files files_pkey; Type: CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.files
    ADD CONSTRAINT files_pkey PRIMARY KEY (id_fil);


--
-- TOC entry 5527 (class 2606 OID 18671)
-- Name: layer_codelist layer_codelist_pkey; Type: CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.layer_codelist
    ADD CONSTRAINT layer_codelist_pkey PRIMARY KEY (id_lay_fk, id_cli_fk, code_cli);


--
-- TOC entry 5525 (class 2606 OID 18543)
-- Name: layer layer_pkey; Type: CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.layer
    ADD CONSTRAINT layer_pkey PRIMARY KEY (id_lay);


--
-- TOC entry 5495 (class 2606 OID 18222)
-- Name: municipalities municipalities_pkey; Type: CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.municipalities
    ADD CONSTRAINT municipalities_pkey PRIMARY KEY (gid);


--
-- TOC entry 5503 (class 2606 OID 18261)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id_rol);


--
-- TOC entry 5521 (class 2606 OID 18517)
-- Name: stratigraphy_codelist stratigraphy_codelist_pkey; Type: CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.stratigraphy_codelist
    ADD CONSTRAINT stratigraphy_codelist_pkey PRIMARY KEY (id_sty_fk, id_cli_fk);


--
-- TOC entry 5523 (class 2606 OID 18519)
-- Name: stratigraphy_codelist stratigraphy_codelist_unique; Type: CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.stratigraphy_codelist
    ADD CONSTRAINT stratigraphy_codelist_unique UNIQUE (id_sty_fk, id_cli_fk, code_cli);


--
-- TOC entry 5519 (class 2606 OID 18494)
-- Name: stratigraphy stratigraphy_pkey; Type: CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.stratigraphy
    ADD CONSTRAINT stratigraphy_pkey PRIMARY KEY (id_sty);


--
-- TOC entry 5535 (class 2606 OID 29207)
-- Name: terms_accepted terms_accepted_pkey; Type: CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.terms_accepted
    ADD CONSTRAINT terms_accepted_pkey PRIMARY KEY (id_usr_fk, id_tes_fk);


--
-- TOC entry 5533 (class 2606 OID 29201)
-- Name: terms terms_pkey; Type: CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.terms
    ADD CONSTRAINT terms_pkey PRIMARY KEY (id_tes);


--
-- TOC entry 5499 (class 2606 OID 18248)
-- Name: users user_pkey; Type: CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.users
    ADD CONSTRAINT user_pkey PRIMARY KEY (id_usr);


--
-- TOC entry 5509 (class 2606 OID 18280)
-- Name: users_roles users_roles_pkey; Type: CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.users_roles
    ADD CONSTRAINT users_roles_pkey PRIMARY KEY (id_usr_fk, id_rol_fk, id_wgp_fk);


--
-- TOC entry 5501 (class 2606 OID 18250)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 5517 (class 2606 OID 18465)
-- Name: workflow workflow_pkey; Type: CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.workflow
    ADD CONSTRAINT workflow_pkey PRIMARY KEY (id_wkf);


--
-- TOC entry 5505 (class 2606 OID 18275)
-- Name: workgroups workgroups_name_wgp_key; Type: CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.workgroups
    ADD CONSTRAINT workgroups_name_wgp_key UNIQUE (name_wgp);


--
-- TOC entry 5507 (class 2606 OID 18273)
-- Name: workgroups workgroups_pkey; Type: CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.workgroups
    ADD CONSTRAINT workgroups_pkey PRIMARY KEY (id_wgp);


--
-- TOC entry 5548 (class 2606 OID 18325)
-- Name: borehole borehole_canton_bho_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_canton_bho_fkey FOREIGN KEY (canton_bho) REFERENCES bdms.cantons(gid);


--
-- TOC entry 5568 (class 2606 OID 18425)
-- Name: borehole borehole_chronostrat_id_cli_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_chronostrat_id_cli_fkey FOREIGN KEY (chronostrat_id_cli) REFERENCES bdms.codelist(id_cli);


--
-- TOC entry 5549 (class 2606 OID 18330)
-- Name: borehole borehole_city_bho_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_city_bho_fkey FOREIGN KEY (city_bho) REFERENCES bdms.municipalities(gid);


--
-- TOC entry 5571 (class 2606 OID 18450)
-- Name: borehole_codelist borehole_codelist_id_bho_fk_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.borehole_codelist
    ADD CONSTRAINT borehole_codelist_id_bho_fk_fkey FOREIGN KEY (id_bho_fk) REFERENCES bdms.borehole(id_bho) ON DELETE CASCADE;


--
-- TOC entry 5570 (class 2606 OID 18445)
-- Name: borehole_codelist borehole_codelist_id_cli_fk_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.borehole_codelist
    ADD CONSTRAINT borehole_codelist_id_cli_fk_fkey FOREIGN KEY (id_cli_fk) REFERENCES bdms.codelist(id_cli);


--
-- TOC entry 5558 (class 2606 OID 18375)
-- Name: borehole borehole_cuttings_id_cli_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_cuttings_id_cli_fkey FOREIGN KEY (cuttings_id_cli) REFERENCES bdms.codelist(id_cli);


--
-- TOC entry 5605 (class 2606 OID 29184)
-- Name: borehole_files borehole_files_id_usr_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.borehole_files
    ADD CONSTRAINT borehole_files_id_usr_fkey FOREIGN KEY (id_usr_fk) REFERENCES bdms.users(id_usr);


--
-- TOC entry 5552 (class 2606 OID 18345)
-- Name: borehole borehole_hrs_id_cli_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_hrs_id_cli_fkey FOREIGN KEY (hrs_id_cli) REFERENCES bdms.codelist(id_cli);


--
-- TOC entry 5545 (class 2606 OID 18310)
-- Name: borehole borehole_id_wgp_fk_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_id_wgp_fk_fkey FOREIGN KEY (id_wgp_fk) REFERENCES bdms.workgroups(id_wgp);


--
-- TOC entry 5550 (class 2606 OID 18335)
-- Name: borehole borehole_kind_id_cli_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_kind_id_cli_fkey FOREIGN KEY (kind_id_cli) REFERENCES bdms.codelist(id_cli);


--
-- TOC entry 5556 (class 2606 OID 18365)
-- Name: borehole borehole_landuse_id_cli_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_landuse_id_cli_fkey FOREIGN KEY (landuse_id_cli) REFERENCES bdms.codelist(id_cli);


--
-- TOC entry 5566 (class 2606 OID 18415)
-- Name: borehole borehole_lithology_id_cli_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_lithology_id_cli_fkey FOREIGN KEY (lithology_id_cli) REFERENCES bdms.codelist(id_cli);


--
-- TOC entry 5567 (class 2606 OID 18420)
-- Name: borehole borehole_lithostrat_id_cli_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_lithostrat_id_cli_fkey FOREIGN KEY (lithostrat_id_cli) REFERENCES bdms.codelist(id_cli);


--
-- TOC entry 5546 (class 2606 OID 18315)
-- Name: borehole borehole_locked_by_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_locked_by_fkey FOREIGN KEY (locked_by) REFERENCES bdms.users(id_usr) ON DELETE SET NULL;


--
-- TOC entry 5557 (class 2606 OID 18370)
-- Name: borehole borehole_method_id_cli_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_method_id_cli_fkey FOREIGN KEY (method_id_cli) REFERENCES bdms.codelist(id_cli);


--
-- TOC entry 5565 (class 2606 OID 18410)
-- Name: borehole borehole_national_relevance_id_cli_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_national_relevance_id_cli_fkey FOREIGN KEY (national_relevance_id_cli) REFERENCES bdms.codelist(id_cli);


--
-- TOC entry 5564 (class 2606 OID 18405)
-- Name: borehole borehole_processing_status_id_cli_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_processing_status_id_cli_fkey FOREIGN KEY (processing_status_id_cli) REFERENCES bdms.codelist(id_cli);


--
-- TOC entry 5559 (class 2606 OID 18380)
-- Name: borehole borehole_purpose_id_cli_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_purpose_id_cli_fkey FOREIGN KEY (purpose_id_cli) REFERENCES bdms.codelist(id_cli);


--
-- TOC entry 5561 (class 2606 OID 18390)
-- Name: borehole borehole_qt_bore_inc_dir_id_cli_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_qt_bore_inc_dir_id_cli_fkey FOREIGN KEY (qt_bore_inc_dir_id_cli) REFERENCES bdms.codelist(id_cli);


--
-- TOC entry 5555 (class 2606 OID 18360)
-- Name: borehole borehole_qt_elevation_id_cli_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_qt_elevation_id_cli_fkey FOREIGN KEY (qt_elevation_id_cli) REFERENCES bdms.codelist(id_cli);


--
-- TOC entry 5562 (class 2606 OID 18395)
-- Name: borehole borehole_qt_length_id_cli_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_qt_length_id_cli_fkey FOREIGN KEY (qt_length_id_cli) REFERENCES bdms.codelist(id_cli);


--
-- TOC entry 5554 (class 2606 OID 18355)
-- Name: borehole borehole_qt_location_id_cli_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_qt_location_id_cli_fkey FOREIGN KEY (qt_location_id_cli) REFERENCES bdms.codelist(id_cli);


--
-- TOC entry 5563 (class 2606 OID 18400)
-- Name: borehole borehole_qt_top_bedrock_id_cli_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_qt_top_bedrock_id_cli_fkey FOREIGN KEY (qt_top_bedrock_id_cli) REFERENCES bdms.codelist(id_cli);


--
-- TOC entry 5553 (class 2606 OID 18350)
-- Name: borehole borehole_restriction_id_cli_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_restriction_id_cli_fkey FOREIGN KEY (restriction_id_cli) REFERENCES bdms.codelist(id_cli);


--
-- TOC entry 5551 (class 2606 OID 18340)
-- Name: borehole borehole_srs_id_cli_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_srs_id_cli_fkey FOREIGN KEY (srs_id_cli) REFERENCES bdms.codelist(id_cli);


--
-- TOC entry 5560 (class 2606 OID 18385)
-- Name: borehole borehole_status_id_cli_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_status_id_cli_fkey FOREIGN KEY (status_id_cli) REFERENCES bdms.codelist(id_cli);


--
-- TOC entry 5569 (class 2606 OID 18430)
-- Name: borehole borehole_tecto_id_cli_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_tecto_id_cli_fkey FOREIGN KEY (tecto_id_cli) REFERENCES bdms.codelist(id_cli);


--
-- TOC entry 5547 (class 2606 OID 18320)
-- Name: borehole borehole_updater_bho_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.borehole
    ADD CONSTRAINT borehole_updater_bho_fkey FOREIGN KEY (updater_bho) REFERENCES bdms.users(id_usr);


--
-- TOC entry 5608 (class 2606 OID 37994)
-- Name: events events_id_usr_fk_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.events
    ADD CONSTRAINT events_id_usr_fk_fkey FOREIGN KEY (id_usr_fk) REFERENCES bdms.users(id_usr) ON DELETE CASCADE;


--
-- TOC entry 5604 (class 2606 OID 29168)
-- Name: files files_id_usr_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.files
    ADD CONSTRAINT files_id_usr_fkey FOREIGN KEY (id_usr_fk) REFERENCES bdms.users(id_usr);


--
-- TOC entry 5590 (class 2606 OID 18594)
-- Name: layer layer_alteration_id_cli_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.layer
    ADD CONSTRAINT layer_alteration_id_cli_fkey FOREIGN KEY (alteration_id_cli) REFERENCES bdms.codelist(id_cli);


--
-- TOC entry 5585 (class 2606 OID 18569)
-- Name: layer layer_chronostratigraphy_id_cli_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.layer
    ADD CONSTRAINT layer_chronostratigraphy_id_cli_fkey FOREIGN KEY (chronostratigraphy_id_cli) REFERENCES bdms.codelist(id_cli);


--
-- TOC entry 5595 (class 2606 OID 18619)
-- Name: layer layer_cohesion_id_cli_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.layer
    ADD CONSTRAINT layer_cohesion_id_cli_fkey FOREIGN KEY (cohesion_id_cli) REFERENCES bdms.codelist(id_cli);


--
-- TOC entry 5591 (class 2606 OID 18599)
-- Name: layer layer_compactness_id_cli_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.layer
    ADD CONSTRAINT layer_compactness_id_cli_fkey FOREIGN KEY (compactness_id_cli) REFERENCES bdms.codelist(id_cli);


--
-- TOC entry 5589 (class 2606 OID 18589)
-- Name: layer layer_consistance_id_cli_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.layer
    ADD CONSTRAINT layer_consistance_id_cli_fkey FOREIGN KEY (consistance_id_cli) REFERENCES bdms.codelist(id_cli);


--
-- TOC entry 5580 (class 2606 OID 18544)
-- Name: layer layer_creator_lay_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.layer
    ADD CONSTRAINT layer_creator_lay_fkey FOREIGN KEY (creator_lay) REFERENCES bdms.users(id_usr);


--
-- TOC entry 5593 (class 2606 OID 18609)
-- Name: layer layer_grain_size_1_id_cli_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.layer
    ADD CONSTRAINT layer_grain_size_1_id_cli_fkey FOREIGN KEY (grain_size_1_id_cli) REFERENCES bdms.codelist(id_cli);


--
-- TOC entry 5594 (class 2606 OID 18614)
-- Name: layer layer_grain_size_2_id_cli_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.layer
    ADD CONSTRAINT layer_grain_size_2_id_cli_fkey FOREIGN KEY (grain_size_2_id_cli) REFERENCES bdms.codelist(id_cli);


--
-- TOC entry 5601 (class 2606 OID 18649)
-- Name: layer layer_humidity_id_cli_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.layer
    ADD CONSTRAINT layer_humidity_id_cli_fkey FOREIGN KEY (humidity_id_cli) REFERENCES bdms.codelist(id_cli);


--
-- TOC entry 5581 (class 2606 OID 18549)
-- Name: layer layer_id_sty_fk_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.layer
    ADD CONSTRAINT layer_id_sty_fk_fkey FOREIGN KEY (id_sty_fk) REFERENCES bdms.stratigraphy(id_sty) ON DELETE CASCADE;


--
-- TOC entry 5599 (class 2606 OID 18639)
-- Name: layer layer_kirost_id_cli_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.layer
    ADD CONSTRAINT layer_kirost_id_cli_fkey FOREIGN KEY (kirost_id_cli) REFERENCES bdms.codelist(id_cli);


--
-- TOC entry 5603 (class 2606 OID 18659)
-- Name: layer layer_lithok_id_cli_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.layer
    ADD CONSTRAINT layer_lithok_id_cli_fkey FOREIGN KEY (lithok_id_cli) REFERENCES bdms.codelist(id_cli);


--
-- TOC entry 5584 (class 2606 OID 18564)
-- Name: layer layer_lithology_id_cli_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.layer
    ADD CONSTRAINT layer_lithology_id_cli_fkey FOREIGN KEY (lithology_id_cli) REFERENCES bdms.codelist(id_cli);


--
-- TOC entry 5600 (class 2606 OID 18644)
-- Name: layer layer_lithostratigraphy_id_cli_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.layer
    ADD CONSTRAINT layer_lithostratigraphy_id_cli_fkey FOREIGN KEY (lithostratigraphy_id_cli) REFERENCES bdms.codelist(id_cli);


--
-- TOC entry 5588 (class 2606 OID 18584)
-- Name: layer layer_plasticity_id_cli_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.layer
    ADD CONSTRAINT layer_plasticity_id_cli_fkey FOREIGN KEY (plasticity_id_cli) REFERENCES bdms.codelist(id_cli);


--
-- TOC entry 5583 (class 2606 OID 18559)
-- Name: layer layer_qt_description_id_cli_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.layer
    ADD CONSTRAINT layer_qt_description_id_cli_fkey FOREIGN KEY (qt_description_id_cli) REFERENCES bdms.codelist(id_cli);


--
-- TOC entry 5592 (class 2606 OID 18604)
-- Name: layer layer_soil_state_id_cli_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.layer
    ADD CONSTRAINT layer_soil_state_id_cli_fkey FOREIGN KEY (soil_state_id_cli) REFERENCES bdms.codelist(id_cli);


--
-- TOC entry 5587 (class 2606 OID 18579)
-- Name: layer layer_symbol_id_cli_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.layer
    ADD CONSTRAINT layer_symbol_id_cli_fkey FOREIGN KEY (symbol_id_cli) REFERENCES bdms.codelist(id_cli);


--
-- TOC entry 5586 (class 2606 OID 18574)
-- Name: layer layer_tectonic_unit_id_cli_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.layer
    ADD CONSTRAINT layer_tectonic_unit_id_cli_fkey FOREIGN KEY (tectonic_unit_id_cli) REFERENCES bdms.codelist(id_cli);


--
-- TOC entry 5602 (class 2606 OID 18654)
-- Name: layer layer_unconrocks_id_cli_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.layer
    ADD CONSTRAINT layer_unconrocks_id_cli_fkey FOREIGN KEY (unconrocks_id_cli) REFERENCES bdms.codelist(id_cli);


--
-- TOC entry 5582 (class 2606 OID 18554)
-- Name: layer layer_updater_lay_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.layer
    ADD CONSTRAINT layer_updater_lay_fkey FOREIGN KEY (updater_lay) REFERENCES bdms.users(id_usr);


--
-- TOC entry 5596 (class 2606 OID 18624)
-- Name: layer layer_uscs_1_id_cli_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.layer
    ADD CONSTRAINT layer_uscs_1_id_cli_fkey FOREIGN KEY (uscs_1_id_cli) REFERENCES bdms.codelist(id_cli);


--
-- TOC entry 5597 (class 2606 OID 18629)
-- Name: layer layer_uscs_2_id_cli_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.layer
    ADD CONSTRAINT layer_uscs_2_id_cli_fkey FOREIGN KEY (uscs_2_id_cli) REFERENCES bdms.codelist(id_cli);


--
-- TOC entry 5598 (class 2606 OID 18634)
-- Name: layer layer_uscs_determination_id_cli_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.layer
    ADD CONSTRAINT layer_uscs_determination_id_cli_fkey FOREIGN KEY (uscs_determination_id_cli) REFERENCES bdms.codelist(id_cli);


--
-- TOC entry 5576 (class 2606 OID 18500)
-- Name: stratigraphy stratigraphy_author_sty_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.stratigraphy
    ADD CONSTRAINT stratigraphy_author_sty_fkey FOREIGN KEY (author_sty) REFERENCES bdms.users(id_usr);


--
-- TOC entry 5578 (class 2606 OID 18520)
-- Name: stratigraphy_codelist stratigraphy_codelist_id_cli_fk_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.stratigraphy_codelist
    ADD CONSTRAINT stratigraphy_codelist_id_cli_fk_fkey FOREIGN KEY (id_cli_fk) REFERENCES bdms.codelist(id_cli);


--
-- TOC entry 5579 (class 2606 OID 18525)
-- Name: stratigraphy_codelist stratigraphy_codelist_id_sty_fk_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.stratigraphy_codelist
    ADD CONSTRAINT stratigraphy_codelist_id_sty_fk_fkey FOREIGN KEY (id_sty_fk) REFERENCES bdms.stratigraphy(id_sty) ON DELETE CASCADE;


--
-- TOC entry 5575 (class 2606 OID 18495)
-- Name: stratigraphy stratigraphy_id_bho_fk_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.stratigraphy
    ADD CONSTRAINT stratigraphy_id_bho_fk_fkey FOREIGN KEY (id_bho_fk) REFERENCES bdms.borehole(id_bho) ON DELETE CASCADE;


--
-- TOC entry 5577 (class 2606 OID 18505)
-- Name: stratigraphy stratigraphy_updater_sty_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.stratigraphy
    ADD CONSTRAINT stratigraphy_updater_sty_fkey FOREIGN KEY (updater_sty) REFERENCES bdms.users(id_usr);


--
-- TOC entry 5607 (class 2606 OID 29213)
-- Name: terms_accepted terms_accepted_id_tes_fk_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.terms_accepted
    ADD CONSTRAINT terms_accepted_id_tes_fk_fkey FOREIGN KEY (id_tes_fk) REFERENCES bdms.terms(id_tes) ON DELETE CASCADE;


--
-- TOC entry 5606 (class 2606 OID 29208)
-- Name: terms_accepted terms_accepted_id_usr_fk_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.terms_accepted
    ADD CONSTRAINT terms_accepted_id_usr_fk_fkey FOREIGN KEY (id_usr_fk) REFERENCES bdms.users(id_usr) ON DELETE CASCADE;


--
-- TOC entry 5542 (class 2606 OID 18281)
-- Name: users_roles user_roles_id_usr_fk_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.users_roles
    ADD CONSTRAINT user_roles_id_usr_fk_fkey FOREIGN KEY (id_usr_fk) REFERENCES bdms.users(id_usr) ON DELETE CASCADE;


--
-- TOC entry 5543 (class 2606 OID 18286)
-- Name: users_roles users_roles_id_rol_fk_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.users_roles
    ADD CONSTRAINT users_roles_id_rol_fk_fkey FOREIGN KEY (id_rol_fk) REFERENCES bdms.roles(id_rol);


--
-- TOC entry 5544 (class 2606 OID 18291)
-- Name: users_roles users_roles_id_wgp_fk_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.users_roles
    ADD CONSTRAINT users_roles_id_wgp_fk_fkey FOREIGN KEY (id_wgp_fk) REFERENCES bdms.workgroups(id_wgp) ON DELETE CASCADE;


--
-- TOC entry 5572 (class 2606 OID 18466)
-- Name: workflow workflow_id_bho_fk_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.workflow
    ADD CONSTRAINT workflow_id_bho_fk_fkey FOREIGN KEY (id_bho_fk) REFERENCES bdms.borehole(id_bho) ON DELETE CASCADE;


--
-- TOC entry 5573 (class 2606 OID 18471)
-- Name: workflow workflow_id_rol_fk_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.workflow
    ADD CONSTRAINT workflow_id_rol_fk_fkey FOREIGN KEY (id_rol_fk) REFERENCES bdms.roles(id_rol);


--
-- TOC entry 5574 (class 2606 OID 18476)
-- Name: workflow workflow_id_usr_fk_fkey; Type: FK CONSTRAINT; Schema: bdms; Owner: -
--

ALTER TABLE ONLY bdms.workflow
    ADD CONSTRAINT workflow_id_usr_fk_fkey FOREIGN KEY (id_usr_fk) REFERENCES bdms.users(id_usr);


-- Completed on 2022-09-21 08:05:24 UTC

--
-- PostgreSQL database dump complete
--

