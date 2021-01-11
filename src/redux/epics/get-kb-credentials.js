import { of } from 'rxjs';
import {
  mergeMap,
  filter,
  map,
  catchError,
} from 'rxjs/operators';

import {
  GET_KB_CREDENTIALS,
  getKbCredentialsSuccess,
  getKbCredentialsFailure,
} from '../actions';

export default ({ knowledgeBaseApi }) => (action$, store) => {
  return action$
    .pipe(
      filter(action => action.type === GET_KB_CREDENTIALS),
      mergeMap(() => knowledgeBaseApi
        .getCollection(store.getState().okapi)
        .pipe(
          map(getKbCredentialsSuccess),
          catchError(errors => of(getKbCredentialsFailure({ errors })))
        )),
    );
};
