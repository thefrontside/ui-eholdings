/* global describe, it, beforeEach */
import { expect } from 'chai';
import { TestScheduler } from 'rxjs/testing';

import { createDeleteAgreementLinesEpic } from '../../../../../src/redux/epics';
import {
  GET_AGREEMENT_LINES_SUCCESS,
  DELETE_AGREEMENT_LINES_SUCCESS,
  DELETE_AGREEMENT_LINES_FAILURE,
} from '../../../../../src/redux/actions';

describe('(epic) deleteAgreementLines', () => {
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

  it('should trigger an action to delete agreement lines', () => {
    const action$ = testScheduler.createHotObservable('-a', {
      a: { type: GET_AGREEMENT_LINES_SUCCESS },
    });

    const agreement = {
      id: 1,
      items: [
        {
          id: '1-1',
          _delete: true,
        }, {
          id: '1-2',
          _delete: true,
        },
      ],
    };

    const dependencies = {
      agreementsApi: {
        deleteAgreementLines: () => testScheduler.createColdObservable('--a', {
          a: agreement,
        }),
      },
    };

    const output$ = createDeleteAgreementLinesEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: { type: DELETE_AGREEMENT_LINES_SUCCESS },
    });
  });

  it('should handle errors', () => {
    const action$ = testScheduler.createHotObservable('-a', {
      a: { type: GET_AGREEMENT_LINES_SUCCESS },
    });

    const dependencies = {
      agreementsApi: {
        deleteAgreementLines: () => testScheduler.createColdObservable('--#', 'Error messages'),
      },
    };

    const output$ = createDeleteAgreementLinesEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: DELETE_AGREEMENT_LINES_FAILURE,
        payload: { errors: 'Error messages' },
      },
    });
  });
});
