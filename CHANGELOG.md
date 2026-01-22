# Changelog

## [Unreleased]

### Changed
- Upgraded NuGet packages and GitHub actions.

## v2.1.1427 - 2025-11-27

### Fixed
- Lithologies used deprecated `custom.lithology_top_bedrock` codelists instead of the new `lithology_con`.

## v2.1.1425 - 2025-11-20

### Changed
- The max file size for file uploads in the log tab has been increased to 5 GB.

## v2.1.1422 - 2025-11-13

### Fixed
- The casing was not displayed in the form select element when editing a sealing.

## v2.1.1419 - 2025-11-13

### Added
- Added new lithology UI and backend to manage the borehole's lithologies. Removed legacy lithology UI.
- Added functionality to automatically extract lithological descriptions from borehole profiles.
- Added new log UI and backend to add, edit and delete borehole log runs and log files.

### Changed
- Update legal links in disclaimer for all languages.
- Upgraded to PostgreSQL 17 and PostGIS 3.5.

## v2.1.1358 - 2025-09-24

### Changed
- Use new codelists for stratigraphy properties in borehole.

## v2.1.1346 - 2025-09-23

### Changed
- Migrated stratigraphies and layers to new lithology tables.
- Renamed codelist schema `texture_mata` to `texture_meta`.

## v2.1.1335 - 2025-09-17

### Added
- Added new lithology table

## v2.1.1328 - 2025-09-11

### Changed
- Filters for registration are now hidden on the view instance.
- The _show all_ switch in the filters is now hidden on the view instance and all fields are shown by default.

### Fixed
- _view-sync_ did not sync *Water ingresses*, *Groundwater measurements* and *Field measurements* correctly.

## v2.1.1325 - 2025-09-08

### Changed
- Upgraded swissgeol OCR service to version 1.1.0.
- Added new workflow UI and backend to manage the borehole's publication status. Removed legacy workflow UI and backend.
- Filters for workgroup and status are now hidden on the view instance.
- Attachments can now be exported without editor privileges.
- _view-sync_ now also syncs published public attachments.
- Adding or importing boreholes is now explicitly disabled when no workgroup is selected.
- Moved geometry format names to localization files to support translations.
- _extern-sync_ now syncs all boreholes once they reach the `Reviewed` status.

### Fixed
- Boreholes that were locked by any user could not be edited by others, including administrators, even after lock timeout expiration.
- There was an overflow issue in UI of the borehole detail view in the tabs _borehole_ and _completion_.

## v2.1.1266 - 2025-07-22

### Changed
- Upgraded to Node 22.

## v2.1.1257 - 2025-07-17

### Changed
- Lithology, lithostratigraphy and chronostratigraphy are combined into one menu item.
- Removed description quality of lithological descriptions and facies descriptions.

### Fixed
- The pagination was not displayed on the last page of the borehole table.
- Borehole exports no longer contain photos.
- Fixed bug where public checkbox state was reset when adding a new attachment (e.g. photo, profile, document) to a borehole.
- The axis labels on top view geometry chart were switched and the ticks did not include any decimals.
- Adjusted table style to match the UI-design.

## v2.1.1230 - 2025-06-13

### Added
- Added the documents tab to the borehole attachments.

### Changed
- Updated _extern-sync_ logic to filter published boreholes by target workgroup for duplication check.
- In the overview map when hovering over a borehole, clicking the tooltip text now navigates to the borehole detail view. If several boreholes are located at the same position, a list of boreholes is displayed in the tooltip and clicking on one of them navigates to the respective borehole detail view.
- Administrators can now edit workgroup names on the settings page.
- Show loading indicator when importing data.
- Select input fields now filter and display only the options that match the user's input.
- Remove type from profile table.

### Fixed
- Boreholes could not be exported in the _view_ environment.
- `Boreholes.swissgeol.ch ID` was not listed in the location type ID filter.
- The lithostratigraphy was missing when copying a stratigraphy.
- Loading a page by url did not work after a redirect from the login page.
- When changing settings for lithology fields, the state of the checkboxes would be lost when navigating away and returning.
- Editing boreholes with photos would cause an error.
- Boreholes with observations could not be exported as JSON.

## v2.1.1200 - 2025-05-22

### Added
- Added the photos tab to the borehole attachments.
- Added photo viewer to the borehole sidepanel.
- Added data collection to detail page.
- Automatic conversion from meters above sea level (MASL) to measured depth (MD) in hydro module.

### Changed
- Upgraded to React 19.1
- Refactored save logic in the borehole detail view.
- Refactored attachments tabs to unify the design and behavior of the tables.
- Pagination in the side panel now navigates to first and last page of the document, instead of the next or previous file when clicking on the outer arrows.
- Added codelist entry 'liner' to the codelist `casing_type`.

### Fixed
- Boreholes were always copied to the default workgroup instead of the selected workgroup.
- _view-sync_ failed if the source database had a default workgroup named `Default`.
- Depths with thousand separators could not be input in lithostratigraphy and chronostratigraphy.
- Fixed a bug where copy boreholes dialog could not always be closed.
- Fixed French translation of codelist entry `grab drilling`.

## v2.1.1162 - 2025-04-10

### Fixed
- Calculations of TVD resulted in an error when the distance between the two coordinates to interpolate was larger than their difference of MD.

## v2.1.1156 - 2025-04-04

### Added
- Added a button to add workgroups in the workgroup administration.

### Changed
- The text extraction button is now disabled when the text extraction is in progress.
- Update legal links in disclaimer for all languages.
- Number inputs in the borehole sections, hydrogeology, completion and layer descriptions are now displayed with thousand separators.
- The borehole geometry charts and tables now display numbers with thousand separators.
- Bump data extraction API version to v1.0.30.
- The panel displaying the PDF is now also visible when editing is disabled.
- Inputs in filters and the lithology form and the lithology layer form now have the new UI style.
- Reduced data of exported JSON files.

### Fixed
- When extracting coordinates from a PDF with the labeling feature, they could not be reset by pressing the discard changes button.
- Copying a borehole did not update its casing references to the copied casings.
- Importing a borehole with attachments assigned to a non-existent user id resulted in an error.
- When exporting .zip archives for boreholes whose names contained dots the .zip extension was missing.

## v2.1.1125 - 2025-03-19

### Changed
- Attachments are now displayed in a table following new UI design.

### Fixed
- Attachments page was missing scrollbars.
- The input field for the alternate name was always overwritten by the original name when loading the location page.
- Tooltips in the labeling area where not complete and would sometimes overlap with text to be selected.
- Copy borehole to the correct workgroup if the user only has edit permissions in a single workgroup.
- Very small numbers were not displayed correctly in hydrogeology result tables.

## v2.1.1116 - 2025-03-17

### Changed

- Increased Disclaimer dialog width.

## v2.1.1113 - 2025-03-17

### Added

- Added a table displaying all the users in the admin settings.
- Added a detail view for users in the admin settings.
- Added a table displaying all the workgroups in the admin settings.
- Added a detail view for workgroups in the admin settings.
- Enable auto setting of depth in MASL in hydro module.
- Added functionality to copy extracted text to clipboard in the labeling panel.
- New _extern-sync_ Docker image for syncing published boreholes from a source to a target database.
- Added highlighting of words that will be included in text extraction.
- Added data collection with consent option.

### Changed

- The settings are now displayed in tabs.
- A spinner is now displayed during the file download when exporting data.
- In the data extraction panel the boxes can now be drawn with click and drag instead of two clicks.
- Detail page side navigation items are greyed out if there is no applicable content.
- Content tabs of completion and borehole sections are greyed out if there is no applicable content.
- The pressure unit in the hydrotest module is now displayed as `kPa` instead of `Pa`.
- The values in the hydrotest results are now displayed with thousand separators.

### Fixed

- When hovering over the main side navigation icons, an incorrect background color was displayed for the hovered icon.
- Before export or import check if the user has the correct role and is in the same workgroup as the borehole.
- Fix sorting by drilling purpose in borehole table.
- Fix unexpected reset of column width in borehole table.
- Stop automatic update of alternate name when it is different from the original name.

## v2.1.1052 - 2025-02-04

### Added

- Added functionality to import borehole attachments inside a ZIP file.
- Added field `Top bedrock intersected` to borehole form.

### Changed 

- Exporting boreholes as CSV and JSON (without attachments) is now also available in anonymous mode. 
- Display an error message to the user when attachment files could not be fetched from cloud storage during export.
- Removed all asterisks from required form fields.
- Updated the UI design of the tabs component.
- Reincluded download link for codelist references in the import panel.
- Formfield border color now depend on whether borehole editing is enabled or not.
- Select dropdown arrows are now only displayed if borehole editing is enabled.

### Fixed

- Workgroup reset in the bulk edit form had to be clicked twice to take effect. 
- Numeric inputs on the borehole tab were not correctly reset.
- When navigating away from the sections tab with unsaved changes, no warning prompt was displayed.
- Replace whitespaces in borehole attachments before upload. Also replace whitespaces in existing filenames.
- When importing boreholes or creating a new borehole the workgroup could not be selected.
- Scrollbar not appearing in the borehole general tab when the screen height was smaller than the tab height.

## v2.1.1025 - 2025-01-17

### Added

- Added ZIP export with JSON and attachments for single and multiple boreholes.
- Added geopackage export for single and multiple boreholes.

### Changed 
- Removed attachments from csv import.
- Updated recommended csv headers for borehole import to camel case e.g. `OriginalName` (snake case e.g. `original_name` is still supported for all properties except for custom identifiers).
- Changed order of `Top Bedrock (fresh)` and `Top Bedrock (weathered)` fields in borehole form.
- When importing custom IDs with CSV, the headers are now dynamically mapped to the `borehole_identifier` codelists in the database.
- Moved borehole import to side drawer and adapted UI design.
- Years greater than 9999 can no longer be used in date inputs.
- The application language is now determined by the browser language if it is any of the supported languages.
- Changed the icon for opening the labeling area.
- Add thousand separators to large numbers in borehole overview table.

### Fixed

- Observations were not included in exported borehole JSON file.
- Fixed bug where values of 0 were not displayed in numeric input fields.
- Fixed bug where `Lithostratigraphhy Top Bedrock` and `Chronostratigraphhy Top Bedrock` were not displayed in form after updating them and navigating away.
- Ensure all hydrotest codelist values are imported.
- JSON export/import did not handle borehole geometry and location geometry correctly.
- JSON import did not handle casing references of observations, backfills and instrumentations correctly.
- In some cases, the color of the workflow badge did not match the publication status.

## v2.1.993 - 2024-12-13

### Added

- WMTS Services are now supported as custom user layers.
- Added data extraction API.
- Added support to extract coordinates from a borehole attachment.
- Show ChangedAt and ChangedBy information in borehole detail header.
- Add JSON and CSV export for single and multiple boreholes.
- The workgroup name is now displayed in the borehole location tab.
- Added new API endpoint to retrieve all boreholes.
- Add JSON import for boreholes.

### Changed

- Updated the style of bulk edit form.
- Hide the `help` button in the navigation bar in read-only mode.
- Hide the `original_name` field in the borehole detail view in read-only mode.
- Updated the style of the location tab.
- Changes on the location tab and the borehole tab are now saved by clicking the `Save` button, instead of immediately.
- The `alternate_name` is now displayed in the borehole detail header and the map markers.
- From depth and to depth are no longer displayed in groundwater level measurements.
- Updated the layout of the borehole general tab.
- Removed deduplication check when adding and detaching attachments.
- When copying a borehole, attachments won't be copied.
- Removed csv lithology import.
- Removed import id from csv import.

### Fixed

- _view-sync_ did not clean up unpublished boreholes.
- User permissions were not checked when detaching files from boreholes.
- The basemap selector buttons were not displayed correctly on hover.
- No scrollbar was displayed in the side drawer when many additional layers were added.
- There was no appropriate error message when the drawn box did not contain extractable coordinates.
- There was an internal error alert when navigating back from the borehole detail to the borehole table in anonymous mode.
- The responsive design of the coordinate segment in the detail view was broken.
- When clicking the select all checkbox in the borehole table, only the boreholes on the current page were selected.
- Some filter chips were missing translations or where not displayed correctly.
- Filtering striae for `not specified` returned wrong results.
- Filtering by `borehole status` did not work.
- When saving with ctrl+s in the borehole sections, the form content was reset.
- When copying a borehole, the nested collections of observations were not copied.
- There was a bug when changing the order, transparency or visibility of custom WMS user layers.
- The borehole status was not translated everywhere in the workflow panel.

## v2.1.870 - 2024-09-27

### Added

- Tooltips to main side navigation.
- Location hash for tabs in borehole detail view.
- Language dropdown in the header.
- Added health check endpoint for the .NET API.
- Added possibility to run the boreholes web application in read-only mode.
- New _view-sync_ Docker image for syncing free/published boreholes from a source to a target database.

### Changed

- Renamed technical attributes `kind_id_cli` to `borehole_type_id`, `top_bedrock` to `top_bedrock_fresh` and `qt_top_bedrock` to `top_bedrock_weathered`.
- Moved groundwater radio buttons in borehole form to the bottom.
- Made `startTime` and `reliability` optional for hydrogeology.
- Removed title from prompt dialog.
- Use standard prompt dialog for deleting boreholes.
- Updated standard alert.
- Updated styling of attachment upload button.
- It is now possible to restart a workflow from every publication status.
- Renamed codelist entries for casing type and casing material.
- Upgraded to PostgreSQL 15 and PostGIS 3.4.
- Removed unused `IsViewer` flag from user.
- Removed unused `UserEvent` from user.
- Migrated `User` API endpoints to .NET API.
- Disclaimer is now displayed at every login.
- Changed boreholes table design.
- Migrated `Workgroup` API endpoints to .NET API.
- Use `filled` style for form components.
- The borehole table now displays the attribute `alternate_name` instead of `origianal_name` in the `Name` column.
- Removed `supplier_wgp` column from `workgroup` table.
- Fixed typo in `consistency` codelist.
- Updated the style of various buttons.
- Map zoom level and center are now preserved when returning to the main map.
- Deactivated the possibility to select page size in borehole table pagination.

### Fixed

- Attribute `top_bedrock_weathered` could not be imported.
- Badge with number of active filters on sidebar did not include polygon filter.
- Fixed label for water ingress menu item.
- Location precision filter caused an internal error.
- Base maps were loaded beyond their maximum zoom level.
- `layer_depth_to` was displayed in filter even though it was not selected in the filter settings.
- Users can now only import or add new boreholes to workgroups where they have an editor role.
- Label for description quality was wrong in lithology filter and settings.
- Boreholes could not be deleted in the detail view if the publication status was not `Change in progess`.
- Boreholes table loaded all boreholes instead of none when a filter combination with polygon was used that did not return any boreholes.
- Boreholes table reset scroll position when hovering over a row.
- When returning to the boreholes table from another page, the last scroll position was lost.
- Status filter labels were not displayed correctly.
- Order of groundwater level measurement attributes was incorrect.
- The `Name` attribute in the borehole form was not correctly updated when first navigating to the page.
- Fixed german translation for `clay pellets` and french translation for `openBorehole`.

## v2.1.772 - 2024-06-27

### Added

- Added borehole geometry panel.
- Added secondary header to borehole detail view.
- Added new codelist entries for `casing_type` and `backfill_material`.

### Changed

- Added `outcrop` to codelist `borehole_type`.
- Made boreholes table on the map page collapsible.
- Changed sidebar layout and design.
- Moved form to add a borehole from modal to sidepanel.
- Removed fields `Inclination` `InclinationDirection` and `QtInclinationDirectionId` from borehole.
- Removed filter by map functionality.
- Moved icon to handle custom layers to sidebar.
- Show more entries on the boreholes table when screensize is smaller than 1200px.
- Calculate TVD values in General panel using the geometry of the borehole.
- Moved logout to header and improved header style.
- Removed entries `drilling_date`,`drilling_diameter`,`drilling_method_id`,`spud_date` and `cuttings_id` from the borehole import.
- Removed entries `inclination`,`inclination_direction` and `qt_inclination_direction_id` from the borehole import.
- Removed settings for `codelist translations` and `identifiers` from admin settings.
- Removed entries `total_depth_tvd`, and `qt_total_depth_tvd_id` from the borehole import.
- Renewed lithology codelists in schema `custom.lithology_top_bedrock`.
- Moved publication status in detail view to separate tab.
- Published boreholes cannot be edited anymore.

### Fixed

- Fixed precisions where not correctly displayed for imported coordinates.
- When editing lithology layers, the view would always scroll to the bottom of the layer stack when finished.
- Added missing foreign key constraints on `borehole_files` composite primary keys.

## v2.0.687 - 2024-04-19

### Added

- Added borehole sections panel.
- Added new basemap selector in maps.

### Changed

- Disabled viewer mode, moved map settings from viewer settings to editor settings.
- Renamed codelist `custom.qt_top_bedrock` to `depth_precision`.
- Placed `casing_elements` inputs on two lines for better readability.
- Sorted common.json files alphabetically and removed unused entries.
- Removed `public` field in publication workflow.
- Removed developer debug functionality.
- Removed unneeded scroller component.
- Remove fields from borehole that are now part of sections.
- Renamed `spud_date` to `drilling_start_date`.
- Adapted map icons to match common style of swissgeol applications.
- New casing element's top depths is set to the previous casing element's bottom depth by default.
- Set minimal resolution to 0.1 for open layer maps.
- Renamed table `borehole_codelist ` to `borehole_identifiers_codelist`.
- Changed order of menu items in borehole detail view.
- Split generic join table `hydrotest_codelists` into 3 separate join tables for each many to many relationship between hydrotest and codelist.

### Fixed

- Fixed direct navigation to nested urls.
- Fixed hash routing for completion tabs.
- When copying a borehole `completions`, `hydrogeological observations` and `borehole sections` were not copied.
- Updated favicon for help.
- Fixed zoom level when loading detail map.
- Fixed authorization exception for users who have not yet been assigned to a role or workgroup.

## v2.0.644 - 2024-03-22

### Added

- Reusable form components.
- Quality attribute for stratigraphy.
- Support Amazon Cognito logout flow.
- IsOpenBorehole option for instrumentation and backfill.
- Support adding multiple field measurement results in `hydrogeology`.
- Show prompt for unsaved changes when switching data card or completion tabs.
- Add entry `resin` to codelist `backfill_material` and entries `U-probe` and `double U-probe` to codelist `casing_type`.
- Show prompt before deleting data card.

### Changed

- Updated layer management to use the .NET API.
- Update stratigraphy management to use the .NET API.
- Hide outer ring for disabled radio buttons.
- Handle Authentication with a OpenID Connect.
- Improved input behavior for various input fields. E.g. stratigraphy name.
- Increased editing lock timeout to 60 minutes.
- Administrators are always allowed to edit all boreholes.
- Removed the functionality to add new users since they are now managed by the IAM.
- Removed the functionality to edit user details (first name, surname and password) since they are now managed by the IAM.
- Removed middle name from user details because it was not used until now.
- Disable inputs of the editor view's _borehole_ tab, when editing mode is not active or borehole status does not allow editing.
- Simplified and restructured the completion section (database, API, UI).
- Link hydrogeology observations to new completion casing.
- Use always _m MD_ as unit for borehole depth.
- Use reusable form components for hydrogeology.
- Replaced label for layer description quality.
- Reduced number of seeded boreholes for development from 10'000 to 3'000.
- Use reusable card components for hydrogeology.
- Renamed various codelists to have more evocative names (e.g. `location_precision` instead of `qt_location`, `plasticity` instead of `mlpr101`, …)
- Remove stratigraphy kind.
- Split generic join table `layer_codelists` into 6 separate join tables for each many to many relationship between layer and codelist.
- Replaced create-react-app (react-scripts) with vite for frontend tooling.
- Included typescript configuration.
- Prevent typing dates in profile and filter, only allow selecting date in datepicker.
- Split table `casing` into tables `casing` and `casing_element`.
- Store precision of coordinates, to be able to display zeros after the decimal points in coordinate inputs.
- Link casing to backfill.
- Removed square brackets from _m MD_ in `chronostratigraphy` and `lithostratigraphy`.
- Implemented a validation to check the user's role and the lock status of the borehole before performing any data manipulations on child tables in the .NET API.
- Include completion in casing name for hydrogeological observations.
- Removed property _isLast_ from `ChronostratigraphyLayer`, `LithostratigraphyLayer`, `LithologicalDescription` and `FaciesDescription`.
- Removed feedback functionality.
- Included new `swissgeol boreholes` logo and icon.
- Removed `completed` checkbox from hydrogeology observations and added option `open hole` to completion name.
- Removed the configurable welcome message on the login overlay.
- Login is performed automatically on page visit.
- Use a non-root user to run the boreholes web application.

### Fixed

- Ensure hydrogeology components are loaded properly when refreshed.
- Fix translations for _new_ buttons.
- Fixed delete behavior for non-nullable foreign keys of type _Codelist_.
- Fixed height reference system display.
- Fixed hydrotest kind display.

## v2.0.506 - 2023-12-21

### Added

- Table and controller for completion.

### Changed

- Use numeric input instead of dropdown for top bedrock quality fields.
- Proxy requests to legacy api through .NET API with authentication.
- Disable inputs of the editor view's borehole _location_ tab, when editing mode is not active or borehole status does not allow editing.
- Remove obsolete database view `completness`.
- Use a non-root user in the .NET Docker image.

## v2.0.476 - 2023-12-08

### Changed

- Upgraded to OpenLayers 8.
- Upgraded to .NET 8.
- Upgraded to Node 20.

## v2.0.452 - 2023-07-05

### Added

- Added new field `national_interest` to borehole table.
- Added support for _ID boreholes.swissgeol.ch_ as a filter ID type.
- Added filter for chronostratigraphy.
- Added filter for lithostratigraphy.

### Changed

- Removed `lithostratigraphy_id` from import.
- Renamed stratigraphy filter to lithology filter.

### Fixed

- Fixed bug where value for debris lithology was not displayed.

## v2.0.441 - 2023-06-12

### Added

- Added new symbols for borehole types 'virtual borehole' and 'other'.
- Panel to edit lithostratigraphy layers.

### Changed

- Updated the lithostratigraphy codelist table.
- Upgraded to OpenLayers 7.
- Removed lithostratigraphy and chronostratigraphy from lithology.
- Removed obsolete columns `facies_description_lay` and `lithological_description_lay` from layer table.

### Fixed

- Fixed bug where empty strings were displayed instead of _unknown_ in the _casing_ dropdown when adding water ingresses, hydrotests, groundwater measurements or field measurements.
- Fixed label and setting for lithology top bedrock attribute of layer.
- Fixed bug where normal user had no permission to create hydrotests.

## v2.0.422 - 2023-06-02

### Added

- Lithology csv import.
- Table and controller for lithostratigraphy.

### Changed

- The hydrotest input mask now supports selecting multiple hydrotest kinds.
- Enable all file types as borehole attachments.
- Improved appearance of import UI.
- Increased maximum of displayed validation errors during borehole import to 1000.

### Fixed

- Fixed italian translation for _completionFinished_.
- Workgroup dropdown in the import menu was not scrollable.
- Ensure duplicated boreholes are detected during borehole import.
- When the application was set to German, an issue occurred where the term 'keine_Angabe' was unecessarily displayed in the lithology subtitle.
- Ensure copied stratigraphy is not primary.
- Ensure borehole attachments can be managed by any user role.
- Enable upload of borehole attachments with a size of up to 200 Mb.
- Show message when borehole import takes longer than 30 seconds.

## v2.0.400 - 2023-05-24

### Added

- Added link to online help in import dialog.
- Upload borehole attachments using borehole import feature.
- Added boreholes.swissgeol.ch id to details view.
- Added `import_id` as required field for borehole import.
- Added functionality to add, edit and delete hydrotests, which belong to the hydrogeology observations of a borehole.
- Added functionality to add, edit and delete field measurement, which belong to the hydrogeology observations of a borehole.
- Added csv export for current codelist table.
- Added the fields _qt_location_, _qt_elevation_, _reference_elevation_qt_ and _reference_elevation_type_ to bulk editing.

### Changed

- Changed style of the inputs when editing _lithological_descriptions_ and _facies_descriptions_ to _outlined_.
- Borehole duplicates are only identified within the same workgroup when importing boreholes.
- Filter contents are shown directly below the filter group without reordering.
- Harmonized labels for _from_depth_ and _to_depth_ fields across the application.
- The duplicate checks for a borehole's _original_name_ and _alternate_name_ have been removed. Duplicate names are now allowed.
- Improve chronostratigraphy edit, change the stratigraphy selection to a simple dropdown.
- Hide overlapping chronostratigraphy layer depth labels and add depth scale.

### Fixed

- Fixed and extended chronostratigraphy geolcodes.
- Fixed login with passwords containing `:` and other non ASCII characters.
- Fixed label of _completion_finished_ in hydrogeological observations, which used to be always in german.
- The chronostratigraphy edit panel shows progress indicator when no stratigraphies or lithologies exist.
- Copy and delete buttons not visible when editing lithology.
- Show stratigraphy with empty name as unknown.
- Chronostratigraphy fields were not translated.
- Lithology layers not sorted by depth in viewer.

## v2.0.298 - 2023-04-18

### Added

- Defined borehole csv import fields `original_name`, `location_x` and `location_y` as required.
- Added validation for required borehole csv import fields.
- Added online help.
- Added validation for duplicated boreholes during the cvs import.
- Added functionality to add, edit and delete wateringresses, which belong to the hydrogeology observations of a borehole.
- Use .NET API for managing borehole files.

### Changed

- Changed all db attributes of type _date_ to _timestamp with timezone_.
- Support `ID Kernlager` (_drill core storage facility ID_) in csv import.
- Removed _clone_ and _delete_ icons in chronostratigraphy header.
- Made csv import validation error modal content scrollable.
- Replaced csv import validation messages with more specific messages.
- Updated csv borehole upload endpoint to additionally handle list of PDF's.

### Fixed

- Fixed scrolling behaviour for _lithological_descriptions_ and _facies_descriptions_.
- Fixed missing datapoints on map zoom after filtering by map extent.
- Fixed table was reset to page 1 when returning to borehole list from detail with appearance _Map & List|Details_ and _List|Details & Map_.
- Fixed search filters were not applied to points on map.
- Fixed scrolling behaviour for _lithology_layers_.
- Fixed error when repeatedly sorting by "original name" that caused the application to crash under special circumstances.

## v2.0.273 - 2023-04-04

### Added

- Added functionality to edit facies description seperately from lithology.
- Added functionality to scroll to newly created lithology layer.
- Added separate panel to edit chronostratigraphy layers.
- Added minimal csv-import for boreholes.
- Added option to edit workgroup in bulk edit dialog.

### Changed

- Memorized table and map state when navigating through the application.
- When leaving settings page, correctly navigate back to the previously selected mode (viewer or editor).
- Display loader icon when fetching data for stratigraphy or users.
- Removed _lithological description_ and _facies description_ from lithology layer in viewer mode, editor mode and in settings.
- Removed _set manually_ from resolving options when deleting a lithology layer.
- Display lithology layer details in lithology column in editor mode.
- Immediately delete layers in _casing_ and _backfill_ columns, without showing a delete dialog.
- Removed export functionality.
- Removed blue info button of displayed maps in map settings.
- Updated Chronostratigraphy Codelist entries.
- Made Lithology a sub-menu of Stratigraphy.
- Display chronostratigraphy colors in chronostratigraphy editor.
- Migrated chronostratigraphy _Middle Jurassic undifferenciated_ to _Middle Jurassic_.
- Removed height reference system column from editor view list.
- Removed import settings from administrator settings.
- Enabled editor mode settings for all user types.
- Replaced csv import coordinates related columns by `location_x` and `location_y`.
- Auto detect the provided coordinate reference system in the csv import and calculate the coordinates for the not provided reference system.

### Fixed

- Creating, editing or deleting lithological descriptions was not allowed for non-admin users.
- When creating and locating a new borehole, each click added a new point on the map.
- Added missing translations when editing a locked borehole, giving feedback or deleting an ID type.
- Fixed internal error when adding a backfill with _no casing_.
- Fixed internal error in viewer/editor settings for _Stratigraphy fields_ when clicking _Select all_.
- Fixed error when downloading a borehole profile.
- Fixed bug where a facies description with a height of 0 could be created.
- Fixed broken layout of _lithological description_ and _facies description_ columns when a gap of more than one layer was created in the _lithology_ column.
- Fixed bug where lithological descriptions where not copied when copying boreholes or stratigraphies.
- Fixed bug where coordinates were not updated when pasted in the coordinate input.
- Empty text or numeric fields are always displayed as `-` in the detail sections of the viewer mode.
- Enabled translation of transparency label in map settings.
- Removed unnecessary Italian text in publish confirmation modal.
- Added status submit message in all languages.
- Allowed uploading the same file for different boreholes.
- Display an error message if a file is already uploaded for a particular borehole.
- Resolved error when selecting `Instrumentation` with no EDIT role and no stratigraphy defined for borehole.
- Fixed and improve flaky Instrumentation tests.
- Improved rendering of Instrumentations.
- Removed unnecessary borehole property `date` from csv import as well as in the database.

## v2.0.186 - 2023-02-13

### Added

- Added new location migration endpoint in order to be able to manually update location information (country_bho, canton_bho and municipality_bho).

## v2.0.183 - 2023-02-10

### Added

- Added functionality to edit lithological description seperately from lithology.

### Changed

- Replaced all generic browser alerts with styled alerts.

### Fixed

- Fixed bug where selecting the location filter as viewer or editor caused the application to crash.
- When copying a borehole, layer properties with multiple values (i.e. USCS3) were ignored and not copied.
- Copying a borehole was not allowed as non-admin user.

## v2.0.169 - 2023-02-07

### Added

- Added new data migration endpoint to recalculate the coordinates depending on whether the original spatial reference system is LV03 or LV95 based.

### Changed

- Get Municipality, Canton, Country from geo.admin.ch service. Removed obsolete Canton / Municipality tables.
- Removed unnecessary units from various labels.
- Reused styles in map component.
- Removed unnecessary JSON attributes when loading borehole geometries.
- Placed `original_lithology` field after `lithology` in viewer/editor settings for _Stratigraphy fields_.
- Empty text or numeric fields are always displayed as `-` in the detail sections of the viewer mode.
- Added workgroup filter to viewer.
- Removed unused table `bdms.geodin_files` from database.

### Fixed

- Fixed partly unresponsive UI by avoiding unnecessary data loading on startup.
- Fixed bug where setting or changing the borehole location on the map in editor mode caused the application to freeze.
- Disabled possibility to draw and move point in detail map when borehole is not locked.
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

- Migrated existing LV95 coordinates into LV03 coordinates using 'shift' method. Preserve original LV95 coordinates for some selected boreholes (e.g. Bülach-1-1, ...).
- Points on the overview map are now displayed as clusters depending on zoom level.
- Ordered codelists in translation UI by `order` column instead of by `geolcode`.
- Coordinates, elevations diameters and depths in inputs and texts are now displayed with thousand separators.
- Removed `mentions` functionality in workflow comments.
- Removed unused columns from database: `borehole.import_id`, `borehole.tecto_id_cli`, `stratigraphy.import_id`, `layer.import_id`, `layer.tectonic_unit_id_cli`, `layer.symbol_id_cli`, `layer.soil_state_id_cli`, `layer.kirost_id_cli`.
- Removed unused table `bdms.statigraphy_codelist` from database.
- Removed `layer.unconrocks_id_cli` and `layer.lithok_id_cli` from database.
- Changed cardinality of `uscs3` field on `bdms.layer` to m:n.

### Fixed

- Fixed sending feedback e-mail.
- Display `lithology_top_bedrock`, `lithostratigraphy_top_bedrock`and `chronostratigraphy_top_bedrock` as domain trees in bulk edit.
- Added space above the instrument list.
- Fixed bug where casing IDs could be selected, even though the name of completion was `No casing`.
- Fixed bug where filtering by `identifier` led to bugs in bulk edit.
- Fixed bug where points with spatial reference system LV03 were not correctly displayed on detail map.
- Fixed bug where groundwater radio buttons were not displayed.
- Correctly display number of boreholes, independently of map appearance.
- Disabled possibility to draw and move point in detail map when borehole is not locked.
- Fixed layout of comments in publication workflow.
- Immediately update tickboxes in admin user role UI.
- Display dropdown with values from schema `qt_top_bedrock` for attribute `qt_depth` to streamline all qt drowpdowns
- Display _Filter by map_ in Editor when appearance is _Large Map_.
- Fixed bug where clicks on clusters or points have been ignored on viewer map.
- Fixed bug where updating of `qt_depth` led to error.

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

- Updated _Dokumentation_ page in settings.
- Standardized messages for empty profiles, empty casing and missing stratigraphy.
- Updated the app title in the top left to show the new _boreholes.swissgeol.ch_ name including the correct environment.
- Removed _Enter as viewer_ login option.

### Fixed

- Added missing option _Keine Angabe_ for layer_striae.
- Fixed blank screen in viewer mode.
- Added missing package to fix Docker health check in production.
- Fixed broken total_depth attribute reference in table.
- Improved stratigraphy viewer.
- Fixed terms of service.
- Always show up to date login screen text.
- Fixed filter dropdowns not updating.
- Fixed appearance setting label.
- Fixed error highlight of identifier fields.
- Fixed bulk edit.
- Fixed sorting in borehole tables in viewer and editor mode.
- Fixed text displayed in backfill tab, when no backfill is available.
- Fixed text displayed in instrument tab, when no instrument is available.
- Fixed dialog message when enabling user.
- Fixed creation of user with admin role.
- Added missing translations when publishing new welcome messages.
- Fixed copying of boreholes.
- Added missing checks for contributions when deleting users.
- Removed obsolete `borehole.contact_id` column.
- Always displays `Show all` button when editing instruments.
