import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as List } from "react-window";
import { User } from "revolt.js/dist/maps/Users";

import { forwardRef } from "preact/compat";

import { UserButton } from "../items/ButtonItem";

export type MemberListEntry = string | User;
interface ItemData {
    entries: MemberListEntry[];
}

const PADDING_SIZE = 6;

const Row = ({
    data,
    style,
    index,
}: {
    data: ItemData;
    index: number;
    style: JSX.CSSProperties;
}) => {
    const item = data.entries[index];

    return (
        <div
            style={{
                ...style,
                top: `${parseFloat(style.top as string) + PADDING_SIZE}px`,
            }}>
            {typeof item === "string" ? (
                `cat ${item}`
            ) : (
                <UserButton
                    key={item._id}
                    user={item}
                    margin
                    /* context={channel}
                    onClick={() =>
                        openScreen({
                            id: "profile",
                            user_id: user._id,
                        })
                    } */
                />
            )}
        </div>
    );
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
}: {
    entries: MemberListEntry[];
}) {
    return (
        <AutoSizer>
            {({ width, height }) => (
                <List
                    className="virtualList"
                    width={width}
                    height={height}
                    itemData={{
                        entries,
                    }}
                    itemCount={entries.length}
                    innerElementType={innerElementType}
                    itemSize={42}>
                    {
                        // eslint-disable-next-line
                        Row as any
                    }
                </List>
            )}
        </AutoSizer>
    );
}
