import { XCircle } from "@styled-icons/boxicons-regular";
import isEqual from "lodash.isequal";
import { Channels, Servers, Users } from "revolt.js/dist/api/objects";
import { Route } from "revolt.js/dist/api/routes";
import { ulid } from "ulid";

import styles from "./Panes.module.scss";
import { Text } from "preact-i18n";
import { useContext, useEffect, useState } from "preact/hooks";

import { AppContext } from "../../../context/revoltjs/RevoltClient";
import { useChannels } from "../../../context/revoltjs/hooks";

import ChannelIcon from "../../../components/common/ChannelIcon";
import UserIcon from "../../../components/common/user/UserIcon";
import Button from "../../../components/ui/Button";
import ComboBox from "../../../components/ui/ComboBox";
import IconButton from "../../../components/ui/IconButton";
import InputBox from "../../../components/ui/InputBox";
import Preloader from "../../../components/ui/Preloader";
import Tip from "../../../components/ui/Tip";

interface Props {
    server: Servers.Server;
}

// ! FIXME: really bad code
export function Categories({ server }: Props) {
    const client = useContext(AppContext);
    const channels = useChannels(server.channels) as (
        | Channels.TextChannel
        | Channels.VoiceChannel
    )[];

    const [cats, setCats] = useState<Servers.Category[]>(
        server.categories ?? [],
    );

    const [name, setName] = useState("");

    return (
        <div>
            <Tip warning>This section is under construction.</Tip>
            <p>
                <Button
                    contrast
                    disabled={isEqual(server.categories ?? [], cats)}
                    onClick={() =>
                        client.servers.edit(server._id, { categories: cats })
                    }>
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
                        style={{
                            display: "flex",
                            gap: "12px",
                            alignItems: "center",
                        }}>
                        <div style={{ flexShrink: 0 }}>
                            <ChannelIcon target={channel} size={24} />{" "}
                            <span>{channel.name}</span>
                        </div>
                        <ComboBox
                            style={{ flexGrow: 1 }}
                            value={
                                cats.find((x) =>
                                    x.channels.includes(channel._id),
                                )?.id ?? "none"
                            }
                            onChange={(e) =>
                                setCats(
                                    cats.map((x) => {
                                        return {
                                            ...x,
                                            channels: [
                                                ...x.channels.filter(
                                                    (y) => y !== channel._id,
                                                ),
                                                ...(e.currentTarget.value ===
                                                x.id
                                                    ? [channel._id]
                                                    : []),
                                            ],
                                        };
                                    }),
                                )
                            }>
                            <option value="none">Uncategorised</option>
                            {cats.map((x) => (
                                <option value={x.id}>{x.title}</option>
                            ))}
                        </ComboBox>
                    </div>
                );
            })}
        </div>
    );
}
