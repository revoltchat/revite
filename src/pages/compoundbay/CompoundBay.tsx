import { observer } from "mobx-react-lite";
import Papa from "papaparse";
import { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";

import styles from "./CompoundBay.module.scss";

import { GroupBuySale } from "../../types/groupBuySale";
import FilterSidebar from "./FilterSidebar";
import ResultsSidebar from "./ResultsSidebar";

const CompoundBay = observer(() => {
    const [groupBuySales, setGroupBuySales] = useState<GroupBuySale[]>([]);
    const [visibleGroupBuySales, setVisibleGroupBuySales] = useState<
        GroupBuySale[]
    >([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loadCount, setLoadCount] = useState(10);
    const [expandedSales, setExpandedSales] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filter states
    const [vendorRating, setVendorRating] = useState("");
    const [vendor, setVendor] = useState("");
    const [shipsFromCountry, setShipsFromCountry] = useState("");
    const [compound, setCompound] = useState("");

    // Add new state for dropdown options
    const [vendorOptions, setVendorOptions] = useState<string[]>([]);
    const [countryOptions, setCountryOptions] = useState<string[]>([]);
    const [compoundOptions, setCompoundOptions] = useState<string[]>([]);

    useEffect(() => {
        const fetchGroupBuySales = async () => {
            setIsLoading(true);
            try {
                const response = await fetch("/data/group_buy_sales.csv");
                const csvText = await response.text();
                Papa.parse(csvText, {
                    header: true,
                    complete: (results) => {
                        const parsedSales = results.data.map((row: any) => ({
                            vendor: row.Vendor,
                            vendorRating: row["Vendor rating"],
                            type: row.Type,
                            compound: row.Compound,
                            dose: row.Dose,
                            unit: row.Unit,
                            format: row.Format,
                            quantity: row.Quantity,
                            price: row.Price,
                            shipsFromCountry: row["Ships from Country"],
                            shippingCost: row["Shipping $"],
                            moq: row.MOQ,
                            analysis: row.Analysis,
                            purityGuarantee: row["Purity guarantee"],
                            massGuarantee: row["Mass guarantee"],
                            reshipGuarantee: row["Re-ship guarantee"],
                            start: row.Start,
                            close: row.Close,
                            pepChatLink: row["PepChat Link"],
                            discordLink: row["Discord Link"],
                            telegramLink: row["Telegram Link"],
                            notes: row.Notes,
                        })) as GroupBuySale[];

                        console.log("Parsed sales:", parsedSales); // Debug log

                        // Check for missing properties
                        const validSales = parsedSales.filter((sale) => {
                            if (
                                !sale.vendor ||
                                !sale.compound ||
                                !sale.shipsFromCountry
                            ) {
                                console.warn("Invalid sale object:", sale);
                                return false;
                            }
                            return true;
                        });

                        setGroupBuySales(validSales);
                        setVisibleGroupBuySales(validSales.slice(0, loadCount));

                        // Extract unique options for dropdowns
                        const vendors = [
                            ...new Set(validSales.map((sale) => sale.vendor)),
                        ];
                        const countries = [
                            ...new Set(
                                validSales.map((sale) => sale.shipsFromCountry),
                            ),
                        ];
                        const compounds = [
                            ...new Set(validSales.map((sale) => sale.compound)),
                        ];

                        setVendorOptions(vendors);
                        setCountryOptions(countries);
                        setCompoundOptions(compounds);
                    },
                    error: (err) => {
                        console.error("Error parsing CSV:", err);
                        setError("Failed to load group buy sales data.");
                    },
                });
            } catch (err) {
                console.error("Error fetching CSV:", err);
                setError("Failed to fetch group buy sales data.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchGroupBuySales();
    }, []);

    useEffect(() => {
        const filteredSales = groupBuySales.filter((sale) => {
            return (
                (vendorRating === "" || sale.vendorRating === vendorRating) &&
                (vendor === "" ||
                    sale.vendor.toLowerCase().includes(vendor.toLowerCase())) &&
                (shipsFromCountry === "" ||
                    sale.shipsFromCountry
                        .toLowerCase()
                        .includes(shipsFromCountry.toLowerCase())) &&
                (compound === "" ||
                    sale.compound
                        .toLowerCase()
                        .includes(compound.toLowerCase())) &&
                (searchTerm === "" ||
                    sale.vendor
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    sale.compound
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()))
            );
        });

        console.log("Filtered sales:", filteredSales); // Debug log
        setVisibleGroupBuySales(filteredSales.slice(0, loadCount));
    }, [
        groupBuySales,
        vendorRating,
        vendor,
        shipsFromCountry,
        compound,
        searchTerm,
        loadCount,
    ]);

    const handleSearch = () => {
        setLoadCount(10);
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight * 1.5) {
            setLoadCount((prevCount) => prevCount + 10);
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedSales((prevExpanded) => {
            const newExpanded = new Set(prevExpanded);
            if (newExpanded.has(id)) {
                newExpanded.delete(id);
            } else {
                newExpanded.add(id);
            }
            return newExpanded;
        });
    };

    const clearFilters = () => {
        setVendorRating("");
        setVendor("");
        setShipsFromCountry("");
        setCompound("");
        setSearchTerm("");
        setLoadCount(10);
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.banner}>CompoundBay</h1>
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
                    vendorOptions={vendorOptions}
                    countryOptions={countryOptions}
                    compoundOptions={compoundOptions}
                />
                <ResultsSidebar
                    visibleGroupBuySales={visibleGroupBuySales}
                    expandedSales={expandedSales}
                    toggleExpand={toggleExpand}
                    handleScroll={handleScroll}
                />
            </div>
        </div>
    );
});

export default CompoundBay;
