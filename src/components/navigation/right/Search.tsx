import { Link, useParams, useHistory } from "react-router-dom";
import { Message as MessageI } from "revolt.js";
import styled from "styled-components/macro";

import { Text } from "preact-i18n";
import { useEffect, useState } from "preact/hooks";

import { Button, Preloader } from "@revoltchat/ui";

import { useClient } from "../../../controllers/client/ClientController";
import { internalEmit } from "../../../lib/eventEmitter";
import Message from "../../common/messaging/Message";
import { GenericSidebarBase, GenericSidebarList } from "../SidebarBase";

type SearchState =
    | {
          type: "waiting";
      }
    | {
          type: "loading";
      }
    | {
          type: "results";
          results: MessageI[];
      };

// Custom wider sidebar for search results
const SearchSidebarBase = styled(GenericSidebarBase)`
    width: 360px; /* Increased from 232px */
    
    @media (max-width: 1200px) {
        width: 320px;
    }
    
    @media (max-width: 900px) {
        width: 280px;
    }
`;

const SearchBase = styled.div`
    padding: 6px;
    padding-top: 48px; /* Add space for the header */

    input {
        width: 100%;
    }

    .list {
        gap: 4px;
        margin: 8px 0;
        display: flex;
        flex-direction: column;
    }

    .message {
        margin: 4px 2px 8px 2px;
        padding: 8px;
        overflow: hidden;
        border-radius: var(--border-radius);
        background: var(--primary-background);

        &:hover {
            background: var(--hover);
        }

        > * {
            pointer-events: none;
        }
        
        /* Override message text color but preserve mentions and other highlights */
        p {
            color: var(--foreground) !important;
        }
        
        /* Also override any direct text that might be themed */
        color: var(--foreground);
    }

    .sort {
        gap: 4px;
        margin: 6px 0;
        display: flex;

        > * {
            flex: 1;
            min-width: 0;
        }
    }
`;

const Overline = styled.div<{ type?: string; block?: boolean }>`
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    color: ${props => props.type === "error" ? "var(--error)" : "var(--tertiary-foreground)"};
    margin: 0.4em 0;
    cursor: ${props => props.type === "error" ? "pointer" : "default"};
    display: ${props => props.block ? "block" : "inline"};
    
    &:hover {
        ${props => props.type === "error" && "text-decoration: underline;"}
    }
`;

interface Props {
    close: () => void;
    initialQuery?: string;
    searchParams?: {
        query: string;
        author?: string;
        mention?: string;
        before_date?: string;
        after_date?: string;
        during?: string;
        server_wide?: boolean;
    };
}

export function SearchSidebar({ close, initialQuery = "", searchParams }: Props) {
    const client = useClient();
    const history = useHistory();
    const params = useParams<{ channel: string }>();
    const channel = client.channels.get(params.channel)!;

    type Sort = "Relevance" | "Latest" | "Oldest";
    const [sort, setSort] = useState<Sort>("Latest");
    const [query, setQuery] = useState(searchParams?.query || initialQuery);

    const [state, setState] = useState<SearchState>({ type: "waiting" });
    const [savedSearchParams, setSavedSearchParams] = useState(searchParams);

    async function search() {
        const searchQuery = searchParams?.query || query;
        if (!searchQuery && !searchParams?.author && !searchParams?.mention && 
            !searchParams?.before_date && !searchParams?.after_date && !searchParams?.during && !searchParams?.server_wide) return;
        
        setState({ type: "loading" });
        const searchOptions: any = { 
            query: searchQuery, 
            sort 
        };
        
        // Add user filters if provided
        if (searchParams?.author) {
            searchOptions.author = searchParams.author;
        }
        if (searchParams?.mention) {
            searchOptions.mention = searchParams.mention;
        }
        
        // Add date filters if provided
        if (searchParams?.before_date) {
            searchOptions.before_date = searchParams.before_date;
        }
        if (searchParams?.after_date) {
            searchOptions.after_date = searchParams.after_date;
        }
        if (searchParams?.during) {
            searchOptions.during = searchParams.during;
        }
        
        // Add server-wide filter if provided
        if (searchParams?.server_wide) {
            searchOptions.server_wide = true;
        }
        
        const data = await channel.searchWithUsers(searchOptions);
        setState({ type: "results", results: data.messages });
    }

    useEffect(() => {
        search();
        // Save search params when they change
        if (searchParams) {
            setSavedSearchParams(searchParams);
        }
        // eslint-disable-next-line
    }, [sort, query, searchParams]);

    return (
        <SearchSidebarBase>
            <GenericSidebarList>
                <SearchBase>
                    <Overline type="subtle" block>
                        <Text id="app.main.channel.search.title" />
                    </Overline>
                    <div className="sort">
                        {(["Latest", "Oldest", "Relevance"] as Sort[]).map((key) => (
                            <Button
                                key={key}
                                compact
                                palette={sort === key ? "accent" : "secondary"}
                                onClick={() => setSort(key)}>
                                <Text
                                    id={`app.main.channel.search.sort.${key.toLowerCase()}`}
                                />
                            </Button>
                        ))}
                    </div>
                    {state.type === "loading" && <Preloader type="ring" />}
                    {state.type === "results" && (
                        <div className="list">
                        {(() => {
                            // Group messages by channel
                            const groupedMessages = state.results.reduce((acc, message) => {
                                const channelId = message.channel_id;
                                if (!acc[channelId]) {
                                    acc[channelId] = [];
                                }
                                acc[channelId].push(message);
                                return acc;
                            }, {} as Record<string, MessageI[]>);

                            const client = useClient();
                            
                            return Object.entries(groupedMessages).map(([channelId, messages]) => {
                                const messageChannel = client.channels.get(channelId);
                                const channelName = messageChannel?.name || "Unknown Channel";
                                
                                return (
                                    <div key={channelId}>
                                        <Overline type="subtle" block>
                                            # {channelName}
                                        </Overline>
                                        {messages.map((message) => {
                                            let href = "";
                                            if (messageChannel?.channel_type === "TextChannel") {
                                                href += `/server/${messageChannel.server_id}`;
                                            }
                                            href += `/channel/${message.channel_id}/${message._id}`;

                                            return (
                                                <div 
                                                    key={message._id}
                                                    className="message"
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        // Navigate to the message
                                                        history.push(href);
                                                        // Re-emit the search sidebar with the same params to keep it open
                                                        setTimeout(() => {
                                                            internalEmit("RightSidebar", "open", "search", savedSearchParams || searchParams);
                                                        }, 100);
                                                    }}
                                                >
                                                    <Message
                                                        message={message}
                                                        head
                                                        hideReply
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            });
                        })()}
                        </div>
                    )}
                </SearchBase>
            </GenericSidebarList>
        </SearchSidebarBase>
    );
}