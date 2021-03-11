import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
} from 'react-intl';
import hasIn from 'lodash/fp/hasIn';

import {
  Accordion,
  Headline,
  KeyValue,
  Icon,
} from '@folio/stripes/components';

import ProxyDisplay from '../../../../proxy-display';
import TokenDisplay from '../../../../token-display';
import AccessType from '../../../../access-type-display';

import {
  getAccessTypeId,
  getAccessTypeIdsAndNames,
} from '../../../../utilities';
import {
  accessTypesReduxStateShape,
} from '../../../../../constants';

const propTypes = {
  accessStatusTypes: accessTypesReduxStateShape.isRequired,
  isOpen: PropTypes.bool.isRequired,
  model: PropTypes.object.isRequired,
  onToggle: PropTypes.func.isRequired,
  packageAllowedToAddTitles: PropTypes.bool.isRequired,
  packageSelected: PropTypes.bool.isRequired,
  provider: PropTypes.object.isRequired,
  proxyTypes: PropTypes.object.isRequired,
};

const PackageSettings = ({
  isOpen,
  onToggle,
  model,
  proxyTypes,
  provider,
  accessStatusTypes,
  packageAllowedToAddTitles,
  packageSelected,
}) => {
  const renderAccessTypeDisplay = () => {
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
  };

  const renderPackageSettings = () => {
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
              ? renderAccessTypeDisplay()
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
  };

  return (
    <Accordion
      label={(
        <Headline
          size="large"
          tag="h3"
        >
          <FormattedMessage id="ui-eholdings.package.packageSettings" />
        </Headline>
      )}
      open={isOpen}
      id="packageShowSettings"
      onToggle={onToggle}
    >
      {
        packageSelected
          ? renderPackageSettings()
          : <p><FormattedMessage id="ui-eholdings.package.visibility.notSelected" /></p>
      }
    </Accordion>
  );
};

PackageSettings.propTypes = propTypes;

export default PackageSettings;