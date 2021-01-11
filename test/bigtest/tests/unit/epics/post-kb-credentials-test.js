/* global describe, it, beforeEach */
import { expect } from 'chai';
import { TestScheduler } from 'rxjs/testing';

import { createPostKbCredentialsEpic } from '../../../../../src/redux/epics';

import {
  POST_KB_CREDENTIALS,
  POST_KB_CREDENTIALS_SUCCESS,
  POST_KB_CREDENTIALS_FAILURE,
} from '../../../../../src/redux/actions';

describe('(epic) postKbCredentialsEpic', () => {
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

  it('should trigger an action to create KB credentials and passes KB credentials data', () => {
    const action$ = testScheduler.createHotObservable('-a', {
      a: { type: POST_KB_CREDENTIALS }
    });

    const kbCredentials = {
      type: 'credentials',
      attributes: {
        name: 'post post post post',
        apiKey: 'XXXX',
        url: 'YYYY',
        customerId: 'ZZZZ'
      },
    };

    const dependencies = {
      knowledgeBaseApi: {
        createCredentials: () => testScheduler.createColdObservable('--a', {
          a: kbCredentials,
        })
      }
    };

    const output$ = createPostKbCredentialsEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: POST_KB_CREDENTIALS_SUCCESS,
        payload: kbCredentials,
      }
    });
  });

  it('should handle errors', () => {
    const action$ = testScheduler.createHotObservable('-a', {
      a: { type: POST_KB_CREDENTIALS },
    });

    const dependencies = {
      knowledgeBaseApi: {
        createCredentials: () => testScheduler.createColdObservable('--#', 'Error messages')
      }
    };

    const output$ = createPostKbCredentialsEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: POST_KB_CREDENTIALS_FAILURE,
        payload: { errors: 'Error messages' }
      }
    });
  });
});
