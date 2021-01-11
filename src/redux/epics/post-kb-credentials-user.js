import { of } from 'rxjs';
import {
  mergeMap,
  filter,
  map,
  catchError,
} from 'rxjs/operators';

import {
  POST_KB_CREDENTIALS_USER,
  postKBCredentialsUserSuccess,
  postKBCredentialsUserFailure,
} from '../actions';

export default ({ kbCredentialsUsersApi }) => (action$, store) => {
  return action$.pipe(
    filter(action => action.type === POST_KB_CREDENTIALS_USER),
    mergeMap(({ payload }) => {
      const { credentialsId, userData } = payload;

      return kbCredentialsUsersApi
        .assignUser(store.getState().okapi, credentialsId, userData)
        .pipe(
          map(postKBCredentialsUserSuccess),
          catchError(errors => of(postKBCredentialsUserFailure({ errors }))),
        );
    }),
  );
};
