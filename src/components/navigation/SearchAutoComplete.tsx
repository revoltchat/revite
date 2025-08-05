import styled from "styled-components/macro";
import { User } from "revolt.js";
import { AutoCompleteState } from "../common/AutoComplete";
import UserIcon from "../common/user/UserIcon";

const Base = styled.div`
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 4px;
    background: var(--primary-background);
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    z-index: 1001;
    overflow: hidden;
    max-height: 200px;
    overflow-y: auto;

    button {
        width: 100%;
        gap: 8px;
        padding: 8px 12px;
        border: none;
        display: flex;
        font-size: 14px;
        cursor: pointer;
        align-items: center;
        flex-direction: row;
        font-family: inherit;
        background: transparent;
        color: var(--foreground);
        text-align: left;
        transition: background 0.15s ease;

        &:hover,
        &.active {
            background: var(--secondary-background);
        }

        span {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }
`;

interface Props {
    state: AutoCompleteState;
    setState: (state: AutoCompleteState) => void;
    onClick: (userId: string, username: string) => void;
}

export default function SearchAutoComplete({ state, setState, onClick }: Props) {
    if (state.type !== "user") return null;

    return (
        <Base>
            {state.matches.length > 0 ? (
                state.matches.map((user, i) => (
                    <button
                        key={user._id}
                        className={i === state.selected ? "active" : ""}
                        onMouseEnter={() =>
                            (i !== state.selected || !state.within) &&
                            setState({
                                ...state,
                                selected: i,
                                within: true,
                            })
                        }
                        onMouseLeave={() =>
                            state.within &&
                            setState({
                                ...state,
                                within: false,
                            })
                        }
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onClick(user._id, user.username);
                        }}>
                        <UserIcon size={20} target={user} status={true} />
                        <span>{user.username}</span>
                    </button>
                ))
            ) : (
                <div style={{
                    padding: "12px",
                    textAlign: "center",
                    color: "var(--tertiary-foreground)",
                    fontSize: "13px"
                }}>
                    No users found
                </div>
            )}
        </Base>
    );
}