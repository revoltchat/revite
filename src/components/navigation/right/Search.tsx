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
          pages: Map<number, MessageI[]>;
          currentPage: number;
          hasMore: boolean;
          isLoadingPage?: boolean;
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
        date_start?: string;
        date_end?: string;
        has?: string;
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
    const [pageLastMessageIds, setPageLastMessageIds] = useState<Map<number, string>>(new Map());
    
    const MESSAGES_PER_PAGE = 50;

    async function searchPage(pageNumber: number) {
        const searchQuery = searchParams?.query || query;
        if (!searchQuery && !searchParams?.author && !searchParams?.mention && 
            !searchParams?.date_start && !searchParams?.date_end && 
            !searchParams?.has && !searchParams?.server_wide) return;
        
        // Check if we already have this page cached
        if (state.type === "results" && state.pages.has(pageNumber) && pageNumber !== state.currentPage) {
            setState({ ...state, currentPage: pageNumber });
            return;
        }
        
        // Mark as loading page
        if (state.type === "results") {
            setState({ ...state, isLoadingPage: true });
        } else {
            setState({ type: "loading" });
        }
        
        const searchOptions: any = { 
            query: searchQuery, 
            sort,
            limit: MESSAGES_PER_PAGE
        };
        
        // Add pagination cursor for pages after the first
        if (pageNumber > 1) {
            const previousPageLastId = pageLastMessageIds.get(pageNumber - 1);
            if (previousPageLastId) {
                searchOptions.before = previousPageLastId;
            } else {
                // If we don't have the previous page, we need to load pages sequentially
                // This shouldn't happen in normal navigation
                console.warn("Previous page not loaded, loading sequentially");
                return;
            }
        }
        
        // Add user filters if provided
        if (searchParams?.author) {
            searchOptions.author = searchParams.author;
        }
        if (searchParams?.mention) {
            searchOptions.mention = searchParams.mention;
        }
        
        // Add date filters if provided using the new standardized parameters
        if (searchParams?.date_start) {
            searchOptions.date_start = searchParams.date_start;
        }
        if (searchParams?.date_end) {
            searchOptions.date_end = searchParams.date_end;
        }
        
        // Add server-wide filter if provided
        if (searchParams?.server_wide) {
            searchOptions.server_wide = true;
        }
        
        // Add has filter if provided
        if (searchParams?.has) {
            searchOptions.has = searchParams.has;
        }
        
        const data = await channel.searchWithUsers(searchOptions);
        
        // Store the last message ID for this page
        if (data.messages.length > 0) {
            const newPageLastIds = new Map(pageLastMessageIds);
            newPageLastIds.set(pageNumber, data.messages[data.messages.length - 1]._id);
            setPageLastMessageIds(newPageLastIds);
        }
        
        if (state.type === "results") {
            // Add this page to the cache
            const newPages = new Map(state.pages);
            newPages.set(pageNumber, data.messages);
            setState({ 
                type: "results", 
                pages: newPages,
                currentPage: pageNumber,
                hasMore: data.messages.length === MESSAGES_PER_PAGE,
                isLoadingPage: false
            });
        } else {
            // First page load
            const newPages = new Map<number, MessageI[]>();
            newPages.set(1, data.messages);
            setState({ 
                type: "results", 
                pages: newPages,
                currentPage: 1,
                hasMore: data.messages.length === MESSAGES_PER_PAGE,
                isLoadingPage: false
            });
        }
    }
    
    function goToNextPage() {
        if (state.type === "results" && state.hasMore && !state.isLoadingPage) {
            searchPage(state.currentPage + 1);
        }
    }
    
    function goToPreviousPage() {
        if (state.type === "results" && state.currentPage > 1 && !state.isLoadingPage) {
            searchPage(state.currentPage - 1);
        }
    }

    useEffect(() => {
        // Reset to page 1 when search params change
        searchPage(1);
        // Clear cached pages when search params change
        setPageLastMessageIds(new Map());
        // Save search params when they change
        if (searchParams) {
            setSavedSearchParams(searchParams);
        }
        // eslint-disable-next-line
    }, [
        sort, 
        query, 
        searchParams?.query,
        searchParams?.author,
        searchParams?.mention,
        searchParams?.date_start,
        searchParams?.date_end,
        searchParams?.has,
        searchParams?.server_wide
    ]);

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
                    {state.type === "results" && (() => {
                        const currentPageMessages = state.pages.get(state.currentPage) || [];
                        return (
                            <>
                                <Overline type="subtle" block style={{ textAlign: 'center', marginTop: '12px' }}>
                                    {currentPageMessages.length > 0 
                                        ? currentPageMessages.length === 1 ? 'Result' : 'Results'
                                        : 'No Results'
                                    }
                                </Overline>
                                
                                {state.isLoadingPage ? (
                                    <div style={{ textAlign: 'center', padding: '20px' }}>
                                        <Preloader type="ring" />
                                    </div>
                                ) : (
                                    <div className="list">
                                        {currentPageMessages.map((message, index) => {
                                            const messageChannel = client.channels.get(message.channel_id);
                                            const channelName = messageChannel?.name || "Unknown Channel";
                                            
                                            // Check if this is the first message or if the channel changed from the previous message
                                            const showChannelIndicator = index === 0 || 
                                                message.channel_id !== currentPageMessages[index - 1].channel_id;
                                            
                                            let href = "";
                                            if (messageChannel?.channel_type === "TextChannel") {
                                                href += `/server/${messageChannel.server_id}`;
                                            }
                                            href += `/channel/${message.channel_id}/${message._id}`;

                                            return (
                                                <div key={message._id}>
                                                    {showChannelIndicator && (
                                                        <Overline type="subtle" block>
                                                            # {channelName}
                                                        </Overline>
                                                    )}
                                                    <div 
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
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                
                                {/* Navigation with page count at the bottom - only show if there are results */}
                                {currentPageMessages.length > 0 && (
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center',
                                        gap: '12px', 
                                        justifyContent: 'center',
                                        margin: '16px 0 8px 0'
                                    }}>
                                        <Button
                                            compact
                                            palette="secondary"
                                            disabled={state.currentPage === 1 || state.isLoadingPage}
                                            onClick={goToPreviousPage}
                                        >
                                            ← Back
                                        </Button>
                                        
                                        <span style={{ 
                                            color: 'var(--tertiary-foreground)', 
                                            fontSize: '13px',
                                            fontWeight: '500'
                                        }}>
                                            Page {state.currentPage}
                                        </span>
                                        
                                        <Button
                                            compact
                                            palette="secondary"
                                            disabled={!state.hasMore || state.isLoadingPage}
                                            onClick={goToNextPage}
                                        >
                                            Next →
                                        </Button>
                                    </div>
                                )}
                            </>
                        );
                    })()}
                </SearchBase>
            </GenericSidebarList>
        </SearchSidebarBase>
    );
}