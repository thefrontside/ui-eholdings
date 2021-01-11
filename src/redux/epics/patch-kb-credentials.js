import { of } from 'rxjs';
import {
  mergeMap,
  filter,
  map,
  catchError,
} from 'rxjs/operators';

import {
  PATCH_KB_CREDENTIALS,
  patchKBCredentialsSuccess,
  patchKBCredentialsFailure,
} from '../actions';

export default ({ knowledgeBaseApi }) => (action$, store) => {
  return action$.pipe(
    filter(action => action.type === PATCH_KB_CREDENTIALS),
    mergeMap(({ payload }) => {
      return knowledgeBaseApi
        .editCredentials(store.getState().okapi, { data: payload.data }, payload.credentialId)
        .pipe(
          map(() => patchKBCredentialsSuccess(payload.data)),
          catchError(errors => of(patchKBCredentialsFailure({ errors }))),
        );
    }),
  );
};
