/* global describe, it, beforeEach */
import { expect } from 'chai';
import { TestScheduler } from 'rxjs/testing';

import { createDeleteAccessTypeEpic } from '../../../../../src/redux/epics';

describe('(epic) deleteAccessType', () => {
  const state$ = {
    getState: () => ({
      okapi: {
        url: 'https://folio-snapshot',
        tenant: 'diku',
        token: 'token',
      },
    }),
  };

  let testScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).deep.equal(expected);
    });
  });

  it('should trigger an action to delete access type', () => {
    const action$ = testScheduler.createHotObservable('-a', {
      a: { type: 'DELETE_ACCESS_TYPE' },
    });

    const accessTypeId = 'qwerty12345';
    const dependencies = {
      accessTypesApi: {
        deleteAccessType: () => testScheduler.createColdObservable('--a', { a: accessTypeId }),
      },
    };

    const output$ = createDeleteAccessTypeEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: 'DELETE_ACCESS_TYPE',
        payload: accessTypeId,
      },
    });
  });

  it('should handle errors', () => {
    const action$ = testScheduler.createHotObservable('-a', {
      a: { type: 'DELETE_ACCESS_TYPE' },
    });

    const dependencies = {
      accessTypesApi: {
        deleteAccessType: () => testScheduler.createColdObservable('--#', 'Error messages'),
      },
    };

    const output$ = createDeleteAccessTypeEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: 'DELETE_ACCESS_TYPE_FAILURE',
        payload: { errors: 'Error messages' },
      },
    });
  });
});
