/* global describe, it, beforeEach */
import { expect } from 'chai';

import { TestScheduler } from 'rxjs/testing';

import { createGetAgreementsEpic } from '../../../../../src/redux/epics';

describe('(epic) getAgreements', () => {
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
      a: { type: 'GET_AGREEMENTS', payload: { refId: '123' } }
    });

    const dependencies = {
      agreementsApi: {
        getAll: () => testScheduler.createColdObservable('--a', {
          a: response.body
        })
      }
    };

    const output$ = createGetAgreementsEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: 'GET_AGREEMENTS_SUCCESS',
        payload: {
          items: response.body,
        }
      }
    });

    testScheduler.flush();
  });

  it('should handle errors', () => {
    const action$ = testScheduler.createHotObservable('-a', {
      a: { type: 'GET_AGREEMENTS', payload: { refId: '123' } }
    });

    const dependencies = {
      agreementsApi: {
        getAll: () => testScheduler.createColdObservable('--#', null, 'Error messages')
      }
    };

    const output$ = createGetAgreementsEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: 'GET_AGREEMENTS_FAILURE',
        payload: { errors: 'Error messages' },
      }
    });

    testScheduler.flush();
  });
});
