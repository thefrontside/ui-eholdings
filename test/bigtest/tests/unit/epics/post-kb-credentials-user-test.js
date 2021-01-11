/* global describe, it, beforeEach */
import { expect } from 'chai';
import { TestScheduler } from 'rxjs/testing';

import { createPostKbCredentialsUserEpic } from '../../../../../src/redux/epics';

import {
  POST_KB_CREDENTIALS_USER,
  POST_KB_CREDENTIALS_USER_SUCCESS,
  POST_KB_CREDENTIALS_USER_FAILURE,
} from '../../../../../src/redux/actions';

describe('(epic) postKbCredentialsUserEpic', () => {
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

  it('should trigger an action to assign a user to KB credentials and passes user data to success action', () => {
    const userData = { name: 'joe' };
    const action$ = testScheduler.createHotObservable('-a', {
      a: {
        type: POST_KB_CREDENTIALS_USER,
        payload: {
          credentialsId: '123',
          userData,
        }
      }
    });

    const dependencies = {
      kbCredentialsUsersApi: {
        assignUser: () => testScheduler.createColdObservable('--a', {
          a: userData,
        })
      }
    };

    const output$ = createPostKbCredentialsUserEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: POST_KB_CREDENTIALS_USER_SUCCESS,
        payload: userData,
      }
    });
  });

  it('should handle errors', () => {
    const action$ = testScheduler.createHotObservable('-a', {
      a: { type: POST_KB_CREDENTIALS_USER },
    });

    const dependencies = {
      kbCredentialsUsersApi: {
        assignUser: () => testScheduler.createColdObservable('--#', 'Error messages')
      }
    };

    const output$ = createPostKbCredentialsUserEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: POST_KB_CREDENTIALS_USER_FAILURE,
        payload: { errors: 'Error messages' }
      }
    });
  });
});
