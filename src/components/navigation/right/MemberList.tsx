import { GroupedVirtuoso } from "react-virtuoso";
import { Channel } from "revolt.js/dist/maps/Channels";
import { User } from "revolt.js/dist/maps/Users";
import styled, { css } from "styled-components";

import { Text } from "preact-i18n";
import { memo } from "preact/compat";

import {
    Screen,
    useIntermediate,
} from "../../../context/intermediate/Intermediate";

import { UserButton } from "../items/ButtonItem";
import { internalEmit } from "../../../lib/eventEmitter";

export type MemberListGroup = {
    type: "online" | "offline" | "role";
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
            onClick={e => {
                if (e.shiftKey) {
                    internalEmit(
                        "MessageBox",
                        "append",
                        `<@${item._id}>`,
                        "mention",
                    );
                } else[
                    openScreen({
                        id: "profile",
                        user_id: item._id,
                    })
                ]
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
                const type = entries[index].type;
                return (
                    <ListCategory first={index === 0}>
                        {type === "role" ? (
                            <>{entries[index].name}</>
                        ) : type === "online" ? (
                            <Text id="app.status.online" />
                        ) : (
                            <Text id="app.status.offline" />
                        )}
                        {" - "}
                        {entries[index].users.length}
                    </ListCategory>
                );
            }}
            itemContent={(absoluteIndex, groupIndex) => {
                const relativeIndex =
                    absoluteIndex -
                    entries
                        .slice(0, groupIndex)
                        .reduce((a, b) => a + b.users.length, 0);

                const item = entries[groupIndex].users[relativeIndex];
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
