import { of } from 'rxjs';
import {
  mergeMap,
  filter,
  map,
  catchError,
} from 'rxjs/operators';

import {
  getRootProxySuccess,
  getRootProxyFailure,
  GET_ROOT_PROXY,
} from '../actions';

export default ({ rootProxyApi }) => (action$, store) => {
  return action$
    .pipe(
      filter(action => action.type === GET_ROOT_PROXY),
      mergeMap(action => {
        const {
          payload: credentialId,
        } = action;

        return rootProxyApi
          .get(store.getState().okapi, credentialId)
          .pipe(
            map(response => getRootProxySuccess(response)),
            catchError(errors => of(getRootProxyFailure({ errors }))),
          );
      }),
    );
};
