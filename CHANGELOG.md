# Changelog

## [Unreleased]

### Added

- Added functionality to edit facies description seperately from lithology.
- Added functionality to scroll to newly created lithology layer.
- Add separate panel to edit chronostratigraphy layers.
- Add minimal csv-import for boreholes.

### Changed

- Memorize table and map state when navigating through the application.
- When leaving settings page, correctly navigate back to the previously selected mode (viewer or editor).
- Display loader icon when fetching data for stratigraphy or users.
- Remove _lithological description_ and _facies description_ from lithology layer in viewer mode, editor mode and in settings.
- Removed _set manually_ from resolving options when deleting a lithology layer.
- Display lithology layer details in lithology column in editor mode.
- Immediately delete layers in _casing_ and _backfill_ columns, without showing a delete dialog.
- Removed export functionality.
- Removed blue info button of displayed maps in map settings.
- Update Chronostratigraphy Codelist entries.
- Make Lithology a sub-menu of Stratigraphy.
- Display chronostratigraphy colors in chronostratigraphy editor.
- Migrate chronostratigraphy _Middle Jurassic undifferenciated_ to _Middle Jurassic_.
- Remove height reference system column from editor view list.
- Remove import settings from administrator settings.

### Fixed

- Creating, editing or deleting lithological descriptions was not allowed for non-admin users.
- When creating and locating a new borehole, each click added a new point on the map.
- Add missing translations when editing a locked borehole, giving feedback or deleting an ID type.
- Fix internal error when adding a backfill with _no casing_.
- Fix internal error in viewer/editor settings for _Stratigraphy fields_ when clicking _Select all_.
- Fix error when downloading a borehole profile.
- Fix bug where a facies description with a height of 0 could be created.
- Fix broken layout of _lithological description_ and _facies description_ columns when a gap of more than one layer was created in the _lithology_ column.
- Fix bug where lithological descriptions where not copied when copying boreholes or stratigraphies.
- Fix bug where coordinates were not updated when pasted in the coordinate input.
- Empty text or numeric fields are always displayed as `-` in the detail sections of the viewer mode.
- Enable translation of transparency label in map settings.
- Remove unnecessary Italian text in publish confirmation modal.
- Add status submit message in all languages.
- Allow uploading the same file for different boreholes.
- Display an error message if a file is already uploaded for a particular borehole.
- Resolve error when selecting `Instrumentation` with no EDIT role and no stratigraphy defined for borehole.
- Fix and improve flaky Instrumentation tests.

## v2.0.186 - 2023-02-13

### Added

- Added new location migration endpoint in order to be able to manually update location information (country_bho, canton_bho and municipality_bho).

## v2.0.183 - 2023-02-10

### Added

- Added functionality to edit lithological description seperately from lithology.

### Changed

- Replaced all generic browser alerts with styled alerts.

### Fixed

- Fix bug where selecting the location filter as viewer or editor caused the application to crash.
- When copying a borehole, layer properties with multiple values (i.e. USCS3) were ignored and not copied.
- Copying a borehole was not allowed as non-admin user.

## v2.0.169 - 2023-02-07

### Added

- Added new data migration endpoint to recalculate the coordinates depending on whether the original spatial reference system is LV03 or LV95 based.

### Changed

- Get Municipality, Canton, Country from geo.admin.ch service. Removed obsolete Canton / Municipality tables.
- Remove unnecessary units from various labels.
- Reuse styles in map component.
- Remove unnecessary JSON attributes when loading borehole geometries.
- Place `original_lithology` field after `lithology` in viewer/editor settings for _Stratigraphy fields_.
- Empty text or numeric fields are always displayed as `-` in the detail sections of the viewer mode.
- Add workgroup filter to viewer.
- Removed unused table `bdms.geodin_files` from database.

### Fixed

- Fix partly unresponsive UI by avoiding unnecessary data loading on startup.
- Fix bug where setting or changing the borehole location on the map in editor mode caused the application to freeze.
- Disable possibility to draw and move point in detail map when borehole is not locked.
- When copying a stratigraphy, layer properties with multiple values (i.e. USCS3) were ignored and not copied.

## v2.0.133 - 2023-01-19

### Added

- Added db constraints for table `layer_codelist`.
- Display original_lithology field in viewer and editor mode.

### Changed

- Use REST API v2 to display layer in viewer mode.

## v2.0.131 - 2023-01-16

### Added

- Added possibility to add a casing layer (_CasingId_) to an instrument.
- Added new columns in borehole table for LV03 coordinates.
- Added inputs for entering coordinates in LV03 as well as LV95. The coordinates in the coordinate system that were not entered by the user, are automatically transformed and completed.
- Added search filter for reference systems (LV03 and LV95).
- Added cluster layer for displaying points on map while maintaining application performance.
- Added input field to codelist translation UI, that is used to change the order of the codelist.
- Added filter in editor mode for registration details creation date and user.
- Added db constraints for `stratigraphy.fill_casng_id_sty_fk` and `layer.gradation_id_cli`.
- Added new db field `original_lithology` to layer table. The new field contains english text values of `unconrocks_id_cli` and `lithok_id_cli`.

### Changed

- Migrate existing LV95 coordinates into LV03 coordinates using 'shift' method. Preserve original LV95 coordinates for some selected boreholes (e.g. Bülach-1-1, ...).
- Points on the overview map are now displayed as clusters depending on zoom level.
- Order codelists in translation UI by `order` column instead of by `geolcode`.
- Coordinates, elevations diameters and depths in inputs and texts are now displayed with thousand separators.
- Removed `mentions` functionality in workflow comments.
- Removed unused columns from database: `borehole.import_id`, `borehole.tecto_id_cli`, `stratigraphy.import_id`, `layer.import_id`, `layer.tectonic_unit_id_cli`, `layer.symbol_id_cli`, `layer.soil_state_id_cli`, `layer.kirost_id_cli`.
- Removed unused table `bdms.statigraphy_codelist` from database.
- Removed  `layer.unconrocks_id_cli` and `layer.lithok_id_cli` from database.
- Changed cardinality of `uscs3` field on `bdms.layer` to m:n.

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
- Fix bug where updating of `qt_depth` led to error.

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
