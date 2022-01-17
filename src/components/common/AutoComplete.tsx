import { Channel } from "revolt.js/dist/maps/Channels";
import { User } from "revolt.js/dist/maps/Users";
import styled, { css } from "styled-components/macro";

import { StateUpdater, useState } from "preact/hooks";

import { useClient } from "../../context/revoltjs/RevoltClient";

import { emojiDictionary } from "../../assets/emojis";
import ChannelIcon from "./ChannelIcon";
import Emoji from "./Emoji";
import UserIcon from "./user/UserIcon";

export type AutoCompleteState =
    | { type: "none" }
    | ({ selected: number; within: boolean } & (
          | {
                type: "emoji";
                matches: string[];
            }
          | {
                type: "user";
                matches: User[];
            }
          | {
                type: "channel";
                matches: Channel[];
            }
      ));

export type SearchClues = {
    users?: { type: "channel"; id: string } | { type: "all" };
    channels?: { server: string };
};

export type AutoCompleteProps = {
    detached?: boolean;
    state: AutoCompleteState;
    setState: StateUpdater<AutoCompleteState>;

    onKeyUp: (ev: KeyboardEvent) => void;
    onKeyDown: (ev: KeyboardEvent) => boolean;
    onChange: (ev: JSX.TargetedEvent<HTMLTextAreaElement, Event>) => void;
    onClick: JSX.MouseEventHandler<HTMLButtonElement>;
    onFocus: JSX.FocusEventHandler<HTMLTextAreaElement>;
    onBlur: JSX.FocusEventHandler<HTMLTextAreaElement>;
};

export function useAutoComplete(
    setValue: (v?: string) => void,
    searchClues?: SearchClues,
): AutoCompleteProps {
    const [state, setState] = useState<AutoCompleteState>({ type: "none" });
    const [focused, setFocused] = useState(false);
    const client = useClient();

    function findSearchString(
        el: HTMLTextAreaElement,
    ): ["emoji" | "user" | "channel", string, number] | undefined {
        if (el.selectionStart === el.selectionEnd) {
            const cursor = el.selectionStart;
            const content = el.value.slice(0, cursor);

            const valid = /\w/;

            let j = content.length - 1;
            if (content[j] === "@") {
                return ["user", "", j];
            } else if (content[j] === "#") {
                return ["channel", "", j];
            }

            while (j >= 0 && valid.test(content[j])) {
                j--;
            }

            if (j === -1) return;
            const current = content[j];

            if (current === ":" || current === "@" || current === "#") {
                const search = content.slice(j + 1, content.length);
                const minLen = current === ":" ? 2 : 1;

                if (search.length >= minLen) {
                    return [
                        current === "#"
                            ? "channel"
                            : current === ":"
                            ? "emoji"
                            : "user",
                        search.toLowerCase(),
                        j + 1,
                    ];
                }
            }
        }
    }

    function onChange(ev: JSX.TargetedEvent<HTMLTextAreaElement, Event>) {
        const el = ev.currentTarget;

        const result = findSearchString(el);
        if (result) {
            const [type, search] = result;
            const regex = new RegExp(search, "i");

            if (type === "emoji") {
                // ! TODO: we should convert it to a Binary Search Tree and use that
                const matches = Object.keys(emojiDictionary)
                    .filter((emoji: string) => emoji.match(regex))
                    .splice(0, 5);

                if (matches.length > 0) {
                    const currentPosition =
                        state.type !== "none" ? state.selected : 0;

                    setState({
                        type: "emoji",
                        matches,
                        selected: Math.min(currentPosition, matches.length - 1),
                        within: false,
                    });

                    return;
                }
            }

            if (type === "user" && searchClues?.users) {
                let users: User[] = [];
                switch (searchClues.users.type) {
                    case "all":
                        users = [...client.users.values()];
                        break;
                    case "channel": {
                        const channel = client.channels.get(
                            searchClues.users.id,
                        );
                        switch (channel?.channel_type) {
                            case "Group":
                            case "DirectMessage":
                                users = channel.recipients!.filter(
                                    (x) => typeof x !== "undefined",
                                ) as User[];
                                break;
                            case "TextChannel":
                                {
                                    const server = channel.server_id;
                                    users = [...client.members.keys()]
                                        .map((x) => JSON.parse(x))
                                        .filter((x) => x.server === server)
                                        .map((x) => client.users.get(x.user))
                                        .filter(
                                            (x) => typeof x !== "undefined",
                                        ) as User[];
                                }
                                break;
                            default:
                                return;
                        }
                    }
                }

                users = users.filter(
                    (x) => x._id !== "00000000000000000000000000",
                );

                const matches = (
                    search.length > 0
                        ? users.filter((user) =>
                              user.username.toLowerCase().match(regex),
                          )
                        : users
                )
                    .splice(0, 5)
                    .filter((x) => typeof x !== "undefined");

                if (matches.length > 0) {
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

            if (type === "channel" && searchClues?.channels) {
                const channels = client.servers
                    .get(searchClues.channels.server)
                    ?.channels.filter(
                        (x) => typeof x !== "undefined",
                    ) as Channel[];

                const matches = (
                    search.length > 0
                        ? channels.filter((channel) =>
                              channel.name!.toLowerCase().match(regex),
                          )
                        : channels
                )
                    .splice(0, 5)
                    .filter((x) => typeof x !== "undefined");

                if (matches.length > 0) {
                    const currentPosition =
                        state.type !== "none" ? state.selected : 0;

                    setState({
                        type: "channel",
                        matches,
                        selected: Math.min(currentPosition, matches.length - 1),
                        within: false,
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
            const result = findSearchString(el);
            if (result) {
                const [_type, search, index] = result;

                const content = el.value.split("");
                if (state.type === "emoji") {
                    content.splice(
                        index,
                        search.length,
                        state.matches[state.selected],
                        ": ",
                    );
                } else if (state.type === "user") {
                    content.splice(
                        index - 1,
                        search.length + 1,
                        "<@",
                        state.matches[state.selected]._id,
                        "> ",
                    );
                } else {
                    content.splice(
                        index - 1,
                        search.length + 1,
                        "<#",
                        state.matches[state.selected]._id,
                        "> ",
                    );
                }

                setValue(content.join(""));
            }
        }
    }

    function onClick(ev: JSX.TargetedMouseEvent<HTMLButtonElement>) {
        ev.preventDefault();
        selectCurrent(document.querySelector("#message")!);
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
                selectCurrent(e.currentTarget as HTMLTextAreaElement);

                return true;
            }
        }

        return false;
    }

    function onKeyUp(e: KeyboardEvent) {
        if (e.currentTarget !== null) {
            // @ts-expect-error Type mis-match.
            onChange(e);
        }
    }

    function onFocus(ev: JSX.TargetedFocusEvent<HTMLTextAreaElement>) {
        setFocused(true);
        onChange(ev);
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

const Base = styled.div<{ detached?: boolean }>`
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
        font-size: 1em;
        cursor: pointer;
        align-items: center;
        flex-direction: row;
        font-family: inherit;
        background: transparent;
        color: var(--foreground);
        width: calc(100% - 12px);
        border-radius: var(--border-radius);

        span {
            display: grid;
            place-items: center;
        }

        &.active {
            background: var(--primary-background);
        }
    }

    ${(props) =>
        props.detached &&
        css`
            bottom: 8px;

            > div {
                border-radius: var(--border-radius);
            }
        `}
`;

export default function AutoComplete({
    detached,
    state,
    setState,
    onClick,
}: Pick<AutoCompleteProps, "detached" | "state" | "setState" | "onClick">) {
    return (
        <Base detached={detached}>
            <div>
                {state.type === "emoji" &&
                    state.matches.map((match, i) => (
                        <button
                            key={match}
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
                            onClick={onClick}>
                            <Emoji
                                emoji={
                                    (emojiDictionary as Record<string, string>)[
                                        match
                                    ]
                                }
                                size={20}
                            />
                            :{match}:
                        </button>
                    ))}
                {state.type === "user" &&
                    state.matches.map((match, i) => (
                        <button
                            key={match}
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
                            onClick={onClick}>
                            <UserIcon size={24} target={match} status={true} />
                            {match.username}
                        </button>
                    ))}
                {state.type === "channel" &&
                    state.matches.map((match, i) => (
                        <button
                            key={match}
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
                            onClick={onClick}>
                            <ChannelIcon size={24} target={match} />
                            {match.name}
                        </button>
                    ))}
            </div>
        </Base>
    );
}
