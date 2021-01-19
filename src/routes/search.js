import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactRouterPropTypes from 'react-router-prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import {
  isEqual,
  hasIn,
} from 'lodash';

import { TitleManager } from '@folio/stripes/core';

import {
  qs,
  transformQueryParams,
  getResultsNotFoundTranslationKey
} from '../components/utilities';

import { createResolver } from '../redux';
import Provider from '../redux/provider';
import Package from '../redux/package';
import Title from '../redux/title';
import Tag from '../redux/tag';
import { getAccessTypes as getAccessTypesAction } from '../redux/actions';
import { selectPropFromData } from '../redux/selectors';

import ProviderSearchList from '../components/provider-search-list';
import PackageSearchList from '../components/package-search-list';
import TitleSearchList from '../components/title-search-list';
import SearchPaneset from '../components/search-paneset';
import SearchForm from '../components/search-form';
import {
  searchTypes,
  accessTypesReduxStateShape,
} from '../constants';

import { filterCountFromQuery } from '../components/search-modal/search-modal';

class SearchRoute extends Component {
  static propTypes = {
    accessTypes: accessTypesReduxStateShape.isRequired,
    getAccessTypes: PropTypes.func.isRequired,
    getTags: PropTypes.func.isRequired,
    history: ReactRouterPropTypes.history.isRequired,
    location: ReactRouterPropTypes.location.isRequired,
    match: ReactRouterPropTypes.match.isRequired,
    resolver: PropTypes.object.isRequired,
    searchPackages: PropTypes.func.isRequired,
    searchProviders: PropTypes.func.isRequired,
    searchTitles: PropTypes.func.isRequired,
    tagsModel: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    // the current location's query params, minus the search type
    const { searchType = 'providers', ...params } = qs.parse(props.location.search);

    // cache queries so we can restore them with the search type buttons
    this.queries = {};
    this.path = {};

    props.getTags();
    props.getAccessTypes();

    if (searchType) {
      this.queries[searchType] = params;
      this.path[searchType] = props.location.pathname;
    }

    this.state = {
      // used in getDerivedStateFromProps
      // eslint-disable-next-line react/no-unused-state
      hideDetails: /^\/eholdings\/?$/.test(props.location.pathname),
      searchType,
      params,
      sort: params.sort,
      submittedSearchString: params.q,
      draftSearchString: params.q,
      submittedSearchFilters: params.filter || {},
      draftSearchFilters: params.filter,
      searchField: params.searchfield,
      hideFilters: false,
      searchByTagsEnabled: false,
      searchByAccessTypesEnabled: false,
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { location, history, match } = nextProps;
    const { searchType, ...params } = qs.parse(location.search);
    if (!searchType) {
      history.replace({
        pathname: '/eholdings',
        search: '?searchType=providers'
      });

      return null;
    }

    const hideDetails = /^\/eholdings\/?$/.test(location.pathname);
    const searchTypeChanged = searchType !== prevState.searchType;
    const urlContainsTagsFilter = hasIn(params, ['filter', 'tags']);
    const urlContainsAccessTypesFilter = hasIn(params, ['filter', 'access-type']);
    let shouldFocusItem = null;

    if (hideDetails && match.params.id !== (prevState.match && prevState.match.params.id)) {
      shouldFocusItem = prevState.match.params.id || null;
    }
    // update searchstring state only when it actually changes in the location instead of updating it each time on
    // input to text field. This eliminates re-rendering of the text field on each keyboard in and solves problem
    // stated in https://issues.folio.org/browse/UIEH-558
    if (!isEqual(location, prevState.location)) {
      return {
        location,
        match,
        searchType,
        params,
        hideDetails,
        shouldFocusItem,
        sort: params.sort,
        submittedSearchFilters: params.filter || {},
        draftSearchFilters: searchTypeChanged
          ? params.filter
          : prevState.draftSearchFilters,
        searchField: params.searchfield,
        submittedSearchString: params.q,
        draftSearchString: searchTypeChanged
          ? params.q
          : prevState.draftSearchString,
        searchByTagsEnabled: urlContainsTagsFilter,
        searchByAccessTypesEnabled: !urlContainsTagsFilter && urlContainsAccessTypesFilter,
      };
    }

    return null;
  }

  componentDidUpdate() {
    // cache the query so it can be restored via the search type
    if (this.state.searchType) {
      this.queries[this.state.searchType] = this.state.params;
      this.path[this.state.searchType] = this.state.location.pathname;
    }
  }

  $resultPaneTitle = React.createRef();

  toggleFilter = filterName => () => {
    const filterToBeToggled = filterName === 'access-type'
      ? 'searchByAccessTypesEnabled'
      : 'searchByTagsEnabled';

    const filterToBeDisabled = filterName === 'access-type'
      ? 'searchByTagsEnabled'
      : 'searchByAccessTypesEnabled';

    this.setState(currentState => {
      const searchByAccessTypesIsExpected = !currentState[filterToBeToggled] && hasIn(currentState.draftSearchFilters, filterName);

      return searchByAccessTypesIsExpected
        ? {
          [filterToBeToggled]: !currentState[filterToBeToggled],
          [filterToBeDisabled]: false,
          submittedSearchString: '',
          submittedSearchFilters: {
            [filterName]: currentState.draftSearchFilters[filterName],
          },

        }
        : {
          [filterToBeToggled]: !currentState[filterToBeToggled],
          [filterToBeDisabled]: false,
        };
    }, this.handleSearch);
  }

  handleSearchChange = draftSearchString => {
    this.setState({ draftSearchString });
  };

  handleFilterChange = (sort, searchFilters) => {
    this.setState(prevState => {
      return {
        sort,
        submittedSearchFilters: prevState.sort !== sort
          ? prevState.submittedSearchFilters
          : {
            ...searchFilters,
            tags: undefined,
            'access-type': undefined,
          },
        draftSearchFilters: searchFilters
      };
    }, this.handleSearch);
  };

  handleStandaloneFilterChange = filter => {
    this.setState(prevState => ({
      submittedSearchFilters: filter,
      draftSearchFilters: {
        ...prevState.submittedSearchFilters,
        ...filter
      },
      submittedSearchString: '',
    }), this.handleSearch);
  }

  handleSearchFieldChange = searchField => {
    this.setState({ searchField });
  }

  updateFilters = fn => this.setState(({ hideFilters }) => ({
    hideFilters: fn(hideFilters)
  }));

  /**
   * Uses the resolver to get a results collection for the current
   * search type and search params (including the page)
   * @returns {Collection} a collection instance
   */
  getResults() {
    const { resolver } = this.props;
    const { searchType, params } = this.state;
    const { offset = 0, ...queryParams } = params;
    const searchParams = transformQueryParams(searchType, queryParams);
    const page = Math.floor(offset / 25) + 1;

    return resolver.query(searchType, {
      filter: undefined,
      ...searchParams,
      page
    });
  }

  /**
   * Build's a url for a specific search type + query
   * @param {String} pathname - the base pathname
   * @param {Object|String} [query] - the query string or object (will be stringified)
   * @param {String} [searchType] - the search type to construct the url for
   * @returns {String} the final url for a search type, including a query
   */
  buildSearchUrl(pathname, query = '', searchType = this.state.searchType) {
    const queryString = typeof query === 'string' ? query : qs.stringify(query);
    let url = `${pathname}?searchType=${searchType}`;

    if (queryString) {
      url += `&${queryString}`;
    }
    return url;
  }

  /**
   * Generates a hash of urls for the various search types and their
   * queries from the cache of queries kept by this component
   * @returns {Object} key value pair of search type urls
   */
  getSearchTypeUrls() {
    const searchTypesArr = [
      searchTypes.PROVIDERS,
      searchTypes.PACKAGES,
      searchTypes.TITLES
    ];
    return searchTypesArr.reduce((locations, type) => {
      const lastQuery = this.queries[type] || {};
      const lastPath = this.path[type] || '/eholdings';
      const url = this.buildSearchUrl(lastPath, lastQuery, type);
      return { ...locations, [type]: url };
    }, {});
  }

  /**
   * Update the url to match new search params
   * @param {Object} params - query param object
   */
  updateURLParams = (params) => {
    const { location, history } = this.props;

    // if the new query is different from our location, update the location
    if (qs.stringify(params) !== qs.stringify(this.state.params)) {
      let url = this.buildSearchUrl(location.pathname, params);

      // if new query is different from current query this will close detail pane
      if (params.q !== this.state.params.q) {
        url = this.buildSearchUrl('/eholdings', params);
      }

      // if only the filters have changed, just replace the current location
      if (params.q === this.state.params.q) {
        history.replace(url);
      } else {
        history.push(url);
      }
    }
  };

  /**
   * Dispatches a search action specific to the current search type
   * @param {Object} params - search params for the action
   */
  search(params) {
    const { searchType } = this.state;
    const searchParams = transformQueryParams(searchType, params);

    if (searchType === searchTypes.PROVIDERS) this.props.searchProviders(searchParams);
    if (searchType === searchTypes.PACKAGES) this.props.searchPackages(searchParams);
    if (searchType === searchTypes.TITLES) this.props.searchTitles(searchParams);
  }

  /**
   * Handles submitting the search form and updates the URL
   * @param {Object} params - query param object
   */
  handleSearch = () => {
    const {
      submittedSearchString,
      submittedSearchFilters,
      sort,
      searchField,
    } = this.state;

    const params = {
      q: submittedSearchString,
      filter: submittedSearchFilters,
      searchfield: searchField,
      sort,
    };

    this.updateURLParams(params);
  };

  handleSearchButtonClick = () => {
    this.setState(currentState => ({
      submittedSearchString: currentState.draftSearchString,
      submittedSearchFilters: {
        ...currentState.draftSearchFilters,
        'access-type': undefined,
        tags: undefined
      }
    }), this.handleSearch);
    this.$resultPaneTitle.current.focus();
  };

  /**
   * Handles updating the pffset query param in our URL. The
   * QueryList component will trigger this method when scrolling
   * @param {Number} offset - the read offset the QueryList component
   * has been scrolled to
   */
  handleOffset = offset => {
    const { params } = this.state;
    this.updateURLParams({ ...params, offset });
  };

  /**
   * Uses the current params to search for another page
   * @param {Number} page - the page number
   */
  fetchPage = (page) => {
    const { offset, ...params } = this.state.params;
    this.search({ ...params, page });
  };

  notFoundMessage = (searchType) => {
    const { params } = this.state;
    const translationKey = getResultsNotFoundTranslationKey(searchType, params.q);
    return params.q ? (
      <FormattedMessage
        id={translationKey}
        values={{ query: params.q }}
      />
    ) : <FormattedMessage id={translationKey} />;
  };


  /**
   * Renders the search component specific to the current search type
   */
  renderResults() {
    const { searchType, params, shouldFocusItem } = this.state;
    const { history, location, match: { params: { id } } } = this.props;

    const props = {
      params,
      activeId: id,
      shouldFocusItem,
      location: this.props.location,
      collection: this.getResults(),
      onUpdateOffset: this.handleOffset,
      fetch: this.fetchPage,
      onClickItem: (detailUrl) => {
        history.push({
          pathname: detailUrl,
          search: location.search,
          state: { eholdings: true }
        });
      },
      notFoundMessage: this.notFoundMessage(searchType)
    };

    const {
      filter = {}
    } = params;


    const {
      tags = '',
      'access-type': accessType,
    } = filter;


    if (params.q || tags || accessType) {
      if (searchType === searchTypes.PROVIDERS) {
        return <ProviderSearchList {...props} />;
      } else if (searchType === searchTypes.PACKAGES) {
        return <PackageSearchList {...props} />;
      } else if (searchType === searchTypes.TITLES) {
        return <TitleSearchList {...props} />;
      }
    }

    return null;
  }

  /**
   * If there is a valid search type present in the current location,
   * render the search paneset, otherwise simply render our children
   */
  render() {
    const {
      location,
      tagsModel,
      accessTypes,
    } = this.props;

    const {
      searchType,
      params,
      sort,
      draftSearchString,
      draftSearchFilters,
      searchField,
      hideFilters,
      searchByTagsEnabled,
      searchByAccessTypesEnabled,
    } = this.state;

    const results = this.getResults();
    const filterCount = filterCountFromQuery({
      sort: params.sort,
      q: params.q,
      filter: params.filter
    });

    return (
      <FormattedMessage id={`ui-eholdings.search.searchType.${searchType}`}>
        {label => (
          <TitleManager record={label}>
            <div data-test-eholdings>
              <SearchPaneset
                filterCount={filterCount}
                hideFilters={hideFilters}
                resultsType={searchType}
                resultsLabel={label}
                resultsView={this.renderResults()}
                resultPaneTitle={this.$resultPaneTitle}
                totalResults={results.length}
                isLoading={!results.hasLoaded}
                updateFilters={this.updateFilters}
                location={location}
                searchForm={(
                  <SearchForm
                    sort={sort}
                    searchType={searchType}
                    searchString={draftSearchString}
                    searchFilter={draftSearchFilters}
                    searchField={searchField}
                    searchByTagsEnabled={searchByTagsEnabled}
                    searchByAccessTypesEnabled={searchByAccessTypesEnabled}
                    tagsModel={tagsModel}
                    accessTypesStoreData={accessTypes}
                    searchTypeUrls={this.getSearchTypeUrls()}
                    isLoading={!!params.q && !results.hasLoaded}
                    onSearch={this.handleSearchButtonClick}
                    onSearchFieldChange={this.handleSearchFieldChange}
                    onFilterChange={this.handleFilterChange}
                    onSearchChange={this.handleSearchChange}
                    onStandaloneFilterChange={this.handleStandaloneFilterChange}
                    onStandaloneFilterToggle={this.toggleFilter}
                  />
                )}
              />
            </div>
          </TitleManager>
        )}
      </FormattedMessage>
    );
  }
}

export default connect(
  (store) => {
    const { data } = store.eholdings;
    const resolver = createResolver(data);
    return {
      tagsModel: resolver.query('tags'),
      resolver,
      accessTypes: selectPropFromData(store, 'accessStatusTypes'),
    };
  }, {
    searchProviders: params => Provider.query(params),
    searchPackages: params => Package.query(params),
    searchTitles: params => Title.query(params),
    getTags: () => Tag.query(),
    getAccessTypes: getAccessTypesAction
  }
)(SearchRoute);
