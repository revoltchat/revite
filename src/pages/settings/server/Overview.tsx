import { Markdown } from "@styled-icons/boxicons-logos";
import isEqual from "lodash.isequal";
import { observer } from "mobx-react-lite";
import { Server } from "revolt.js/dist/maps/Servers";

import styles from "./Panes.module.scss";
import { Text } from "preact-i18n";
import { useEffect, useState } from "preact/hooks";

import TextAreaAutoSize from "../../../lib/TextAreaAutoSize";

import { FileUploader } from "../../../context/revoltjs/FileUploads";
import { getChannelName } from "../../../context/revoltjs/util";

import Button from "../../../components/ui/Button";
import ComboBox from "../../../components/ui/ComboBox";
import InputBox from "../../../components/ui/InputBox";

interface Props {
    server: Server;
}

export const Overview = observer(({ server }: Props) => {
    const [name, setName] = useState(server.name);
    const [description, setDescription] = useState(server.description ?? "");
    const [systemMessages, setSystemMessages] = useState(
        server.system_messages,
    );

    useEffect(() => setName(server.name), [server.name]);
    useEffect(
        () => setDescription(server.description ?? ""),
        [server.description],
    );
    useEffect(
        () => setSystemMessages(server.system_messages),
        [server.system_messages],
    );

    const [changed, setChanged] = useState(false);
    function save() {
        const changes: Record<string, unknown> = {};
        if (name !== server.name) changes.name = name;
        if (description !== server.description)
            changes.description = description;
        if (!isEqual(systemMessages, server.system_messages))
            changes.system_messages = systemMessages ?? undefined;

        server.edit(changes);
        setChanged(false);
    }

    return (
        <div className={styles.overview}>
            <div className={styles.row}>
                <FileUploader
                    width={80}
                    height={80}
                    style="icon"
                    fileType="icons"
                    behaviour="upload"
                    maxFileSize={2_500_000}
                    onUpload={(icon) => server.edit({ icon })}
                    previewURL={server.generateIconURL({ max_side: 256 }, true)}
                    remove={() => server.edit({ remove: "Icon" })}
                />
                <div className={styles.name}>
                    <h3>
                        <Text id="app.main.servers.name" />
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
            </div>

            <h3>
                <Text id="app.main.servers.description" />
            </h3>
            <TextAreaAutoSize
                maxRows={10}
                minHeight={120}
                maxLength={1024}
                value={description}
                placeholder={"Add a topic..."}
                onChange={(ev) => {
                    setDescription(ev.currentTarget.value);
                    if (!changed) setChanged(true);
                }}
            />
            <div className={styles.markdown}>
                <Markdown size="24" />
                <h5>
                    Descriptions support Markdown formatting,{" "}
                    <a
                        href="https://developers.revolt.chat/markdown"
                        target="_blank"
                        rel="noreferrer">
                        learn more here
                    </a>
                    .
                </h5>
            </div>
            <hr />
            <h3>
                <Text id="app.main.servers.custom_banner" />
            </h3>
            <FileUploader
                height={160}
                style="banner"
                fileType="banners"
                behaviour="upload"
                maxFileSize={6_000_000}
                onUpload={(banner) => server.edit({ banner })}
                previewURL={server.generateBannerURL({ width: 1000 }, true)}
                remove={() => server.edit({ remove: "Banner" })}
            />
            <hr />
            <h3>
                <Text id="app.settings.server_pages.overview.system_messages" />
            </h3>
            {[
                ["User Joined", "user_joined"],
                ["User Left", "user_left"],
                ["User Kicked", "user_kicked"],
                ["User Banned", "user_banned"],
            ].map(([i18n, key]) => (
                // ! FIXME: temporary code just so we can expose the options
                <p
                    key={key}
                    style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                    }}>
                    <span style={{ flexShrink: "0", flex: `25%` }}>{i18n}</span>
                    <ComboBox
                        value={
                            systemMessages?.[
                                key as keyof typeof systemMessages
                            ] ?? "disabled"
                        }
                        onChange={(e) => {
                            if (!changed) setChanged(true);
                            const v = e.currentTarget.value;
                            if (v === "disabled") {
                                const {
                                    [key as keyof typeof systemMessages]: _,
                                    ...other
                                } = systemMessages;
                                setSystemMessages(other);
                            } else {
                                setSystemMessages({
                                    ...systemMessages,
                                    [key]: v,
                                });
                            }
                        }}>
                        <option value="disabled">
                            <Text id="general.disabled" />
                        </option>
                        {server.channels
                            .filter(
                                (x) =>
                                    typeof x !== "undefined" &&
                                    x.channel_type === "TextChannel",
                            )
                            .map((channel) => (
                                <option key={channel!._id} value={channel!._id}>
                                    {getChannelName(channel!, true)}
                                </option>
                            ))}
                    </ComboBox>
                </p>
            ))}

            <p>
                <Button onClick={save} contrast disabled={!changed}>
                    <Text id="app.special.modals.actions.save" />
                </Button>
            </p>
        </div>
    );
});
