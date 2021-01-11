import { of } from 'rxjs';
import {
  mergeMap,
  filter,
  map,
  catchError,
} from 'rxjs/operators';

import {
  GET_USER_GROUPS,
  getUserGroupsSuccess,
  getUserGroupsFailure,
} from '../actions';

export default ({ userGroupsApi }) => (action$, store) => {
  return action$.pipe(
    filter(action => action.type === GET_USER_GROUPS),
    mergeMap(() => userGroupsApi
      .getAll(store.getState().okapi)
      .pipe(
        map(getUserGroupsSuccess),
        catchError(errors => of(getUserGroupsFailure({ errors })))
      ))
  );
};
