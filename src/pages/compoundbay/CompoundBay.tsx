import { observer } from "mobx-react-lite";
import Papa from "papaparse";
import { useState, useEffect, useMemo } from "react";
import { FaSearch, FaFilter } from "react-icons/fa";

import styles from "./CompoundBay.module.scss";

import { GroupBuySale } from "../../types/groupBuySale";
import FilterSidebar from "./FilterSidebar";
import ResultsSidebar from "./ResultsSidebar";

const CSV_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQYEkd82Pu4ukikZXz-APjdT2LYpMP2htYYbD_zJHq0bCshqFIWKF9vOJFMrPxMb_wuODyadyTETly1/pub?gid=1445611808&single=true&output=csv";

const CompoundBay = observer(() => {
    const [groupBuySales, setGroupBuySales] = useState<GroupBuySale[]>([]);
    const [visibleGroupBuySales, setVisibleGroupBuySales] = useState<
        GroupBuySale[]
    >([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loadCount, setLoadCount] = useState(10);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filter states
    const [vendorRating, setVendorRating] = useState("");
    const [vendor, setVendor] = useState("");
    const [shipsFromCountry, setShipsFromCountry] = useState("");
    const [compound, setCompound] = useState("");
    const [isMobileFilterVisible, setIsMobileFilterVisible] = useState(false);

    const fetchGroupBuySales = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(CSV_URL);
            const csvText = await response.text();

            Papa.parse(csvText, {
                header: true,
                complete: (results) => {
                    const sales = results.data as GroupBuySale[];
                    setGroupBuySales(sales);
                    setVisibleGroupBuySales(sales.slice(0, loadCount));
                },
                error: (error) => {
                    console.error("Error parsing CSV:", error);
                    setError("Failed to parse group buy sales data.");
                },
            });
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Failed to fetch group buy sales data.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGroupBuySales();
        const intervalId = setInterval(fetchGroupBuySales, 15 * 60 * 1000); // Refresh every 15 minutes
        return () => clearInterval(intervalId);
    }, []);

    const filteredSales = useMemo(() => {
        return groupBuySales.filter((sale) => {
            return (
                (vendorRating === "" ||
                    sale["Vendor rating"] === vendorRating) &&
                (vendor === "" ||
                    sale.Vendor.toLowerCase().includes(vendor.toLowerCase())) &&
                (shipsFromCountry === "" ||
                    sale["Ships from Country"]
                        .toLowerCase()
                        .includes(shipsFromCountry.toLowerCase())) &&
                (compound === "" ||
                    sale.Compound.toLowerCase().includes(
                        compound.toLowerCase(),
                    )) &&
                (searchTerm === "" ||
                    sale.Vendor.toLowerCase().includes(
                        searchTerm.toLowerCase(),
                    ) ||
                    sale.Compound.toLowerCase().includes(
                        searchTerm.toLowerCase(),
                    ) ||
                    sale["Ships from Country"]
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()))
            );
        });
    }, [
        groupBuySales,
        vendorRating,
        vendor,
        shipsFromCountry,
        compound,
        searchTerm,
    ]);

    const dynamicVendorOptions = useMemo(() => {
        return [...new Set(filteredSales.map((sale) => sale.Vendor))];
    }, [filteredSales]);

    const dynamicCountryOptions = useMemo(() => {
        return [
            ...new Set(filteredSales.map((sale) => sale["Ships from Country"])),
        ];
    }, [filteredSales]);

    const dynamicCompoundOptions = useMemo(() => {
        return [...new Set(filteredSales.map((sale) => sale.Compound))];
    }, [filteredSales]);

    const dynamicVendorRatingOptions = useMemo(() => {
        return [...new Set(filteredSales.map((sale) => sale["Vendor rating"]))];
    }, [filteredSales]);

    useEffect(() => {
        setVisibleGroupBuySales(filteredSales.slice(0, loadCount));
    }, [filteredSales, loadCount]);

    const handleSearch = () => {
        setLoadCount(10);
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight * 1.5) {
            setLoadCount((prevCount) => prevCount + 10);
        }
    };

    const clearFilters = () => {
        setVendorRating("");
        setVendor("");
        setShipsFromCountry("");
        setCompound("");
        setSearchTerm("");
        setLoadCount(10);
    };

    const toggleMobileFilter = () => {
        setIsMobileFilterVisible(!isMobileFilterVisible);
    };

    return (
        <div className={styles.container}>
            <div className={styles.searchBarContainer}>
                <input
                    type="text"
                    placeholder="Search compounds..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchBar}
                />
                <button className={styles.searchButton} onClick={handleSearch}>
                    <FaSearch />
                </button>
                <button
                    className={styles.mobileFilterButton}
                    onClick={toggleMobileFilter}>
                    <FaFilter />
                </button>
            </div>
            <div className={styles.content}>
                <FilterSidebar
                    vendorRating={vendorRating}
                    vendor={vendor}
                    shipsFromCountry={shipsFromCountry}
                    compound={compound}
                    handleVendorRatingChange={setVendorRating}
                    handleVendorChange={setVendor}
                    handleShipsFromCountryChange={setShipsFromCountry}
                    handleCompoundChange={setCompound}
                    clearFilters={clearFilters}
                    vendorOptions={dynamicVendorOptions}
                    countryOptions={dynamicCountryOptions}
                    compoundOptions={dynamicCompoundOptions}
                    vendorRatingOptions={dynamicVendorRatingOptions}
                    isMobileFilterVisible={isMobileFilterVisible}
                    toggleMobileFilter={toggleMobileFilter}
                />
                <ResultsSidebar
                    visibleGroupBuySales={visibleGroupBuySales}
                    handleScroll={handleScroll}
                />
            </div>
        </div>
    );
});

export default CompoundBay;
