/* global describe, it, beforeEach */
import { expect } from 'chai';

import { TestScheduler } from 'rxjs/testing';

import { createAttachAgreementEpic } from '../../../../../src/redux/epics';

describe('(epic) attachAgreement', () => {
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

  let testScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).deep.equal(expected);
    });
  });

  it('should trigger an action to add agreement and passes agreement data', () => {
    const action$ = testScheduler.createHotObservable('-a', {
      a: { type: 'ATTACH_AGREEMENT' }
    });

    const agreement = {
      id: 'id',
      agreementStatus: 'status',
      name: 'name',
      startDate: 'start date',
    };

    const dependencies = {
      agreementsApi: {
        attachAgreement: () => testScheduler.createColdObservable('--a', {
          a: agreement
        })
      }
    };

    const output$ = createAttachAgreementEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: 'ADD_AGREEMENT',
        payload: agreement
      }
    });
  });

  it('should handle errors', () => {
    const action$ = testScheduler.createHotObservable('-a', {
      a: { type: 'ATTACH_AGREEMENT' }
    });

    const dependencies = {
      agreementsApi: {
        attachAgreement: () => testScheduler.createColdObservable('--#', 'Error messages')
      }
    };

    const output$ = createAttachAgreementEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: 'ATTACH_AGREEMENT_FAILURE',
        payload: { errors: 'Error messages' }
      }
    });
  });
});
