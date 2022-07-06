import { observer } from "mobx-react-lite";
import { Channel } from "revolt.js";
import styled from "styled-components/macro";

import { Text } from "preact-i18n";
import { useEffect, useState } from "preact/hooks";

import { Button, Checkbox, InputBox } from "@revoltchat/ui";

import TextAreaAutoSize from "../../../lib/TextAreaAutoSize";

import { FileUploader } from "../../../controllers/client/jsx/legacy/FileUploads";

interface Props {
    channel: Channel;
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

export default observer(({ channel }: Props) => {
    const [name, setName] = useState(channel.name ?? undefined);
    const [description, setDescription] = useState(channel.description ?? "");
    const [nsfw, setNSFW] = useState(channel.nsfw ?? false);

    useEffect(() => setName(channel.name ?? undefined), [channel.name]);
    useEffect(
        () => setDescription(channel.description ?? ""),
        [channel.description],
    );
    useEffect(() => setNSFW(channel.nsfw ?? false), [channel.nsfw]);

    const [changed, setChanged] = useState(false);
    function save() {
        const changes: Record<string, string | boolean | undefined> = {};
        if (name !== channel.name) changes.name = name;
        if (description !== channel.description)
            changes.description = description;
        if (nsfw !== channel.nsfw) changes.nsfw = nsfw;

        channel.edit(changes);
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
                    onUpload={(icon) => channel.edit({ icon })}
                    previewURL={channel.generateIconURL(
                        { max_side: 256 },
                        true,
                    )}
                    remove={() => channel.edit({ remove: ["Icon"] })}
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
                        palette="secondary"
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
            <hr />
            {channel.channel_type === "VoiceChannel" ? (
                ""
            ) : (
                <Checkbox
                    value={nsfw ?? false}
                    onChange={(nsfwchange) => {
                        setNSFW(nsfwchange);
                        if (!changed) setChanged(true);
                    }}
                    title="NSFW"
                    description="Set this channel to NSFW."
                />
            )}
            <p>
                <Button onClick={save} palette="secondary" disabled={!changed}>
                    <Text id="app.special.modals.actions.save" />
                </Button>
            </p>
        </div>
    );
});
