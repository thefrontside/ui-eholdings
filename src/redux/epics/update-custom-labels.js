import { of } from 'rxjs';
import {
  mergeMap,
  filter,
  map,
  catchError,
} from 'rxjs/operators';

import {
  UPDATE_CUSTOM_LABELS,
  updateCustomLabelsFailure,
  updateCustomLabelsSuccess,
} from '../actions';


export default ({ customLabelsApi }) => (action$, store) => {
  return action$
    .pipe(
      filter(action => action.type === UPDATE_CUSTOM_LABELS),
      mergeMap(action => {
        const {
          payload: { customLabels, credentialId },
        } = action;

        return customLabelsApi
          .updateCustomLabels(store.getState().okapi, customLabels, credentialId)
          .pipe(
            map(updateCustomLabelsSuccess),
            catchError(errors => of(updateCustomLabelsFailure({ errors })))
          );
      }),
    );
};
