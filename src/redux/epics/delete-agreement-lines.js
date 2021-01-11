import { of } from 'rxjs';
import {
  mergeMap,
  filter,
  map,
  catchError,
} from 'rxjs/operators';

import {
  deleteAgreementLinesSuccess,
  deleteAgreementLinesFailure,
  GET_AGREEMENT_LINES_SUCCESS,
} from '../actions';

export default ({ agreementsApi }) => (action$, store) => {
  return action$
    .pipe(
      filter(action => action.type === GET_AGREEMENT_LINES_SUCCESS),
      mergeMap(({ payload }) => {
        const {
          okapi,
          eholdings: { data: { agreements: { unassignedAgreement } } },
        } = store.getState();

        const items = payload.map(id => ({ id, _delete: true }));

        const agreement = {
          ...unassignedAgreement,
          items,
        };

        return agreementsApi.deleteAgreementLines(okapi, agreement)
          .pipe(
            map(() => deleteAgreementLinesSuccess()),
            catchError(errors => of(deleteAgreementLinesFailure({ errors }))),
          );
      }),
    );
};
