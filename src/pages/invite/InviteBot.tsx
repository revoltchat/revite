/* eslint-disable react/jsx-no-literals */
import { useParams } from "react-router-dom";
import { API } from "revolt.js";
import styled from "styled-components/macro";

import { useEffect, useState } from "preact/hooks";

import { Button, Category, ComboBox, Preloader, Tip } from "@revoltchat/ui";

import UserIcon from "../../components/common/user/UserIcon";
import Markdown from "../../components/markdown/Markdown";
import { useClient } from "../../controllers/client/ClientController";

const BotInfo = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 12px;
    padding: 12px;
    width: 100%;
    margin: 20px 0;
    border-radius: 10px;

    .name {
        display: flex;
        align-items: center;
        gap: 16px;
        font-size: 1.5rem;
        font-weight: 500;

        h1 {
            margin: 0;
        }
    }

    .description {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        font-size: 1rem;
        line-height: 1;
        color: #ddd;
        margin-top: 12px;
        margin-bottom: 24px;
    }
`;

const Option = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 12px;
    padding: 12px;
    width: 100%;
    margin: 20px 0;

    label {
        font-size: 16px;
        margin-right: 16px;
    }

    .select-container {
        display: flex;
        flex-direction: column;
        gap: 14px;
        justify-content: space-between;
        align-items: center;
        width: 100%;
    }
`;

export default function InviteBot() {
    const { id } = useParams<{ id: string }>();
    const client = useClient();
    const [data, setData] = useState<API.PublicBot>();

    useEffect(() => {
        client.bots.fetchPublic(id).then(setData);
        // eslint-disable-next-line
    }, []);

    const [server, setServer] = useState<string | undefined>(undefined);
    const [group, setGroup] = useState<string | undefined>(undefined);
    const [selectedOption, setSelectedOption] = useState("");

    const handleAdd = () => {
        if (selectedOption === "server" && server) {
            client.bots.invite(data!._id, { server });
        } else if (selectedOption === "group" && group) {
            client.bots.invite(data!._id, { group });
        }
    };

    return (
        <div
            style={{
                padding: "6em",
                overflowY: "auto",
            }}>
            <Tip palette="warning">This section is under construction.</Tip>
            {typeof data === "undefined" && <Preloader type="spinner" />}
            {data && (
                <>
                    <BotInfo
                        style={{
                            padding: "16px",
                        }}>
                        <div className="name">
                            <UserIcon size={64} attachment={data.avatar} />
                            <h1>{data.username}</h1>
                        </div>
                        {data.description && (
                            <div className="description">
                                <Markdown content={data.description} />
                            </div>
                        )}
                    </BotInfo>
                    <Option>
                        <Category>
                            Add this bot to your Revolt server, group
                        </Category>
                        <div className="select-container">
                            <ComboBox
                                id="server-select"
                                value={selectedOption}
                                onChange={(e) =>
                                    setSelectedOption(e.currentTarget.value)
                                }>
                                <option value="">Select an option</option>
                                <option value="server">Server</option>
                                <option value="group">Group</option>
                            </ComboBox>
                            {selectedOption === "server" && (
                                <div className="select-container">
                                    <ComboBox
                                        id="server-select"
                                        value={server}
                                        onChange={(e) =>
                                            setServer(e.currentTarget.value)
                                        }>
                                        <option value="none">
                                            Select a server
                                        </option>
                                        {[...client.servers.values()]
                                            .filter((x) =>
                                                x.havePermission(
                                                    "ManageServer",
                                                ),
                                            )
                                            .map((server) => (
                                                <option
                                                    value={server._id}
                                                    key={server._id}>
                                                    {server.name}
                                                </option>
                                            ))}
                                    </ComboBox>
                                </div>
                            )}
                            {selectedOption === "group" && (
                                <div className="select-container">
                                    <ComboBox
                                        value={group}
                                        onChange={(e) =>
                                            setGroup(e.currentTarget.value)
                                        }>
                                        <option value="none">
                                            Select a group
                                        </option>
                                        {[...client.channels.values()]
                                            .filter(
                                                (x) =>
                                                    x.channel_type === "Group",
                                            )
                                            .map((channel) => (
                                                <option
                                                    value={channel._id}
                                                    key={channel._id}>
                                                    {channel.name}
                                                </option>
                                            ))}
                                    </ComboBox>
                                </div>
                            )}
                            <Button palette="secondary" onClick={handleAdd}>
                                Add Bot
                            </Button>
                        </div>
                    </Option>
                </>
            )}
        </div>
    );
}
