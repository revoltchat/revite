import styled from "styled-components/macro";
import { useState, useEffect, useRef } from "preact/hooks";
import { ChevronLeft, ChevronRight } from "@styled-icons/boxicons-regular";

const Base = styled.div`
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 4px;
    background: var(--primary-background);
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    z-index: 1002;
    overflow: hidden;
    padding: 12px;
    min-width: 280px;
    
    @media (max-width: 768px) {
        min-width: 240px;
        right: -20px;
    }
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    padding: 0 4px;
`;

const MonthYear = styled.div`
    font-weight: 600;
    color: var(--foreground);
    font-size: 14px;
`;

const NavButton = styled.button`
    background: transparent;
    border: none;
    color: var(--tertiary-foreground);
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    transition: all 0.1s ease;
    
    &:hover {
        background: var(--secondary-background);
        color: var(--foreground);
    }
`;

const WeekDays = styled.div`
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
    margin-bottom: 8px;
`;

const WeekDay = styled.div`
    text-align: center;
    font-size: 11px;
    font-weight: 600;
    color: var(--tertiary-foreground);
    text-transform: uppercase;
    padding: 4px;
`;

const Days = styled.div`
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
`;

const Day = styled.button<{ 
    isToday?: boolean; 
    isSelected?: boolean; 
    isOtherMonth?: boolean;
    isRangeStart?: boolean;
    isRangeEnd?: boolean;
    isInRange?: boolean;
    isInHoverRange?: boolean;
}>`
    background: ${props => {
        if (props.isSelected || props.isRangeStart || props.isRangeEnd) return 'var(--accent)';
        if (props.isInRange) return 'var(--accent-disabled)';
        if (props.isInHoverRange) return 'var(--hover)';
        return 'transparent';
    }};
    color: ${props => {
        if (props.isSelected || props.isRangeStart || props.isRangeEnd) return 'var(--accent-contrast)';
        if (props.isOtherMonth) return 'var(--tertiary-foreground)';
        return 'var(--foreground)';
    }};
    border: none;
    padding: 8px;
    border-radius: ${props => {
        if (props.isRangeStart || (props.isInHoverRange && props.isOtherMonth === false && !props.isRangeEnd)) return '4px 0 0 4px';
        if (props.isRangeEnd || (props.isInHoverRange && props.isOtherMonth === false && !props.isRangeStart)) return '0 4px 4px 0';
        if (props.isInRange || props.isInHoverRange) return '0';
        return '4px';
    }};
    cursor: pointer;
    font-size: 13px;
    transition: all 0.1s ease;
    position: relative;
    
    ${props => props.isToday && `
        &::after {
            content: '';
            position: absolute;
            bottom: 2px;
            left: 50%;
            transform: translateX(-50%);
            width: 4px;
            height: 4px;
            border-radius: 50%;
            background: ${props.isSelected || props.isRangeStart || props.isRangeEnd ? 'var(--accent-contrast)' : 'var(--accent)'};
        }
    `}
    
    &:hover {
        background: ${props => {
            if (props.isSelected || props.isRangeStart || props.isRangeEnd) return 'var(--accent)';
            return 'var(--secondary-background)';
        }};
    }
    
    &:disabled {
        cursor: not-allowed;
        opacity: 0.5;
    }
`;

const QuickSelects = styled.div`
    display: flex;
    gap: 4px;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--secondary-background);
`;

const RangePreview = styled.div`
    margin: 12px 0;
    padding: 8px 12px;
    background: var(--secondary-background);
    border-radius: 4px;
    font-size: 13px;
    color: var(--foreground);
    text-align: center;
    
    .hint {
        color: var(--tertiary-foreground);
        font-size: 12px;
        margin-top: 4px;
    }
`;

const QuickSelect = styled.button`
    background: transparent;
    border: 1px solid var(--secondary-background);
    color: var(--foreground);
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.1s ease;
    
    &:hover {
        background: var(--secondary-background);
        border-color: var(--tertiary-background);
    }
`;

interface Props {
    onSelect: (date: Date) => void;
    onRangeSelect?: (startDate: Date, endDate: Date) => void;
    filterType: "before" | "after" | "during" | "between";
}

export default function SearchDatePicker({ onSelect, onRangeSelect, filterType }: Props) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [rangeStart, setRangeStart] = useState<Date | null>(null);
    const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
    const [hoverDate, setHoverDate] = useState<Date | null>(null);
    
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        const days: Array<{ date: Date; isOtherMonth: boolean }> = [];
        
        // Previous month days
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            days.push({
                date: new Date(year, month - 1, prevMonthLastDay - i),
                isOtherMonth: true
            });
        }
        
        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                date: new Date(year, month, i),
                isOtherMonth: false
            });
        }
        
        // Next month days to fill the grid
        const remainingDays = 42 - days.length; // 6 weeks * 7 days
        for (let i = 1; i <= remainingDays; i++) {
            days.push({
                date: new Date(year, month + 1, i),
                isOtherMonth: true
            });
        }
        
        return days;
    };
    
    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };
    
    const isSameDate = (date1: Date, date2: Date | null) => {
        if (!date2) return false;
        return date1.toDateString() === date2.toDateString();
    };
    
    const isDateInRange = (date: Date) => {
        if (!rangeStart || !rangeEnd) return false;
        return date >= rangeStart && date <= rangeEnd;
    };
    
    const isDateInHoverRange = (date: Date) => {
        if (filterType !== "between" || !rangeStart || rangeEnd || !hoverDate) return false;
        const start = rangeStart < hoverDate ? rangeStart : hoverDate;
        const end = rangeStart < hoverDate ? hoverDate : rangeStart;
        return date >= start && date <= end;
    };
    
    const handleDateSelect = (date: Date) => {
        if (filterType === "between") {
            if (!rangeStart || (rangeStart && rangeEnd)) {
                // First click or reset
                setRangeStart(date);
                setRangeEnd(null);
            } else {
                // Second click
                if (date < rangeStart) {
                    setRangeEnd(rangeStart);
                    setRangeStart(date);
                } else {
                    setRangeEnd(date);
                }
                // Call the callback with both dates
                if (onRangeSelect) {
                    const start = date < rangeStart ? date : rangeStart;
                    const end = date < rangeStart ? rangeStart : date;
                    onRangeSelect(start, end);
                }
            }
        } else {
            setSelectedDate(date);
            onSelect(date);
        }
    };
    
    const handleQuickSelect = (option: string) => {
        const today = new Date();
        let date: Date;
        
        switch (option) {
            case "today":
                date = today;
                break;
            case "yesterday":
                date = new Date(today);
                date.setDate(today.getDate() - 1);
                break;
            case "week":
                date = new Date(today);
                date.setDate(today.getDate() - 7);
                break;
            case "month":
                date = new Date(today);
                date.setMonth(today.getMonth() - 1);
                break;
            default:
                return;
        }
        
        handleDateSelect(date);
    };
    
    const navigateMonth = (direction: number) => {
        const newMonth = new Date(currentMonth);
        newMonth.setMonth(currentMonth.getMonth() + direction);
        setCurrentMonth(newMonth);
    };
    
    const days = getDaysInMonth(currentMonth);
    
    return (
        <Base data-date-picker onClick={(e) => e.stopPropagation()}>
            <Header>
                <NavButton onClick={() => navigateMonth(-1)}>
                    <ChevronLeft size={20} />
                </NavButton>
                <MonthYear>
                    {filterType === "between" && rangeStart && !rangeEnd 
                        ? "Select end date" 
                        : `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`
                    }
                </MonthYear>
                <NavButton onClick={() => navigateMonth(1)}>
                    <ChevronRight size={20} />
                </NavButton>
            </Header>
            
            <WeekDays>
                {weekDays.map(day => (
                    <WeekDay key={day}>{day}</WeekDay>
                ))}
            </WeekDays>
            
            <Days>
                {days.map((day, index) => (
                    <Day
                        key={index}
                        onClick={() => handleDateSelect(day.date)}
                        onMouseEnter={() => setHoverDate(day.date)}
                        onMouseLeave={() => setHoverDate(null)}
                        isToday={isToday(day.date)}
                        isSelected={filterType !== "between" && isSameDate(day.date, selectedDate)}
                        isRangeStart={filterType === "between" && rangeStart && isSameDate(day.date, rangeStart)}
                        isRangeEnd={filterType === "between" && rangeEnd && isSameDate(day.date, rangeEnd)}
                        isInRange={filterType === "between" && isDateInRange(day.date)}
                        isInHoverRange={isDateInHoverRange(day.date)}
                        isOtherMonth={day.isOtherMonth}
                    >
                        {day.date.getDate()}
                    </Day>
                ))}
            </Days>
            
            
            <QuickSelects>
                <QuickSelect onClick={() => handleQuickSelect("today")}>
                    Today
                </QuickSelect>
                <QuickSelect onClick={() => handleQuickSelect("yesterday")}>
                    Yesterday
                </QuickSelect>
                <QuickSelect onClick={() => handleQuickSelect("week")}>
                    Last week
                </QuickSelect>
                <QuickSelect onClick={() => handleQuickSelect("month")}>
                    Last month
                </QuickSelect>
            </QuickSelects>
        </Base>
    );
}