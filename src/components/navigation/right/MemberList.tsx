import { Link } from "react-router-dom";
import { GroupedVirtuoso } from "react-virtuoso";
import { Channel } from "revolt.js/dist/maps/Channels";
import { User } from "revolt.js/dist/maps/Users";
import styled, { css } from "styled-components/macro";

import { Text } from "preact-i18n";
import { memo } from "preact/compat";

import { internalEmit } from "../../../lib/eventEmitter";

import {
    Screen,
    useIntermediate,
} from "../../../context/intermediate/Intermediate";

import { UserButton } from "../items/ButtonItem";

export type MemberListGroup = {
    type: "online" | "offline" | "role" | "no_offline";
    name?: string;
    users: User[];
};

const ListCategory = styled.div<{ first?: boolean }>`
    opacity: 0.8;
    font-size: 0.8em;
    font-weight: 600;
    user-select: none;

    padding: 4px 14px;
    padding-top: 12px;

    color: var(--secondary-foreground);
    background: var(--secondary-background);

    ${(props) =>
        !props.first &&
        css`
            padding-top: 16px;
        `}
`;

// ! FIXME: temporary performance fix
const NoOomfie = styled.div`
    padding: 4px;
    padding-bottom: 12px;

    font-size: 0.8em;
    text-align: center;
    color: var(--secondary-foreground);

    flex-direction: column;
    display: flex;
    gap: 4px;
`;

const ItemContent = memo(
    ({
        item,
        context,
        openScreen,
    }: {
        item: User;
        context: Channel;
        openScreen: (screen: Screen) => void;
    }) => (
        <UserButton
            key={item._id}
            user={item}
            margin
            context={context}
            onClick={(e) => {
                if (e.shiftKey) {
                    internalEmit(
                        "MessageBox",
                        "append",
                        `<@${item._id}>`,
                        "mention",
                    );
                } else
                    [
                        openScreen({
                            id: "profile",
                            user_id: item._id,
                        }),
                    ];
            }}
        />
    ),
);

export default function MemberList({
    entries,
    context,
}: {
    entries: MemberListGroup[];
    context: Channel;
}) {
    const { openScreen } = useIntermediate();

    return (
        <GroupedVirtuoso
            groupCounts={entries.map((x) => x.users.length)}
            groupContent={(index) => {
                const entry = entries[index];
                return (
                    <ListCategory first={index === 0}>
                        {entry.type === "role" ? (
                            <>{entry.name}</>
                        ) : entry.type === "online" ? (
                            <Text id="app.status.online" />
                        ) : (
                            <Text id="app.status.offline" />
                        )}
                        {entry.type !== "no_offline" && (
                            <>
                                {" - "}
                                {entry.users.length}
                            </>
                        )}
                    </ListCategory>
                );
            }}
            itemContent={(absoluteIndex, groupIndex) => {
                const relativeIndex =
                    absoluteIndex -
                    entries
                        .slice(0, groupIndex)
                        .reduce((a, b) => a + b.users.length, 0);

                const entry = entries[groupIndex];
                if (entry.type === "no_offline") {
                    return (
                        <NoOomfie>
                            <div>
                                Offline users temporarily disabled for this
                                server, see issue{" "}
                                <a
                                    href="https://github.com/revoltchat/delta/issues/128"
                                    target="_blank">
                                    #128
                                </a>{" "}
                                for when this will be resolved.
                            </div>
                            <div>
                                You may re-enable them in{" "}
                                <Link to="/settings/experiments">
                                    <a>experiments</a>
                                </Link>
                                .
                            </div>
                        </NoOomfie>
                    );
                }

                const item = entry.users[relativeIndex];
                if (!item) return null;

                return (
                    <div>
                        <ItemContent
                            item={item}
                            context={context}
                            openScreen={openScreen}
                        />
                    </div>
                );
            }}
        />
    );
}
