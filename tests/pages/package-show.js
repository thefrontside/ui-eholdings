import {
  clickable,
  collection,
  computed,
  interactor,
  isPresent,
  property,
  action,
  text,
  triggerable
} from '@bigtest/interactor';
import { isRootPresent, getComputedStyle, hasClassBeginningWith } from './helpers';
import Datepicker from './datepicker';
import Toast from './toast';

@interactor class PackageShowModal {
  confirmDeselection = clickable('[data-test-eholdings-package-deselection-confirmation-modal-yes]');
  cancelDeselection = clickable('[data-test-eholdings-package-deselection-confirmation-modal-no]');
}

@interactor class PackageShowPage {
  exist = isRootPresent();
  allowKbToAddTitles = property('[data-test-eholdings-package-details-allow-add-new-titles] input', 'checked');
  hasAllowKbToAddTitles = isPresent('[data-test-eholdings-package-details-toggle-allow-add-new-titles] input');
  hasAllowKbToAddTitlesToggle = isPresent('[package-details-toggle-allow-add-new-titles-switch]');
  isSelected = property('[data-test-eholdings-package-details-selected] input', 'checked');
  isSelecting = hasClassBeginningWith('[data-test-eholdings-package-details-selected] [data-test-toggle-switch]', 'is-pending--');
  isSelectedToggleDisabled = property('[data-test-eholdings-package-details-selected] input[type=checkbox]', 'disabled');
  modal = new PackageShowModal('#eholdings-package-confirmation-modal');
  hastoggleForAllowKbToAddTitles = isPresent('[data-test-eholdings-package-details-allow-add-new-titles]');
  toggleAllowKbToAddTitles = clickable('[data-test-eholdings-package-details-allow-add-new-titles] input');
  toggleIsSelected = clickable('[data-test-eholdings-package-details-selected] input');
  paneTitle = text('[data-test-eholdings-details-view-pane-title]');
  contentType = text('[data-test-eholdings-package-details-content-type]');
  name = text('[data-test-eholdings-details-view-name="package"]');
  numTitles = text('[data-test-eholdings-package-details-titles-total]');
  numTitlesSelected = text('[data-test-eholdings-package-details-titles-selected]');
  packageType = text('[data-test-eholdings-package-details-type');
  hasErrors = isPresent('[data-test-eholdings-details-view-error="package"]');
  hasBackButton = isPresent('[data-test-eholdings-details-view-back-button] button');
  clickBackButton = clickable('[data-test-eholdings-details-view-back-button] button');
  detailsPaneContentScrollHeight = property('[data-test-eholdings-detail-pane-contents]', 'scrollHeight');
  clickEditButton = clickable('[data-test-eholdings-package-edit-link]');

  detailPaneMouseWheel = triggerable('[data-test-eholdings-detail-pane-contents]', 'wheel', {
    bubbles: true,
    deltaY: -1
  });

  titlesHaveLoaded = computed(function () {
    return this.titleList().length > 0;
  });

  toggleIsHidden = clickable('[data-test-eholdings-package-details-hidden] input');
  isVisibleToPatrons = property('[data-test-eholdings-package-details-hidden] input', 'checked');
  isHiddenMessage = text('[data-test-eholdings-package-details-is-hidden]');
  isHiddenMessagePresent = isPresent('[data-test-eholdings-package-details-is-hidden]');
  isHiddenToggleDisabled = property('[data-test-eholdings-package-details-hidden] input[type=checkbox]', 'disabled');
  isHiddenTogglePresent = isPresent('[data-test-eholdings-package-details-hidden] input');
  isHiding = hasClassBeginningWith('[data-test-eholdings-package-details-hidden] [data-test-toggle-switch]', 'is-pending--');

  allTitlesHidden = computed(function () {
    return !!this.titleList().length && this.titleList().every(title => title.isResourceHidden);
  });

  allTitlesSelected = computed(function () {
    return !!this.titleList().length && this.titleList().every(title => title.isSelected);
  });

  titleList = collection('[data-test-query-list="package-titles"] li a', {
    name: text('[data-test-eholdings-title-list-item-title-name]'),
    isSelectedLabel: text('[data-test-eholdings-title-list-item-title-selected]'),
    isSelected: computed(function () {
      return this.isSelectedLabel === 'Selected';
    }),
    isHiddenLabel: text('[data-test-eholdings-title-list-item-title-hidden]'),
    isResourceHidden: computed(function () {
      return this.isHiddenLabel === 'Hidden';
    })
  });

  detailsPaneScrollTop = action(function (offset) {
    return this.find('[data-test-query-list="package-titles"]')
      .do(() => {
        return this.scroll('[data-test-eholdings-detail-pane-contents]', {
          top: offset
        });
      });
  });

  scrollToTitleOffset = action(function (readOffset) {
    return this.find('[data-test-query-list="package-titles"] li')
      .do((firstItem) => {
        return this.scroll('[data-test-query-list="package-titles"]', {
          top: firstItem.offsetHeight * readOffset
        });
      });
  });

  titleContainerHeight = property('[data-test-eholdings-details-view-list="package"]', 'offsetHeight');
  detailPaneContentsHeight = property('[data-test-eholdings-detail-pane-contents]', 'offsetHeight');
  titleQueryListOverFlowY = getComputedStyle('[data-test-query-list="package-titles"]', 'overflow-y');
  detailsPaneContentsOverFlowY = getComputedStyle('[data-test-eholdings-detail-pane-contents]', 'overflow-y');

  hasCustomCoverage = isPresent('[data-test-eholdings-package-details-custom-coverage-display]');
  customCoverage = text('[data-test-eholdings-package-details-custom-coverage-display]');
  hasCustomCoverageAddButton = isPresent('[data-test-eholdings-package-details-custom-coverage-button] button');
  clickCustomCoverageAddButton = clickable('[data-test-eholdings-package-details-custom-coverage-button] button');
  clickCustomCoverageCancelButton = clickable('[data-test-eholdings-inline-form-cancel-button] button');
  clickCustomCoverageEditButton = clickable('[data-test-eholdings-package-details-edit-custom-coverage-button] button');
  clickCustomCoverageSaveButton = clickable('[data-test-eholdings-inline-form-save-button] button');
  isCustomCoverageDisabled = property('[data-test-eholdings-inline-form-save-button] button', 'disabled');
  validationError = text('[data-test-eholdings-coverage-fields-date-range-begin] [class^="feedbackError"]');

  beginDate = new Datepicker('[data-test-eholdings-coverage-fields-date-range-begin]');
  endDate = new Datepicker('[data-test-eholdings-coverage-fields-date-range-end]');

  toast = Toast

  fillDates(beginDate, endDate) {
    return this.beginDate.fillAndBlur(beginDate)
      .append(this.endDate.fillAndBlur(endDate));
  }

  deselectAndConfirmPackage() {
    return this.toggleIsSelected().append(this.modal.confirmDeselection());
  }

  deselectAndCancelPackage() {
    return this.toggleIsSelected().append(this.modal.cancelDeselection());
  }
}

export default new PackageShowPage('[data-test-eholdings-details-view="package"]');
