import isEqual from "lodash.isequal";
import { observer } from "mobx-react-lite";
import { Category } from "revolt-api/types/Servers";
import { Server } from "revolt.js/dist/maps/Servers";
import styled from "styled-components";
import { ulid } from "ulid";

import { useState } from "preact/hooks";

import ChannelIcon from "../../../components/common/ChannelIcon";
import Button from "../../../components/ui/Button";
import ComboBox from "../../../components/ui/ComboBox";
import InputBox from "../../../components/ui/InputBox";
import Tip from "../../../components/ui/Tip";

/* interface CreateCategoryProps {
    callback: (name: string) => void;
}

function CreateCategory({ callback }: CreateCategoryProps) {
    const [name, setName] = useState("");

    return <></>;
} */

const KanbanEntry = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;

    margin: 4px;
    height: 40px;
    flex-shrink: 0;
    background: var(--primary-background);
`;

const KanbanList = styled.div`
    gap: 8px;
    width: 180px;
    display: flex;
    flex-shrink: 0;
    overflow-y: auto;
    flex-direction: column;
    background: var(--secondary-background);
`;

const KanbanBoard = styled.div`
    gap: 8px;
    display: flex;
    overflow-x: scroll;
    flex-direction: row;
`;

interface Props {
    server: Server;
}

export const Categories = observer(({ server }: Props) => {
    const [categories, setCategories] = useState<Category[]>(
        server.categories ?? [],
    );

    return (
        <KanbanBoard>
            {categories.map((category, i) => (
                <KanbanList key={category.id}>
                    <h3>{category.title}</h3>
                    {category.channels.map((x) => {
                        const channel = server.client.channels.get(x);
                        if (!channel) return null;

                        return (
                            <KanbanEntry key={x}>
                                <ChannelIcon target={channel} size={24} />{" "}
                                {channel.name}
                            </KanbanEntry>
                        );
                    })}
                </KanbanList>
            ))}
        </KanbanBoard>
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
