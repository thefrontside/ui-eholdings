import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';

import {
  MultiColumnList,
  KeyValue,
} from '@folio/stripes/components';

import { getSummaryTableColumnProperties } from './column-properties';
import { costPerUse as costPerUseShape } from '../../../constants';

const propTypes = {
  contentData: PropTypes.array,
  costPerUseData: costPerUseShape.CostPerUseReduxStateShape.isRequired,
  costPerUseType: PropTypes.string.isRequired,
  customProperties: PropTypes.object,
  entityType: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  isExportDisabled: PropTypes.bool,
  metricType: PropTypes.string,
  onExportTitles: PropTypes.func,
  onViewTitles: PropTypes.func,
};

const SummaryTable = ({
  costPerUseData,
  customProperties,
  id,
  costPerUseType,
  onViewTitles,
  entityType,
  metricType,
  onExportTitles,
  isExportDisabled,
  ...rest
}) => {
  const intl = useIntl();
  const data = costPerUseData.data[costPerUseType];
  if (!data) {
    return null;
  }

  const currency = data?.attributes?.parameters?.currency;

  const {
    cost,
    costPerUse,
    usage,
  } = data?.attributes?.analysis;

  const contentData = rest.contentData || [{ cost, costPerUse, usage }];

  return (
    <KeyValue>
      <MultiColumnList
        id={id}
        contentData={contentData}
        {...getSummaryTableColumnProperties(intl, customProperties, {
          currency,
          metricType,
          entityType,
        })}
        {...rest}
      />
    </KeyValue>
  );
};

SummaryTable.defaultProps = {
  isExportDisabled: false,
  onExportTitles: () => {},
  onViewTitles: () => {},
};

SummaryTable.propTypes = propTypes;

export default SummaryTable;