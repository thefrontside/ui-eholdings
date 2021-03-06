import React, {
  Component,
} from 'react';
import PropTypes from 'prop-types';
import {
  FormattedDate,
  FormattedNumber,
  FormattedMessage,
  injectIntl,
} from 'react-intl';

import update from 'lodash/fp/update';
import set from 'lodash/fp/set';
import hasIn from 'lodash/fp/hasIn';

import {
  withStripes,
  IfPermission,
} from '@folio/stripes-core';

import SafeHTMLMessage from '@folio/react-intl-safe-html';
import { NotesSmartAccordion } from '@folio/stripes/smart-components';

import {
  Accordion,
  Button,
  Headline,
  Icon,
  KeyValue,
  Modal,
  ModalFooter,
  expandAllFunction,
} from '@folio/stripes/components';

import {
  entityAuthorityTypes,
  entityTypes,
  listTypes,
  DOMAIN_NAME,
  paths,
  accessTypesReduxStateShape,
  costPerUse as costPerUseShape,
  TITLES_PACKAGES_CREATE_DELETE_PERMISSION,
  PACKAGE_TITLE_SELECT_UNSELECT_PERMISSION,
  RECORDS_EDIT_PERMISSION,
} from '../../../constants';
import {
  processErrors,
  getAccessTypeId,
  getAccessTypeIdsAndNames,
} from '../../utilities';
import DetailsView from '../../details-view';
import QueryList from '../../query-list';
import InternalLink from '../../internal-link';
import TitleListItem from '../../title-list-item';
import NavigationModal from '../../navigation-modal';
import Toaster from '../../toaster';
import SelectionStatus from '../selection-status';
import KeyValueColumns from '../../key-value-columns';
import ProxyDisplay from '../../proxy-display';
import TokenDisplay from '../../token-display';
import TagsAccordion from '../../tags';
import AccessType from '../../access-type-display';
import {
  AgreementsAccordion,
  UsageConsolidationAccordion,
} from '../../../features';
import QueryNotFound from '../../query-list/not-found';
import KeyShortcutsWrapper from '../../key-shortcuts-wrapper';

const ITEM_HEIGHT = 62;
const MAX_EXPORT_TITLE_LIMIT = 200000;

class PackageShow extends Component {
  static propTypes = {
    accessStatusTypes: accessTypesReduxStateShape.isRequired,
    addPackageToHoldings: PropTypes.func.isRequired,
    costPerUse: costPerUseShape.CostPerUseReduxStateShape.isRequired,
    fetchCostPerUsePackageTitles: PropTypes.func.isRequired,
    fetchPackageCostPerUse: PropTypes.func.isRequired,
    fetchPackageTitles: PropTypes.func.isRequired,
    intl: PropTypes.shape({
      formatMessage: PropTypes.func.isRequired,
    }).isRequired,
    isDestroyed: PropTypes.bool,
    isFreshlySaved: PropTypes.bool,
    isNewRecord: PropTypes.bool,
    loadMoreCostPerUsePackageTitles: PropTypes.func.isRequired,
    model: PropTypes.object.isRequired,
    onEdit: PropTypes.func.isRequired,
    packageTitles: PropTypes.object.isRequired,
    provider: PropTypes.object.isRequired,
    proxyTypes: PropTypes.object.isRequired,
    searchModal: PropTypes.node,
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func.isRequired,
    }).isRequired,
    tagsModel: PropTypes.object,
    toggleSelected: PropTypes.func.isRequired,
    updateFolioTags: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      showSelectionConfirmationModal: false,
      showDeselectionModal: false,
      packageSelected: this.props.model.isSelected,
      packageAllowedToAddTitles: this.props.model.allowKbToAddTitles,
      isCoverageEditable: false,
      sections: {
        packageShowTags: true,
        packageShowHoldingStatus: true,
        packageShowInformation: true,
        packageShowSettings: true,
        packageShowCoverageSettings: true,
        packageShowAgreements: true,
        packageShowTitles: true,
        packageShowNotes: true,
        packageShowUsageConsolidation: false,
      },
    };
  }

  static getDerivedStateFromProps(nextProps) {
    const { model: { allowKbToAddTitles, isSaving, isSelected } } = nextProps;
    if (!isSaving) {
      return {
        packageSelected: isSelected,
        packageAllowedToAddTitles: allowKbToAddTitles
      };
    }
    return null;
  }

  handleSelectionToggle = () => {
    this.setState({ packageSelected: !this.props.model.isSelected });
    if (this.props.model.isSelected) {
      this.setState({ showDeselectionModal: true });
    } else {
      this.setState({ packageAllowedToAddTitles: true });
      this.props.toggleSelected();
    }
  };

  commitSelectionToggle = () => {
    this.setState({ showDeselectionModal: false });
    this.props.toggleSelected();
  };

  cancelSelectionToggle = () => {
    this.setState({
      showDeselectionModal: false,
      packageSelected: this.props.model.isSelected
    });
  };

  handleCoverageEdit = (isCoverageEditable) => {
    this.setState({ isCoverageEditable });
  };

  handleSectionToggle = ({ id }) => {
    const next = update(`sections.${id}`, value => !value, this.state);
    this.setState(next);
  }

  handleExpandAll = (sections) => {
    const next = set('sections', sections, this.state);
    this.setState(next);
  }

  hasEditPermission = () => {
    const { stripes } = this.props;
    const { packageSelected } = this.state;

    const hasEditPerm = stripes.hasPerm(RECORDS_EDIT_PERMISSION);

    return !!(hasEditPerm && packageSelected);
  };

  getActionMenu = () => {
    const {
      stripes,
      model: { isCustom },
      onEdit,
      model
    } = this.props;

    const { packageSelected } = this.state;

    const requiredRemovingPermission = isCustom
      ? TITLES_PACKAGES_CREATE_DELETE_PERMISSION
      : PACKAGE_TITLE_SELECT_UNSELECT_PERMISSION;

    const hasRequiredRemovingPermission = stripes.hasPerm(requiredRemovingPermission);
    const hasSelectionPermission = stripes.hasPerm(PACKAGE_TITLE_SELECT_UNSELECT_PERMISSION);
    const isAddButtonNeeded = (!packageSelected || model.isPartiallySelected) && hasSelectionPermission;
    const isRemoveButtonNeeded = packageSelected && hasRequiredRemovingPermission;
    const canEdit = this.hasEditPermission();
    const isMenuNeeded = canEdit || isAddButtonNeeded || isRemoveButtonNeeded;

    if (!isMenuNeeded) return null;

    return ({ onToggle }) => (
      <>
        {canEdit &&
          <Button
            buttonStyle="dropdownItem fullWidth"
            onClick={onEdit}
            data-test-eholdings-package-edit-link
          >
            <FormattedMessage id="ui-eholdings.actionMenu.edit" />
          </Button>}
        {isRemoveButtonNeeded && this.renderRemoveFromHoldingsButton(onToggle)}
        {isAddButtonNeeded && this.renderAddToHoldingsButton(onToggle)}
      </>
    );
  };

  renderAccessTypeDisplay() {
    const { model, accessStatusTypes } = this.props;

    if (!accessStatusTypes?.items?.data?.length) {
      return null;
    }

    const formattedAccessTypes = getAccessTypeIdsAndNames(accessStatusTypes.items.data);

    return (
      <AccessType
        accessTypeId={getAccessTypeId(model)}
        accessStatusTypes={formattedAccessTypes}
      />
    );
  }

  renderPackageSettings() {
    const {
      model,
      proxyTypes,
      provider,
      accessStatusTypes,
    } = this.props;

    const {
      packageAllowedToAddTitles,
    } = this.state;

    const visibilityMessage = model.visibilityData.reason && `(${model.visibilityData.reason})`;
    const hasProxy = hasIn('proxy.id', model);
    const hasProviderToken = hasIn('providerToken.prompt', provider);
    const hasPackageToken = hasIn('packageToken.prompt', model);
    const isProxyAvailable = hasProxy && proxyTypes.request.isResolved && model.isLoaded && provider.isLoaded;
    const haveAccessTypesLoaded = !accessStatusTypes?.isLoading && !model.isLoading;

    return (
      <div>
        <KeyValue label={<FormattedMessage id="ui-eholdings.package.visibility" />}>
          <div data-test-eholdings-package-details-visibility-status>
            {
              !model.visibilityData.isHidden
                ? <FormattedMessage id="ui-eholdings.yes" />
                : <FormattedMessage id="ui-eholdings.package.visibility.no" values={{ visibilityMessage }} />
            }
          </div>
        </KeyValue>
        {
          !model.isCustom && (
            <KeyValue label={<FormattedMessage id="ui-eholdings.package.packageAllowToAddTitles" />}>
              <div>
                {
                  packageAllowedToAddTitles !== null
                    ? (
                      <div data-test-eholdings-package-details-allow-add-new-titles>
                        {packageAllowedToAddTitles ?
                          (<FormattedMessage id="ui-eholdings.yes" />)
                          :
                          (<FormattedMessage id="ui-eholdings.no" />)}
                      </div>
                    )
                    : (
                      <div>
                        <Icon icon="spinner-ellipsis" />
                      </div>
                    )
                }
              </div>
            </KeyValue>
          )
        }
        {
          isProxyAvailable
            ? (
              <ProxyDisplay
                proxy={model.proxy}
                proxyTypes={proxyTypes}
                inheritedProxyId={provider.proxy && provider.proxy.id}
              />
            )
            : <Icon icon="spinner-ellipsis" />
        }
        {
          <div data-test-eholdings-access-type>
            {haveAccessTypesLoaded
              ? this.renderAccessTypeDisplay()
              : <Icon icon="spinner-ellipsis" />
            }
          </div>
        }
        {
          hasProviderToken && (
            provider.isLoading
              ? <Icon icon="spinner-ellipsis" />
              : (
                <KeyValue label={<FormattedMessage id="ui-eholdings.provider.token" />}>
                  <TokenDisplay
                    token={provider.providerToken}
                    type="provider"
                  />
                </KeyValue>
              )
          )
        }
        {
          hasPackageToken && (
            model.isLoading
              ? <Icon icon="spinner-ellipsis" />
              : (
                <KeyValue label={<FormattedMessage id="ui-eholdings.package.token" />}>
                  <TokenDisplay
                    token={model.packageToken}
                    type="package"
                  />
                </KeyValue>
              )
          )
        }
      </div>
    );
  }

  getBodyContent() {
    const {
      model,
      tagsModel,
      updateFolioTags,
      stripes,
      fetchPackageCostPerUse,
      fetchCostPerUsePackageTitles,
      loadMoreCostPerUsePackageTitles,
      costPerUse,
    } = this.props;

    const {
      sections,
      packageSelected,
    } = this.state;

    return (
      <>
        <TagsAccordion
          id="packageShowTags"
          model={model}
          onToggle={this.handleSectionToggle}
          open={sections.packageShowTags}
          tagsModel={tagsModel}
          updateFolioTags={updateFolioTags}
        />

        <Accordion
          label={(
            <Headline
              size="large"
              tag="h3"
            >
              <FormattedMessage id="ui-eholdings.label.holdingStatus" />
            </Headline>
          )}
          open={sections.packageShowHoldingStatus}
          id="packageShowHoldingStatus"
          onToggle={this.handleSectionToggle}
        >
          <SelectionStatus
            model={model}
            onAddToHoldings={this.toggleSelectionConfirmationModal}
          />
        </Accordion>

        <Accordion
          label={(
            <Headline
              size="large"
              tag="h3"
            >
              <FormattedMessage id="ui-eholdings.label.packageInformation" />
            </Headline>
          )}
          open={sections.packageShowInformation}
          id="packageShowInformation"
          onToggle={this.handleSectionToggle}
        >
          <KeyValueColumns>
            <div>
              <KeyValue label={<FormattedMessage id="ui-eholdings.package.provider" />}>
                <div data-test-eholdings-package-details-provider>
                  <InternalLink to={`/eholdings/providers/${model.providerId}`}>
                    {model.providerName}
                  </InternalLink>
                </div>
              </KeyValue>

              {
                model.contentType && (
                  <KeyValue label={<FormattedMessage id="ui-eholdings.package.contentType" />}>
                    <div data-test-eholdings-package-details-content-type>
                      {model.contentType}
                    </div>
                  </KeyValue>
                )
              }

              {
                model.packageType && (
                  <KeyValue label={<FormattedMessage id="ui-eholdings.package.packageType" />}>
                    <div data-test-eholdings-package-details-type>
                      {model.packageType}
                    </div>
                  </KeyValue>
                )
              }
            </div>

            <div>
              <KeyValue label={<FormattedMessage id="ui-eholdings.package.titlesSelected" />}>
                <div data-test-eholdings-package-details-titles-selected>
                  <FormattedNumber value={model.selectedCount} />
                </div>
              </KeyValue>

              <KeyValue label={<FormattedMessage id="ui-eholdings.package.totalTitles" />}>
                <div data-test-eholdings-package-details-titles-total>
                  <FormattedNumber value={model.titleCount} />
                </div>
              </KeyValue>
            </div>
          </KeyValueColumns>
        </Accordion>

        <Accordion
          label={(
            <Headline
              size="large"
              tag="h3"
            >
              <FormattedMessage id="ui-eholdings.package.packageSettings" />
            </Headline>
          )}
          open={sections.packageShowSettings}
          id="packageShowSettings"
          onToggle={this.handleSectionToggle}
        >
          {
            packageSelected
              ? this.renderPackageSettings()
              : <p><FormattedMessage id="ui-eholdings.package.visibility.notSelected" /></p>
          }
        </Accordion>

        <Accordion
          label={(
            <Headline
              size="large"
              tag="h3"
            >
              <FormattedMessage id="ui-eholdings.package.coverageSettings" />
            </Headline>
          )}
          closedByDefault={!packageSelected}
          open={sections.packageShowCoverageSettings}
          id="packageShowCoverageSettings"
          onToggle={this.handleSectionToggle}
        >
          {
            packageSelected
              ? (
                <div>
                  {
                    model.customCoverage.beginCoverage
                      ? (
                        <div>
                          <KeyValue label={<FormattedMessage id="ui-eholdings.package.customCoverageDates" />}>
                            <div data-test-eholdings-package-details-custom-coverage-display>
                              <FormattedDate
                                value={model.customCoverage.beginCoverage}
                                timeZone="UTC"
                                year="numeric"
                                month="numeric"
                                day="numeric"
                              />
                              &nbsp;-&nbsp;
                              {
                                (model.customCoverage.endCoverage)
                                  ? (
                                    <FormattedDate
                                      value={model.customCoverage.endCoverage}
                                      timeZone="UTC"
                                      year="numeric"
                                      month="numeric"
                                      day="numeric"
                                    />
                                  )
                                  : <FormattedMessage id="ui-eholdings.date.present" />
                              }
                            </div>
                          </KeyValue>
                        </div>
                      )
                      : <p><FormattedMessage id="ui-eholdings.package.customCoverage.notSet" /></p>
                  }
                </div>
              )
              : <p><FormattedMessage id="ui-eholdings.package.customCoverage.notSelected" /></p>
          }
        </Accordion>

        <AgreementsAccordion
          id="packageShowAgreements"
          stripes={stripes}
          refId={model.id}
          refType={entityAuthorityTypes.PACKAGE}
          isOpen={sections.packageShowAgreements}
          onToggle={this.handleSectionToggle}
          refName={model.name}
        />

        <NotesSmartAccordion
          id="packageShowNotes"
          open={sections.packageShowNotes}
          onToggle={this.handleSectionToggle}
          domainName={DOMAIN_NAME}
          entityName={model.name}
          entityType={entityTypes.PACKAGE}
          entityId={model.id}
          pathToNoteCreate={paths.NOTE_CREATE}
          pathToNoteDetails={paths.NOTES}
        />

        {packageSelected && (
          <UsageConsolidationAccordion
            id="packageShowUsageConsolidation"
            isOpen={sections.packageShowUsageConsolidation}
            onToggle={this.handleSectionToggle}
            onFilterSubmit={fetchPackageCostPerUse}
            onViewTitles={fetchCostPerUsePackageTitles}
            onLoadMoreTitles={loadMoreCostPerUsePackageTitles}
            recordType={entityTypes.PACKAGE}
            recordId={model.id}
            recordName={model.name}
            costPerUseData={costPerUse}
            isExportDisabled={model.selectedCount >= MAX_EXPORT_TITLE_LIMIT}
          />
        )}
      </>
    );
  }

  renderTitlesListItem = (item) => {
    return (
      <TitleListItem
        item={item.content}
        link={item.content && `/eholdings/resources/${item.content.id}`}
        showSelected
        headingLevel='h4'
      />
    );
  }

  renderTitlesList = (scrollable) => {
    const {
      packageTitles,
      fetchPackageTitles,
    } = this.props;

    return (
      <QueryList
        type="package-titles"
        fetch={fetchPackageTitles}
        collection={packageTitles}
        length={packageTitles.length}
        scrollable={scrollable}
        itemHeight={ITEM_HEIGHT}
        notFoundMessage={
          <QueryNotFound type="package-titles">
            <FormattedMessage id="ui-eholdings.notFound" />
          </QueryNotFound>
        }
        renderItem={this.renderTitlesListItem}
      />
    );
  }

  renderRemoveFromHoldingsButton(onToggle) {
    const {
      model: { isCustom },
    } = this.props;

    const translationId = isCustom
      ? 'ui-eholdings.package.deletePackage'
      : 'ui-eholdings.package.removeFromHoldings';

    return (
      <Button
        data-test-eholdings-package-remove-from-holdings-action
        buttonStyle="dropdownItem fullWidth"
        onClick={() => {
          onToggle();
          this.handleSelectionToggle();
        }}
      >
        <FormattedMessage id={translationId} />
      </Button>
    );
  }

  renderAddToHoldingsButton(onToggle) {
    const {
      model: { isPartiallySelected },
    } = this.props;

    const translationIdEnding = isPartiallySelected
      ? 'addAllToHoldings'
      : 'addPackageToHoldings';

    return (
      <IfPermission perm={PACKAGE_TITLE_SELECT_UNSELECT_PERMISSION}>
        <Button
          data-test-eholdings-package-add-to-holdings-action
          buttonStyle="dropdownItem fullWidth"
          onClick={() => {
            onToggle();
            this.toggleSelectionConfirmationModal();
          }}
        >
          <FormattedMessage id={`ui-eholdings.${translationIdEnding}`} />
        </Button>
      </IfPermission>
    );
  }

  toggleSelectionConfirmationModal = () => {
    this.setState(({ showSelectionConfirmationModal }) => ({
      showSelectionConfirmationModal: !showSelectionConfirmationModal,
    }));
  }

  renderSelectionConfirmationModal() {
    const {
      addPackageToHoldings,
      intl,
    } = this.props;

    const footer = (
      <ModalFooter>
        <Button
          data-test-confirm-package-selection
          buttonStyle="primary"
          onClick={() => {
            addPackageToHoldings();
            this.toggleSelectionConfirmationModal();
          }}
        >
          <FormattedMessage id="ui-eholdings.selectPackage.confirmationModal.confirmationButtonText" />
        </Button>
        <Button
          data-test-cancel-package-selection
          onClick={this.toggleSelectionConfirmationModal}
        >
          <FormattedMessage id="ui-eholdings.cancel" />
        </Button>
      </ModalFooter>
    );

    return (
      <Modal
        open
        label={<FormattedMessage id="ui-eholdings.selectPackage.confirmationModal.label" />}
        aria-label={intl.formatMessage({ id: 'ui-eholdings.selectPackage.confirmationModal.label' })}
        footer={footer}
        size="small"
        id="package-selection-confirmation-modal"
      >
        <SafeHTMLMessage id="ui-eholdings.selectPackage.confirmationModal.message" />
      </Modal>
    );
  }

  toggleAllSections = (expand) => {
    this.setState((curState) => {
      const sections = expandAllFunction(curState.sections, expand);
      return { sections };
    });
  };

  render() {
    const {
      model,
      searchModal,
      isFreshlySaved,
      isNewRecord,
      isDestroyed,
      intl,
    } = this.props;

    const {
      showDeselectionModal,
      isCoverageEditable,
      sections,
      showSelectionConfirmationModal,
    } = this.state;

    const modalMessage = model.isCustom ?
      {
        header: <FormattedMessage id="ui-eholdings.package.modal.header.isCustom" />,
        label: intl.formatMessage({ id: 'ui-eholdings.package.modal.header.isCustom' }),
        body: <FormattedMessage id="ui-eholdings.package.modal.body.isCustom" />,
        buttonConfirm: <FormattedMessage id="ui-eholdings.package.modal.buttonConfirm.isCustom" />,
        buttonCancel: <FormattedMessage id="ui-eholdings.package.modal.buttonCancel.isCustom" />
      } :
      {
        header: <FormattedMessage id="ui-eholdings.package.modal.header" />,
        label: intl.formatMessage({ id: 'ui-eholdings.package.modal.header' }),
        body: <FormattedMessage id="ui-eholdings.package.modal.body" />,
        buttonConfirm: <FormattedMessage id="ui-eholdings.package.modal.buttonConfirm" />,
        buttonCancel: <FormattedMessage id="ui-eholdings.package.modal.buttonCancel" />
      };

    const toasts = [
      ...processErrors(model),
    ];

    // if coming from creating a new custom package, show a success toast
    if (isNewRecord) {
      toasts.push({
        id: `success-package-creation-${model.id}`,
        message: <FormattedMessage id="ui-eholdings.package.toast.isNewRecord" />,
        type: 'success'
      });
    }

    // if coming from destroying a custom or managed title
    // from within custom-package, show a success toast
    if (isDestroyed) {
      toasts.push({
        id: `success-resource-destruction-${model.id}`,
        message: <FormattedMessage id="ui-eholdings.package.toast.isDestroyed" />,
        type: 'success'
      });
    }

    // if coming from saving edits to the package, show a success toast
    if (isFreshlySaved) {
      toasts.push({
        id: `success-package-saved-${model.id}`,
        message: <FormattedMessage id="ui-eholdings.package.toast.isFreshlySaved" />,
        type: 'success'
      });
    }

    return (
      <KeyShortcutsWrapper
        toggleAllSections={this.toggleAllSections}
        onEdit={this.props.onEdit}
        isPermission={this.hasEditPermission()}
      >
        <Toaster
          toasts={toasts}
          position="bottom"
        />
        <DetailsView
          type="package"
          model={model}
          key={model.id}
          paneTitle={model.name}
          actionMenu={this.getActionMenu()}
          sections={sections}
          handleExpandAll={this.handleExpandAll}
          searchModal={searchModal}
          bodyContent={this.getBodyContent()}
          listType={listTypes.TITLES}
          listSectionId="packageShowTitles"
          onListToggle={this.handleSectionToggle}
          resultsLength={model.resources.length}
          renderList={this.renderTitlesList}
          ariaRole="tablist"
          bodyAriaRole="tab"
        />
        <Modal
          open={showDeselectionModal}
          size="small"
          label={modalMessage.header}
          aria-label={modalMessage.label}
          id="eholdings-package-confirmation-modal"
          footer={(
            <ModalFooter>
              <Button
                data-test-eholdings-package-deselection-confirmation-modal-yes
                buttonStyle="primary"
                onClick={this.commitSelectionToggle}
              >
                {modalMessage.buttonConfirm}
              </Button>
              <Button
                data-test-eholdings-package-deselection-confirmation-modal-no
                onClick={this.cancelSelectionToggle}
              >
                {modalMessage.buttonCancel}
              </Button>
            </ModalFooter>
          )}
        >
          {modalMessage.body}
        </Modal>
        {showSelectionConfirmationModal && this.renderSelectionConfirmationModal()}
        <NavigationModal when={isCoverageEditable} />
      </KeyShortcutsWrapper>
    );
  }
}

export default withStripes(injectIntl(PackageShow));
