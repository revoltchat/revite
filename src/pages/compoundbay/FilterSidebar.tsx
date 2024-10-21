import React from "react";

import styles from "./FilterSidebar.module.scss";

interface FilterSidebarProps {
    vendorRating: string;
    vendor: string;
    shipsFromCountry: string;
    compound: string;
    handleVendorRatingChange: (rating: string) => void;
    handleVendorChange: (vendor: string) => void;
    handleShipsFromCountryChange: (country: string) => void;
    handleCompoundChange: (compound: string) => void;
    clearFilters: () => void;
    vendorOptions: string[];
    countryOptions: string[];
    compoundOptions: string[];
    vendorRatingOptions: string[];
    isMobileFilterVisible: boolean;
    toggleMobileFilter: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
    vendorRating,
    vendor,
    shipsFromCountry,
    compound,
    handleVendorRatingChange,
    handleVendorChange,
    handleShipsFromCountryChange,
    handleCompoundChange,
    clearFilters,
    vendorOptions,
    countryOptions,
    compoundOptions,
    vendorRatingOptions,
    isMobileFilterVisible,
    toggleMobileFilter,
}) => {
    const renderFilterSection = (
        title: string,
        value: string,
        options: string[],
        handleChange: (value: string) => void,
    ) => (
        <div className={styles.filterSection}>
            <h3>{title}</h3>
            <select
                value={value}
                onChange={(e) => handleChange(e.target.value)}>
                <option value="">All</option>
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );

    return (
        <div
            className={`${styles.filterSidebar} ${
                isMobileFilterVisible ? styles.visible : ""
            }`}>
            <button
                className={styles.closeMobileFilter}
                onClick={toggleMobileFilter}>
                Close
            </button>
            <h2>Filters</h2>

            {renderFilterSection(
                "Vendor Rating",
                vendorRating,
                vendorRatingOptions,
                handleVendorRatingChange,
            )}
            {renderFilterSection(
                "Vendor",
                vendor,
                vendorOptions,
                handleVendorChange,
            )}
            {renderFilterSection(
                "Ships from Country",
                shipsFromCountry,
                countryOptions,
                handleShipsFromCountryChange,
            )}
            {renderFilterSection(
                "Compound",
                compound,
                compoundOptions,
                handleCompoundChange,
            )}

            <button onClick={clearFilters} className={styles.clearFilters}>
                Clear Filters
            </button>
        </div>
    );
};

export default FilterSidebar;
