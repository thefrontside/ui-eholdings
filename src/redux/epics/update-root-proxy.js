import { of } from 'rxjs';
import {
  mergeMap,
  filter,
  map,
  catchError,
} from 'rxjs/operators';

import {
  UPDATE_ROOT_PROXY,
  updateRootProxyFailure,
  updateRootProxySuccess,
} from '../actions';

export default ({ rootProxyApi }) => (action$, store) => {
  return action$.pipe(
    filter(action => action.type === UPDATE_ROOT_PROXY),
    mergeMap(action => {
      const {
        payload: { rootProxy, credentialId },
      } = action;

      return rootProxyApi
        .updateRootProxy(store.getState().okapi, rootProxy, credentialId)
        .pipe(
          map(() => updateRootProxySuccess(rootProxy)),
          catchError(errors => of(updateRootProxyFailure({ errors })))
        );
    }),
  );
};
