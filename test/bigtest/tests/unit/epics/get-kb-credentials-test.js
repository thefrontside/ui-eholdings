/* global describe, it, beforeEach */
import { expect } from 'chai';

import { TestScheduler } from 'rxjs/testing';

import { createGetKbCredentialsEpic } from '../../../../../src/redux/epics';
import {
  GET_KB_CREDENTIALS,
  GET_KB_CREDENTIALS_SUCCESS,
  GET_KB_CREDENTIALS_FAILURE,
} from '../../../../../src/redux/actions';

describe('(epic) getKBCredentials', () => {
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
      a: { type: GET_KB_CREDENTIALS }
    });

    const dependencies = {
      knowledgeBaseApi: {
        getCollection: () => testScheduler.createColdObservable('--a', {
          a: response.body
        })
      }
    };

    const output$ = createGetKbCredentialsEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: GET_KB_CREDENTIALS_SUCCESS,
        payload: response.body,
      }
    });

    testScheduler.flush();
  });

  it('should handle errors', () => {
    const action$ = testScheduler.createHotObservable('-a', {
      a: { type: GET_KB_CREDENTIALS }
    });

    const dependencies = {
      knowledgeBaseApi: {
        getCollection: () => testScheduler.createColdObservable('--#', null, 'Error messages')
      }
    };

    const output$ = createGetKbCredentialsEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: GET_KB_CREDENTIALS_FAILURE,
        payload: 'Error messages',
      }
    });

    testScheduler.flush();
  });
});
