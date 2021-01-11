/* global describe, it, beforeEach */
import { expect } from 'chai';
import { TestScheduler } from 'rxjs/testing';

import { createGetAccessTypesEpic } from '../../../../../src/redux/epics';

describe('(epic) getAccessTypes', () => {
  let testScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).deep.equal(expected);
    });
  });

  const state$ = {
    getState: () => ({
      okapi: {
        url: 'https://folio-snapshot',
        tenant: 'diku',
        token: 'token',
      }
    })
  };

  it('should handle successful data fetching', () => {
    const response = { body: ['item1', 'item2'] };

    const action$ = testScheduler.createHotObservable('-a', {
      a: {
        type: 'GET_ACCESS_TYPES',
        payload: { id: '123' },
      },
    });

    const dependencies = {
      accessTypesApi: {
        getAll: () => testScheduler.createColdObservable('--a', {
          a: response.body,
        })
      }
    };

    const output$ = createGetAccessTypesEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: 'GET_ACCESS_TYPES_SUCCESS',
        payload: { accessTypes: response.body },
      },
    });

    testScheduler.flush();
  });

  it('should handle errors', () => {
    const action$ = testScheduler.createHotObservable('-a', {
      a: {
        type: 'GET_ACCESS_TYPES',
        payload: { id: '123' },
      },
    });

    const dependencies = {
      accessTypesApi: {
        getAll: () => testScheduler.createColdObservable('--#', null, 'Error messages')
      }
    };

    const output$ = createGetAccessTypesEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: 'GET_ACCESS_TYPES_FAILURE',
        payload: 'Error messages',
      },
    });

    testScheduler.flush();
  });
});
