import { of } from 'rxjs';
import {
  mergeMap,
  filter,
  map,
  catchError,
} from 'rxjs/operators';

import {
  UNASSIGN_AGREEMENT,
  getAgreementLinesFailure,
  getAgreementLinesSuccess,
} from '../actions';

export default ({ agreementsApi }) => (action$, store) => {
  return action$
    .pipe(
      filter(action => action.type === UNASSIGN_AGREEMENT),
      mergeMap(action => {
        const { payload: { id: agreementId } } = action;
        const {
          okapi,
          eholdings: { data: { agreements: { refId } } },
        } = store.getState();

        return agreementsApi
          .getAgreementLines(okapi, agreementId, refId).pipe(
            map(agreementLines => {
              const agreementLinesIds = agreementLines.map(({ id }) => id);
              return getAgreementLinesSuccess(agreementLinesIds);
            }),
            catchError(errors => of(getAgreementLinesFailure({ errors }))),
          );
      }),
    );
};
