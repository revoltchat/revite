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

const DisabledButtonWrapper = styled.div`
    opacity: 0.5;
    pointer-events: none;
`;

interface Server {
    id: string;
    name: string;
    description: string;
    inviteCode: string;
    disabled: boolean;
}

interface CachedData {
    timestamp: number;
    data: Server[];
}

const CACHE_KEY = "server_list_cache";
const CACHE_DURATION = 1 * 60 * 1000; // 1 minutes in milliseconds

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
                "https://docs.google.com/spreadsheets/d/e/2PACX-1vRY41D-NgTE6bC3kTN3dRpisI-DoeHG8Eg7n31xb1CdydWjOLaphqYckkTiaG9oIQSWP92h3NE-7cpF/pub?gid=0&single=true&output=csv";

            Papa.parse<Server>(csvUrl, {
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

                    const cacheData: CachedData = {
                        timestamp: Date.now(),
                        data: result.data,
                    };

                    safeStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
                    setServers(result.data);
                    setLoading(false);
                },
                error: (err) => {
                    console.error("Error fetching CSV:", err);
                    setError(
                        "Failed to load server data. Please try again later.",
                    );
                    setLoading(false);
                },
            });
        } catch (err) {
            console.error("Unexpected error:", err);
            setError("An unexpected error occurred. Please try again later.");
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

            await fetchAndCacheData();
        };

        getCachedOrFetchData();
    }, []);

    const renderServerButton = (server: Server) => {
        const isServerJoined = client.servers.get(server.id);
        const linkTo = isServerJoined
            ? `/server/${server.id}`
            : `/invite/${server.inviteCode}`;

        const buttonContent = (
            <CategoryButton
                key={server.id}
                action={server.disabled ? undefined : "chevron"}
                icon={
                    server.disabled ? (
                        <Lock size={32} />
                    ) : isServerJoined ? (
                        <MessageDots size={32} />
                    ) : (
                        <MessageAdd size={32} />
                    )
                }
                description={server.description}>
                {server.name}
            </CategoryButton>
        );

        if (server.disabled) {
            return (
                <DisabledButtonWrapper key={server.id}>
                    {buttonContent}
                </DisabledButtonWrapper>
            );
        } else {
            return (
                <Link to={linkTo} key={server.id}>
                    {buttonContent}
                </Link>
            );
        }
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
                        <h3>Welcome to PepChat</h3>
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
