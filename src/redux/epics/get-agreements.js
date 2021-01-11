import { of } from 'rxjs';
import {
  mergeMap,
  filter,
  map,
  catchError,
} from 'rxjs/operators';

import {
  GET_AGREEMENTS,
  getAgreementsSuccess,
  getAgreementsFailure,
} from '../actions';

export default ({ agreementsApi }) => (action$, store) => {
  return action$
    .pipe(
      filter(action => action.type === GET_AGREEMENTS),
      mergeMap(action => {
        const {
          payload: {
            refId,
          },
        } = action;

        return agreementsApi
          .getAll(store.getState().okapi, refId)
          .pipe(
            map(response => getAgreementsSuccess(response)),
            catchError(errors => of(getAgreementsFailure({ errors }))),
          );
      }),
    );
};
