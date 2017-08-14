import React, { Component } from 'react';
import PropTypes from 'prop-types';
import fetch from 'isomorphic-fetch';

import View from '../../components/vendor-show';

export default class VendorShowRoute extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        vendorId: PropTypes.string.isRequired
      }).isRequired
    }).isRequired,
    resources: PropTypes.shape({
      showVendor: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object)
      }),
      showVendorPackages: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object)
      })
    })
  };

  static manifest = Object.freeze({
    showVendor: {
      type: 'okapi',
      path: 'eholdings/vendors/:{vendorId}',
      pk: 'vendorId'
    },
    showVendorPackages: {
      type: 'okapi',
      path: 'eholdings/vendors/:{vendorId}/packages',
      records: 'packageList',
      pk: 'packageId'
    }
  });

  render() {
    return (
      <View
          vendor={this.getVendor()}
          vendorPackages={this.getVendorPackages()}/>
    );
  }

  getVendor() {
    const {
      resources: { showVendor },
      match: { params: { vendorId } }
    } = this.props;

    if (!showVendor || !vendorId) {
      return null;
    }

    return showVendor.records.find((vendor) => {
      return vendor.vendorId === vendorId;
    });
  }

  getVendorPackages() {
    const {
      resources: { showVendorPackages },
      match: { params: { vendorId } }
    } = this.props;

    if (!showVendorPackages || !vendorId) {
      return null;
    }

    return showVendorPackages.records.filter((pkg) => {
      return pkg.vendorId === vendorId;
    });
  }
}
