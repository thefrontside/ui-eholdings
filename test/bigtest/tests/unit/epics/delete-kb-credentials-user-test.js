/* global describe, it, beforeEach */
import { expect } from 'chai';

import { TestScheduler } from 'rxjs/testing';

import { createDeleteKbCredentialsUsersEpic } from '../../../../../src/redux/epics';
import {
  DELETE_KB_CREDENTIALS_USER,
  DELETE_KB_CREDENTIALS_USER_SUCCESS,
  DELETE_KB_CREDENTIALS_USER_FAILURE,
} from '../../../../../src/redux/actions';

describe('(epic) deleteKbCredentialsUsersEpic', () => {
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


  it('should handle successful DELETE request', () => {
    const action$ = testScheduler.createHotObservable('-a', {
      a: {
        type: DELETE_KB_CREDENTIALS_USER,
        payload: {
          credentialsId: 'someCredId',
          userId: 'someUserId',
        },
      }
    });

    const dependencies = {
      kbCredentialsUsersApi: {
        unassignUser: () => testScheduler.createColdObservable('--a')
      }
    };

    const output$ = createDeleteKbCredentialsUsersEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: DELETE_KB_CREDENTIALS_USER_SUCCESS,
        payload: { userId: 'someUserId' },
      }
    });

    testScheduler.flush();
  });

  it('should handle errors', () => {
    const action$ = testScheduler.createHotObservable('-a', {
      a: {
        type: DELETE_KB_CREDENTIALS_USER,
        payload: {
          credentialsId: 'someCredId',
          userId: 'someUserId',
        },
      }
    });

    const dependencies = {
      kbCredentialsUsersApi: {
        unassignUser: () => testScheduler.createColdObservable('--#', null, 'Error messages')
      }
    };

    const output$ = createDeleteKbCredentialsUsersEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: DELETE_KB_CREDENTIALS_USER_FAILURE,
        payload: 'Error messages',
      }
    });

    testScheduler.flush();
  });
});
