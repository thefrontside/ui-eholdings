/* global describe, it, beforeEach */
import { expect } from 'chai';

import { TestScheduler } from 'rxjs/testing';

import { createUpdateCustomLabelsEpic } from '../../../../../src/redux/epics';

describe('(epic) updateCustomLabels', () => {
  const state$ = {
    getState: () => {
      return {
        okapi: {
          url: 'https://folio-snapshot',
          tenant: 'diku',
          token: 'token',
        },
      };
    },
  };

  let testScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).deep.equal(expected);
    });
  });

  it('should trigger an action to updatecustom labels', () => {
    const action$ = testScheduler.createHotObservable('-a', {
      a: { type: 'UPDATE_CUSTOM_LABELS' },
    });

    const customLabels = {
      data: [{
        type: 'customLabel',
        attributes: {
          id: '1',
          displayLabel: 'label',
          displayOnPublicationFinder: false,
          displayOnFullTimeFinder: false,
        },
      }],
    };

    const dependencies = {
      customLabelsApi: {
        updateCustomLabels: () => testScheduler.createColdObservable('--a', { a: customLabels }),
      },
    };

    const output$ = createUpdateCustomLabelsEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: 'UPDATE_CUSTOM_LABELS',
        payload: customLabels,
      },
    });
  });

  it('should handle errors', () => {
    const action$ = testScheduler.createHotObservable('-a', {
      a: { type: 'UPDATE_CUSTOM_LABELS' },
    });

    const dependencies = {
      customLabelsApi: {
        updateCustomLabels: () => testScheduler.createColdObservable('--#', 'Error messages'),
      },
    };

    const output$ = createUpdateCustomLabelsEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: 'UPDATE_CUSTOM_LABELS_FAILURE',
        payload: { errors: 'Error messages' },
      },
    });
  });
});
