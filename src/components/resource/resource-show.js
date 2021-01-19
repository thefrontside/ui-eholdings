import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import update from 'lodash/fp/update';
import set from 'lodash/fp/set';

import {
  IfPermission,
  withStripes,
} from '@folio/stripes-core';

import { NotesSmartAccordion } from '@folio/stripes/smart-components';

import {
  Accordion,
  Button,
  Headline,
  Icon,
  KeyValue,
  Modal,
  ModalFooter
} from '@folio/stripes/components';

import {
  entityAuthorityTypes,
  entityTypes,
  paths,
  DOMAIN_NAME,
  accessTypesReduxStateShape,
} from '../../constants';
import DetailsView from '../details-view';
import InternalLink from '../internal-link';
import ExternalLink from '../external-link/external-link';
import IdentifiersList from '../identifiers-list';
import ContributorsList from '../contributors-list';
import CoverageDateList from '../coverage-date-list';
import { AgreementsAccordion, CustomLabelsAccordion } from '../../features';
import {
  isBookPublicationType,
  isValidCoverageList,
  processErrors,
  getUserDefinedFields,
  getAccessTypeId,
  getAccessTypeIdsAndNames,
} from '../utilities';
import Toaster from '../toaster';
import TagsAccordion from '../tags';
import KeyValueColumns from '../key-value-columns';
import ProxyDisplay from '../proxy-display';
import AccessTypeDisplay from '../access-type-display';
import { CustomLabelsShowSection } from '../custom-labels-section';

class ResourceShow extends Component {
  static propTypes = {
    accessStatusTypes: accessTypesReduxStateShape.isRequired,
    isFreshlySaved: PropTypes.bool,
    model: PropTypes.object.isRequired,
    onEdit: PropTypes.func.isRequired,
    proxyTypes: PropTypes.object.isRequired,
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func.isRequired,
    }),
    tagsModel: PropTypes.object,
    toggleSelected: PropTypes.func.isRequired,
    updateFolioTags: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      showSelectionModal: false,
      resourceSelected: this.props.model.isSelected,
      sections: {
        resourceShowTags: true,
        resourceShowHoldingStatus: true,
        resourceShowInformation: true,
        resourceShowCustomLabels: true,
        resourceShowSettings: true,
        resourceShowCoverageSettings: true,
        resourceShowAgreements: true,
        resourceShowNotes: true,
      },
    };
  }

  static getDerivedStateFromProps({ model }, prevState) {
    return !model.isSaving ?
      { resourceSelected: model.isSelected } :
      prevState;
  }

  handleHoldingStatus = () => {
    if (this.props.model.isSelected) {
      this.setState({ showSelectionModal: true });
    } else {
      this.props.toggleSelected();
    }
  };

  commitSelectionToggle = () => {
    this.setState({
      showSelectionModal: false,
      resourceSelected: false
    });
    this.props.toggleSelected();
  };

  cancelSelectionToggle = () => {
    this.setState({
      showSelectionModal: false,
      resourceSelected: this.props.model.isSelected
    });
  };

  handleSectionToggle = ({ id }) => {
    const next = update(`sections.${id}`, value => !value, this.state);
    this.setState(next);
  }

  handleExpandAll = (sections) => {
    const next = set('sections', sections, this.state);
    this.setState(next);
  }

  getActionMenu = () => {
    const {
      onEdit,
      stripes,
    } = this.props;
    const { resourceSelected } = this.state;

    const hasEditPermission = stripes.hasPerm('ui-eholdings.records.edit');
    const hasCreateAndDeletePermission = stripes.hasPerm('ui-eholdings.titles-packages.create-delete');
    const hasSelectionPermission = stripes.hasPerm('ui-eholdings.package-title.select-unselect');
    const canEdit = (hasEditPermission || hasCreateAndDeletePermission) && resourceSelected;
    const canSelectAndUnselect = hasSelectionPermission || hasCreateAndDeletePermission;
    const isMenuNeeded = canEdit || hasSelectionPermission;

    if (!isMenuNeeded) return null;

    return ({ onToggle }) => (
      <>
        {canEdit &&
          <Button
            buttonStyle="dropdownItem fullWidth"
            data-test-eholdings-resource-edit-link
            onClick={onEdit}
          >
            <FormattedMessage id="ui-eholdings.actionMenu.edit" />
          </Button>}
        {canSelectAndUnselect && this.renderSelectionButton(onToggle)}
      </>
    );
  }

  renderSelectionButton(onToggle) {
    const { resourceSelected } = this.state;

    return (
      resourceSelected
        ? (
          <Button
            data-test-eholdings-remove-resource-from-holdings
            buttonStyle="dropdownItem fullWidth"
            onClick={() => {
              onToggle();
              this.handleHoldingStatus();
            }}
          >
            <FormattedMessage id="ui-eholdings.resource.actionMenu.removeHolding" />
          </Button>
        )
        : (
          <Button
            data-test-eholdings-add-resource-to-holdings
            buttonStyle="dropdownItem fullWidth"
            onClick={() => {
              onToggle();
              this.handleHoldingStatus();
            }}
          >
            <FormattedMessage id="ui-eholdings.resource.actionMenu.addHolding" />
          </Button>
        )
    );
  }

  renderAccessTypeDisplay() {
    const { model, accessStatusTypes } = this.props;

    if (!accessStatusTypes?.items?.data?.length) {
      return null;
    }

    const formattedAccessTypes = getAccessTypeIdsAndNames(accessStatusTypes.items.data);

    return (
      <AccessTypeDisplay
        accessTypeId={getAccessTypeId(model)}
        accessStatusTypes={formattedAccessTypes}
      />
    );
  }

  render() {
    const {
      model,
      proxyTypes,
      isFreshlySaved,
      tagsModel,
      updateFolioTags,
      stripes,
      accessStatusTypes,
    } = this.props;

    const {
      showSelectionModal,
      resourceSelected,
      sections
    } = this.state;

    const userDefinedFields = getUserDefinedFields(model);
    const showCustomLables = model.isTitleCustom || model.isSelected;

    const isSelectInFlight = model.update.isPending && 'isSelected' in model.update.changedAttributes;
    const visibilityMessage = model.package.visibilityData.isHidden ?
      <FormattedMessage id="ui-eholdings.resource.visibilityData.isHidden" /> :
      model.visibilityData.reason && `(${model.visibilityData.reason})`;

    const hasManagedCoverages = model.managedCoverages.length > 0 &&
      isValidCoverageList(model.managedCoverages);
    const hasManagedEmbargoPeriod = model.managedEmbargoPeriod &&
      model.managedEmbargoPeriod.embargoUnit &&
      model.managedEmbargoPeriod.embargoValue;
    const hasCustomEmbargoPeriod = model.customEmbargoPeriod &&
      model.customEmbargoPeriod.embargoUnit &&
      model.customEmbargoPeriod.embargoValue;
    const hasCustomCoverages = model.customCoverages.length > 0 &&
      isValidCoverageList(model.customCoverages);
    const hasInheritedProxy = model.package &&
      model.package.proxy &&
      model.package.proxy.id;
    const isTokenNeeded = model.data.attributes && model.data.attributes.isTokenNeeded;

    const toasts = processErrors(model);
    const addToEholdingsButtonIsAvailable = (!resourceSelected && !isSelectInFlight)
      || (!model.isSelected && isSelectInFlight);
    const haveAccessTypesLoaded = !accessStatusTypes?.isLoading && !model.isLoading;

    // if coming from updating any value on managed title in a managed package
    // show a success toast
    if (isFreshlySaved) {
      toasts.push({
        id: `success-package-creation-${model.id}`,
        message: <FormattedMessage id="ui-eholdings.resource.toast.isFreshlySaved" />,
        type: 'success'
      });
    }

    return (
      <>
        <Toaster toasts={toasts} position="bottom" />

        <DetailsView
          type="resource"
          model={model}
          paneTitle={model.title.name}
          paneSub={model.package.name}
          actionMenu={this.getActionMenu()}
          sections={sections}
          handleExpandAll={this.handleExpandAll}
          ariaRole="tablist"
          bodyAriaRole="tab"
          bodyContent={(
            <>
              <TagsAccordion
                id="resourceShowTags"
                model={model}
                onToggle={this.handleSectionToggle}
                open={sections.resourceShowTags}
                tagsModel={tagsModel}
                updateFolioTags={updateFolioTags}
              />

              <Accordion
                label={<Headline size="large" tag="h3"><FormattedMessage id="ui-eholdings.label.holdingStatus" /></Headline>}
                open={sections.resourceShowHoldingStatus}
                id="resourceShowHoldingStatus"
                onToggle={this.handleSectionToggle}
              >
                <label
                  data-test-eholdings-resource-show-selected
                  htmlFor="resource-show-toggle-switch"
                >
                  {
                    model.update.isPending
                      ? (
                        <Icon icon='spinner-ellipsis' />
                      )
                      : (
                        <Headline margin="none">
                          {
                            resourceSelected
                              ? (
                                <FormattedMessage id="ui-eholdings.selected" />
                              )
                              : (
                                <FormattedMessage id="ui-eholdings.notSelected" />
                              )
                          }
                        </Headline>
                      )
                  }
                  <br />
                  {
                    addToEholdingsButtonIsAvailable && (
                      <IfPermission perm="ui-eholdings.package-title.select-unselect">
                        <Button
                          buttonStyle="primary"
                          onClick={this.handleHoldingStatus}
                          disabled={model.destroy.isPending || isSelectInFlight}
                          data-test-eholdings-resource-add-to-holdings-button
                        >
                          <FormattedMessage id="ui-eholdings.addToHoldings" />
                        </Button>
                      </IfPermission>
                    )
                  }
                </label>
              </Accordion>

              <Accordion
                label={<Headline size="large" tag="h3"><FormattedMessage id="ui-eholdings.resource.resourceInformation" /></Headline>}
                open={sections.resourceShowInformation}
                id="resourceShowInformation"
                onToggle={this.handleSectionToggle}
              >
                <KeyValueColumns>
                  <div>
                    <KeyValue label={<FormattedMessage id="ui-eholdings.label.title" />}>
                      <InternalLink to={`/eholdings/titles/${model.titleId}`}>
                        {model.title.name}
                      </InternalLink>
                    </KeyValue>

                    {model.title.edition && (
                      <KeyValue label={<FormattedMessage id="ui-eholdings.label.edition" />}>
                        <div data-test-eholdings-resource-show-edition>
                          {model.title.edition}
                        </div>
                      </KeyValue>
                    )}

                    <ContributorsList data={model.title.contributors} />

                    {model.title.publisherName && (
                      <KeyValue label={<FormattedMessage id="ui-eholdings.label.publisher" />}>
                        <div data-test-eholdings-resource-show-publisher-name>
                          {model.title.publisherName}
                        </div>
                      </KeyValue>
                    )}

                    {model.title.publicationType && (
                      <KeyValue label={<FormattedMessage id="ui-eholdings.label.publicationType" />}>
                        <div data-test-eholdings-resource-show-publication-type>
                          {model.title.publicationType}
                        </div>
                      </KeyValue>
                    )}

                    <IdentifiersList data={model.title.identifiers} />

                    {model.title.subjects.length > 0 && (
                      <KeyValue label={<FormattedMessage id="ui-eholdings.label.subjects" />}>
                        <div data-test-eholdings-resource-show-subjects-list>
                          {model.title.subjects.map(subjectObj => subjectObj.subject).join('; ')}
                        </div>
                      </KeyValue>
                    )}

                    <KeyValue label={<FormattedMessage id="ui-eholdings.label.peerReviewed" />}>
                      <div data-test-eholdings-peer-reviewed-field>
                        {model.title.isPeerReviewed ?
                          (<FormattedMessage id="ui-eholdings.yes" />) :
                          (<FormattedMessage id="ui-eholdings.no" />)}
                      </div>
                    </KeyValue>

                    <KeyValue label={<FormattedMessage id="ui-eholdings.label.titleType" />}>
                      <div data-test-eholdings-package-details-type>
                        {model.title.isTitleCustom ?
                          (<FormattedMessage id="ui-eholdings.custom" />) :
                          (<FormattedMessage id="ui-eholdings.managed" />)}
                      </div>
                    </KeyValue>

                    {model.title.description && (
                      <KeyValue label={<FormattedMessage id="ui-eholdings.label.description" />}>
                        <div data-test-eholdings-description-field>
                          {model.title.description}
                        </div>
                      </KeyValue>
                    )}
                  </div>
                  <div>
                    <KeyValue label={<FormattedMessage id="ui-eholdings.label.package" />}>
                      <div data-test-eholdings-resource-show-package-name>
                        <InternalLink to={`/eholdings/packages/${model.packageId}`}>{model.package.name}</InternalLink>
                      </div>
                    </KeyValue>

                    {isTokenNeeded && (
                      <KeyValue label={<FormattedMessage id="ui-eholdings.package.tokenNeed" />}>
                        <Button
                          data-test-add-token-button
                          marginBottom0
                          to={`/eholdings/packages/${model.packageId}/edit`}
                        >
                          <FormattedMessage id="ui-eholdings.package.addToken" />
                        </Button>
                      </KeyValue>
                    )}

                    <KeyValue label={<FormattedMessage id="ui-eholdings.label.provider" />}>
                      <div data-test-eholdings-resource-show-provider-name>
                        <InternalLink to={`/eholdings/providers/${model.providerId}`}>{model.package.providerName}</InternalLink>
                      </div>
                    </KeyValue>

                    {model.package.contentType && (
                      <KeyValue label={<FormattedMessage id="ui-eholdings.resource.packageContentType" />}>
                        <div data-test-eholdings-resource-show-content-type>
                          {model.package.contentType}
                        </div>
                      </KeyValue>
                    )}
                  </div>
                </KeyValueColumns>
              </Accordion>

              {showCustomLables &&
                <CustomLabelsAccordion
                  id="resourceShowCustomLabels"
                  isOpen={sections.resourceShowCustomLabels}
                  onToggle={this.handleSectionToggle}
                  section={CustomLabelsShowSection}
                  userDefinedFields={userDefinedFields}
                />}

              <Accordion
                label={<Headline size="large" tag="h3"><FormattedMessage id="ui-eholdings.resource.resourceSettings" /></Headline>}
                open={sections.resourceShowSettings}
                id="resourceShowSettings"
                onToggle={this.handleSectionToggle}
              >
                <KeyValue label={<FormattedMessage id="ui-eholdings.label.showToPatrons" />}>
                  <div data-test-eholdings-resource-show-visibility>
                    {model.visibilityData.isHidden || !resourceSelected ?
                      (<FormattedMessage
                        id="ui-eholdings.package.visibility.no"
                        values={{ visibilityMessage }}
                      />) :
                      (<FormattedMessage id="ui-eholdings.yes" />)}
                  </div>
                </KeyValue>

                {
                  hasInheritedProxy && (
                    !proxyTypes.request.isResolved || model.isLoading
                      ? (
                        <Icon icon="spinner-ellipsis" />
                      )
                      : (
                        <ProxyDisplay
                          model={model}
                          proxyTypes={proxyTypes}
                          inheritedProxyId={model.package.proxy.id}
                        />
                      )
                  )
                }

                {model.url && (
                  <KeyValue label={model.title.isTitleCustom ?
                    <FormattedMessage id="ui-eholdings.custom" />
                    :
                    <FormattedMessage id="ui-eholdings.managed" />}
                  >
                    <div data-test-eholdings-resource-show-url>
                      <ExternalLink
                        href={model.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    </div>
                  </KeyValue>
                )}

                {
                  <div data-test-eholdings-access-type>
                    {haveAccessTypesLoaded
                      ? this.renderAccessTypeDisplay()
                      : (
                        <Icon icon="spinner-ellipsis" />
                      )}
                  </div>
                }
              </Accordion>

              <Accordion
                label={<Headline size="large" tag="h3"><FormattedMessage id="ui-eholdings.label.coverageSettings" /></Headline>}
                open={sections.resourceShowCoverageSettings}
                id="resourceShowCoverageSettings"
                onToggle={this.handleSectionToggle}
              >

                {hasManagedCoverages && !hasCustomCoverages && (
                  <KeyValue label={<FormattedMessage id="ui-eholdings.label.managed.coverageDates" />}>
                    <div data-test-eholdings-resource-show-managed-coverage-list>
                      <CoverageDateList
                        coverageArray={model.managedCoverages}
                        isYearOnly={isBookPublicationType(model.publicationType)}
                      />
                    </div>
                  </KeyValue>
                )}

                {hasCustomCoverages && (
                  <KeyValue label={<FormattedMessage id="ui-eholdings.label.custom.coverageDates" />}>
                    <div data-test-eholdings-resource-show-custom-coverage-list>
                      <CoverageDateList
                        coverageArray={model.customCoverages}
                        isYearOnly={isBookPublicationType(model.publicationType)}
                      />
                    </div>
                  </KeyValue>
                )}

                {model.coverageStatement && (
                  <KeyValue label={<FormattedMessage id="ui-eholdings.label.custom.coverageStatement" />}>
                    <div data-test-eholdings-resource-coverage-statement-display>
                      {model.coverageStatement}
                    </div>
                  </KeyValue>
                )}

                {hasManagedEmbargoPeriod && !hasCustomEmbargoPeriod && (
                  <KeyValue label={<FormattedMessage id="ui-eholdings.label.managed.embargoPeriod" />}>
                    <div data-test-eholdings-resource-show-managed-embargo-period>
                      <FormattedMessage
                        id={`ui-eholdings.resource.embargoUnit.${model.managedEmbargoPeriod.embargoUnit}`}
                        values={{ value: model.managedEmbargoPeriod.embargoValue }}
                      />
                    </div>
                  </KeyValue>
                )}

                {hasCustomEmbargoPeriod && (
                  <KeyValue label={<FormattedMessage id="ui-eholdings.label.custom.embargoPeriod" />}>
                    <div data-test-eholdings-resource-custom-embargo-display>
                      <FormattedMessage
                        id={`ui-eholdings.resource.embargoUnit.${model.customEmbargoPeriod.embargoUnit}`}
                        values={{ value: model.customEmbargoPeriod.embargoValue }}
                      />
                    </div>
                  </KeyValue>
                )}

                {
                  resourceSelected &&
                  !hasManagedCoverages &&
                  !hasCustomCoverages &&
                  !model.coverageStatement &&
                  !hasManagedEmbargoPeriod &&
                  !hasCustomEmbargoPeriod && (
                    <p data-test-eholdings-resource-not-selected-no-customization-message>
                      <FormattedMessage id="ui-eholdings.resource.coverage.noCustomizations" />
                    </p>
                  )
                }

                {!resourceSelected && !hasManagedCoverages && !hasManagedEmbargoPeriod && (
                  <p data-test-eholdings-resource-not-selected-coverage-message>
                    <FormattedMessage id="ui-eholdings.resource.coverage.notSelected" />
                  </p>
                )}
              </Accordion>

              <AgreementsAccordion
                id="resourceShowAgreements"
                stripes={stripes}
                refId={model.id}
                refType={entityAuthorityTypes.RESOURCE}
                isOpen={sections.resourceShowAgreements}
                onToggle={this.handleSectionToggle}
                refName={model.title.name}
              />

              <NotesSmartAccordion
                id="resourceShowNotes"
                open={sections.resourceShowNotes}
                onToggle={this.handleSectionToggle}
                domainName={DOMAIN_NAME}
                entityName={model.name}
                entityType={entityTypes.RESOURCE}
                entityId={model.id}
                pathToNoteCreate={paths.NOTE_CREATE}
                pathToNoteDetails={paths.NOTES}
              />
            </>
          )}
        />

        <Modal
          open={showSelectionModal}
          size="small"
          label={<FormattedMessage id="ui-eholdings.resource.show.modal.header" />}
          id="eholdings-resource-deselection-confirmation-modal"
          footer={(
            <ModalFooter>
              <Button
                data-test-eholdings-resource-deselection-confirmation-modal-yes
                buttonStyle="primary"
                onClick={this.commitSelectionToggle}
              >
                <FormattedMessage id="ui-eholdings.resource.modal.buttonConfirm" />
              </Button>
              <Button
                data-test-eholdings-resource-deselection-confirmation-modal-no
                onClick={this.cancelSelectionToggle}
              >
                <FormattedMessage id="ui-eholdings.resource.modal.buttonCancel" />
              </Button>
            </ModalFooter>
          )}
        >
          {
            /*
               we use <= here to account for the case where a user
               selects and then immediately deselects the
               resource
            */
            model.package.titleCount <= 1 && model.title.isTitleCustom
              ? (
                <span data-test-eholdings-deselect-final-title-warning>
                  <FormattedMessage id="ui-eholdings.resource.modal.body.isCustom.lastTitle" />
                </span>
              )
              : (
                <span data-test-eholdings-deselect-title-warning>
                  <FormattedMessage id="ui-eholdings.resource.show.modal.body" />
                </span>
              )
          }
        </Modal>
      </>
    );
  }
}

export default withStripes(ResourceShow);
