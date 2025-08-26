import {
    Home as HomeIcon,
    MessageDots,
    MessageAdd,
    Lock,
} from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import Papa from "papaparse";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components/macro";

import styles from "./Home.module.scss";
import { Text } from "preact-i18n";

import { CategoryButton } from "@revoltchat/ui";

import { PageHeader } from "../../components/ui/Header";
import { useClient } from "../../controllers/client/ClientController";

const Overlay = styled.div`
    display: grid;
    height: 100%;
    overflow-y: scroll;

    > * {
        grid-area: 1 / 1;
    }

    .content {
        z-index: 1;
    }

    h3 {
        padding-top: 1rem;
    }
`;

const DisabledWrapper = styled.div`
    opacity: 0.5;
    pointer-events: none;
    margin-bottom: -10px;
`;

interface Server {
    id: string;
    name: string;
    description: string;
    inviteCode: string;
    disabled: boolean;
    new: boolean;
    sortorder: number;
}

interface CachedData {
    timestamp: number;
    data: Server[];
}

// Add a styled component for the new text color
const NewServerWrapper = styled.div`
    color: #fadf4f;
    display: contents;

    a {
        color: #fadf4f;
    }
`;

const CACHE_KEY = "server_list_cache";
const CACHE_DURATION = 1 * 60 * 1000; // 1 minutes in milliseconds

// Fallback data in case Google Sheets is unavailable
const FALLBACK_SERVERS: Server[] = [

    {
        id: "01F7ZSBSFHQ8TA81725KQCSDDP",
        name: "PlaceHolder",
        description: "Community",
        inviteCode: "development",
        disabled: false,
        new: false,
        sortorder: 2
    }
];

// Safe localStorage wrapper
const safeStorage = {
    getItem: (key: string): string | null => {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.warn("Failed to read from localStorage:", e);
            return null;
        }
    },
    setItem: (key: string, value: string): void => {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            console.warn("Failed to write to localStorage:", e);
        }
    },
};

const Home: React.FC = () => {
    const client = useClient();
    const [servers, setServers] = useState<Server[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAndCacheData = async () => {
        try {
            const csvUrl =
                "https://docs.google.com/spreadsheets/d/1kNF50scEUJVJ9KD-0_ibX43vJiOzdHrmgauLoSoBy34/export?format=csv&gid=0";

            // Add cache-busting parameter to prevent browser caching
            const urlWithCacheBust = `${csvUrl}&_cb=${Date.now()}`;

            Papa.parse<Server>(urlWithCacheBust, {
                download: true,
                header: true,
                dynamicTyping: true,
                complete: (result) => {
                    if (result.errors.length > 0) {
                        console.error("CSV parsing errors:", result.errors);
                        setError("Error parsing server data");
                        setLoading(false);
                        return;
                    }

                    // Sort the servers by sortorder before caching
                    const sortedData = [...result.data].sort(
                        (a, b) => (a.sortorder || 0) - (b.sortorder || 0),
                    );

                    const cacheData: CachedData = {
                        timestamp: Date.now(),
                        data: sortedData,
                    };

                    safeStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
                    setServers(sortedData);
                    setLoading(false);
                },
                error: (err) => {
                    console.error("Error fetching CSV:", err);
                    console.warn("Using fallback server data due to Google Sheets error");

                    // Use fallback data instead of showing error
                    setServers(FALLBACK_SERVERS);
                    setLoading(false);
                },
            });
        } catch (err) {
            console.error("Unexpected error:", err);
            console.warn("Using fallback server data due to unexpected error");

            // Use fallback data instead of showing error
            setServers(FALLBACK_SERVERS);
            setLoading(false);
        }
    };

    useEffect(() => {
        const getCachedOrFetchData = async () => {
            try {
                const cachedData = safeStorage.getItem(CACHE_KEY);

                if (cachedData) {
                    const parsed: CachedData = JSON.parse(cachedData);
                    const isExpired =
                        Date.now() - parsed.timestamp > CACHE_DURATION;

                    if (!isExpired && Array.isArray(parsed.data)) {
                        setServers(parsed.data);
                        setLoading(false);
                        return;
                    }
                }
            } catch (err) {
                console.warn("Error reading cache:", err);
                // Continue to fetch fresh data if cache read fails
            }

            try {
                await fetchAndCacheData();
            } catch (err) {
                console.error("Failed to fetch data even after cache miss:", err);
                console.warn("Using fallback server data as last resort");
                setServers(FALLBACK_SERVERS);
                setLoading(false);
            }
        };

        getCachedOrFetchData();
    }, []);

    const renderServerButton = (server: Server) => {
        const isServerJoined = client.servers.get(server.id);
        const linkTo = isServerJoined
            ? `/server/${server.id}`
            : `/invite/${server.inviteCode}`;

        const iconComponent = server.disabled ? (
            <Lock size={32} />
        ) : isServerJoined ? (
            <MessageDots size={32} />
        ) : (
            <MessageAdd size={32} />
        );

        const buttonContent = (
            <CategoryButton
                action={server.disabled ? undefined : "chevron"}
                icon={iconComponent as any}
                description={server.description}>
                {server.name}
            </CategoryButton>
        );

        let content = server.disabled ? (
            <DisabledWrapper>{buttonContent}</DisabledWrapper>
        ) : (
            <Link to={linkTo}>{buttonContent}</Link>
        );

        return server.new ? (
            <NewServerWrapper>{content}</NewServerWrapper>
        ) : (
            content
        );
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className={styles.home}>
            <Overlay>
                <div className="content">
                    <PageHeader icon={<HomeIcon size={24} />} withTransparency>
                        <Text id="app.navigation.tabs.home" />
                    </PageHeader>
                    <div className={styles.homeScreen}>
                        <div className={styles.actions}>
                            {servers.map(renderServerButton)}
                        </div>
                    </div>
                </div>
            </Overlay>
        </div>
    );
};

export default observer(Home);
