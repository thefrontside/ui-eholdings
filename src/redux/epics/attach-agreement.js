import { of } from 'rxjs';
import {
  mergeMap,
  filter,
  map,
  catchError,
} from 'rxjs/operators';

import {
  ATTACH_AGREEMENT,
  attachAgreementSuccess,
  attachAgreementFailure,
  addAgreement,
} from '../actions';

import {
  pickAgreementProps,
} from './common';

export default ({ agreementsApi }) => (action$, store) => {
  return action$
    .pipe(
      filter(action => action.type === ATTACH_AGREEMENT),
      mergeMap(action => {
        const {
          payload: agreement,
        } = action;

        return agreementsApi
          .attachAgreement(store.getState().okapi, agreement)
          .pipe(
            map((currentAgreement) => {
              attachAgreementSuccess();
              return addAgreement(pickAgreementProps(currentAgreement));
            }),
            catchError(errors => of(attachAgreementFailure({ errors }))),
          );
      }),
    );
};
