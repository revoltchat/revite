import { StateUpdater, useContext, useState } from "preact/hooks";
import { AppContext } from "../../context/revoltjs/RevoltClient";
import { Channels } from "revolt.js/dist/api/objects";
import { emojiDictionary } from "../../assets/emojis";
import { SYSTEM_USER_ID, User } from "revolt.js";
import UserIcon from "./user/UserIcon";
import styled from "styled-components";
import Emoji from "./Emoji";
import ChannelIcon from "./ChannelIcon";

export type AutoCompleteState =
    | { type: "none" }
    | ({ selected: number; within: boolean; } & (
        {
            type: "emoji";
            matches: string[];
        } |
        {
            type: "user";
            matches: User[];
        } |
        {
            type: "channel";
            matches: Channels.TextChannel[];
        }
    ));

export type SearchClues = {
    users?: { type: 'channel', id: string } | { type: 'all' },
    channels?: { server: string }
};

export type AutoCompleteProps = {
    state: AutoCompleteState,
    setState: StateUpdater<AutoCompleteState>,

    onKeyUp: (ev: KeyboardEvent) => void,
    onKeyDown: (ev: KeyboardEvent) => boolean,
    onChange: (ev: JSX.TargetedEvent<HTMLTextAreaElement, Event>) => void,
    onClick: JSX.MouseEventHandler<HTMLButtonElement>,
    onFocus: JSX.FocusEventHandler<HTMLTextAreaElement>,
    onBlur: JSX.FocusEventHandler<HTMLTextAreaElement>
}

export function useAutoComplete(setValue: (v?: string) => void, searchClues?: SearchClues): AutoCompleteProps {
    const [state, setState] = useState<AutoCompleteState>({ type: 'none' });
    const [focused, setFocused] = useState(false);
    const client = useContext(AppContext);

    function findSearchString(
        el: HTMLTextAreaElement
    ): ["emoji" | "user" | "channel", string, number] | undefined {
        if (el.selectionStart === el.selectionEnd) {
            let cursor = el.selectionStart;
            let content = el.value.slice(0, cursor);

            let valid = /\w/;

            let j = content.length - 1;
            if (content[j] === '@') {
                return [
                    "user",
                    "",
                    j
                ];
            } else if (content[j] === '#') {
                return [
                    "channel",
                    "",
                    j
                ];
            }

            while (j >= 0 && valid.test(content[j])) {
                j--;
            }

            if (j === -1) return;
            let current = content[j];

            if (current === ":" || current === "@" || current === "#") {
                let search = content.slice(j + 1, content.length);
                if (search.length > 0) {
                    return [
                        current === "#" ? "channel" :
                        current === ":" ? "emoji" : "user",
                        search.toLowerCase(),
                        j + 1
                    ];
                }
            }
        }
    }
    
    function onChange(ev: JSX.TargetedEvent<HTMLTextAreaElement, Event>) {
        const el = ev.currentTarget;

        let result = findSearchString(el);
        if (result) {
            let [type, search] = result;
            const regex = new RegExp(search, 'i');

            if (type === "emoji") {
                // ! FIXME: we should convert it to a Binary Search Tree and use that
                let matches = Object.keys(emojiDictionary)
                    .filter((emoji: string) => emoji.match(regex))
                    .splice(0, 5);

                if (matches.length > 0) {
                    let currentPosition =
                        state.type !== "none"
                            ? state.selected
                            : 0;
                    
                    setState({
                        type: "emoji",
                        matches,
                        selected: Math.min(currentPosition, matches.length - 1),
                        within: false
                    });

                    return;
                }
            }

            if (type === "user" && searchClues?.users) {
                let users: User[] = [];
                switch (searchClues.users.type) {
                    case 'all': users = client.users.toArray(); break;
                    case 'channel': {
                        let channel = client.channels.get(searchClues.users.id);
                        switch (channel?.channel_type) {
                            case 'Group':
                            case 'DirectMessage':
                                users = client.users.mapKeys(channel.recipients)
                                    .filter(x => typeof x !== 'undefined') as User[];
                                break;
                            case 'TextChannel':
                                const server = channel.server;
                                users = client.servers.members.toArray()
                                    .filter(x => x._id.substr(0, 26) === server)
                                    .map(x => client.users.get(x._id.substr(26)))
                                    .filter(x => typeof x !== 'undefined') as User[];
                                break;
                            default: return;
                        }
                    }
                }

                users = users.filter(x => x._id !== SYSTEM_USER_ID);

                let matches = (search.length > 0 ? users.filter(user => user.username.toLowerCase().match(regex)) : users)
                    .splice(0, 5)
                    .filter(x => typeof x !== "undefined");

                if (matches.length > 0) {
                    let currentPosition =
                        state.type !== "none"
                            ? state.selected
                            : 0;
                    
                    setState({
                        type: "user",
                        matches,
                        selected: Math.min(currentPosition, matches.length - 1),
                        within: false
                    });

                    return;
                }
            }

            if (type === 'channel' && searchClues?.channels) {
                let channels = client.servers.get(searchClues.channels.server)
                    ?.channels
                    .map(x => client.channels.get(x))
                    .filter(x => typeof x !== 'undefined') as Channels.TextChannel[];

                let matches = (search.length > 0 ? channels.filter(channel => channel.name.toLowerCase().match(regex)) : channels)
                    .splice(0, 5)
                    .filter(x => typeof x !== "undefined");

                if (matches.length > 0) {
                    let currentPosition =
                        state.type !== "none"
                            ? state.selected
                            : 0;
                    
                    setState({
                        type: "channel",
                        matches,
                        selected: Math.min(currentPosition, matches.length - 1),
                        within: false
                    });

                    return;
                }
            }
        }

        if (state.type !== "none") {
            setState({ type: "none" });
        }
    }

    function selectCurrent(el: HTMLTextAreaElement) {
        if (state.type !== "none") {
            let result = findSearchString(el);
            if (result) {
                let [_type, search, index] = result;

                let content = el.value.split("");
                if (state.type === "emoji") {
                    content.splice(
                        index,
                        search.length,
                        state.matches[state.selected],
                        ": "
                    );
                } else if (state.type === 'user') {
                    content.splice(
                        index - 1,
                        search.length + 1,
                        "<@",
                        state.matches[state.selected]._id,
                        "> "
                    );
                } else {
                    content.splice(
                        index - 1,
                        search.length + 1,
                        "<#",
                        state.matches[state.selected]._id,
                        "> "
                    );
                }

                setValue(content.join(""));
            }
        }
    }

    function onClick(ev: JSX.TargetedMouseEvent<HTMLButtonElement>) {
        ev.preventDefault();
        selectCurrent(document.querySelector("#message")!);
    }

    function onKeyDown(e: KeyboardEvent) {
        if (focused && state.type !== 'none') {
            if (e.key === "ArrowUp") {
                e.preventDefault();
                if (state.selected > 0) {
                    setState({
                        ...state,
                        selected: state.selected - 1
                    });
                }

                return true;
            }

            if (e.key === "ArrowDown") {
                e.preventDefault();
                if (state.selected < state.matches.length - 1) {
                    setState({
                        ...state,
                        selected: state.selected + 1
                    });
                }

                return true;
            }

            if (e.key === "Enter" || e.key === "Tab") {
                e.preventDefault();
                selectCurrent(
                    e.currentTarget as HTMLTextAreaElement
                );

                return true;
            }
        }

        return false;
    }

    function onKeyUp(e: KeyboardEvent) {
        if (e.currentTarget !== null) {
            // @ts-expect-error
            onChange(e);
        }
    }

    function onFocus(ev: JSX.TargetedFocusEvent<HTMLTextAreaElement>) {
        setFocused(true);
        onChange(ev);
    }

    function onBlur() {
        if (state.type !== 'none' && state.within) return;
        setFocused(false);
    }

    return {
        state: focused ? state : { type: 'none' },
        setState,

        onClick,
        onChange,
        onKeyUp,
        onKeyDown,
        onFocus,
        onBlur
    }
}

const Base = styled.div`
    position: relative;

    > div {
        bottom: 0;
        width: 100%;
        position: absolute;
        background: var(--primary-header);
    }

    button {
        gap: 8px;
        margin: 4px;
        padding: 6px;
        border: none;
        display: flex;
        cursor: pointer;
        border-radius: 6px;
        flex-direction: row;
        background: transparent;
        color: var(--foreground);
        width: calc(100% - 12px);

        span {
            display: grid;
            place-items: center;
        }

        &.active {
            background: var(--primary-background);
        }
    }
`;

export default function AutoComplete({ state, setState, onClick }: Pick<AutoCompleteProps, 'state' | 'setState' | 'onClick'>) {
    return (
        <Base>
            <div>
                {state.type === "emoji" &&
                    state.matches.map((match, i) => (
                        <button
                            className={i === state.selected ? "active" : ''}
                            onMouseEnter={() =>
                                (i !== state.selected ||
                                    !state.within) &&
                                    setState({
                                    ...state,
                                    selected: i,
                                    within: true
                                })
                            }
                            onMouseLeave={() =>
                                state.within &&
                                setState({
                                    ...state,
                                    within: false
                                })
                            }
                            onClick={onClick}>
                            <Emoji emoji={(emojiDictionary as any)[match]} size={20} />
                            :{match}:
                        </button>
                    ))}
                {state.type === "user" &&
                    state.matches.map((match, i) => (
                        <button
                            className={i === state.selected ? "active" : ''}
                            onMouseEnter={() =>
                                (i !== state.selected ||
                                    !state.within) &&
                                setState({
                                    ...state,
                                    selected: i,
                                    within: true
                                })
                            }
                            onMouseLeave={() =>
                                state.within &&
                                setState({
                                    ...state,
                                    within: false
                                })
                            }
                            onClick={onClick}>
                            <UserIcon
                                size={24}
                                target={match}
                                status={true} />
                            {match.username}
                        </button>
                    ))}
                {state.type === "channel" &&
                    state.matches.map((match, i) => (
                        <button
                            className={i === state.selected ? "active" : ''}
                            onMouseEnter={() =>
                                (i !== state.selected ||
                                    !state.within) &&
                                setState({
                                    ...state,
                                    selected: i,
                                    within: true
                                })
                            }
                            onMouseLeave={() =>
                                state.within &&
                                setState({
                                    ...state,
                                    within: false
                                })
                            }
                            onClick={onClick}>
                            <ChannelIcon
                                size={24}
                                target={match} />
                            {match.name}
                        </button>
                    ))}
            </div>
        </Base>
    )
}
