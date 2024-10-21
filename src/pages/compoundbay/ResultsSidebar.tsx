import React from "react";

import styles from "./ResultsSidebar.module.scss";

import { GroupBuySale } from "../../types/groupBuySale";

interface ResultsSidebarProps {
    visibleGroupBuySales: GroupBuySale[];
    handleScroll: (e: React.UIEvent<HTMLDivElement>) => void;
}

const ResultsSidebar: React.FC<ResultsSidebarProps> = ({
    visibleGroupBuySales,
    handleScroll,
}) => {
    const renderLink = (link: string, text: string) => {
        if (
            link &&
            link.toLowerCase() !== "invite only" &&
            link.toLowerCase() !== "n/a"
        ) {
            return (
                <a href={link} target="_blank" rel="noopener noreferrer">
                    {text}
                </a>
            );
        }
        return link || "N/A";
    };

    const renderDetailItem = (label: string, value: string) => (
        <div className={styles.detailItem}>
            <span className={styles.detailLabel}>{label}:</span> {value}
        </div>
    );

    return (
        <div className={styles.results} onScroll={handleScroll}>
            {visibleGroupBuySales.length > 0 ? (
                visibleGroupBuySales.map((sale, index) => (
                    <div key={index} className={styles.saleItem}>
                        <h3 className={styles.saleTitle}>
                            {sale.Vendor} - {sale.Compound}
                        </h3>
                        <p className={styles.salePrice}>Price: {sale.Price}</p>
                        <div className={styles.expandedDetails}>
                            <div className={styles.detailsGrid}>
                                {renderDetailItem("Type", sale.Type)}
                                {renderDetailItem(
                                    "Dose",
                                    `${sale.Dose} ${sale.Unit}`,
                                )}
                                {renderDetailItem("Format", sale.Format)}
                                {renderDetailItem("Quantity", sale.Quantity)}
                                {renderDetailItem(
                                    "Ships from",
                                    sale["Ships from Country"],
                                )}
                                {renderDetailItem(
                                    "Shipping Cost",
                                    sale["Shipping $"],
                                )}
                                {renderDetailItem("MOQ", sale.MOQ)}
                                {renderDetailItem(
                                    "Vendor Rating",
                                    sale["Vendor rating"],
                                )}
                                {renderDetailItem("Analysis", sale.Analysis)}
                                {renderDetailItem(
                                    "Purity Guarantee",
                                    sale["Purity guarantee"],
                                )}
                                {renderDetailItem(
                                    "Mass Guarantee",
                                    sale["Mass guarantee"],
                                )}
                                {renderDetailItem(
                                    "Reship Guarantee",
                                    sale["Re-ship guarantee"],
                                )}
                                {renderDetailItem("Start", sale.Start)}
                                {renderDetailItem("Close", sale.Close)}
                            </div>
                            <div className={styles.notes}>
                                <span className={styles.detailLabel}>
                                    Notes:
                                </span>{" "}
                                {sale.Notes}
                            </div>
                            <div className={styles.links}>
                                <div className={styles.linkItem}>
                                    <span className={styles.detailLabel}>
                                        PepChat:
                                    </span>{" "}
                                    {renderLink(
                                        sale["PepChat Link"],
                                        "PepChat",
                                    )}
                                </div>
                                <div className={styles.linkItem}>
                                    <span className={styles.detailLabel}>
                                        Discord:
                                    </span>{" "}
                                    {renderLink(
                                        sale["Discord Link"],
                                        "Discord",
                                    )}
                                </div>
                                <div className={styles.linkItem}>
                                    <span className={styles.detailLabel}>
                                        Telegram:
                                    </span>{" "}
                                    {renderLink(
                                        sale["Telegram Link"],
                                        "Telegram",
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <p className={styles.noResults}>
                    No group buy sales available.
                </p>
            )}
        </div>
    );
};

export default ResultsSidebar;
