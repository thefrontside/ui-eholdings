import { of } from 'rxjs';
import {
  mergeMap,
  filter,
  map,
  catchError,
} from 'rxjs/operators';

import {
  DELETE_KB_CREDENTIALS,
  deleteKBCredentialsSuccess,
  deleteKBCredentialsFailure,
} from '../actions';

export default ({ knowledgeBaseApi }) => (action$, store) => {
  return action$
    .pipe(
      filter(action => action.type === DELETE_KB_CREDENTIALS),
      mergeMap(action => {
        const { payload: { id } } = action;

        return knowledgeBaseApi
          .deleteCredentials(store.getState().okapi, id)
          .pipe(
            map(() => deleteKBCredentialsSuccess(id)),
            catchError(errors => of(deleteKBCredentialsFailure({ errors }))),
          );
      }),
    );
};
