/* global describe, it, beforeEach */
import { expect } from 'chai';
import { TestScheduler } from 'rxjs/testing';

import { createDeleteKbCredentialsEpic } from '../../../../../src/redux/epics';

import {
  DELETE_KB_CREDENTIALS,
  DELETE_KB_CREDENTIALS_SUCCESS,
  DELETE_KB_CREDENTIALS_FAILURE,
} from '../../../../../src/redux/actions';

describe('(epic) deleteKbCredentialsEpic', () => {
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

  it('should trigger an action to delete KB credentials and passes the credentials\'s id', () => {
    const credentialsId = 1;
    const action$ = testScheduler.createHotObservable('-a', {
      a: {
        type: DELETE_KB_CREDENTIALS,
        payload: { id: credentialsId },
      }
    });

    const dependencies = {
      knowledgeBaseApi: {
        deleteCredentials: () => testScheduler.createColdObservable('--a')
      }
    };

    const output$ = createDeleteKbCredentialsEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: DELETE_KB_CREDENTIALS_SUCCESS,
        payload: { id: credentialsId },
      }
    });
  });

  it('should handle errors', () => {
    const credentialsId = 1;
    const action$ = testScheduler.createHotObservable('-a', {
      a: {
        type: DELETE_KB_CREDENTIALS,
        payload: { id: credentialsId },
      }
    });

    const dependencies = {
      knowledgeBaseApi: {
        deleteCredentials: () => testScheduler.createColdObservable('--#', 'Error messages')
      }
    };

    const output$ = createDeleteKbCredentialsEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: DELETE_KB_CREDENTIALS_FAILURE,
        payload: { errors: 'Error messages' }
      }
    });
  });
});
