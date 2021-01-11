/* global describe, it, beforeEach */
import { expect } from 'chai';

import { TestScheduler } from 'rxjs/testing';

import { createGetCustomLabelsEpic } from '../../../../../src/redux/epics';

describe('(epic) getCustomLabels', () => {
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
    const response = {
      body: {
        data: [{
          '1': {
            type: 'customLabel',
            attributes: {
              id: 1,
              displayLabel: 'simple label',
              displayOnFullTextFinder: true,
              displayOnPublicationFinder: false,
            }
          }
        }],
      }
    };

    const action$ = testScheduler.createHotObservable('-a', {
      a: { type: 'GET_CUSTOM_LABELS' }
    });

    const dependencies = {
      customLabelsApi: {
        getAll: () => testScheduler.createColdObservable('--a', {
          a: response.body
        })
      }
    };

    const output$ = createGetCustomLabelsEpic(dependencies)(action$, state$);

    testScheduler.expectObservable(output$).toBe('---a', {
      a: {
        type: 'GET_CUSTOM_LABELS_SUCCESS',
        payload: {
          customLabels: response.body,
        }
      }
    });

    testScheduler.flush();
  });
});
