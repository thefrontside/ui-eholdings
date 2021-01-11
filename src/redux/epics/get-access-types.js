import { of } from 'rxjs';
import {
  mergeMap,
  filter,
  map,
  catchError,
} from 'rxjs/operators';

import {
  getAccessTypesSuccess,
  getAccessTypesFailure,
  GET_ACCESS_TYPES,
} from '../actions';

export default ({ accessTypesApi }) => (action$, store) => {
  return action$
    .pipe(
      filter(action => action.type === GET_ACCESS_TYPES),
      mergeMap(({ payload: credentialId }) => {
        return accessTypesApi.getAll(store.getState().okapi, credentialId)
          .pipe(
            map(response => getAccessTypesSuccess(response)),
            catchError(errors => of(getAccessTypesFailure({ errors })))
          );
      }),
    );
};
