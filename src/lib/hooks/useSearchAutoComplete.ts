import { useState } from "preact/hooks";
import { User } from "revolt.js";
import { useClient } from "../../controllers/client/ClientController";
import { AutoCompleteState, SearchClues } from "../../components/common/AutoComplete";

export interface SearchAutoCompleteProps {
    state: AutoCompleteState;
    setState: (state: AutoCompleteState) => void;
    onKeyUp: (ev: KeyboardEvent) => void;
    onKeyDown: (ev: KeyboardEvent) => boolean;
    onChange: (ev: Event) => void;
    onClick: (userId: string, username: string) => void;
    onFocus: () => void;
    onBlur: () => void;
}

// Mapping of user IDs to usernames for display
export interface UserMapping {
    [key: string]: string;
}

export function useSearchAutoComplete(
    setValue: (v: string) => void,
    userMappings: UserMapping,
    setUserMappings: (mappings: UserMapping) => void,
): SearchAutoCompleteProps {
    const [state, setState] = useState<AutoCompleteState>({ type: "none" });
    const [focused, setFocused] = useState(false);
    const client = useClient();

    function findSearchPattern(
        value: string,
        cursorPos: number
    ): ["user", string, number, "from" | "mentions"] | undefined {
        // Look backwards from cursor to find "from:" or "mentions:"
        const beforeCursor = value.slice(0, cursorPos);
        const afterCursor = value.slice(cursorPos);
        
        // Check if we're currently typing after "from:" or "mentions:" (including hyphens)
        const fromMatch = beforeCursor.match(/\bfrom:(@?[\w-]*)$/);
        if (fromMatch) {
            // Check if there's already a username that continues after cursor
            const continuationMatch = afterCursor.match(/^([\w-]*)/);
            const fullUsername = fromMatch[1].replace('@', '') + (continuationMatch ? continuationMatch[1] : '');
            return ["user", fullUsername, fromMatch.index! + 5, "from"];
        }
        
        const mentionsMatch = beforeCursor.match(/\bmentions:(@?[\w-]*)$/);
        if (mentionsMatch) {
            // Check if there's already a username that continues after cursor
            const continuationMatch = afterCursor.match(/^([\w-]*)/);
            const fullUsername = mentionsMatch[1].replace('@', '') + (continuationMatch ? continuationMatch[1] : '');
            return ["user", fullUsername, mentionsMatch.index! + 9, "mentions"];
        }
        
        // Also check if cursor is inside an existing filter
        const lastFromIndex = beforeCursor.lastIndexOf("from:");
        const lastMentionsIndex = beforeCursor.lastIndexOf("mentions:");
        
        if (lastFromIndex !== -1 || lastMentionsIndex !== -1) {
            const filterIndex = Math.max(lastFromIndex, lastMentionsIndex);
            const filterType = lastFromIndex > lastMentionsIndex ? "from" : "mentions";
            const filterLength = filterType === "from" ? 5 : 9;
            
            // Check if we're still within this filter (no space between filter and cursor)
            const betweenFilterAndCursor = value.slice(filterIndex + filterLength, cursorPos);
            if (!betweenFilterAndCursor.includes(" ")) {
                // Get the username part (including hyphens)
                const afterFilter = value.slice(filterIndex + filterLength);
                const usernameMatch = afterFilter.match(/^@?([\w-]*)/);
                if (usernameMatch) {
                    return ["user", usernameMatch[1] || "", filterIndex + filterLength, filterType];
                }
            }
        }
        
        return undefined;
    }

    function onChange(ev: Event) {
        const el = ev.target as HTMLInputElement;
        const cursorPos = el.selectionStart || 0;
        
        const result = findSearchPattern(el.value, cursorPos);
        if (result) {
            const [type, search, , filterType] = result;
            const regex = new RegExp(search, "i");
            
            if (type === "user") {
                // Get all users - in a real app, you might want to limit this
                // or use a specific search context
                let users = [...client.users.values()];
                
                // Filter out system user
                users = users.filter(
                    (x) => x._id !== "00000000000000000000000000"
                );
                
                // Filter by search term
                let matches = (
                    search.length > 0
                        ? users.filter((user) =>
                            user.username.toLowerCase().match(regex)
                        )
                        : users
                )
                    .slice(0, 5)
                    .filter((x) => typeof x !== "undefined");
                
                // Always show autocomplete when filter is typed, even with no matches
                const currentPosition =
                    state.type !== "none" ? state.selected : 0;
                
                setState({
                    type: "user",
                    matches,
                    selected: Math.min(currentPosition, matches.length - 1),
                    within: false,
                });
                
                return;
            }
        }
        
        if (state.type !== "none") {
            setState({ type: "none" });
        }
    }

    function selectCurrent(el: HTMLInputElement) {
        if (state.type === "user") {
            const cursorPos = el.selectionStart || 0;
            const result = findSearchPattern(el.value, cursorPos);
            
            if (result) {
                const [, search, startIndex, filterType] = result;
                const selectedUser = state.matches[state.selected];
                
                // Store the mapping
                const newMappings = { ...userMappings };
                const mappingKey = `${filterType}:${selectedUser.username}`;
                newMappings[mappingKey] = selectedUser._id;
                setUserMappings(newMappings);
                
                // Find the end of the current username (including @ if present and hyphens)
                let endIndex = startIndex;
                const afterStartIndex = el.value.slice(startIndex);
                const existingMatch = afterStartIndex.match(/^@?[\w-]*/);
                if (existingMatch) {
                    endIndex = startIndex + existingMatch[0].length;
                }
                
                // Replace the text with @username and add space
                const before = el.value.slice(0, startIndex);
                const after = el.value.slice(endIndex);
                setValue(before + "@" + selectedUser.username + " " + after);
                
                // Set cursor position after the @username and space
                setTimeout(() => {
                    el.setSelectionRange(
                        startIndex + selectedUser.username.length + 2, // +1 for @, +1 for space
                        startIndex + selectedUser.username.length + 2
                    );
                }, 0);
                
                setState({ type: "none" });
            }
        }
    }

    function onClick(userId: string, username: string) {
        const el = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (el && state.type === "user") {
            // Find which user was clicked
            const clickedIndex = state.matches.findIndex(u => u._id === userId);
            if (clickedIndex !== -1) {
                setState({ ...state, selected: clickedIndex });
                // Use setTimeout to ensure state is updated before selection
                setTimeout(() => selectCurrent(el), 0);
            }
        }
        setFocused(false);
    }

    function onKeyDown(e: KeyboardEvent) {
        if (focused && state.type !== "none") {
            if (e.key === "ArrowUp") {
                e.preventDefault();
                if (state.selected > 0) {
                    setState({
                        ...state,
                        selected: state.selected - 1,
                    });
                }
                return true;
            }

            if (e.key === "ArrowDown") {
                e.preventDefault();
                if (state.selected < state.matches.length - 1) {
                    setState({
                        ...state,
                        selected: state.selected + 1,
                    });
                }
                return true;
            }

            if (e.key === "Enter" || e.key === "Tab") {
                e.preventDefault();
                if (state.matches.length > 0) {
                    selectCurrent(e.currentTarget as HTMLInputElement);
                }
                return true;
            }
            
            if (e.key === "Escape") {
                e.preventDefault();
                setState({ type: "none" });
                return true;
            }
        }
        return false;
    }

    function onKeyUp(e: KeyboardEvent) {
        if (e.currentTarget !== null) {
            onChange(e);
        }
    }

    function onFocus() {
        setFocused(true);
    }

    function onBlur() {
        if (state.type !== "none" && state.within) return;
        setFocused(false);
    }

    return {
        state: focused ? state : { type: "none" },
        setState,
        onClick,
        onChange,
        onKeyUp,
        onKeyDown,
        onFocus,
        onBlur,
    };
}

// Transform display query with usernames to API query with user IDs
export function transformSearchQuery(
    displayQuery: string,
    userMappings: UserMapping
): { query: string; author?: string; mention?: string; date_start?: string; date_end?: string; has?: string; server_wide?: boolean } {
    let query = displayQuery;
    let author: string | undefined;
    let mention: string | undefined;
    let date_start: string | undefined;
    let date_end: string | undefined;
    let has: string | undefined;
    let server_wide: boolean | undefined;
    
    // Extract and replace from:@username with user ID (including hyphens)
    const fromMatch = query.match(/\bfrom:@?([\w-]+)/);
    if (fromMatch) {
        const username = fromMatch[1];
        const userId = userMappings[`from:${username}`];
        if (userId) {
            author = userId;
            // Remove from:@username from query
            query = query.replace(fromMatch[0], "").trim();
        }
    }
    
    // Extract and replace mentions:@username with user ID (including hyphens)
    const mentionsMatch = query.match(/\bmentions:@?([\w-]+)/);
    if (mentionsMatch) {
        const username = mentionsMatch[1];
        const userId = userMappings[`mentions:${username}`];
        if (userId) {
            mention = userId;
            // Remove mentions:@username from query
            query = query.replace(mentionsMatch[0], "").trim();
        }
    }
    
    // Extract date filters (YYYY-MM-DD format) and convert to ISO 8601
    // Using the new standardized date_start and date_end approach
    const beforeMatch = query.match(/\bbefore:(\d{4}-\d{2}-\d{2})/);
    if (beforeMatch) {
        // "before" means before the START of this day
        const [year, month, day] = beforeMatch[1].split('-').map(Number);
        const startOfDay = new Date(year, month - 1, day);
        startOfDay.setHours(0, 0, 0, 0);
        
        date_end = startOfDay.toISOString();
        query = query.replace(beforeMatch[0], "").trim();
    }
    
    const afterMatch = query.match(/\bafter:(\d{4}-\d{2}-\d{2})/);
    if (afterMatch) {
        // "after" means after the END of this day
        const [year, month, day] = afterMatch[1].split('-').map(Number);
        const endOfDay = new Date(year, month - 1, day);
        endOfDay.setHours(23, 59, 59, 999);
        
        date_start = endOfDay.toISOString();
        query = query.replace(afterMatch[0], "").trim();
    }
    
    const duringMatch = query.match(/\bduring:(\d{4}-\d{2}-\d{2})/);
    if (duringMatch) {
        // For 'during', capture the full day from start to end
        const [year, month, day] = duringMatch[1].split('-').map(Number);
        
        const startOfDay = new Date(year, month - 1, day);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(year, month - 1, day);
        endOfDay.setHours(23, 59, 59, 999);
        
        date_start = startOfDay.toISOString();
        date_end = endOfDay.toISOString();
        
        query = query.replace(duringMatch[0], "").trim();
    }
    
    // Extract between date range filter (between:YYYY-MM-DD..YYYY-MM-DD)
    const betweenMatch = query.match(/\bbetween:(\d{4}-\d{2}-\d{2})\.\.(\d{4}-\d{2}-\d{2})/);
    if (betweenMatch) {
        // Start date: from the START of the first day
        const [startYear, startMonth, startDay] = betweenMatch[1].split('-').map(Number);
        const startOfFirstDay = new Date(startYear, startMonth - 1, startDay);
        startOfFirstDay.setHours(0, 0, 0, 0);
        date_start = startOfFirstDay.toISOString();
        
        // End date: to the END of the last day
        const [endYear, endMonth, endDay] = betweenMatch[2].split('-').map(Number);
        const endOfLastDay = new Date(endYear, endMonth - 1, endDay);
        endOfLastDay.setHours(23, 59, 59, 999);
        date_end = endOfLastDay.toISOString();
        
        query = query.replace(betweenMatch[0], "").trim();
    }
    
    // Extract has: filter for attachment types
    const hasMatch = query.match(/\bhas:(video|image|link|audio|file)/i);
    if (hasMatch) {
        has = hasMatch[1].toLowerCase();
        query = query.replace(hasMatch[0], "").trim();
    }
    
    // Check for server-wide flag
    if (query.includes("server-wide")) {
        server_wide = true;
        query = query.replace(/\bserver-wide\b/g, "").trim();
    }
    
    return { query, author, mention, date_start, date_end, has, server_wide };
}