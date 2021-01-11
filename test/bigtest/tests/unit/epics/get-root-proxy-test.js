/* global describe, it, beforeEach */
import { expect } from 'chai';

import { TestScheduler } from 'rxjs/testing';

import { createGetRootProxyEpic } from '../../../../../src/redux/epics';
import {
  GET_ROOT_PROXY,
  GET_ROOT_PROXY_SUCCESS,
  GET_ROOT_PROXY_FAILURE,
} from '../../../../../src/redux/actions';

describe('(epic) getRootProxy', () => {
  let testScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).deep.equal(expected);
    });
  });

  const state$ = {
    getState: () => {
      return {
        okapi: {
          url: 'https://folio-snapshot',
          tenant: 'diku',
          token: 'token',
        }
      };
    }
  };


  it('should handle successful data fetching', () => {
    const response = { body: ['item1', 'item2'] };

    const action$ = testScheduler.createHotObservable('-a', {
      a: { type: GET_ROOT_PROXY }
    });

    const dependencies = {
      rootProxyApi: {
        get: () => testScheduler.createColdObservable('--a', {
          a: response.body,
        }),
      },
    };

    const output$ = createGetRootProxyEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: GET_ROOT_PROXY_SUCCESS,
        payload: response.body,
      },
    });

    testScheduler.flush();
  });

  it('should handle errors', () => {
    const action$ = testScheduler.createHotObservable('-a', {
      a: { type: GET_ROOT_PROXY }
    });

    const dependencies = {
      rootProxyApi: {
        get: () => testScheduler.createColdObservable('--#', null, 'Error messages')
      }
    };

    const output$ = createGetRootProxyEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: GET_ROOT_PROXY_FAILURE,
        payload: 'Error messages',
      }
    });

    testScheduler.flush();
  });
});
