/* global describe, it, beforeEach */
import { expect } from 'chai';
import { TestScheduler } from 'rxjs/testing';

import { createAttachAccessTypeEpic } from '../../../../../src/redux/epics';

describe('(epic) attachAccessType', () => {
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

  it('should trigger an action to add access type and passes access type data', () => {
    const action$ = testScheduler.createHotObservable('-a', {
      a: { type: 'ATTACH_ACCESS_TYPE' }
    });

    const accessType = {
      type: 'accessType',
      attributes: {
        name: 'We will',
        description: 'Rock you',
      },
    };

    const dependencies = {
      accessTypesApi: {
        attachAccessType: () => testScheduler.createColdObservable('--a', {
          a: accessType,
        })
      }
    };

    const output$ = createAttachAccessTypeEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: 'ADD_ACCESS_TYPE',
        payload: accessType,
      }
    });
  });

  it('should handle errors', () => {
    const action$ = testScheduler.createHotObservable('-a', {
      a: { type: 'ATTACH_ACCESS_TYPE' },
    });

    const dependencies = {
      accessTypesApi: {
        attachAccessType: () => testScheduler.createColdObservable('--#', 'Error messages')
      }
    };

    const output$ = createAttachAccessTypeEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: 'ATTACH_ACCESS_TYPE_FAILURE',
        payload: { errors: 'Error messages' }
      }
    });
  });
});
