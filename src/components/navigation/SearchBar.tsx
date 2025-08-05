import { Search, X } from "@styled-icons/boxicons-regular";
import { HelpCircle } from "@styled-icons/boxicons-solid";
import styled from "styled-components/macro";
import { useEffect, useRef, useState } from "preact/hooks";
import { Tooltip } from "@revoltchat/ui";
import { internalEmit } from "../../lib/eventEmitter";
import { useSearchAutoComplete, transformSearchQuery, UserMapping } from "../../lib/hooks/useSearchAutoComplete";
import SearchAutoComplete from "./SearchAutoComplete";
import SearchDatePicker from "./SearchDatePicker";

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
    padding: 6px 2px 6px 12px;
    outline: none;
    
    &::placeholder {
        color: var(--tertiary-foreground);
    }
`;

const IconButton = styled.div`
    display: flex;
    align-items: center;
    padding: 0 12px 0 8px;
    color: var(--tertiary-foreground);
    cursor: pointer;
    transition: color 0.1s ease;
    
    &:hover {
        color: var(--foreground);
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
`;

const OptionsHeader = styled.div`
    padding: 0 8px 8px 8px;
    font-size: 12px;
    color: var(--tertiary-foreground);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
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
`;

const OptionLabel = styled.span`
    color: var(--foreground);
    font-weight: 500;
    margin-right: 8px;
    font-family: var(--monospace-font), monospace;
    font-size: 13px;
    white-space: nowrap;
`;

const OptionDesc = styled.span`
    color: var(--tertiary-foreground);
    font-size: 13px;
    flex: 1;
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
        label: "server-wide",
        description: "Entire server",
        tooltip: "Search in entire server instead of just this channel"
    }
];

export function SearchBar() {
    const [query, setQuery] = useState("");
    const [showOptions, setShowOptions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [userMappings, setUserMappings] = useState<UserMapping>({});
    const [showDatePicker, setShowDatePicker] = useState<"before" | "after" | "during" | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    
    // Setup autocomplete
    const {
        state: autocompleteState,
        setState: setAutocompleteState,
        onKeyUp,
        onKeyDown: onAutocompleteKeyDown,
        onChange: onAutocompleteChange,
        onClick: onAutocompleteClick,
        onFocus: onAutocompleteFocus,
        onBlur: onAutocompleteBlur,
    } = useSearchAutoComplete(setQuery, userMappings, setUserMappings);
    
    const handleFocus = () => {
        onAutocompleteFocus();
        setShowOptions(true);
    };
    
    const handleClick = () => {
        // Show options when clicking on the input, even if already focused
        if (!showOptions && autocompleteState.type === "none" && !showDatePicker) {
            setShowOptions(true);
        }
    };
    
    const handleBlur = () => {
        onAutocompleteBlur();
        // Delay to allow clicking on options
        setTimeout(() => {
            // Check if we have an incomplete filter
            const hasIncompleteFilter = query.match(/\b(from:|mentions:)\s*$/);
            const hasIncompleteDateFilter = query.match(/\b(before:|after:|during:)\s*$/);
            
            if (!hasIncompleteFilter && !hasIncompleteDateFilter && !showDatePicker) {
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
        
        // Check for date filters
        const beforeCursor = value.slice(0, cursorPos);
        const beforeMatch = beforeCursor.match(/\bbefore:\s*$/);
        const afterMatch = beforeCursor.match(/\bafter:\s*$/);
        const duringMatch = beforeCursor.match(/\bduring:\s*$/);
        
        if (beforeMatch) {
            setShowDatePicker("before");
            setShowOptions(false);
            setAutocompleteState({ type: "none" });
        } else if (afterMatch) {
            setShowDatePicker("after");
            setShowOptions(false);
            setAutocompleteState({ type: "none" });
        } else if (duringMatch) {
            setShowDatePicker("during");
            setShowOptions(false);
            setAutocompleteState({ type: "none" });
        } else {
            // Only trigger autocomplete if no date filter is active
            const dateFilterActive = value.match(/\b(before:|after:|during:)\s*$/);
            if (!dateFilterActive) {
                onAutocompleteChange(e);
                if (showDatePicker) {
                    setShowDatePicker(null);
                }
            }
        }
    };
    
    const handleSearch = () => {
        const trimmedQuery = query.trim();
        
        // Check for incomplete filters (only user filters, not date filters)
        const hasIncompleteUserFilter = trimmedQuery.match(/\b(from:|mentions:)\s*$/);
        const hasIncompleteDateFilter = trimmedQuery.match(/\b(before:|after:|during:)\s*$/);
        
        if (hasIncompleteUserFilter || hasIncompleteDateFilter) {
            // Don't search if there's an incomplete filter
            return;
        }
        
        // Transform query to use user IDs
        const searchParams = transformSearchQuery(trimmedQuery, userMappings);
        
        // Check if we have any search criteria (query text or filters)
        const hasSearchCriteria = searchParams.query || 
                                searchParams.author || 
                                searchParams.mention || 
                                searchParams.before_date || 
                                searchParams.after_date || 
                                searchParams.during ||
                                searchParams.server_wide;
        
        if (hasSearchCriteria) {
            // Open search in right sidebar with transformed query
            internalEmit("RightSidebar", "open", "search", searchParams);
            setShowOptions(false);
            setIsSearching(true);
            setAutocompleteState({ type: "none" });
            inputRef.current?.blur();
        }
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
        const currentValue = (e.currentTarget as HTMLInputElement).value;
        const cursorPos = (e.currentTarget as HTMLInputElement).selectionStart || 0;
        
        // Handle backspace/delete for server-wide
        if (e.key === "Backspace" || e.key === "Delete") {
            const beforeCursor = currentValue.slice(0, cursorPos);
            const afterCursor = currentValue.slice(cursorPos);
            
            // Check if we're at the end of "server-wide" or within it
            if (e.key === "Backspace") {
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
                // Check if cursor is at the beginning of server-wide
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
            } else {
                inputRef.current?.blur();
            }
            if (isSearching) {
                internalEmit("RightSidebar", "close");
                setIsSearching(false);
            }
        }
    };
    
    const handleClear = () => {
        setQuery("");
        setIsSearching(false);
        inputRef.current?.focus();
        internalEmit("RightSidebar", "close");
    };
    
    const handleOptionClick = (option: SearchOption) => {
        // If it's a date filter, just show the date picker without adding text
        if (option.label === "before:" || option.label === "after:" || option.label === "during:") {
            setShowDatePicker(option.label.slice(0, -1) as "before" | "after" | "during");
            setShowOptions(false);
        } else if (option.label === "server-wide") {
            // For server-wide, add it as a standalone filter with auto-space
            const newQuery = query + (query ? " " : "") + "server-wide ";
            setQuery(newQuery);
            setShowOptions(false);
            
            // Move cursor to end after the space
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
            inputRef.current?.focus();
        }
    };
    
    const handleDateSelect = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD for display
        
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
    
    // Close date picker when clicking outside
    useEffect(() => {
        if (showDatePicker) {
            const handleClickOutside = (e: MouseEvent) => {
                // Check if click is outside the container
                const container = e.target as HTMLElement;
                if (!container.closest('[data-search-container]') && !container.closest('[data-date-picker]')) {
                    setShowDatePicker(null);
                }
            };
            
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [showDatePicker]);
    
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
            {showOptions && autocompleteState.type === "none" && !showDatePicker && (
                <OptionsDropdown onClick={(e) => e.stopPropagation()}>
                    <OptionsHeader>{"Search Options"}</OptionsHeader>
                    {searchOptions.map((option) => (
                        <Option
                            key={option.label}
                            onClick={() => handleOptionClick(option)}
                        >
                            <OptionLabel>{option.label}</OptionLabel>
                            <OptionDesc>{option.description}</OptionDesc>
                            <Tooltip content={option.tooltip} placement="right">
                                <HelpIcon size={16} />
                            </Tooltip>
                        </Option>
                    ))}
                </OptionsDropdown>
            )}
            {showDatePicker && (
                <SearchDatePicker
                    onSelect={handleDateSelect}
                    filterType={showDatePicker}
                />
            )}
        </Container>
    );
}