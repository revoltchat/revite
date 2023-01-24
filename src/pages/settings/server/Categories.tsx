import { Plus, X } from "@styled-icons/boxicons-regular";
import { observer } from "mobx-react-lite";
import { DragDropContext } from "react-beautiful-dnd";
import { Channel, Server, API } from "revolt.js";
import styled, { css } from "styled-components/macro";
import { ulid } from "ulid";

import { Text } from "preact-i18n";
import { useCallback, useEffect, useMemo, useState } from "preact/hooks";

import { SaveStatus } from "@revoltchat/ui";

import { useAutosave } from "../../../lib/debounce";
import { Draggable, Droppable } from "../../../lib/dnd";
import { noop } from "../../../lib/js";

import ChannelIcon from "../../../components/common/ChannelIcon";
import { modalController } from "../../../controllers/modals/ModalController";

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

        input {
            width: 100%;
            height: 100%;
            border: none;
            font-size: 1em;
            text-align: center;
            background: transparent;
            color: var(--foreground);
        }

        > [data-rbd-droppable-id] {
            min-height: 24px;
        }
    }
`;

const Row = styled.div`
    gap: 2px;
    margin: 4px;
    display: flex;

    > :first-child {
        flex-grow: 1;
    }
`;

const KanbanListHeader = styled.div`
    height: 34px;
    display: grid;
    min-width: 34px;
    place-items: center;
    cursor: pointer !important;
    transition: 0.2s ease background-color;

    > * {
        font: var(--font);
    }

    &:hover {
        background: var(--background);
    }
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
    const [status, setStatus] = useState<"saved" | "editing" | "saving">(
        "saved",
    );
    const [categories, setCategories] = useState<API.Category[]>(
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

    const defaultCategory = useMemo(() => {
        return {
            title: "Uncategorized",
            channels: [...server.channels]
                .filter((x) => x)
                .map((x) => x!._id)
                .filter(
                    (x) => !categories.find((cat) => cat.channels.includes(x)),
                ),
            id: "none",
        };
    }, [categories, server.channels]);

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
                        if (destination.index === 0) return;

                        // Remove from array.
                        const cat = categories.find(
                            (x) => x.id === draggableId,
                        );
                        const arr = categories.filter(
                            (x) => x.id !== draggableId,
                        );

                        // Insert at new position.
                        arr.splice(destination.index - 1, 0, cat!);
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
                        {(provided) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}>
                                <KanbanBoard>
                                    <ListElement
                                        category={defaultCategory}
                                        server={server}
                                        index={0}
                                        addChannel={noop}
                                    />
                                    {categories.map((category, index) => (
                                        <ListElement
                                            draggable
                                            category={category}
                                            server={server}
                                            index={index + 1}
                                            key={category.id}
                                            setTitle={(title) => {
                                                setCategories(
                                                    categories.map((x) =>
                                                        x.id === category.id
                                                            ? {
                                                                  ...x,
                                                                  title,
                                                              }
                                                            : x,
                                                    ),
                                                );
                                            }}
                                            deleteSelf={() =>
                                                setCategories(
                                                    categories.filter(
                                                        (x) =>
                                                            x.id !==
                                                            category.id,
                                                    ),
                                                )
                                            }
                                            addChannel={(channel) => {
                                                setCategories(
                                                    categories.map((x) =>
                                                        x.id === category.id
                                                            ? {
                                                                  ...x,
                                                                  channels: [
                                                                      ...x.channels,
                                                                      channel._id,
                                                                  ],
                                                              }
                                                            : x,
                                                    ),
                                                );
                                            }}
                                        />
                                    ))}
                                    <KanbanList last>
                                        <div className="inner">
                                            <KanbanListHeader
                                                onClick={() =>
                                                    setCategories([
                                                        ...categories,
                                                        {
                                                            id: ulid(),
                                                            title: "New Category",
                                                            channels: [],
                                                        },
                                                    ])
                                                }>
                                                <Plus size={24} />
                                            </KanbanListHeader>
                                        </div>
                                    </KanbanList>
                                    {provided.placeholder}
                                </KanbanBoard>
                            </div>
                        )}
                    </Droppable>
                </FullSize>
            </DragDropContext>
        </>
    );
});

function ListElement({
    category,
    server,
    index,
    setTitle,
    deleteSelf,
    addChannel,
    draggable,
}: {
    category: API.Category;
    server: Server;
    index: number;
    setTitle?: (title: string) => void;
    deleteSelf?: () => void;
    addChannel: (channel: Channel) => void;
    draggable?: boolean;
}) {
    const [editing, setEditing] = useState<string>();
    const startEditing = () => setTitle && setEditing(category.title);

    const save = useCallback(() => {
        setEditing(undefined);
        if (editing !== "") {
            setTitle!(editing!);
        }
    }, [editing, setTitle]);

    useEffect(() => {
        if (editing === undefined) return;

        function onClick(ev: MouseEvent) {
            if ((ev.target as HTMLElement)?.id !== category.id) {
                save();
            }
        }

        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, [editing, category.id, save]);

    return (
        <Draggable
            isDragDisabled={!draggable}
            key={category.id}
            draggableId={category.id}
            index={index}>
            {(provided) => (
                <div {...provided.draggableProps} ref={provided.innerRef}>
                    <KanbanList last={false} key={category.id}>
                        <div className="inner">
                            <Row>
                                <KanbanListHeader {...provided.dragHandleProps}>
                                    {editing !== undefined ? (
                                        <input
                                            value={editing}
                                            onChange={(e) =>
                                                setEditing(
                                                    e.currentTarget.value,
                                                )
                                            }
                                            onKeyDown={(e) =>
                                                e.key === "Enter" && save()
                                            }
                                            id={category.id}
                                        />
                                    ) : (
                                        <span onClick={startEditing}>
                                            {category.title}
                                        </span>
                                    )}
                                </KanbanListHeader>
                                {deleteSelf && (
                                    <KanbanListHeader onClick={deleteSelf}>
                                        <X size={24} />
                                    </KanbanListHeader>
                                )}
                            </Row>
                            <Droppable
                                droppableId={category.id}
                                key={category.id}>
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}>
                                        {category.channels.map((x, index) => {
                                            const channel =
                                                server.client.channels.get(x);
                                            if (!channel) return null;

                                            return (
                                                <Draggable
                                                    key={x}
                                                    draggableId={x}
                                                    index={index}>
                                                    {(provided) => (
                                                        <div
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            ref={
                                                                provided.innerRef
                                                            }>
                                                            <KanbanEntry>
                                                                <div className="inner">
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
                                                    )}
                                                </Draggable>
                                            );
                                        })}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                            <KanbanListHeader
                                onClick={() =>
                                    modalController.push({
                                        type: "create_channel",
                                        target: server,
                                        cb: addChannel,
                                    })
                                }>
                                <Plus size={24} />
                            </KanbanListHeader>
                        </div>
                    </KanbanList>
                </div>
            )}
        </Draggable>
    );
}
