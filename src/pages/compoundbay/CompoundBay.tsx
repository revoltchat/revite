import { observer } from "mobx-react-lite";
import Papa from "papaparse";
import { useState, useEffect } from "react";
import styled from "styled-components/macro";

const Container = styled.div`
    width: 100%;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #f0f0f0;
    font-family: "Roboto", sans-serif;
`;

const Banner = styled.h1`
    font-size: 2.5em;
    margin-bottom: 20px;
    color: #1a237e;
    font-weight: 500;
`;

const SearchBar = styled.input`
    width: 50%;
    padding: 12px;
    margin-bottom: 20px;
    border: 1px solid #bdbdbd;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    font-size: 1em;
    font-family: "Roboto", sans-serif;
`;

const Content = styled.div`
    display: flex;
    width: 100%;
    max-width: 1200px;
`;

const Filters = styled.div`
    flex: 1;
    padding: 20px;
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    margin-right: 20px;
`;

const Results = styled.div`
    flex: 3;
    padding: 20px;
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    overflow-y: auto;
    height: 600px; /* Set a fixed height for scrolling */
`;

const FilterTitle = styled.h3`
    margin-bottom: 10px;
    color: #1a237e;
    font-size: 1.2em;
    font-weight: 500;
`;

const FilterOption = styled.div`
    margin-bottom: 10px;
    color: #424242;
    cursor: pointer;
    font-size: 1em;
    &:hover {
        color: #1a237e;
    }
`;

const ResultCard = styled.div`
    margin-bottom: 20px;
    padding: 20px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    background-color: #ffffff;
`;

const VendorName = styled.h3`
    color: #1a237e;
    font-size: 1.5em;
    font-weight: 500;
    margin-bottom: 10px;
`;

const VendorDescription = styled.p`
    color: #616161;
    font-size: 1em;
    margin-bottom: 10px;
`;

const VendorDetail = styled.p`
    color: #424242;
    font-size: 0.9em;
    margin-bottom: 5px;
`;

const CompoundBay = observer(() => {
    const [searchTerm, setSearchTerm] = useState("");
    const [vendors, setVendors] = useState([]);
    const [visibleVendors, setVisibleVendors] = useState([]);
    const [loadCount, setLoadCount] = useState(10);

    useEffect(() => {
        // Load and parse the CSV file
        Papa.parse("/src/data/vendors.csv", {
            download: true,
            header: true,
            complete: (results) => {
                setVendors(results.data);
                setVisibleVendors(results.data.slice(0, loadCount));
            },
        });
    }, []);

    const loadMoreVendors = () => {
        setLoadCount((prevCount) => prevCount + 10);
        setVisibleVendors(vendors.slice(0, loadCount + 10));
    };

    const handleScroll = (e) => {
        const bottom =
            e.target.scrollHeight - e.target.scrollTop ===
            e.target.clientHeight;
        if (bottom) {
            loadMoreVendors();
        }
    };

    return (
        <Container>
            <Banner>CompoundBay</Banner>
            <SearchBar
                type="text"
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Content>
                <Filters>
                    <FilterTitle>Sort By</FilterTitle>
                    <FilterOption>Relevance</FilterOption>
                    <FilterOption>Rating</FilterOption>
                    <FilterTitle>Categories</FilterTitle>
                    <FilterOption>Organic</FilterOption>
                    <FilterOption>Inorganic</FilterOption>
                    <FilterTitle>Available On</FilterTitle>
                    <FilterOption>Online</FilterOption>
                    <FilterOption>In-store</FilterOption>
                </Filters>
                <Results onScroll={handleScroll}>
                    {visibleVendors.map((vendor) => (
                        <ResultCard key={vendor.id}>
                            <VendorName>{vendor.name}</VendorName>
                            <VendorDescription>
                                {vendor.description}
                            </VendorDescription>
                            <VendorDetail>
                                <strong>Compound:</strong> {vendor.compound}
                            </VendorDetail>
                            <VendorDetail>
                                <strong>Dose:</strong> {vendor.dose}{" "}
                                {vendor.measurement}
                            </VendorDetail>
                            <VendorDetail>
                                <strong>Format:</strong> {vendor.format}
                            </VendorDetail>
                            <VendorDetail>
                                <strong>Quantity:</strong> {vendor.quantity}
                            </VendorDetail>
                            <VendorDetail>
                                <strong>Price USD:</strong> ${vendor.priceUSD}
                            </VendorDetail>
                            <VendorDetail>
                                <strong>Shipping:</strong> {vendor.shipping}
                            </VendorDetail>
                            <VendorDetail>
                                <strong>Testing:</strong> {vendor.testing}
                            </VendorDetail>
                            <VendorDetail>
                                <strong>Guarantees:</strong> {vendor.guarantees}
                            </VendorDetail>
                            <VendorDetail>
                                <strong>Vendor Rating:</strong>{" "}
                                {vendor.vendorRating} / 5
                            </VendorDetail>
                        </ResultCard>
                    ))}
                </Results>
            </Content>
        </Container>
    );
});

export default CompoundBay;
