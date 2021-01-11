import { of } from 'rxjs';
import {
  mergeMap,
  filter,
  map,
  catchError,
} from 'rxjs/operators';

import {
  ATTACH_ACCESS_TYPE,
  attachAccessTypeSuccess,
  attachAccessTypeFailure,
  addAccessType,
} from '../actions';

export default ({ accessTypesApi }) => (action$, store) => {
  return action$
    .pipe(
      filter(action => action.type === ATTACH_ACCESS_TYPE),
      mergeMap(action => {
        const { payload: { accessType, credentialId } } = action;

        return accessTypesApi
          .attachAccessType(store.getState().okapi, { data: accessType }, credentialId)
          .pipe(
            map(response => {
              attachAccessTypeSuccess();
              return addAccessType(response);
            }),
            catchError(errors => of(attachAccessTypeFailure({ errors }))),
          );
      }),
    );
};
