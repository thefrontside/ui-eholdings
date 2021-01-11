/* global describe, it, beforeEach */
import { expect } from 'chai';
import { TestScheduler } from 'rxjs/testing';

import { createPatchKBCredentialsEpic } from '../../../../../src/redux/epics';

import {
  PATCH_KB_CREDENTIALS,
  PATCH_KB_CREDENTIALS_SUCCESS,
  PATCH_KB_CREDENTIALS_FAILURE,
} from '../../../../../src/redux/actions';

describe('(epic) PatchKBCredentialsEpic', () => {
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

  it('should trigger an action to update KB credentials and passes KB credentials data', () => {
    const action$ = testScheduler.createHotObservable('-a', {
      a: { type: PATCH_KB_CREDENTIALS }
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
        editCredentials: () => testScheduler.createColdObservable('--a', {
          a: kbCredentials,
        })
      }
    };

    const output$ = createPatchKBCredentialsEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: PATCH_KB_CREDENTIALS_SUCCESS,
        payload: kbCredentials,
      }
    });
  });

  it('should handle errors', () => {
    const action$ = testScheduler.createHotObservable('-a', {
      a: { type: PATCH_KB_CREDENTIALS },
    });

    const dependencies = {
      knowledgeBaseApi: {
        editCredentials: () => testScheduler.createColdObservable('--#', 'Error messages')
      }
    };

    const output$ = createPatchKBCredentialsEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: PATCH_KB_CREDENTIALS_FAILURE,
        payload: { errors: 'Error messages' }
      }
    });
  });
});
