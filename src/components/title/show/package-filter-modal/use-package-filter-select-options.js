import { useState, useMemo } from 'react';

const getOptionsFromPackageList = packages => packages.map(({ id, packageName }) => ({ value: id, label: packageName }));

const usePackageFilterSelectOptions = (allPackages, selectedPackages) => {
  const [searchFilters, setSearchFilters] = useState({});
  const [selectedOptions, setSelectedOptions] = useState(() => getOptionsFromPackageList(selectedPackages));
  const allOptions = useMemo(() => getOptionsFromPackageList(allPackages), [allPackages]);

  return {
    allOptions,
    selectedOptions,
    setSelectedOptions,
    searchFilters,
    setSearchFilters,
  };
};

export default usePackageFilterSelectOptions;
