-- =============================================================================
-- As part of the docker-entrypoint initialization, this script creates the
-- required extensions for the local database.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS ltree;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS postgis;
