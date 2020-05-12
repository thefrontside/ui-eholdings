import {
  clickable,
  collection,
  isPresent,
  text,
  attribute,
} from '@bigtest/interactor';

import { interactor } from '../helpers/interactor';

export default @interactor class {
  isExpanded = !!attribute('#accordion-toggle-button-packageShowAgreements', 'aria-expanded');
  agreements = collection('[data-test-agreements-list-item]');
  hasNewButton = isPresent('[data-test-new-button]');
  clickNewButton = clickable('[data-test-new-button]');
  clickSection = clickable('[class^=defaultCollapseButton]');
  hasBadge = isPresent('[class^="badge"]');
  agreementsQuantity = text('[class^="badge"]');
}
