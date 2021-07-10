import { Channels } from "revolt.js/dist/api/objects";
import styled, { css } from "styled-components";

import { Text } from "preact-i18n";
import { useContext, useEffect, useState } from "preact/hooks";

import TextAreaAutoSize from "../../../lib/TextAreaAutoSize";

import { FileUploader } from "../../../context/revoltjs/FileUploads";
import { AppContext } from "../../../context/revoltjs/RevoltClient";

import Button from "../../../components/ui/Button";
import InputBox from "../../../components/ui/InputBox";

interface Props {
    channel:
        | Channels.GroupChannel
        | Channels.TextChannel
        | Channels.VoiceChannel;
}

const Row = styled.div`
    gap: 20px;
    display: flex;

    .name {
        flex-grow: 1;

        input {
            width: 100%;
        }
    }
`;

export default function Overview({ channel }: Props) {
    const client = useContext(AppContext);

    const [name, setName] = useState(channel.name);
    const [description, setDescription] = useState(channel.description ?? "");

    useEffect(() => setName(channel.name), [channel.name]);
    useEffect(
        () => setDescription(channel.description ?? ""),
        [channel.description],
    );

    const [changed, setChanged] = useState(false);
    function save() {
        const changes: any = {};
        if (name !== channel.name) changes.name = name;
        if (description !== channel.description)
            changes.description = description;

        client.channels.edit(channel._id, changes);
        setChanged(false);
    }

    return (
        <div className="overview">
            <Row>
                <FileUploader
                    width={80}
                    height={80}
                    style="icon"
                    fileType="icons"
                    behaviour="upload"
                    maxFileSize={2_500_000}
                    onUpload={(icon) =>
                        client.channels.edit(channel._id, { icon })
                    }
                    previewURL={client.channels.getIconURL(
                        channel._id,
                        { max_side: 256 },
                        true,
                    )}
                    remove={() =>
                        client.channels.edit(channel._id, { remove: "Icon" })
                    }
                    defaultPreview={
                        channel.channel_type === "Group"
                            ? "/assets/group.png"
                            : undefined
                    }
                />
                <div className="name">
                    <h3>
                        {channel.channel_type === "Group" ? (
                            <Text id="app.main.groups.name" />
                        ) : (
                            <Text id="app.main.servers.channel_name" />
                        )}
                    </h3>
                    <InputBox
                        contrast
                        value={name}
                        maxLength={32}
                        onChange={(e) => {
                            setName(e.currentTarget.value);
                            if (!changed) setChanged(true);
                        }}
                    />
                </div>
            </Row>

            <h3>
                {channel.channel_type === "Group" ? (
                    <Text id="app.main.groups.description" />
                ) : (
                    <Text id="app.main.servers.channel_description" />
                )}
            </h3>
            <TextAreaAutoSize
                maxRows={10}
                minHeight={60}
                maxLength={1024}
                value={description}
                placeholder={"Add a description..."}
                onChange={(ev) => {
                    setDescription(ev.currentTarget.value);
                    if (!changed) setChanged(true);
                }}
            />
            <p>
                <Button onClick={save} contrast disabled={!changed}>
                    <Text id="app.special.modals.actions.save" />
                </Button>
            </p>
        </div>
    );
}
