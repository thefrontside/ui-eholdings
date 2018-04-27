import {
  action,
  clickable,
  collection,
  computed,
  fillable,
  isPresent,
  is,
  property,
  interactor,
  value,
  text
} from '@bigtest/interactor';
import { isRootPresent, hasClassBeginningWith } from './helpers';

@interactor class ProviderSearchPage {
  exists = isRootPresent();
  fillSearch = fillable('[data-test-search-field] input[name="search"]');
  submitSearch = clickable('[data-test-search-submit]');
  hasSearchField = isPresent('[data-test-search-field] input[name="search"]');
  hasSearchFilters = isPresent('[data-test-eholdings-search-filters="providers"]');
  searchFieldValue = value('[data-test-search-field] input[name="search"]');
  totalResults = text('[data-test-eholdings-search-results-header] p');
  providerPreviewPaneIsPresent = isPresent('[data-test-preview-pane="providers"]');
  packagePreviewPaneIsPresent = isPresent('[data-test-preview-pane="packages"]');
  hasBackButton = isPresent('[data-test-eholdings-details-view-back-button] button');
  clickSearchVignette = clickable('[data-test-search-vignette]');
  clickBackButton = clickable('[data-test-eholdings-details-view-back-button] button');
  hasErrors = isPresent('[data-test-query-list-error="providers"]');
  errorMessage = text('[data-test-query-list-error="providers"]');
  noResultsMessage = text('[data-test-query-list-not-found="providers"]');
  selectedSearchType = collection('[data-test-search-form-type-switcher] a[class^="is-active--"]');
  sortBy = value('[data-test-eholdings-search-filters="providers"] input[name="sort"]:checked');
  isSearchButtonDisabled = property('[data-test-search-submit]', 'disabled');
  isSearchVignetteHidden = hasClassBeginningWith('[data-test-search-vignette]', 'is-hidden---');
  clickCloseButton = clickable('[data-test-eholdings-details-view-close-button] a');
  hasPreSearchPane = isPresent('[data-test-eholdings-pre-search-pane]');

  hasLoaded = computed(function () {
    return this.providerList().length > 0;
  })

  changeSearchType = action(function (searchType) {
    return this.click(`[data-test-search-type-button="${searchType}"]`);
  })

  clickFilter = action(function (name, val) {
    return this.click(`[data-test-eholdings-search-filters="providers"] input[name="${name}"][value="${val}"]`);
  })

  clearSearch = action(function () {
    return this.fillSearch('');
  })

  scrollToOffset = action(function (readOffset) {
    return this.find('[data-test-query-list="providers"] li')
      .do((firstItem) => {
        let scrollOffset = firstItem.offsetHeight * readOffset;
        return this.scroll('[data-test-query-list="providers"]', { top: scrollOffset });
      })
      .run();
  })

  search(query) {
    return this
      .fillSearch(query)
      .submitSearch();
  }

  providerList = collection('[data-test-eholdings-provider-list-item]', {
    name: text('[data-test-eholdings-provider-list-item-name]'),
    numPackages: text('[data-test-eholdings-provider-list-item-num-packages-total]'),
    providerName: text('[data-test-eholdings-package-list-item-provider-name]'),
    numPackagesSelected: text('[data-test-eholdings-provider-list-item-num-packages-selected]'),
    isActive: is(this.$root, '[class*="is-selected"]'),
    clickThrough: clickable()
  });

  providerPackageList = collection('[data-test-query-list="provider-packages"] li', {
    clickToPackage: clickable('a')
  });
}

export default new ProviderSearchPage('[data-test-eholdings]');
