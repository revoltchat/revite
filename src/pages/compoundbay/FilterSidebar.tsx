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
}) => {
    return (
        <div className={styles.filterSidebar}>
            <h2>Filters</h2>

            <div className={styles.filterSection}>
                <h3>Vendor Rating</h3>
                <select
                    value={vendorRating}
                    onChange={(e) => handleVendorRatingChange(e.target.value)}>
                    <option value="">All</option>
                    <option value="A">A</option>
                    <option value="AA">AA</option>
                    <option value="AAA">AAA</option>
                </select>
            </div>

            <div className={styles.filterSection}>
                <h3>Vendor</h3>
                <select
                    value={vendor}
                    onChange={(e) => handleVendorChange(e.target.value)}>
                    <option value="">All</option>
                    {vendorOptions.map((v) => (
                        <option key={v} value={v}>
                            {v}
                        </option>
                    ))}
                </select>
            </div>

            <div className={styles.filterSection}>
                <h3>Ships from Country</h3>
                <select
                    value={shipsFromCountry}
                    onChange={(e) =>
                        handleShipsFromCountryChange(e.target.value)
                    }>
                    <option value="">All</option>
                    {countryOptions.map((c) => (
                        <option key={c} value={c}>
                            {c}
                        </option>
                    ))}
                </select>
            </div>

            <div className={styles.filterSection}>
                <h3>Compound</h3>
                <select
                    value={compound}
                    onChange={(e) => handleCompoundChange(e.target.value)}>
                    <option value="">All</option>
                    {compoundOptions.map((c) => (
                        <option key={c} value={c}>
                            {c}
                        </option>
                    ))}
                </select>
            </div>

            <button onClick={clearFilters} className={styles.clearFilters}>
                Clear Filters
            </button>
        </div>
    );
};

export default FilterSidebar;
