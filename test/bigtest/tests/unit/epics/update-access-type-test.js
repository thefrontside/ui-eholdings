/* global describe, it, beforeEach */
import { expect } from 'chai';
import { TestScheduler } from 'rxjs/testing';

import { createUpdateAccessTypeEpic } from '../../../../../src/redux/epics';

describe('(epic) updateAccessType', () => {
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

  it('should trigger an action to update access type', () => {
    const action$ = testScheduler.createHotObservable('-a', {
      a: { type: 'UPDATE_ACCESS_TYPE' },
    });

    const accessType = {
      type: 'accesType',
      attributes: {
        name: 'Super',
        discription: 'Puper',
      },
    };

    const dependencies = {
      accessTypesApi: {
        updateAccessType: () => testScheduler.createColdObservable('--a', { a: accessType }),
      },
    };

    const output$ = createUpdateAccessTypeEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: 'UPDATE_ACCESS_TYPE',
        payload: accessType,
      },
    });
  });

  it('should handle errors', () => {
    const action$ = testScheduler.createHotObservable('-a', {
      a: { type: 'UPDATE_ACCESS_TYPE' },
    });

    const dependencies = {
      accessTypesApi: {
        updateAccessType: () => testScheduler.createColdObservable('--#', 'Error messages'),
      },
    };

    const output$ = createUpdateAccessTypeEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: 'UPDATE_ACCESS_TYPE_FAILURE',
        payload: { errors: 'Error messages' },
      },
    });
  });
});
