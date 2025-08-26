import { Search, X } from "@styled-icons/boxicons-regular";
import { HelpCircle } from "@styled-icons/boxicons-solid";
import styled from "styled-components/macro";
import { useEffect, useRef, useState } from "preact/hooks";
import { internalEmit } from "../../lib/eventEmitter";
import { useSearchAutoComplete, transformSearchQuery, UserMapping } from "../../lib/hooks/useSearchAutoComplete";
import SearchAutoComplete from "./SearchAutoComplete";
import SearchDatePicker from "./SearchDatePicker";
import { isTouchscreenDevice } from "../../lib/isTouchscreenDevice";
import { useApplicationState } from "../../mobx/State";
import { SIDEBAR_MEMBERS } from "../../mobx/stores/Layout";
import Tooltip from "../common/Tooltip";

const Container = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    background: var(--primary-header);
    border-radius: var(--border-radius);
    width: 220px;
    height: 32px;
    
    @media (max-width: 768px) {
        width: 180px;
    }
`;

const Input = styled.input`
    flex: 1;
    border: none;
    background: transparent;
    color: var(--foreground);
    font-size: 14px;
    padding: 6px 2px 6px 8px; /* Reduced left padding for more space */
    outline: none;
    min-width: 0; /* Allow input to shrink properly */
    
    &::placeholder {
        color: var(--tertiary-foreground);
        font-size: 13px; /* Slightly smaller placeholder on mobile */
    }
    
    @media (max-width: 768px) {
        font-size: 13px;
        padding: 6px 2px 6px 6px;
    }
`;

const IconButton = styled.div`
    display: flex;
    align-items: center;
    padding: 0 8px; /* Symmetrical padding */
    color: var(--tertiary-foreground);
    cursor: pointer;
    transition: color 0.1s ease;
    flex-shrink: 0; /* Prevent icon from shrinking */
    
    &:hover {
        color: var(--foreground);
    }
    
    @media (max-width: 768px) {
        padding: 0 6px; /* Less padding on mobile */
        
        svg {
            width: 16px;
            height: 16px;
        }
    }
`;

const OptionsDropdown = styled.div`
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 8px;
    background: var(--primary-background);
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    overflow: hidden;
    padding: 8px;
    min-width: 300px;
    
    @media (max-width: 768px) {
        padding: 12px;
        min-width: 320px;
        max-width: calc(100vw - 20px);
        right: -10px; /* Adjust position to prevent edge cutoff */
        max-height: 40vh; /* Limit height when keyboard is up */
        overflow-y: auto; /* Make it scrollable */
        
        /* Add scrollbar styles for mobile */
        &::-webkit-scrollbar {
            width: 4px;
        }
        
        &::-webkit-scrollbar-track {
            background: transparent;
        }
        
        &::-webkit-scrollbar-thumb {
            background: var(--scrollbar-thumb);
            border-radius: 2px;
        }
    }
`;

const OptionsHeader = styled.div`
    padding: 0 8px 8px 8px;
    font-size: 12px;
    color: var(--tertiary-foreground);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    
    @media (max-width: 768px) {
        font-size: 11px;
        padding: 0 8px 8px 8px;
    }
`;

const Option = styled.div`
    display: flex;
    align-items: center;
    padding: 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.15s ease;
    margin-bottom: 2px;
    
    &:hover {
        background: var(--secondary-background);
    }
    
    &:last-child {
        margin-bottom: 0;
    }
    
    @media (max-width: 768px) {
        padding: 10px 10px;
        margin-bottom: 3px;
        border-radius: 6px;
        
        /* Add touch feedback for mobile */
        &:active {
            background: var(--secondary-background);
            transform: scale(0.98);
        }
    }
`;

const OptionLabel = styled.span`
    color: var(--foreground);
    font-weight: 500;
    margin-right: 8px;
    font-family: var(--monospace-font), monospace;
    font-size: 13px;
    white-space: nowrap;
    
    @media (max-width: 768px) {
        font-size: 13px;
        margin-right: 10px;
    }
`;

const OptionDesc = styled.span`
    color: var(--tertiary-foreground);
    font-size: 13px;
    flex: 1;
    
    @media (max-width: 768px) {
        font-size: 12px;
    }
`;

const HelpIcon = styled(HelpCircle)`
    color: var(--tertiary-foreground);
    margin-left: auto;
    flex-shrink: 0;
    opacity: 0;
    transition: opacity 0.15s ease;
    
    ${Option}:hover & {
        opacity: 0.7;
    }
`;

interface SearchOption {
    label: string;
    description: string;
    tooltip: string;
}

const searchOptions: SearchOption[] = [
    {
        label: "from:",
        description: "user",
        tooltip: "Filter messages by author"
    },
    {
        label: "mentions:",
        description: "user",
        tooltip: "Find messages mentioning a user"
    },
    {
        label: "has:",
        description: "video, image, link, audio, file",
        tooltip: "Messages with specific attachment types"
    },
    {
        label: "before:",
        description: "specific date",
        tooltip: "Messages before this date"
    },
    {
        label: "during:",
        description: "specific date",
        tooltip: "Messages on this date"
    },
    {
        label: "after:",
        description: "specific date",
        tooltip: "Messages after this date"
    },
    {
        label: "between:",
        description: "date range",
        tooltip: "Messages between two dates"
    },
    {
        label: "server-wide",
        description: "Entire server",
        tooltip: "Search in entire server instead of just this channel"
    }
];

export function SearchBar() {
    const layout = useApplicationState().layout;
    const [query, setQuery] = useState("");
    const [showOptions, setShowOptions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [userMappings, setUserMappings] = useState<UserMapping>({});
    const [showDatePicker, setShowDatePicker] = useState<"before" | "after" | "during" | "between" | null>(null);
    const [showAttachmentTypes, setShowAttachmentTypes] = useState(false);
    const [activeDateRange, setActiveDateRange] = useState<{
        start: string;
        end: string;
        startDisplay: string;
        endDisplay: string;
    } | null>(null);
    const [showServerWideError, setShowServerWideError] = useState(false);
    const [showDateRangeError, setShowDateRangeError] = useState(false);
    const [showMultipleHasError, setShowMultipleHasError] = useState(false);
    const [showDuplicateFilterError, setShowDuplicateFilterError] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const skipNextFocus = useRef(false);
    
    // Setup autocomplete
    const {
        state: autocompleteState,
        setState: setAutocompleteState,
        onKeyUp,
        onKeyDown: originalOnAutocompleteKeyDown,
        onChange: onAutocompleteChange,
        onClick: originalOnAutocompleteClick,
        onFocus: onAutocompleteFocus,
        onBlur: onAutocompleteBlur,
    } = useSearchAutoComplete(setQuery, userMappings, setUserMappings);
    
    // Wrap the autocomplete click to show options menu after selection
    const onAutocompleteClick = (userId: string, username: string) => {
        originalOnAutocompleteClick(userId, username);
        // Show options menu after user selection
        setTimeout(() => {
            setShowOptions(true);
        }, 100);
    };
    
    // Wrap the onKeyDown handler to show options menu after Enter selection
    const onAutocompleteKeyDown = (e: KeyboardEvent) => {
        const handled = originalOnAutocompleteKeyDown(e);
        // If Enter or Tab was pressed and autocomplete was active, show options menu
        if (handled && (e.key === "Enter" || e.key === "Tab") && autocompleteState.type !== "none") {
            setTimeout(() => {
                setShowOptions(true);
            }, 100);
        }
        return handled;
    };
    
    const handleFocus = () => {
        // Check if we should skip showing options this time
        if (skipNextFocus.current) {
            skipNextFocus.current = false;
            onAutocompleteFocus();
            return;
        }
        
        onAutocompleteFocus();
        // Don't show options if we're in the middle of typing a filter
        const hasIncompleteFilter = query.match(/\b(from:|mentions:|has:|before:|after:|during:|between:)\s*$/);
        if (!hasIncompleteFilter && !showDatePicker && !showAttachmentTypes && autocompleteState.type === "none") {
            setShowOptions(true);
        }
    };
    
    const handleClick = () => {
        // Check if we're currently editing a filter
        const cursorPos = inputRef.current?.selectionStart || 0;
        const beforeCursor = query.slice(0, cursorPos);
        
        // Check if cursor is within a filter
        const isInFilter = beforeCursor.match(/\b(from:|mentions:|has:|before:|after:|during:|between:)[^\\s]*$/);
        
        // Show options when clicking on the input, if not editing a filter
        if (!isInFilter && !showOptions && autocompleteState.type === "none" && !showDatePicker && !showAttachmentTypes) {
            setShowOptions(true);
        }
    };
    
    const handleBlur = () => {
        onAutocompleteBlur();
        // Delay to allow clicking on options
        setTimeout(() => {
            // Check if we have an incomplete filter that should keep autocomplete open
            const hasUserFilter = query.match(/\b(from:|mentions:)[\s\S]*$/);
            const hasIncompleteDateFilter = query.match(/\b(before:|after:|during:)\s*$/);
            
            // Don't close options/autocomplete if we have a user filter
            if (!hasUserFilter && !hasIncompleteDateFilter && !showDatePicker) {
                setShowOptions(false);
                if (autocompleteState.type === "none") {
                    setAutocompleteState({ type: "none" });
                }
            }
        }, 200);
    };
    
    const handleInput = (e: Event) => {
        const value = (e.target as HTMLInputElement).value;
        const cursorPos = (e.target as HTMLInputElement).selectionStart || 0;
        
        // Check if user is trying to add space after incomplete filter
        const incompleteFilterWithSpace = value.match(/\b(from:|mentions:)\s+$/);
        if (incompleteFilterWithSpace && autocompleteState.type === "user") {
            // Don't allow space after filter unless user was selected
            return;
        }
        
        setQuery(value);
        
        // Clear user mappings and date range when query becomes empty
        if (value.trim() === "") {
            setUserMappings({});
            setActiveDateRange(null);
            // Reset search state and close sidebar when input is completely cleared
            if (isSearching) {
                setIsSearching(false);
                internalEmit("RightSidebar", "close");
            }
        }
        
        // Check for filters
        const beforeCursor = value.slice(0, cursorPos);
        
        // Check for user filters (from: and mentions:) - these should trigger autocomplete
        const fromMatch = beforeCursor.match(/\bfrom:[\s\S]*$/);
        const mentionsMatch = beforeCursor.match(/\bmentions:[\s\S]*$/);
        
        if (fromMatch || mentionsMatch) {
            // Close other dropdowns
            setShowOptions(false);
            setShowDatePicker(null);
            setShowAttachmentTypes(false);
            // Trigger autocomplete immediately for user filters
            onAutocompleteChange(e);
            return;
        }
        
        // Check for date filters
        const beforeMatch = beforeCursor.match(/\bbefore:\s*$/);
        const afterMatch = beforeCursor.match(/\bafter:\s*$/);
        const duringMatch = beforeCursor.match(/\bduring:\s*$/);
        const betweenMatch = beforeCursor.match(/\bbetween:\s*$/);
        const hasMatch = beforeCursor.match(/\bhas:\s*$/);
        
        if (beforeMatch) {
            setShowDatePicker("before");
            setShowOptions(false);
            setShowAttachmentTypes(false);
            setAutocompleteState({ type: "none" });
        } else if (afterMatch) {
            setShowDatePicker("after");
            setShowOptions(false);
            setShowAttachmentTypes(false);
            setAutocompleteState({ type: "none" });
        } else if (duringMatch) {
            setShowDatePicker("during");
            setShowOptions(false);
            setShowAttachmentTypes(false);
            setAutocompleteState({ type: "none" });
        } else if (betweenMatch) {
            setShowDatePicker("between");
            setShowOptions(false);
            setShowAttachmentTypes(false);
            setAutocompleteState({ type: "none" });
        } else if (hasMatch) {
            // Show attachment type options
            setShowAttachmentTypes(true);
            setShowOptions(false);
            setShowDatePicker(null);
            setAutocompleteState({ type: "none" });
        } else {
            // Check if "has:" was removed and close attachment types dropdown
            if (showAttachmentTypes && !value.includes("has:")) {
                setShowAttachmentTypes(false);
            }
            
            // Only trigger autocomplete if no date/has filter is active
            const filterActive = value.match(/\b(before:|after:|during:|between:|has:)\s*$/);
            if (!filterActive) {
                onAutocompleteChange(e);
                if (showDatePicker) {
                    setShowDatePicker(null);
                }
            }
        }
    };
    
    const handleSearch = () => {
        let trimmedQuery = query.trim();
        
        // Check for incomplete filters
        const hasIncompleteUserFilter = trimmedQuery.match(/\b(from:|mentions:)\s*$/);
        const hasIncompleteDateFilter = trimmedQuery.match(/\b(before:|after:|during:|between:)\s*$/);
        const hasIncompleteHasFilter = trimmedQuery.match(/\bhas:\s*$/);
        
        if (hasIncompleteUserFilter || hasIncompleteDateFilter || hasIncompleteHasFilter) {
            // Don't search if there's an incomplete filter
            return;
        }
        
        // Check for duplicate filters (only one of each type allowed)
        const checkDuplicates = (pattern: RegExp, filterName: string): boolean => {
            const matches = trimmedQuery.match(pattern) || [];
            if (matches.length > 1) {
                setShowDuplicateFilterError(true);
                setTimeout(() => setShowDuplicateFilterError(false), 3000);
                return true;
            }
            return false;
        };
        
        // Check each filter type for duplicates
        if (checkDuplicates(/\bfrom:@?[\w-]+/gi, "from")) return;
        if (checkDuplicates(/\bmentions:@?[\w-]+/gi, "mentions")) return;
        if (checkDuplicates(/\bbefore:\d{4}-\d{2}-\d{2}/gi, "before")) return;
        if (checkDuplicates(/\bafter:\d{4}-\d{2}-\d{2}/gi, "after")) return;
        if (checkDuplicates(/\bduring:\d{4}-\d{2}-\d{2}/gi, "during")) return;
        if (checkDuplicates(/\bbetween:\d{4}-\d{2}-\d{2}\.\.\d{4}-\d{2}-\d{2}/gi, "between")) return;
        
        // Check for multiple has: filters (only one attachment type filter allowed)
        const hasFilterMatches = trimmedQuery.match(/\bhas:(video|image|link|audio|file)/gi) || [];
        if (hasFilterMatches.length > 1) {
            // Show tooltip error message - only one attachment type filter is allowed
            setShowMultipleHasError(true);
            // Auto-hide after 3 seconds
            setTimeout(() => setShowMultipleHasError(false), 3000);
            return;
        }
        
        // Check for multiple date-range occurrences
        const dateRangeCount = (trimmedQuery.match(/\bdate-range\b/g) || []).length;
        if (dateRangeCount > 1) {
            // Show tooltip error message - only one date range is allowed
            setShowDateRangeError(true);
            // Auto-hide after 3 seconds
            setTimeout(() => setShowDateRangeError(false), 3000);
            return;
        }
        
        // Check if we have "date-range" in the query and replace it with actual dates
        if (dateRangeCount === 1 && activeDateRange) {
            // Replace "date-range" with the actual between filter for processing
            trimmedQuery = trimmedQuery.replace(/\bdate-range\b/, `between:${activeDateRange.start}..${activeDateRange.end}`);
        }
        
        // Transform query to use user IDs
        const searchParams = transformSearchQuery(trimmedQuery, userMappings);
        
        // Check if only server-wide is present without other filters
        if (searchParams.server_wide && 
            !searchParams.query && 
            !searchParams.author && 
            !searchParams.mention && 
            !searchParams.date_start && 
            !searchParams.date_end && 
            !searchParams.has) {
            
            // Show tooltip error message - server-wide requires other filters
            setShowServerWideError(true);
            // Auto-hide after 3 seconds
            setTimeout(() => setShowServerWideError(false), 3000);
            return;
        }
        
        // Check if we have any search criteria (query text or filters)
        // Allow empty query string if filters are present
        const hasFilters = searchParams.author || 
                          searchParams.mention || 
                          searchParams.date_start || 
                          searchParams.date_end ||
                          searchParams.has ||
                          searchParams.server_wide;
        
        const hasSearchCriteria = (searchParams.query && searchParams.query.trim() !== "") || hasFilters;
        
        if (hasSearchCriteria) {
            // Ensure the sidebar container is visible for desktop users
            if (!isTouchscreenDevice && !layout.getSectionState(SIDEBAR_MEMBERS, true)) {
                layout.setSectionState(SIDEBAR_MEMBERS, true, true);
                // Small delay to ensure the sidebar container is rendered first
                setTimeout(() => {
                    internalEmit("RightSidebar", "open", "search", searchParams);
                }, 50);
            } else {
                // Sidebar is already visible, emit immediately
                internalEmit("RightSidebar", "open", "search", searchParams);
            }
            
            setShowOptions(false);
            setIsSearching(true);
            setAutocompleteState({ type: "none" });
            inputRef.current?.blur();
            
            // On mobile, automatically slide to show search results
            if (isTouchscreenDevice) {
                setTimeout(() => {
                    const panels = document.querySelector("#app > div > div > div");
                    panels?.scrollTo({
                        behavior: "smooth",
                        left: panels.clientWidth * 3,
                    });
                }, 100); // Small delay to ensure sidebar is opened first
            }
        }
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
        const currentValue = (e.currentTarget as HTMLInputElement).value;
        const cursorPos = (e.currentTarget as HTMLInputElement).selectionStart || 0;
        
        // Handle backspace/delete for date filters and server-wide
        if (e.key === "Backspace" || e.key === "Delete") {
            const beforeCursor = currentValue.slice(0, cursorPos);
            const afterCursor = currentValue.slice(cursorPos);
            
            // Check for date filters with backspace
            if (e.key === "Backspace") {
                // Handle single date filters (before:, after:, during:)
                const singleDateMatch = beforeCursor.match(/\b(before|after|during):(\d{4}-\d{2}-\d{2})\s*$/);
                if (singleDateMatch) {
                    e.preventDefault();
                    const filterStart = singleDateMatch.index!;
                    
                    // Remove the entire filter and date
                    const newValue = currentValue.slice(0, filterStart) + afterCursor;
                    setQuery(newValue);
                    
                    // Position cursor where filter was
                    setTimeout(() => {
                        if (inputRef.current) {
                            inputRef.current.setSelectionRange(filterStart, filterStart);
                        }
                    }, 0);
                    return;
                }
                
                // Handle filter-only patterns (e.g., "before:" without date)
                const filterOnlyMatch = beforeCursor.match(/\b(before|after|during|between):\s*$/);
                if (filterOnlyMatch) {
                    e.preventDefault();
                    const filterStart = filterOnlyMatch.index!;
                    
                    // Remove the entire filter
                    const newValue = currentValue.slice(0, filterStart) + afterCursor;
                    setQuery(newValue);
                    
                    // Close date picker if open
                    setShowDatePicker(null);
                    
                    setTimeout(() => {
                        if (inputRef.current) {
                            inputRef.current.setSelectionRange(filterStart, filterStart);
                        }
                    }, 0);
                    return;
                }
                
                // Handle between date range filter
                const betweenMatch = beforeCursor.match(/\bbetween:(\d{4}-\d{2}-\d{2})\.\.(\d{4}-\d{2}-\d{2})\s*$/);
                if (betweenMatch) {
                    e.preventDefault();
                    const filterStart = betweenMatch.index!;
                    const startDate = betweenMatch[1];
                    
                    // Remove end date but keep "between:YYYY-MM-DD.."
                    const newValue = currentValue.slice(0, filterStart) + "between:" + startDate + ".." + afterCursor;
                    setQuery(newValue);
                    
                    const newCursorPos = filterStart + "between:".length + startDate.length + 2;
                    setTimeout(() => {
                        if (inputRef.current) {
                            inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
                        }
                    }, 0);
                    return;
                }
                
                // Handle partial between filter (between:YYYY-MM-DD..)
                const partialBetweenMatch = beforeCursor.match(/\bbetween:(\d{4}-\d{2}-\d{2})\.\.\s*$/);
                if (partialBetweenMatch) {
                    e.preventDefault();
                    const filterStart = partialBetweenMatch.index!;
                    const startDate = partialBetweenMatch[1];
                    
                    // Remove ".." to get "between:YYYY-MM-DD"
                    const newValue = currentValue.slice(0, filterStart) + "between:" + startDate + afterCursor;
                    setQuery(newValue);
                    
                    const newCursorPos = filterStart + "between:".length + startDate.length;
                    setTimeout(() => {
                        if (inputRef.current) {
                            inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
                        }
                    }, 0);
                    return;
                }
                
                // Handle between with only start date (between:YYYY-MM-DD)
                const betweenStartOnlyMatch = beforeCursor.match(/\bbetween:(\d{4}-\d{2}-\d{2})\s*$/);
                if (betweenStartOnlyMatch) {
                    e.preventDefault();
                    const filterStart = betweenStartOnlyMatch.index!;
                    
                    // Remove date but keep "between:"
                    const newValue = currentValue.slice(0, filterStart) + "between:" + afterCursor;
                    setQuery(newValue);
                    
                    const newCursorPos = filterStart + "between:".length;
                    setTimeout(() => {
                        if (inputRef.current) {
                            inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
                            // Open the date picker in between mode
                            setShowDatePicker("between");
                            setShowOptions(false);
                        }
                    }, 0);
                    return;
                }
                
                // Handle date-range keyword removal
                const dateRangeMatch = beforeCursor.match(/\bdate-range\s*$/);
                if (dateRangeMatch) {
                    e.preventDefault();
                    const filterStart = dateRangeMatch.index!;
                    
                    // Remove the keyword and clear the stored date range
                    const newValue = currentValue.slice(0, filterStart) + afterCursor;
                    setQuery(newValue);
                    setActiveDateRange(null);
                    
                    // Position cursor where filter was
                    setTimeout(() => {
                        if (inputRef.current) {
                            inputRef.current.setSelectionRange(filterStart, filterStart);
                        }
                    }, 0);
                    return;
                }
                
                // Handle has: filter removal
                const hasMatch = beforeCursor.match(/\bhas:(video|image|link|audio|file)\s*$/);
                if (hasMatch) {
                    e.preventDefault();
                    const filterStart = hasMatch.index!;
                    
                    // Remove the entire filter
                    const newValue = currentValue.slice(0, filterStart) + afterCursor;
                    setQuery(newValue);
                    
                    // Position cursor where filter was
                    setTimeout(() => {
                        if (inputRef.current) {
                            inputRef.current.setSelectionRange(filterStart, filterStart);
                        }
                    }, 0);
                    return;
                }
                
                // Handle has: without value
                const hasOnlyMatch = beforeCursor.match(/\bhas:\s*$/);
                if (hasOnlyMatch) {
                    e.preventDefault();
                    const filterStart = hasOnlyMatch.index!;
                    
                    // Remove the entire filter
                    const newValue = currentValue.slice(0, filterStart) + afterCursor;
                    setQuery(newValue);
                    
                    setTimeout(() => {
                        if (inputRef.current) {
                            inputRef.current.setSelectionRange(filterStart, filterStart);
                        }
                    }, 0);
                    return;
                }
                
                // Original server-wide handling
                const serverWideMatch = beforeCursor.match(/\bserver-wide\s*$/);
                if (serverWideMatch) {
                    e.preventDefault();
                    const newValue = currentValue.slice(0, serverWideMatch.index) + afterCursor;
                    setQuery(newValue);
                    // Set cursor position to where server-wide started
                    setTimeout(() => {
                        if (inputRef.current) {
                            inputRef.current.setSelectionRange(serverWideMatch.index, serverWideMatch.index);
                        }
                    }, 0);
                    return;
                }
            } else if (e.key === "Delete") {
                // Handle date filters with delete key
                // Check if we're at a filter: position
                const filterMatch = afterCursor.match(/^(before|after|during|between):(\d{4}-\d{2}-\d{2})?/);
                if (filterMatch && beforeCursor.match(/\s$|^$/)) {
                    e.preventDefault();
                    const filterType = filterMatch[1];
                    const hasDate = filterMatch[2];
                    
                    if (hasDate) {
                        // Remove entire filter and date
                        const newValue = beforeCursor + afterCursor.slice(filterMatch[0].length).trimStart();
                        setQuery(newValue);
                    } else {
                        // Just filter: without date, remove it
                        const newValue = beforeCursor + afterCursor.slice(filterType.length + 1).trimStart();
                        setQuery(newValue);
                    }
                    
                    setTimeout(() => {
                        if (inputRef.current) {
                            inputRef.current.setSelectionRange(beforeCursor.length, beforeCursor.length);
                        }
                    }, 0);
                    return;
                }
                
                // Handle has: filter with delete key
                const hasAfter = afterCursor.match(/^has:(video|image|link|audio|file)?\s*/);
                if (hasAfter) {
                    e.preventDefault();
                    const newValue = beforeCursor + afterCursor.slice(hasAfter[0].length);
                    setQuery(newValue);
                    return;
                }
                
                // Original server-wide handling
                const serverWideAfter = afterCursor.match(/^server-wide\s*/);
                if (serverWideAfter) {
                    e.preventDefault();
                    const newValue = beforeCursor + afterCursor.slice(serverWideAfter[0].length);
                    setQuery(newValue);
                    return;
                }
            }
        }
        
        // Check if user is trying to type space when there's an incomplete filter
        if (e.key === " " || e.key === "Spacebar") {
            const beforeCursor = currentValue.slice(0, cursorPos);
            const afterCursor = currentValue.slice(cursorPos);
            
            // Check if cursor is within or right after a filter
            const lastFromIndex = beforeCursor.lastIndexOf("from:");
            const lastMentionsIndex = beforeCursor.lastIndexOf("mentions:");
            
            if (lastFromIndex !== -1 || lastMentionsIndex !== -1) {
                const filterIndex = Math.max(lastFromIndex, lastMentionsIndex);
                const afterFilter = beforeCursor.slice(filterIndex);
                
                // Check if we're still within the filter (no space after it in the part before cursor)
                if (!afterFilter.includes(" ")) {
                    // Also check if there's no space immediately after cursor (editing in middle of username)
                    const hasSpaceAfterCursor = afterCursor.startsWith(" ");
                    
                    if (!hasSpaceAfterCursor) {
                        // We're within a filter and trying to add space - always prevent
                        e.preventDefault();
                        return;
                    }
                }
            }
        }
        
        // Let autocomplete handle key events first
        if (onAutocompleteKeyDown(e)) {
            return;
        }
        
        if (e.key === "Enter") {
            // Don't search if autocomplete is showing
            if (autocompleteState.type === "none") {
                handleSearch();
            }
        } else if (e.key === "Escape") {
            if (query) {
                setQuery("");
                setUserMappings({});
                setActiveDateRange(null);
                // Reset search state and close sidebar when query is cleared
                if (isSearching) {
                    setIsSearching(false);
                    internalEmit("RightSidebar", "close");
                }
            } else {
                inputRef.current?.blur();
            }
            if (isSearching && !query) {
                internalEmit("RightSidebar", "close");
                setIsSearching(false);
            }
        }
    };
    
    const handleClear = () => {
        setQuery("");
        setIsSearching(false);
        setUserMappings({});
        setActiveDateRange(null);
        inputRef.current?.focus();
        internalEmit("RightSidebar", "close");
    };
    
    const handleOptionClick = (option: SearchOption) => {
        // If it's a date filter, just show the date picker without adding text
        if (option.label === "before:" || option.label === "after:" || option.label === "during:" || option.label === "between:") {
            setShowDatePicker(option.label.slice(0, -1) as "before" | "after" | "during" | "between");
            setShowOptions(false);
            // Ensure autocomplete is hidden
            setAutocompleteState({ type: "none" });
        } else if (option.label === "has:") {
            // For has: filter, add it and show attachment type options
            const newQuery = query + (query ? " " : "") + "has:";
            setQuery(newQuery);
            setShowOptions(false);
            setShowAttachmentTypes(true);
            // Ensure autocomplete is hidden
            setAutocompleteState({ type: "none" });
            
            // Move cursor after "has:"
            setTimeout(() => {
                if (inputRef.current) {
                    const endPos = newQuery.length;
                    inputRef.current.setSelectionRange(endPos, endPos);
                    inputRef.current.focus();
                }
            }, 0);
        } else if (option.label === "server-wide") {
            // For server-wide, add it as a standalone filter with auto-space
            const newQuery = query + (query ? " " : "") + "server-wide ";
            setQuery(newQuery);
            setShowOptions(false);
            // Ensure autocomplete is hidden
            setAutocompleteState({ type: "none" });
            
            // Set flag to skip showing options on the next focus
            skipNextFocus.current = true;
            
            // Move cursor to end after the space
            setTimeout(() => {
                if (inputRef.current) {
                    const endPos = newQuery.length;
                    inputRef.current.setSelectionRange(endPos, endPos);
                    inputRef.current.focus();
                }
            }, 0);
        } else if (option.label === "from:" || option.label === "mentions:") {
            // For user filters, add the text and let the user type to trigger autocomplete
            const newQuery = query + (query ? " " : "") + option.label;
            setQuery(newQuery);
            setShowOptions(false);
            
            // Focus and position cursor
            setTimeout(() => {
                if (inputRef.current) {
                    const endPos = newQuery.length;
                    inputRef.current.setSelectionRange(endPos, endPos);
                    inputRef.current.focus();
                }
            }, 0);
        } else {
            // For other filters, add the text immediately
            const newQuery = query + (query ? " " : "") + option.label;
            setQuery(newQuery);
            // Ensure autocomplete is hidden
            setAutocompleteState({ type: "none" });
            inputRef.current?.focus();
        }
    };
    
    const handleAttachmentTypeClick = (type: string) => {
        // Add the attachment type to the query
        const newQuery = query + type + " ";
        setQuery(newQuery);
        setShowAttachmentTypes(false);
        
        // Move cursor to end and focus
        setTimeout(() => {
            if (inputRef.current) {
                const endPos = newQuery.length;
                inputRef.current.setSelectionRange(endPos, endPos);
                inputRef.current.focus();
            }
        }, 0);
    };
    
    // Format date to YYYY-MM-DD in local timezone
    const formatLocalDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    
    const handleDateSelect = (date: Date) => {
        const dateStr = formatLocalDate(date); // Use local date formatting
        
        // Add the filter and date to the query with auto-space
        const filterText = `${showDatePicker}:${dateStr} `;
        const newQuery = query + (query ? " " : "") + filterText;
        
        setQuery(newQuery);
        setShowDatePicker(null);
        
        // Move cursor to end after the space
        setTimeout(() => {
            if (inputRef.current) {
                const endPos = newQuery.length;
                inputRef.current.setSelectionRange(endPos, endPos);
                inputRef.current.focus();
            }
        }, 0);
    };
    
    const handleRangeSelect = (startDate: Date, endDate: Date) => {
        const startStr = formatLocalDate(startDate);
        const endStr = formatLocalDate(endDate);
        
        // Store the actual date range in state
        setActiveDateRange({
            start: startStr,
            end: endStr,
            startDisplay: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            endDisplay: endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        });
        
        // Only add "date-range" to the query, not the actual dates
        const filterText = `date-range `;
        const newQuery = query + (query ? " " : "") + filterText;
        
        setQuery(newQuery);
        setShowDatePicker(null);
        
        // Move cursor to end after the space
        setTimeout(() => {
            if (inputRef.current) {
                const endPos = newQuery.length;
                inputRef.current.setSelectionRange(endPos, endPos);
                inputRef.current.focus();
            }
        }, 0);
    };
    
    
    // Global keyboard shortcut
    useEffect(() => {
        const handleGlobalKeydown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };
        
        window.addEventListener("keydown", handleGlobalKeydown);
        return () => window.removeEventListener("keydown", handleGlobalKeydown);
    }, []);
    
    // Close date picker or attachment types when clicking outside
    useEffect(() => {
        if (showDatePicker || showAttachmentTypes) {
            const handleClickOutside = (e: MouseEvent) => {
                // Check if click is outside the container
                const container = e.target as HTMLElement;
                if (!container.closest('[data-search-container]') && !container.closest('[data-date-picker]')) {
                    setShowDatePicker(null);
                    setShowAttachmentTypes(false);
                }
            };
            
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [showDatePicker, showAttachmentTypes]);
    
    return (
        <Container data-search-container onMouseDown={(e) => e.stopPropagation()}>
            <Input
                ref={inputRef}
                type="text"
                placeholder="Search"
                value={query}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onClick={handleClick}
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                onKeyUp={onKeyUp}
            />
            {isSearching ? (
                <IconButton onClick={handleClear}>
                    <X size={18} />
                </IconButton>
            ) : (
                <IconButton onClick={handleSearch}>
                    <Search size={18} />
                </IconButton>
            )}
            {autocompleteState.type !== "none" && (
                <SearchAutoComplete
                    state={autocompleteState}
                    setState={setAutocompleteState}
                    onClick={onAutocompleteClick}
                />
            )}
            {showOptions && autocompleteState.type === "none" && !showDatePicker && !showAttachmentTypes && (
                <OptionsDropdown onClick={(e) => e.stopPropagation()}>
                    <OptionsHeader>{"Search Options"}</OptionsHeader>
                    {searchOptions.map((option) => (
                        <Option
                            key={option.label}
                            onClick={() => handleOptionClick(option)}
                        >
                            <OptionLabel>{option.label}</OptionLabel>
                            <OptionDesc>{option.description}</OptionDesc>
                            <Tooltip content={option.tooltip} placement="top">
                                <HelpIcon size={16} />
                            </Tooltip>
                        </Option>
                    ))}
                </OptionsDropdown>
            )}
            {showDatePicker && (
                <SearchDatePicker
                    onSelect={handleDateSelect}
                    onRangeSelect={handleRangeSelect}
                    filterType={showDatePicker}
                />
            )}
            {showAttachmentTypes && (
                <OptionsDropdown onClick={(e) => e.stopPropagation()}>
                    <OptionsHeader>Attachment Types</OptionsHeader>
                    <Option onClick={() => handleAttachmentTypeClick("video")}>
                        <OptionLabel>video</OptionLabel>
                        <OptionDesc>Messages with videos</OptionDesc>
                    </Option>
                    <Option onClick={() => handleAttachmentTypeClick("image")}>
                        <OptionLabel>image</OptionLabel>
                        <OptionDesc>Messages with images</OptionDesc>
                    </Option>
                    <Option onClick={() => handleAttachmentTypeClick("link")}>
                        <OptionLabel>link</OptionLabel>
                        <OptionDesc>Messages with links</OptionDesc>
                    </Option>
                    <Option onClick={() => handleAttachmentTypeClick("audio")}>
                        <OptionLabel>audio</OptionLabel>
                        <OptionDesc>Messages with audio</OptionDesc>
                    </Option>
                    <Option onClick={() => handleAttachmentTypeClick("file")}>
                        <OptionLabel>file</OptionLabel>
                        <OptionDesc>Messages with files</OptionDesc>
                    </Option>
                </OptionsDropdown>
            )}
        </Container>
    );
}