/* global describe, it, beforeEach */
import { expect } from 'chai';

import { TestScheduler } from 'rxjs/testing';

import { createUpdateRootProxyEpic } from '../../../../../src/redux/epics';
import {
  UPDATE_ROOT_PROXY,
  UPDATE_ROOT_PROXY_SUCCESS,
  UPDATE_ROOT_PROXY_FAILURE,
} from '../../../../../src/redux/actions';

describe('(epic) updateRootProxy', () => {
  const state$ = {
    getState: () => {
      return {
        okapi: {
          url: 'https://folio-snapshot',
          tenant: 'diku',
          token: 'token',
        },
      };
    },
  };

  let testScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).deep.equal(expected);
    });
  });

  it('should trigger an action to update root proxy', () => {
    const action$ = testScheduler.createHotObservable('-a', {
      a: { type: UPDATE_ROOT_PROXY },
    });

    const rootProxy = {
      data: {
        id: 'root-proxy',
        type: 'rootProxy',
        attributes: {
          id: 'root-proxy',
          proxyTypeId: 'microstates',
        },
      },
    };
    const credentialId = '1';

    const dependencies = {
      rootProxyApi: {
        updateRootProxy: () => testScheduler.createColdObservable('--a', { a: rootProxy }),
      },
    };

    const output$ = createUpdateRootProxyEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: UPDATE_ROOT_PROXY,
        payload: {
          rootProxy,
          credentialId,
        },
      },
    });
  });

  it('should trigger an action to update root proxy', () => {
    const action$ = testScheduler.createHotObservable('-a', {
      a: { type: UPDATE_ROOT_PROXY }
    });

    const rootProxy = {
      data: {
        id: 'root-proxy',
        type: 'rootProxy',
        attributes: {
          id: 'root-proxy',
          proxyTypeId: 'microstates',
        },
      },
    };
    const credentialId = '1';

    const dependencies = {
      rootProxyApi: {
        updateRootProxy: () => testScheduler.createColdObservable('--a', {
          a: {
            rootProxy,
            credentialId,
          },
        })
      }
    };

    const output$ = createUpdateRootProxyEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: UPDATE_ROOT_PROXY_SUCCESS,
        payload: rootProxy,
      }
    });
  });

  it('should handle errors', () => {
    const action$ = testScheduler.createHotObservable('-a', {
      a: { type: UPDATE_ROOT_PROXY },
    });

    const dependencies = {
      rootProxyApi: {
        updateRootProxy: () => testScheduler.createColdObservable('--#', 'Error messages'),
      },
    };

    const output$ = createUpdateRootProxyEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: UPDATE_ROOT_PROXY_FAILURE,
        payload: { errors: 'Error messages' },
      },
    });
  });
});
