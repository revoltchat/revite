import AutoSizer from "react-virtualized-auto-sizer";
import { VariableSizeList as List } from "react-window";
import { Channel } from "revolt.js/dist/maps/Channels";
import { User } from "revolt.js/dist/maps/Users";
import styled from "styled-components";

import { Text } from "preact-i18n";
import { forwardRef } from "preact/compat";

import {
    Screen,
    useIntermediate,
} from "../../../context/intermediate/Intermediate";

import { UserButton } from "../items/ButtonItem";

export type MemberListEntry = string | User;
interface ItemData {
    entries: MemberListEntry[];
    context: Channel;
    openScreen: (screen: Screen) => void;
}

const PADDING_SIZE = 6;

const ListCategory = styled.div`
    height: 100%;
    display: flex;
    padding: 0 14px;
    font-size: 0.8em;
    font-weight: 600;
    user-select: none;
    flex-direction: column;
    justify-content: flex-end;
    color: var(--secondary-foreground);
`;

const Row = ({
    data,
    style: styleIn,
    index,
}: {
    data: ItemData;
    index: number;
    style: JSX.CSSProperties;
}) => {
    const item = data.entries[index];
    const style = {
        ...styleIn,
        top: `${parseFloat(styleIn.top as string) + PADDING_SIZE}px`,
    };

    if (typeof item === "string") {
        const [cat, count] = item.split(":");
        return (
            <div style={style}>
                <ListCategory>
                    {cat === "online" ? (
                        <Text id="app.status.online" />
                    ) : (
                        <Text id="app.status.offline" />
                    )}
                    {" - "}
                    {count}
                </ListCategory>
            </div>
        );
        // eslint-disable-next-line
    } else {
        return (
            <div style={style}>
                <UserButton
                    key={item._id}
                    user={item}
                    margin
                    context={data.context}
                    onClick={() =>
                        data.openScreen({
                            id: "profile",
                            user_id: item._id,
                        })
                    }
                />
            </div>
        );
    }
};

// @ts-expect-error Copied directly from example code.
const innerElementType = forwardRef(({ style, ...rest }, ref) => (
    <div
        // @ts-expect-error Copied directly from example code.
        ref={ref}
        style={{
            ...style,
            height: `${parseFloat(style.height) + PADDING_SIZE * 2}px`,
        }}
        {...rest}
    />
));

export default function MemberList({
    entries,
    context,
}: {
    entries: MemberListEntry[];
    context: Channel;
}) {
    const { openScreen } = useIntermediate();
    return (
        <AutoSizer>
            {({ width, height }) => (
                <List
                    width={width}
                    height={height}
                    itemData={{
                        entries,
                        context,
                        openScreen,
                    }}
                    itemCount={entries.length}
                    innerElementType={innerElementType}
                    itemSize={(index) =>
                        typeof entries[index] === "string" ? 24 : 42
                    }
                    estimatedItemSize={42}>
                    {
                        // eslint-disable-next-line
                        Row as any
                    }
                </List>
            )}
        </AutoSizer>
    );
}
