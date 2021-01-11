/* global describe, it, beforeEach */
import { expect } from 'chai';

import { TestScheduler } from 'rxjs/testing';

import { createGetUserGroupsEpic } from '../../../../../src/redux/epics';
import {
  GET_USER_GROUPS,
  GET_USER_GROUPS_SUCCESS,
  GET_USER_GROUPS_FAILURE,
} from '../../../../../src/redux/actions';

describe('(epic) getUserGroups', () => {
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
    const response = { body: { usergroups: ['item1', 'item2'] } };

    const action$ = testScheduler.createHotObservable('-a', {
      a: { type: GET_USER_GROUPS }
    });

    const dependencies = {
      userGroupsApi: {
        getAll: () => testScheduler.createColdObservable('--a', {
          a: response.body
        })
      }
    };

    const output$ = createGetUserGroupsEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: GET_USER_GROUPS_SUCCESS,
        payload: response.body.usergroups,
      }
    });

    testScheduler.flush();
  });

  it('should handle errors', () => {
    const action$ = testScheduler.createHotObservable('-a', {
      a: { type: GET_USER_GROUPS }
    });

    const dependencies = {
      userGroupsApi: {
        getAll: () => testScheduler.createColdObservable('--#', null, 'Error messages')
      }
    };

    const output$ = createGetUserGroupsEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: GET_USER_GROUPS_FAILURE,
        payload: 'Error messages',
      }
    });

    testScheduler.flush();
  });
});
