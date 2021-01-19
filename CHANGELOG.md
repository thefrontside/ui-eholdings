# Change history for ui-eholdings

## [5.1.0] (IN PROGRESS)

* Increase Settings Custom Labels display label max length to 200. (UIEH-985)
* Increase Custom Labels value max length to 500. (UIEH-985)
* Fix routing issues when visiting Note Edit page. (UIEH-991)
* Add permission for button New Settings (eHoldings): Can create, edit, and view knowledge base credentials. (UIEH-992)
* Title Record: Add a Selection Status filter to Search within Packages modal. (UIEH-978)
* Add label for contributor type narrator. (UIEH-977)
* Remove request to '/status' in Settings > eHoldings. (UIEH-1012)
* Fixed text wrapping for Custom Labels. (UIEH-985)
* Make Coverage Accordion in Resource Page be always expanded. (UIEH-1008)
* Update focus behavior on Result list pane. (UIEH-1001)
* Add assign/unassign user from KB permissions. (UIEH-1018) 

## [5.0.0] (https://github.com/folio-org/ui-eholdings/tree/v5.0.0) (2020-10-15)

* Fix permission error in devtools console. (UIEH-915)
* Change filter by Tags request format. (UIEH-922)
* Add package selection confirmation modal. (UIEH-907)
* Add possibility to delete KB credentials. (UIEH-909)
* Refactor from `bigtest/mirage` to `miragejs`.
* Remove headlines from Root Proxy and KB settings pages. (UIEH-911)
* Increment `@folio/stripes` to `v5`, `react-router` to `v5.2`.
* Improve error messaging for unconfigured KB credentials and exceeded API limit. (UIEH-816)
* Add delete KB credentials permission, renamed existing KB credentials permission. (UIEH-910)
* Fixed no Provider/Package/Title results message. (UIEH-905)
* Change holdings status button label. (UIEH-935)
* Changed asterisk to red and added accessibility label on Create/Edit Custom Package > Name. (UIEH-919)
* Changed asterisk to red and added accessibility label on Create/Edit Custom Title > Name and Package. (UIEH-920)
* Add custom labels settings permissions. (UIEH-865)
* Add possibility to filter packages on the title page. (UIEH-928)
* New/Edit Custom title: update Name required error message. (UIEH-958)
* Add Tags label assigned to Title and Packages. (UIEH-933, UIEH-934)
* Fix Package/Title view page wobbles when scrolling. (UIEH-960)
* Add Tags label assigned to Title and Packages. (UIEH-933, UIEH-934)
* Pass aria-labelledby to MultiSelection component. (UIEH-939)
* Bumped `erm` interface version to `3.0`.
* Fixed id and aria-labelledby attributes in Pane header. (UIEH-924)
* Fix issues in Title Record Filter packages Multi-select component. (UIEH-959)
* Fixed Providers, Packages, Titles filter - accordions ARIA attributes. (UIEH-923)
* Bumped `react-intl` version to `5.8.0`.
* Fixed View Package > Find Title - Accordions missing some ARIA attributes. (UIEH-925)
* Fix bug with `<Datepicker>` in Resource Edit Page. (UIEH-961)
* Fix issue in agreements accordion with displaying start date. (UIEH-971)
* Ability to unlink an agreement from package/resource. (UIEH-956)
* Add Unassign Agreement modal window. (UIEH-972)

## [4.0.1] (https://github.com/folio-org/ui-eholdings/tree/v4.0.0) (2020-07-08)

* Fix KB credentials list shown not in alphabetical order. (UIEH-912)
* Fix incorrect x-okapi-token sent after re-logging in eHoldings. (UIEH-918)
* Fix filter by Access Types request incorrectly formatted. (UIEH-917)
* Fix routing issues. (UIEH-916)
* Added possibility to change KB Name. (UIEH-898)

## [4.0.0] (https://github.com/folio-org/ui-eholdings/tree/v4.0.0) (2020-06-11)

* Pin `moment` at `~2.24.0`. Refs STRIPES-678.
* Add filtering of titles by Access Types. (UIEH-834)
* Add validation for duplicated Access Types. (UIEH-878)
* Add permission names to translations. (UIEH-890)
* Update react-intl to v4
* Update `stripes` to `v4`
* Hide delete button when access type is used in records. (UIEH-868)
* Provider Record list of Packages UI updates. (UIEH-861)
* Package record list UI updates. (UIEH-862)
* Title Record list of Packages UI updates. (UIEH-863)
* Ability to create multiple Knowledge base configurations. (UIEH-856)
* Add a Name field to Settings Knowledge Base page. (UIEH-855)
* Apply the default container width to create, edit, view pages. (UIEH-896)
* Fix accessibility and semantics issues on the settings page. (UIEH-894, UIEH-895)
* Fix DetailsView scrolling issues. (UIEH-897)
* Access status types settings permissions. (UIEH-864)
* Settings > Access status types > Delete confirmation modal change. (UIEH-872)
* Handle error when trying to delete access status type that doesn't exist. (UIEH-860)

## [3.0.2] (https://github.com/folio-org/ui-eholdings/tree/v3.0.2) (2020-04-08)

* Retain search within packages search and filter selections on the Provider record (UIEH-847)
* Retain search within titles search and filter selections on the Package record (UIEH-853)
* Display Access Status Types on Create/Edit/View records. (UIEH-831)
* Fix Tags filter is selected by default in Search Modal. (UIEH-882)
* Fix filter by Access Types will not return records. (UIEH-883)

## [3.0.1] (https://github.com/folio-org/ui-eholdings/tree/v3.0.1) (2020-04-02)

* Provider Results UI updates (UIEH-846)
* Fix Unsaved Changes Modal not appearing after changing package selected status. (UIEH-854)
* Fix need to click 'X' twice to return after changing selected status and visiting Edit page. (UIEH-854)
* Fix Proxy selection is set to None when package has Inherited proxy. (UIEH-854)
* Fix inconsistent proxy selection for Resources. (UIEH-875)
* Fix Unsaved Changes Modal not appearing after changing Resource selected status. (UIEH-876)
* Filter Packages by Access Status Type. (UIEH-835)

## [3.0.0] (https://github.com/folio-org/ui-eholdings/tree/v3.0.0) (2020-03-13)

* Add display custom labels on view resource page (UIEH-805)
* Add display custom labels on edit resource page (UIEH-185)
* Create Settings Custom Labels Page (UIEH-184)
* Update eslint to v6.2.1 (UIEH-818)
* Fix view of Action button on package view page header (UIEH-829)
* Remove Actions dropdown from view provider record page. (UIEH-821)
* Remove Actions dropdown from view custom title record page. (UIEH-824)
* Remove Edit/Pencil icon from view package record page (UIEH-822)
* Create Settings Access status types page (UIEH-828)
* Migrate to `stripes` `v3.0.0` and move `react-intl` and `react-router` to peerDependencies.
* Show a Delete warning and confirmation for Access status types (UIEH-842)
* Packages: Clicking "X" starts a nasty loop (UIEH-845)
* Package Results UI updates (UIEH-844)

## [2.1.0](https://github.com/folio-org/ui-eholdings/tree/v2.1.0) (2019-12-04)

* Fixed tests for the notes & for the agreements (STSMACOM-270)
* Fix pane header ids for details view and search paneset. Provide aria label for tags multiselect. (UIEH-780)
* Added tags.all permission to package.json (UIEH-807)
* Add condition to do agreements GET only when it is allowed (UIEH-800)
* Lock react-final-form 6.3.0 version (UIEH-803)
* Fixed error handling for agriments related api calls (UIEH-797)
* Retrieve up to 100k of requested tags instead of 10 (UIEH-796)
* Set focus on search box when accessing the eholdings (UIEH-790)
* Substitute custom eholdings panels for Titles new and Packages new routes with the one from stripes (UIEH-795)
* Refactor settings to use Panes from stripes-components (UIEH-794)
* Support erm interface v2.0

## [2.0.2](https://github.com/folio-org/ui-eholdings/tree/v2.0.2) (2019-09-25)

* Fix BigTest imports (UIEH-793)
* Add isFullPackage flag (UIEH-787)

## [2.0.1](https://github.com/folio-org/ui-eholdings/tree/v2.0.1) (2019-09-16)

* Regenerate yarn.lock for pointing all packages to npm-folio registry
* Fix tests for Notes

## [2.0.0](https://github.com/folio-org/ui-eholdings/tree/v2.0.0) (2019-09-11)

* Update tags endpoints(UIEH-745, UIEH-747, UIEH-748)
* Fix audiobook misspelling causing inability to create a title(UIEH-763)
* Update translation strings
* Updated react-final-form and related dependencies(UIEH-770)
* Remove tags from resource/package/provider PUT payload(UIEH-769)
* Fix accessibility issues(UIEH-750)
* Put repeatable fields on a single line(UIEH-773)
* Fix height of the pane container to fit all content(UIEH-760)
* Updated serializes to exclude not used attrs from PUT package and provider payloads(UIEH-777, UIEH-778)
* Fix mirage handler for GET titles with tags filter(UIEH-758)
* Add error handling for agreements endpoints(UIEH-766)
* Fixed add to custom package modal(UIEH-761, UIEH-762)
* Disallow to create more than 1 date coverage range on Package create page(UIEH-782)

## [1.9.0](https://github.com/folio-org/ui-eholdings/tree/v1.9.0) (2019-08-02)

* Restore eHoldings to the settings menu (UIEH-757, UITEN-35)

## [1.8.0](https://github.com/folio-org/ui-eholdings/tree/v1.8.0) (2019-07-24)

* Make search filters collapsed by default(UIEH-737)
* Update URLs leading to Agreements app(ERM-253)
* Add filter by tags support(UIEH-710, UIEH-711, UIEH-634)
* Remove convertion to lower case of contributor type(UIEH-687)
* Indicate descending order for custom coverage date ranges(UIEH-734)
* Pass AppIcon instance to Pane props(UIEH-728)
* Add numeric formatting for "Titles Selected" and "Total Number of Titles" in package-show page(UIEH-735)
* Use granular permissions for settings items (UITEN-35)

## [1.7.0](https://github.com/folio-org/ui-eholdings/tree/v1.7.0) (2019-06-11)

* Fixed tests related to the datepicker (UIEH-725)
* Fix toggling of the notes accordions (UIEH-718)
* Add Notes accordion to Provider and Resource view pages (UIEH-690)
* Provider/Package/Resource: View a note page (UIEH-698)
* Provider/Package/Resource: Create a note page (UIEH-693)
* Title: Remove Tags functionality (UIEH-685)
* Notes accordion for package show page (UIEH-691)
* Create note page (UIEH-693)

## [1.6.0](https://github.com/folio-org/ui-eholdings/tree/v1.6.0) (2019-05-10)

* Add New button to agreements accordion on Package and Resource show pages for redirecting the user to creation page. (UIEH-629, UIEH-631)
* Add badge with agreements quantity to agreements section on Package and Resource show pages (UIEH-680)
* Fixed translation for capitalized strings (UIEH-651)
* Fix agreements attach functionality (UIEH-684)

## [1.5.0](https://github.com/folio-org/ui-eholdings/tree/v1.5.0) (2019-03-25)

* Apply permissions. Define UI permissions (UIEH-501)
* Assign tags to show provider record (UIEH-585)
* Assign tags to package record (UIEH-586)
* Assign tags to title+package (aka resource) records (UIEH-587)
* Paneheader Dropdown Update: Add and update Full View option (UIEH-603)
* App screen issue (UIEH-610)
* Resolve CoverageDateList warning (UIEH-614)
* BUG: Title Edit Error - Unrecognized contentType field (UIEH-621)
* Title Edit Error : fields temporarily revert to previous value after save (UIEH-627)
* Show Package Record: Allow a user to search agreements and attach to a package (UIEH-628)
* Show Title+Package Record: Allow a user to search agreements and attach to a title+package (UIEH-630)
* Update titles data using new BE endpoint (UIEH-636)
* Bug on closing unsaved form (UIEH-637)
* Tags: assign/unassign tags on provider when no package is selected (UIEH-641)
* Tags: assign/unassign tags on resources regardless of isSelected value (UIEH-642)
* eHoldings App - English words/ phrases showing up while in RTL (UIEH-650)
* Attribute Type is missing error on title edit (UIEH-656)
* Package Detail Record: Search within titles does not work (UIEH-663)
* Package/Resource: Removing Coverage Date will not allow you to save (UIEH-665)
* Change custom coverage tests in accordance with the new back-end response (UIEH-666)
* Fix bug on Resource page when it was unable to reset to Managed Coverage Date (UIEH-667)
* Custom Embargo: Removing Custom Embargo will not enable Save button (UIEH-668)
* Make eholdings UI permissions effective (UIEH-669)
* Tags: assign/unassign tags on packages regardless of isSelected value (UIEH-670)
