import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import styles from './package-list-item.css';
import Link from '../link';

const cx = classNames.bind(styles);

export default function PackageListItem({
  item,
  link,
  showTitleCount,
  showVendorName,
  packageName
}, {
  intl
}) {
  return !item ? (
    <div
      className={cx('skeleton', {
        'is-vendor-name-visible': showVendorName,
        'is-title-count-visible': showTitleCount
      })}
    />
  ) : (
    <Link to={link} className={styles.item}>
      <h5 data-test-eholdings-package-list-item-name>
        {packageName || item.name}
      </h5>

      {showVendorName && (
        <div data-test-eholdings-package-list-item-vendor-name>
          {item.vendorName}
        </div>
      )}

      <div>
        <span data-test-eholdings-package-list-item-selected>
          {item.isSelected ? 'Selected' : 'Not Selected'}
        </span>

        {showTitleCount && (
          <span>
            &nbsp;&bull;&nbsp;

            <span data-test-eholdings-package-list-item-num-titles-selected>
              {intl.formatNumber(item.selectedCount)}
            </span>

            &nbsp;/&nbsp;

            <span data-test-eholdings-package-list-item-num-titles>
              {intl.formatNumber(item.titleCount)}
            </span>

            &nbsp;

            <span>{item.titleCount === 1 ? 'Title' : 'Titles'}</span>
          </span>
        )}
        {item.visibilityData.isHidden && (
          <span>
              &nbsp;&bull;&nbsp;
            <span data-test-eholdings-package-list-item-title-hidden>
              {'Hidden'}
            </span>
          </span>
        )}
      </div>
    </Link>
  );
}

PackageListItem.propTypes = {
  item: PropTypes.object,
  link: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object
  ]),
  showTitleCount: PropTypes.bool,
  showVendorName: PropTypes.bool,
  packageName: PropTypes.string
};

PackageListItem.contextTypes = {
  intl: PropTypes.object
};
