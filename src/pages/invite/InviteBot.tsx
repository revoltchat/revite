import { useParams } from "react-router-dom";
import { API } from "revolt.js";
import styled from "styled-components/macro";

import { useEffect, useState } from "preact/hooks";

import { Button, Category, ComboBox, Preloader, Tip } from "@revoltchat/ui";

import UserIcon from "../../components/common/user/UserIcon";
import Markdown from "../../components/markdown/Markdown";
import { useClient } from "../../controllers/client/ClientController";

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
    const [data, setData] = useState<API.PublicBot>();

    useEffect(() => {
        client.bots.fetchPublic(id).then(setData);
        // eslint-disable-next-line
    }, []);

    const [server, setServer] = useState("none");
    const [group, setGroup] = useState("none");

    return (
        <div style={{ padding: "6em" }}>
            <Tip palette="warning">This section is under construction.</Tip>
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
                    <Category>Add to server</Category>
                    <Option>
                        <ComboBox
                            value={server}
                            onChange={(e) => setServer(e.currentTarget.value)}>
                            <option value="none">Select a server</option>
                            {[...client.servers.values()]
                                .filter((x) => x.havePermission("ManageServer"))
                                .map((server) => (
                                    <option value={server._id} key={server._id}>
                                        {server.name}
                                    </option>
                                ))}
                        </ComboBox>
                        <Button
                            palette="secondary"
                            onClick={() =>
                                server !== "none" &&
                                client.bots.invite(data._id, { server })
                            }>
                            Add
                        </Button>
                    </Option>
                    <Category>Add to group</Category>
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
                            palette="secondary"
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
