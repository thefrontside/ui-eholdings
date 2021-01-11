/* global describe, it, beforeEach */
import { expect } from 'chai';
import { TestScheduler } from 'rxjs/testing';

import { createGetAgreementLinesEpic } from '../../../../../src/redux/epics';
import {
  UNASSIGN_AGREEMENT,
  GET_AGREEMENT_LINES_SUCCESS,
  GET_AGREEMENT_LINES_FAILURE,
} from '../../../../../src/redux/actions';

describe('(epic) getAgreementLines', () => {
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

  it('should trigger an action to get agreement lines ids', () => {
    const action$ = testScheduler.createHotObservable('-a', {
      a: { type: UNASSIGN_AGREEMENT },
    });

    const agreementLines = [
      { id: 1 },
      { id: 2 },
    ];

    const dependencies = {
      agreementsApi: {
        getAgreementLines: () => testScheduler.createColdObservable('--a', {
          a: agreementLines,
        }),
      },
    };

    const output$ = createGetAgreementLinesEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: GET_AGREEMENT_LINES_SUCCESS,
        payload: agreementLines,
      },
    });
  });

  it('should handle errors', () => {
    const action$ = testScheduler.createHotObservable('-a', {
      a: { type: UNASSIGN_AGREEMENT },
    });

    const dependencies = {
      agreementsApi: {
        getAgreementLines: () => testScheduler.createColdObservable('--#', 'Error messages'),
      },
    };

    const output$ = createGetAgreementLinesEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: GET_AGREEMENT_LINES_FAILURE,
        payload: { errors: 'Error messages' },
      },
    });
  });
});
