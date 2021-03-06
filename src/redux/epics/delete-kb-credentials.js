import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import {
  DELETE_KB_CREDENTIALS,
  deleteKBCredentialsSuccess,
  deleteKBCredentialsFailure,
} from '../actions';

export default ({ knowledgeBaseApi }) => (action$, store) => {
  return action$
    .filter(action => action.type === DELETE_KB_CREDENTIALS)
    .mergeMap(action => {
      const { payload: { id } } = action;

      return knowledgeBaseApi
        .deleteCredentials(store.getState().okapi, id)
        .map(() => deleteKBCredentialsSuccess(id))
        .catch(errors => Observable.of(deleteKBCredentialsFailure({ errors })));
    });
};
