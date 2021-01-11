import { of } from 'rxjs';
import {
  mergeMap,
  filter,
  map,
  catchError,
} from 'rxjs/operators';

import {
  getCustomLabelsSuccess,
  getCustomLabelsFailure,
  GET_CUSTOM_LABELS,
} from '../actions';

export default ({ customLabelsApi }) => (action$, store) => {
  return action$
    .pipe(
      filter(action => action.type === GET_CUSTOM_LABELS),
      mergeMap(action => {
        const {
          payload: credentialId,
        } = action;

        return customLabelsApi
          .getAll(store.getState().okapi, credentialId)
          .pipe(
            map(response => getCustomLabelsSuccess(response)),
            catchError(errors => of(getCustomLabelsFailure({ errors }))),
          );
      }),
    );
};
