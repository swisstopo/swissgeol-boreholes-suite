# Changelog

## [Unreleased]

### Added

- Added possibility to add a casing layer (_CasingId_) to an instrument.
- Added new columns in borehole table for LV03 coordinates.
- Added inputs for entering coordinates in LV03 as well as LV95. The coordinates in the coordinate system that were not entered by the user, are automatically transformed and completed.
- Added search filter for reference systems (LV03 and LV95).
- Added cluster layer for displaying points on map while maintaining application performance.
- Added input field to codelist translation UI, that is used to change the order of the codelist.
- Added filter in editor mode for registration details creation date and user.

### Changed

- Migrate existing LV95 coordinates into LV03 coordinates using 'shift' method. Preserve original LV95 coordinates for some selected boreholes (e.g. Bülach-1-1, ...). These changes are not yet visible in the web client.
- Points on the overview map are now displayed as clusters depending on zoom level.
- Order codelists in translation UI by `order` column instead of by `geolcode`.
- Coordinates, elevations diameters and depths in inputs and texts are now displayed with thousand separators.
- Removed `mentions` functionality in workflow comments.
- Removed unused columns from database: `borehole.import_id`, `borehole.tecto_id_cli`, `stratigraphy.import_id`, `layer.import_id`, `layer.tectonic_unit_id_cli`, `layer.symbol_id_cli`, `layer.soil_state_id_cli`, `layer.kirost_id_cli`.

### Fixed

- Fix sending feedback e-mail.
- Display `lithology_top_bedrock`, `lithostratigraphy_top_bedrock`and `chronostratigraphy_top_bedrock` as domain trees in bulk edit.
- Added space above the instrument list.
- Fix bug where casing IDs could be selected, even though the name of completion was `No casing`.
- Fix bug where filtering by `identifier` led to bugs in bulk edit.
- Fix bug where points with spatial reference system LV03 were not correctly displayed on detail map.
- Fix bug where groundwater radio buttons were not displayed.
- Correctly display number of boreholes, independently of map appearance.
- Disable possibility to draw and move point in detail map when borehole is not locked.
- Fix layout of comments in publication workflow.
- Immediately update tickboxes in admin user role UI.
- Display dropdown with values from schema `qt_top_bedrock` for attribute `qt_depth` to streamline all qt drowpdowns
- Display _Filter by map_ in Editor when appearance is _Large Map_.
- Fix bug where clicks on clusters or points have been ignored on viewer map.

## v2.0.65 - 2022-11-04

### Added

- Added this changelog.
- Added new .NET REST API (_v2_).
- Added new API endpoint (_/v2/version_).
- Added stable Docker image tags for testing environment.
- Added UI for updating translations of codelists in editor settings.
- Added fake data for development.
- Added version/environment information in feedback e-mail.
- Added version number in web client.
- Added functionality to add instruments without casing.
- Added a new about page in settings containing license information.
- Added automatic release notes for newly created GitHub releases.

### Changed

- Update _Dokumentation_ page in settings.
- Standardize messages for empty profiles, empty casing and missing stratigraphy.
- Update the app title in the top left to show the new _boreholes.swissgeol.ch_ name including the correct environment.
- Removed _Enter as viewer_ login option.

### Fixed

- Add missing option _Keine Angabe_ for layer_striae.
- Fix blank screen in viewer mode.
- Add missing package to fix Docker health check in production.
- Fix broken total_depth attribute reference in table.
- Improve stratigraphy viewer.
- Fix terms of service.
- Always show up to date login screen text.
- Fix filter dropdowns not updating.
- Fix appearance setting label.
- Fix error highlight of identifier fields.
- Fix bulk edit.
- Fix sorting in borehole tables in viewer and editor mode.
- Fix text displayed in backfill tab, when no backfill is available.
- Fix text displayed in instrument tab, when no instrument is available.
- Fix dialog message when enabling user.
- Fix creation of user with admin role.
- Add missing translations when publishing new welcome messages.
- Fix copying of boreholes.
- Add missing checks for contributions when deleting users.
- Removed obsolete `borehole.contact_id` column.
- Always displays `Show all` button when editing instruments.
