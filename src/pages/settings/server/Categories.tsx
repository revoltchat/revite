import { Check } from "@styled-icons/boxicons-regular";
import isEqual from "lodash.isequal";
import { observer } from "mobx-react-lite";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { Category } from "revolt-api/types/Servers";
import { Server } from "revolt.js/dist/maps/Servers";
import styled, { css } from "styled-components";
import { ulid } from "ulid";

import { Text } from "preact-i18n";
import { useEffect, useErrorBoundary, useState } from "preact/hooks";

import { useAutosave, useAutosaveCallback } from "../../../lib/debounce";

import ChannelIcon from "../../../components/common/ChannelIcon";
import Button from "../../../components/ui/Button";
import ComboBox from "../../../components/ui/ComboBox";
import InputBox from "../../../components/ui/InputBox";
import SaveStatus, { EditStatus } from "../../../components/ui/SaveStatus";
import Tip from "../../../components/ui/Tip";

/* interface CreateCategoryProps {
    callback: (name: string) => void;
}

function CreateCategory({ callback }: CreateCategoryProps) {
    const [name, setName] = useState("");

    return <></>;
} */

const KanbanEntry = styled.div`
    padding: 2px 4px;

    > .inner {
        display: flex;
        align-items: center;

        gap: 4px;
        height: 40px;
        padding: 8px;
        flex-shrink: 0;
        font-size: 0.9em;
        background: var(--primary-background);

        img {
            flex-shrink: 0;
        }

        span {
            min-width: 0;

            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }
    }
`;

const KanbanList = styled.div<{ last: boolean }>`
    ${(props) =>
        !props.last &&
        css`
            padding-inline-end: 4px;
        `}

    > .inner {
        width: 180px;
        display: flex;
        flex-shrink: 0;
        overflow-y: auto;
        padding-bottom: 2px;
        flex-direction: column;
        background: var(--secondary-background);

        > [data-rbd-droppable-id] {
            min-height: 24px;
        }
    }
`;

const KanbanListTitle = styled.div`
    height: 42px;
    display: grid;
    place-items: center;
`;

const KanbanBoard = styled.div`
    display: flex;
    flex-direction: row;
`;

const FullSize = styled.div`
    flex-grow: 1;
    min-height: 0;

    > * {
        height: 100%;
        overflow-x: scroll;
    }
`;

const Header = styled.div`
    display: flex;

    h1 {
        flex-grow: 1;
    }
`;

interface Props {
    server: Server;
}

export const Categories = observer(({ server }: Props) => {
    const [status, setStatus] = useState<EditStatus>("saved");
    const [categories, setCategories] = useState<Category[]>(
        server.categories ?? [],
    );

    useAutosave(
        async () => {
            setStatus("saving");
            await server.edit({ categories });
            setStatus("saved");
        },
        categories,
        server.categories,
        () => setStatus("editing"),
    );

    return (
        <>
            <Header>
                <h1>
                    <Text id={`app.settings.server_pages.categories.title`} />
                </h1>
                <SaveStatus status={status} />
            </Header>
            <DragDropContext
                onDragEnd={(target) => {
                    const { destination, source, draggableId, type } = target;

                    if (
                        !destination ||
                        (destination.droppableId === source.droppableId &&
                            destination.index === source.index)
                    ) {
                        return;
                    }

                    if (type === "column") {
                        // Remove from array.
                        const cat = categories.find(
                            (x) => x.id === draggableId,
                        );
                        const arr = categories.filter(
                            (x) => x.id !== draggableId,
                        );

                        // Insert at new position.
                        arr.splice(destination.index, 0, cat!);
                        setCategories(arr);
                    } else {
                        setCategories(
                            categories.map((category) => {
                                if (category.id === destination.droppableId) {
                                    const channels = category.channels.filter(
                                        (x) => x !== draggableId,
                                    );

                                    channels.splice(
                                        destination.index,
                                        0,
                                        draggableId,
                                    );

                                    return {
                                        ...category,
                                        channels,
                                    };
                                } else if (category.id === source.droppableId) {
                                    return {
                                        ...category,
                                        channels: category.channels.filter(
                                            (x) => x !== draggableId,
                                        ),
                                    };
                                }

                                return category;
                            }),
                        );
                    }
                }}>
                <FullSize>
                    <Droppable
                        droppableId="categories"
                        direction="horizontal"
                        type="column">
                        {(provided) =>
                            (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}>
                                    <KanbanBoard>
                                        {categories.map((category, index) => (
                                            <Draggable
                                                key={category.id}
                                                draggableId={category.id}
                                                index={index}>
                                                {(provided) =>
                                                    (
                                                        <div
                                                            {...(provided.draggableProps as any)}
                                                            ref={
                                                                provided.innerRef
                                                            }>
                                                            <KanbanList
                                                                last={
                                                                    index ===
                                                                    categories.length -
                                                                        1
                                                                }
                                                                key={
                                                                    category.id
                                                                }>
                                                                <div class="inner">
                                                                    <KanbanListTitle
                                                                        {...(provided.dragHandleProps as any)}>
                                                                        <span>
                                                                            {
                                                                                category.title
                                                                            }
                                                                        </span>
                                                                    </KanbanListTitle>
                                                                    <Droppable
                                                                        droppableId={
                                                                            category.id
                                                                        }
                                                                        key={
                                                                            category.id
                                                                        }>
                                                                        {(
                                                                            provided,
                                                                        ) =>
                                                                            (
                                                                                <div
                                                                                    ref={
                                                                                        provided.innerRef
                                                                                    }
                                                                                    {...provided.droppableProps}>
                                                                                    {category.channels.map(
                                                                                        (
                                                                                            x,
                                                                                            index,
                                                                                        ) => {
                                                                                            const channel =
                                                                                                server.client.channels.get(
                                                                                                    x,
                                                                                                );
                                                                                            if (
                                                                                                !channel
                                                                                            )
                                                                                                return null;

                                                                                            return (
                                                                                                <Draggable
                                                                                                    key={
                                                                                                        x
                                                                                                    }
                                                                                                    draggableId={
                                                                                                        x
                                                                                                    }
                                                                                                    index={
                                                                                                        index
                                                                                                    }>
                                                                                                    {(
                                                                                                        provided,
                                                                                                    ) =>
                                                                                                        (
                                                                                                            <div
                                                                                                                {...(provided.draggableProps as any)}
                                                                                                                {...provided.dragHandleProps}
                                                                                                                ref={
                                                                                                                    provided.innerRef
                                                                                                                }>
                                                                                                                <KanbanEntry>
                                                                                                                    <div class="inner">
                                                                                                                        <ChannelIcon
                                                                                                                            target={
                                                                                                                                channel
                                                                                                                            }
                                                                                                                            size={
                                                                                                                                24
                                                                                                                            }
                                                                                                                        />
                                                                                                                        <span>
                                                                                                                            {
                                                                                                                                channel.name
                                                                                                                            }
                                                                                                                        </span>
                                                                                                                    </div>
                                                                                                                </KanbanEntry>
                                                                                                            </div>
                                                                                                        ) as any
                                                                                                    }
                                                                                                </Draggable>
                                                                                            );
                                                                                        },
                                                                                    )}
                                                                                    {
                                                                                        provided.placeholder
                                                                                    }
                                                                                </div>
                                                                            ) as any
                                                                        }
                                                                    </Droppable>
                                                                </div>
                                                            </KanbanList>
                                                        </div>
                                                    ) as any
                                                }
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </KanbanBoard>
                                </div>
                            ) as any
                        }
                    </Droppable>
                </FullSize>
            </DragDropContext>
        </>
    );
});

// ! FIXME: really bad code
export const Categories0 = observer(({ server }: Props) => {
    const channels = server.channels.filter((x) => typeof x !== "undefined");

    const [cats, setCats] = useState<Category[]>(server.categories ?? []);
    const [name, setName] = useState("");

    return (
        <div>
            <Tip warning>This section is under construction.</Tip>
            <p>
                <Button
                    contrast
                    disabled={isEqual(server.categories ?? [], cats)}
                    onClick={() => server.edit({ categories: cats })}>
                    save categories
                </Button>
            </p>
            <h2>categories</h2>
            {cats.map((category) => (
                <div style={{ background: "var(--hover)" }} key={category.id}>
                    <InputBox
                        value={category.title}
                        onChange={(e) =>
                            setCats(
                                cats.map((y) =>
                                    y.id === category.id
                                        ? {
                                              ...y,
                                              title: e.currentTarget.value,
                                          }
                                        : y,
                                ),
                            )
                        }
                        contrast
                    />
                    <Button
                        contrast
                        onClick={() =>
                            setCats(cats.filter((x) => x.id !== category.id))
                        }>
                        delete {category.title}
                    </Button>
                </div>
            ))}
            <h2>create new</h2>
            <p>
                <InputBox
                    value={name}
                    onChange={(e) => setName(e.currentTarget.value)}
                    contrast
                />
                <Button
                    contrast
                    onClick={() => {
                        setName("");
                        setCats([
                            ...cats,
                            {
                                id: ulid(),
                                title: name,
                                channels: [],
                            },
                        ]);
                    }}>
                    create
                </Button>
            </p>
            <h2>channels</h2>
            {channels.map((channel) => {
                return (
                    <div
                        key={channel!._id}
                        style={{
                            display: "flex",
                            gap: "12px",
                            alignItems: "center",
                        }}>
                        <div style={{ flexShrink: 0 }}>
                            <ChannelIcon target={channel} size={24} />{" "}
                            <span>{channel!.name}</span>
                        </div>
                        <ComboBox
                            style={{ flexGrow: 1 }}
                            value={
                                cats.find((x) =>
                                    x.channels.includes(channel!._id),
                                )?.id ?? "none"
                            }
                            onChange={(e) =>
                                setCats(
                                    cats.map((x) => {
                                        return {
                                            ...x,
                                            channels: [
                                                ...x.channels.filter(
                                                    (y) => y !== channel!._id,
                                                ),
                                                ...(e.currentTarget.value ===
                                                x.id
                                                    ? [channel!._id]
                                                    : []),
                                            ],
                                        };
                                    }),
                                )
                            }>
                            <option value="none">Uncategorised</option>
                            {cats.map((x) => (
                                <option key={x.id} value={x.id}>
                                    {x.title}
                                </option>
                            ))}
                        </ComboBox>
                    </div>
                );
            })}
        </div>
    );
});
