import { useParams } from "react-router-dom";
import { Permission } from "revolt.js";
import { Route } from "revolt.js/dist/api/routes";
import styled from "styled-components/macro";

import { useEffect, useState } from "preact/hooks";

import { useClient } from "../../context/revoltjs/RevoltClient";

import UserIcon from "../../components/common/user/UserIcon";
import Button from "../../components/ui/Button";
import ComboBox from "../../components/ui/ComboBox";
import Overline from "../../components/ui/Overline";
import Preloader from "../../components/ui/Preloader";
import Tip from "../../components/ui/Tip";

import Markdown from "../../components/markdown/Markdown";

const BotInfo = styled.div`
    gap: 12px;
    display: flex;
    padding: 12px;

    h1,
    p {
        margin: 0;
    }
`;

const Option = styled.div`
    gap: 8px;
    display: flex;
    margin-top: 4px;
    margin-bottom: 12px;
`;

export default function InviteBot() {
    const { id } = useParams<{ id: string }>();
    const client = useClient();
    const [data, setData] =
        useState<Route<"GET", "/bots/id/invite">["response"]>();

    useEffect(() => {
        client.bots.fetchPublic(id).then(setData);
        // eslint-disable-next-line
    }, []);

    const [server, setServer] = useState("none");
    const [group, setGroup] = useState("none");

    return (
        <div style={{ padding: "6em" }}>
            <Tip warning hideSeparator>
                This section is under construction.
            </Tip>
            {typeof data === "undefined" && <Preloader type="spinner" />}
            {data && (
                <>
                    <BotInfo>
                        <UserIcon size={64} attachment={data.avatar} />
                        <div className="name">
                            <h1>{data.username}</h1>
                            {data.description && (
                                <Markdown content={data.description} />
                            )}
                        </div>
                    </BotInfo>
                    <Overline type="subtle">Add to server</Overline>
                    <Option>
                        <ComboBox
                            value={server}
                            onChange={(e) => setServer(e.currentTarget.value)}>
                            <option value="none">Select a server</option>
                            {[...client.servers.values()]
                                .filter(
                                    (x) =>
                                        x.permission & Permission.ManageServer,
                                )
                                .map((server) => (
                                    <option value={server._id} key={server._id}>
                                        {server.name}
                                    </option>
                                ))}
                        </ComboBox>
                        <Button
                            contrast
                            onClick={() =>
                                server !== "none" &&
                                client.bots.invite(data._id, { server })
                            }>
                            Add
                        </Button>
                    </Option>
                    <Overline type="subtle">Add to group</Overline>
                    <Option>
                        <ComboBox
                            value={group}
                            onChange={(e) => setGroup(e.currentTarget.value)}>
                            <option value="none">Select a group</option>
                            {[...client.channels.values()]
                                .filter((x) => x.channel_type === "Group")
                                .map((channel) => (
                                    <option
                                        value={channel._id}
                                        key={channel._id}>
                                        {channel.name}
                                    </option>
                                ))}
                        </ComboBox>
                        <Button
                            contrast
                            onClick={() =>
                                group !== "none" &&
                                client.bots.invite(data._id, { group })
                            }>
                            Add
                        </Button>
                    </Option>
                </>
            )}
        </div>
    );
}
