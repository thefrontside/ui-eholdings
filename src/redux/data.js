import { from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import get from 'lodash/get';

import { qs } from '../components/utilities';
import {
  getHeaders,
  parseResponseBody,
} from '../api/common';
import {
  mergeRelationships,
  mergeAttributes,
  getTagsData,
  getChangedAttributes,
  formatErrors,
  reduceData,
  getRecord,
  makeRequest,
} from './helpers';
import entityTagsActionTypes from './constants/entityTagsActionTypes';
import entityTagsReducers from './reducers/entityTagsReducers';

// actions
export const actionTypes = {
  QUERY: '@@ui-eholdings/db/QUERY',
  FIND: '@@ui-eholdings/db/FIND',
  SAVE: '@@ui-eholdings/db/SAVE',
  CREATE: '@@ui-eholdings/db/CREATE',
  DELETE: '@@ui-eholdings/db/DELETE',
  RESOLVE: '@@ui-eholdings/db/RESOLVE',
  REJECT: '@@ui-eholdings/db/REJECT',
  UNLOAD: '@@ui-eholdings/db/UNLOAD',
  REMOVE_REQUESTS: '@@ui-eholdings/db/REMOVE_REQUESTS',
  ...entityTagsActionTypes,
};

/**
 * Action creator for querying a set of records
 * @param {String} type - resource type
 * @param {Object} params - query params
 * @param {String} options.path - path to use for the query
 */
export const query = (type, params, { path }) => ({
  type: actionTypes.QUERY,
  data: {
    type,
    path,
    params,
    timestamp: Date.now()
  }
});

/**
 * Action creator for finding a single record
 * @param {String} type - resource type
 * @param {String} id - record id
 * @param {String} options.path - path to use for the request
 * @param {String|[String]} [options.include] - additional resources
 * to include via the `?include` query param
 */
export const find = (type, id, { path, include }) => ({
  type: actionTypes.FIND,
  data: {
    type,
    path,
    params: { id, include },
    timestamp: Date.now()
  }
});

/**
 * Action creator for saving a record
 * @param {String} type - resource type
 * @param {Object} payload - record payload
 * @param {String} [options.path] - path to use
 */
export const save = (type, payload, { path }) => ({
  type: actionTypes.SAVE,
  data: {
    type,
    path,
    params: { id: payload.data.id },
    timestamp: Date.now()
  },
  payload
});

/**
 * Action creator for creating a record
 * @param {String} type - resource type
 * @param {Object} payload - record payload
 * @param {String} [options.path] - path to use
 */
export const create = (type, payload, { path }) => ({
  type: actionTypes.CREATE,
  data: {
    type,
    path,
    params: {},
    timestamp: Date.now()
  },
  payload
});


/**
 * Action creator for destroying a record
 * @param {String} type - resource type
 * @param {Object} payload - record payload
 * @param {String} [options.path] - path to use
 */
export const destroy = (type, payload, { path }) => ({
  type: actionTypes.DELETE,
  data: {
    type,
    path,
    params: {
      id: payload.data.id,
      isTitleCustom: payload.data.attributes.isTitleCustom
    },
    timestamp: Date.now()
  }
});

/**
 * Action creator for unloading a record
 * @param {String} type - resource type
 * @param {String|[String]} ids - one or more record ids
 */
export const unload = (type, ids) => ({
  type: actionTypes.UNLOAD,
  data: {
    type,
    ids: [].concat(ids)
  }
});

/**
 * Action creator for resolving a record or a set of records
 * @param {Object} request - the request state object associated with
 * the request being resolved
 * @param {Object} body - JSON API returned body
 * @param {Object} payload - payload sent with the request
 */
const resolve = (request, body, payload = {}, status) => {
  let records = [];
  let ids = [];
  let meta = {};
  let data;

  if (request.resource === 'tags') {
    data = getTagsData(request, body);
    meta.totalResults = get(body, 'totalRecords', {});
  } else {
    data = get(body, 'data', payload.data);
    meta = get(body, 'meta', {});
  }

  // on request where neither a body or payload is sent
  // such as a delete request we need to pick id off request
  if (!data && request.params.id) {
    data = { id: request.params.id };
  }

  if (Array.isArray(data)) {
    records = records.concat(data);
    ids = records.map(({ id }) => id);
  } else if (data) {
    records = [data];
    ids = [data.id];
  }

  if (body && body.included) {
    records = records.concat(body.included);
  }

  return {
    type: actionTypes.RESOLVE,
    data: { type: request.resource, ids },
    request: { ...request, records: ids, meta, status },
    records,
  };
};

/**
 * Action creator for rejecting a request
 * @param {Object} request - the request state object associated with
 * the request being resolved
 * @param {Array} errors - response errors
 * @param {Object} data - data associated with the request
 * @param {String} status - HTTP response status
 */
const reject = (request, errors, data, status) => ({
  type: actionTypes.REJECT,
  request,
  errors,
  data,
  status,
});

/**
 * Action creator for removing create requests from the store
 * for specific resource type
 * @param {String} type - resource type
 */
export const removeRequests = (resourceType, requestType) => ({
  type: actionTypes.REMOVE_REQUESTS,
  data: {
    resourceType,
    requestType,
  }
});

// reducer handlers
const handlers = {

  /**
   * Handles reducing of entity tags updating on all the resources.
   */
  ...entityTagsReducers,

  /**
   * Handles reducing the data store when removing the create requests
   * @param {Object} state - data store state
   * @param {String} action.data.resourceType - the type of resource whose requests should be removed
   * @param {String} action.data.requestType - the type of requests which should be removed
   */
  [actionTypes.REMOVE_REQUESTS]: (state, { data }) => {
    return reduceData(data.resourceType, state, store => ({

      requests: Object.keys(store.requests).reduce((reqs, timestamp) => {
        const request = store.requests[timestamp];

        // keep the request only if it's not of the type which we want to remove
        if (request.type !== data.requestType) {
          reqs[timestamp] = request;
        }
        return reqs;
      }, {})
    }));
  },

  /**
   * Handles reducing the data store when querying for a new set of resources
   * @param {Object} state - data store state
   * @param {Object} action.data - data associated with the query
   */
  [actionTypes.QUERY]: (state, { data }) => {
    return reduceData(data.type, state, store => ({
      requests: {
        ...store.requests,
        ...makeRequest('query', data)
      }
    }));
  },

  /**
   * Handles reducing the data store when finding a single record
   * @param {Object} state - data store state
   * @param {Object} action.data - data associated with the query
   * @param {Object} action.data.params.id - the id of the requested record
   */
  [actionTypes.FIND]: (state, { data }) => {
    return reduceData(data.type, state, store => ({
      requests: {
        ...store.requests,
        ...makeRequest('find', data)
      },
      records: {
        ...store.records,
        [data.params.id]: {
          ...getRecord(store, data.params.id),
          isLoading: true
        }
      }
    }));
  },

  /**
   * Handles reducing the data store when saving a single record
   * @param {Object} state - data store state
   * @param {Object} action.data - data associated with the query
   * @param {String} action.data.params.id - the id of the requested record
   */
  [actionTypes.SAVE]: (state, { data, payload }) => {
    return reduceData(data.type, state, (store) => {
      const record = getRecord(store, data.params.id);

      return {
        requests: {
          ...store.requests,
          ...makeRequest('update', {
            ...data,
            changedAttributes: getChangedAttributes(record.attributes, payload.data.attributes)
          })
        },
        records: {
          ...store.records,
          [data.params.id]: {
            ...record,
            isSaving: true
          }
        }
      };
    });
  },

  /**
   * Handles reducing the data store when creating a new record
   * @param {Object} state - data store state
   * @param {Object} action.data - data associated with the query
   */
  [actionTypes.CREATE]: (state, { data }) => {
    return reduceData(data.type, state, store => ({
      requests: {
        ...store.requests,
        ...makeRequest('create', data)
      }
    }));
  },

  /**
   * Handles reducing the data store when deleting a single record
   * @param {Object} state - data store state
   * @param {Object} action.data - data associated with the query
   * @param {String} action.data.params.id - the id of the requested record
   */
  [actionTypes.DELETE]: (state, { data }) => {
    return reduceData(data.type, state, (store) => {
      return {
        requests: {
          ...store.requests,
          ...makeRequest('destroy', data)
        },
      };
    });
  },

  /**
   * Handles reducing the data store when unloading records
   * @param {Object} state - data store state
   * @param {Object} action.data - data associated with the action
   * @param {String} action.data.ids - ids of records
   */
  [actionTypes.UNLOAD]: (state, { data }) => {
    return reduceData(data.type, state, store => ({
      // remove the records from the store
      records: data.ids.reduce((records, id) => {
        const newRecordsMap = { ...records };
        delete newRecordsMap[id];

        return newRecordsMap;
      }, store.records),

      // remove requests for this record and flag query requests with `hasUnloaded`
      requests: Object.keys(store.requests).reduce((reqs, timestamp) => {
        const request = store.requests[timestamp];

        // if the request does not include any unloaded ids, keep it
        if (request.type === 'destroy' || !request.records.some(id => data.ids.includes(id))) {
          reqs[timestamp] = request;

          // if a query request includes unloaded ids, flag is with `hasUnloaded`
        } else if (request.type === 'query') {
          reqs[timestamp] = {
            ...request,
            hasUnloaded: true
          };
        }

        return reqs;
      }, {})
    }));
  },

  /**
   * Handles reducing the data store when resolving a resource request
   * @param {Object} state - data store state
   * @param {Object} action.request - the request state object
   * @param {Array} action.records - array of resolved records
   */
  [actionTypes.RESOLVE]: (state, action) => {
    const { request, records } = action;
    // first we reduce the request state object
    let next = reduceData(request.resource, state, store => ({
      requests: {
        ...store.requests,
        [request.timestamp]: {
          ...store.requests[request.timestamp],
          records: request.records,
          meta: request.meta,
          status: request.status,
          isPending: false,
          isResolved: true
        }
      }
    }));

    if (request.type === 'destroy') {
      next = handlers[actionTypes.UNLOAD](next, action);
    } else {
      // then we reduce each record in the set of records
      next = records.reduce((reducedRecordsSet, record) => {
        return reduceData(record.type, reducedRecordsSet, (store) => {
          const recordState = getRecord(store, record.id);

          return {
            records: {
              ...store.records,
              [record.id]: {
                ...recordState,
                attributes: mergeAttributes(recordState.attributes, record.attributes),
                relationships: mergeRelationships(recordState.relationships, record.relationships),
                isSaving: false,
                isLoading: false,
                isLoaded: true
              }
            }
          };
        });
      }, next);
    }

    return next;
  },

  /**
   * Handles reducing the data store when rejecting a resource request
   * @param {Object} state - data store state
   * @param {Object} action.request - the request state object
   * @param {Array} action.errors - response errors
   * @param {Object} action.data - data used to create the request
   */
  [actionTypes.REJECT]: (state, { request, errors, data, status }) => {
    // first we reduce the request state object
    let next = reduceData(request.resource, state, store => ({
      requests: {
        ...store.requests,
        [request.timestamp]: {
          ...store.requests[request.timestamp],
          status,
          errors: formatErrors(errors),
          isPending: false,
          isRejected: true
        }
      }
    }));

    // if we requested a single record, reduce that record's state
    if (data.params.id) {
      next = reduceData(data.type, next, store => ({
        records: {
          ...store.records,
          [data.params.id]: {
            ...getRecord(store, data.params.id),
            isLoading: false,
            isSaving: false
          }
        }
      }));
    }

    return next;
  }
};

/**
 * The main data store reducer simply uses the handlers defined above
 * @param {Object} state - data store state leaf
 * @param {Object} action - redux action being dispatched
 */
export function reducer(state = {}, action) { // NOSONAR
  if (handlers[action.type]) {
    return handlers[action.type](state, action);
  } else {
    return state;
  }
}
/**
 * The epic used to actually make a requests when an action is dispatched
 * @param {Observable} action$ - the observable action
 * @param {Function} store.getState - get's the most recent redux state
 */
export function epic(action$, { getState }) {
  const actionMethods = {
    [actionTypes.QUERY]: 'GET',
    [actionTypes.FIND]: 'GET',
    [actionTypes.SAVE]: 'PUT',
    [actionTypes.CREATE]: 'POST',
    [actionTypes.DELETE]: 'DELETE'
  };

  return action$
    .filter(({ type }) => actionMethods[type])
    .mergeMap(({ type, data, payload }) => {
      const state = getState();
      const method = actionMethods[type];

      // the request object created from this action
      const request = state.eholdings.data[data.type].requests[data.timestamp];

      // used for the actual request
      let url = `${state.okapi.url}${data.path}`;

      const headers = getHeaders(method, state.okapi, url);
      let body;

      // if we're querying a set of records, data.params are the
      // parameters needed in the request URL
      if (type === actionTypes.QUERY && Object.keys(data.params).length !== 0) {
        url = `${url}?${qs.stringify(data.params)}`;
      }

      // if we need to include additional resources in the response,
      // we need to add the proper query param to the request URL.
      if (data.params.include) {
        let include = data.params.include;
        include = Array.isArray(include) ? include.join(',') : include;
        url = `${url}?${qs.stringify({ include })}`;
      }

      // When PUTing, the payload needs to be stringified
      if (method === 'PUT' || method === 'POST') {
        body = JSON.stringify(payload);
      }

      // request which rejects when not OK
      const promise = fetch(url, { headers, method, body })
        .then(response => Promise.all([response.ok, parseResponseBody(response), response.status]))
        .then(([ok, responseBody, status]) => (ok
          ? { status, responseBody }
          : Promise.reject({ errors: responseBody.errors, status }))); // eslint-disable-line prefer-promise-reject-errors

      // an observable from resolving or rejecting the request payload
      return from(promise).pipe(
        map(({ status, responseBody }) => resolve(request, responseBody, payload, status)),
        catchError(({ errors, status }) => of(reject(request, errors, data, status))),
      );
    });
}
