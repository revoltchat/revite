import { Send, HappyAlt, ShieldX } from "@styled-icons/boxicons-solid";
import { Styleshare } from "@styled-icons/simple-icons";
import Axios, { CancelTokenSource } from "axios";
import { Channel } from "revolt.js";
import { ChannelPermission } from "revolt.js/dist/api/permissions";
import styled from "styled-components";
import { ulid } from "ulid";

import { Text } from "preact-i18n";
import { useCallback, useContext, useEffect, useState } from "preact/hooks";

import TextAreaAutoSize from "../../../lib/TextAreaAutoSize";
import { debounce } from "../../../lib/debounce";
import { defer } from "../../../lib/defer";
import { internalEmit, internalSubscribe } from "../../../lib/eventEmitter";
import { useTranslation } from "../../../lib/i18n";
import { isTouchscreenDevice } from "../../../lib/isTouchscreenDevice";
import {
    SingletonMessageRenderer,
    SMOOTH_SCROLL_ON_RECEIVE,
} from "../../../lib/renderer/Singleton";

import { dispatch, getState } from "../../../redux";
import { Reply } from "../../../redux/reducers/queue";

import { SoundContext } from "../../../context/Settings";
import { useIntermediate } from "../../../context/intermediate/Intermediate";
import {
    FileUploader,
    grabFiles,
    uploadFile,
} from "../../../context/revoltjs/FileUploads";
import { AppContext } from "../../../context/revoltjs/RevoltClient";
import { useChannelPermission } from "../../../context/revoltjs/hooks";
import { takeError } from "../../../context/revoltjs/util";

import IconButton from "../../ui/IconButton";

import { PluginSingleton } from "../../../plugins";
import AutoComplete, { useAutoComplete } from "../AutoComplete";
import { PermissionTooltip } from "../Tooltip";
import FilePreview from "./bars/FilePreview";
import ReplyBar from "./bars/ReplyBar";

type Props = {
    channel: Channel;
};

export type UploadState =
    | { type: "none" }
    | { type: "attached"; files: File[] }
    | {
          type: "uploading";
          files: File[];
          percent: number;
          cancel: CancelTokenSource;
      }
    | { type: "sending"; files: File[] }
    | { type: "failed"; files: File[]; error: string };

const Base = styled.div`
    display: flex;
    align-items: flex-start;
    background: var(--message-box);

    textarea {
        font-size: var(--text-size);
        background: transparent;

        &::placeholder {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }
`;

const Blocked = styled.div`
    display: flex;
    align-items: center;
    user-select: none;
    font-size: var(--text-size);
    color: var(--tertiary-foreground);

    .text {
        padding: 14px 14px 14px 0;
    }

    svg {
        flex-shrink: 0;
    }
`;

const Action = styled.div`
    display: flex;
    place-items: center;

    > div {
        height: 48px;
        width: 48px;
        padding: 12px;
    }

    .mobile {
        @media (pointer: fine) {
            display: none;
        }
    }
`;

// ! FIXME: add to app config and load from app config
export const CAN_UPLOAD_AT_ONCE = 4;

export default function MessageBox({ channel }: Props) {
    const [draft, setDraft] = useState(getState().drafts[channel._id] ?? "");

    const [uploadState, setUploadState] = useState<UploadState>({
        type: "none",
    });
    const [typing, setTyping] = useState<boolean | number>(false);
    const [replies, setReplies] = useState<Reply[]>([]);
    const playSound = useContext(SoundContext);
    const { openScreen } = useIntermediate();
    const client = useContext(AppContext);
    const translate = useTranslation();

    const permissions = useChannelPermission(channel._id);
    if (!(permissions & ChannelPermission.SendMessage)) {
        return (
            <Base>
                <Blocked>
                    <Action>
                        <PermissionTooltip
                            permission="SendMessages"
                            placement="top">
                            <ShieldX size={22} />
                        </PermissionTooltip>
                    </Action>
                    <div className="text">
                        <Text id="app.main.channel.misc.no_sending" />
                    </div>
                </Blocked>
            </Base>
        );
    }

    function setMessage(content?: string) {
        setDraft(content ?? "");

        if (content) {
            dispatch({
                type: "SET_DRAFT",
                channel: channel._id,
                content,
            });
        } else {
            dispatch({
                type: "CLEAR_DRAFT",
                channel: channel._id,
            });
        }
    }

    useEffect(() => {
        function append(content: string, action: "quote" | "mention") {
            const text =
                action === "quote"
                    ? `${content
                          .split("\n")
                          .map((x) => `> ${x}`)
                          .join("\n")}\n\n`
                    : `${content} `;

            if (!draft || draft.length === 0) {
                setMessage(text);
            } else {
                setMessage(`${draft}\n${text}`);
            }
        }

        return internalSubscribe("MessageBox", "append", append);
    }, [draft]);

    async function send() {
        if (uploadState.type === "uploading" || uploadState.type === "sending")
            return;

        const content = draft?.trim() ?? "";
        const target = { content };
        if (PluginSingleton.emit("Message:Send", target)) return;

        if (uploadState.type === "attached") return sendFile(target.content);
        if (target.content.length === 0) return;

        stopTyping();
        setMessage();
        setReplies([]);
        playSound("outbound");

        const nonce = ulid();
        dispatch({
            type: "QUEUE_ADD",
            nonce,
            channel: channel._id,
            message: {
                _id: nonce,
                channel: channel._id,
                author: client.user!._id,

                content: target.content,
                replies,
            },
        });

        defer(() =>
            SingletonMessageRenderer.jumpToBottom(
                channel._id,
                SMOOTH_SCROLL_ON_RECEIVE,
            ),
        );

        try {
            await client.channels.sendMessage(channel._id, {
                content: target.content,
                nonce,
                replies,
            });
        } catch (error) {
            dispatch({
                type: "QUEUE_FAIL",
                error: takeError(error),
                nonce,
            });
        }
    }

    async function sendFile(content: string) {
        if (uploadState.type !== "attached") return;
        const attachments: string[] = [];

        const cancel = Axios.CancelToken.source();
        const files = uploadState.files;
        stopTyping();
        setUploadState({ type: "uploading", files, percent: 0, cancel });

        try {
            for (let i = 0; i < files.length && i < CAN_UPLOAD_AT_ONCE; i++) {
                const file = files[i];
                attachments.push(
                    await uploadFile(
                        client.configuration!.features.autumn.url,
                        "attachments",
                        file,
                        {
                            onUploadProgress: (e) =>
                                setUploadState({
                                    type: "uploading",
                                    files,
                                    percent: Math.round(
                                        (i * 100 + (100 * e.loaded) / e.total) /
                                            Math.min(
                                                files.length,
                                                CAN_UPLOAD_AT_ONCE,
                                            ),
                                    ),
                                    cancel,
                                }),
                            cancelToken: cancel.token,
                        },
                    ),
                );
            }
        } catch (err) {
            if (err?.message === "cancel") {
                setUploadState({
                    type: "attached",
                    files,
                });
            } else {
                setUploadState({
                    type: "failed",
                    files,
                    error: takeError(err),
                });
            }

            return;
        }

        setUploadState({
            type: "sending",
            files,
        });

        const nonce = ulid();
        try {
            await client.channels.sendMessage(channel._id, {
                content,
                nonce,
                replies,
                attachments,
            });
        } catch (err) {
            setUploadState({
                type: "failed",
                files,
                error: takeError(err),
            });

            return;
        }

        setMessage();
        setReplies([]);
        playSound("outbound");

        if (files.length > CAN_UPLOAD_AT_ONCE) {
            setUploadState({
                type: "attached",
                files: files.slice(CAN_UPLOAD_AT_ONCE),
            });
        } else {
            setUploadState({ type: "none" });
        }
    }

    function startTyping() {
        if (typeof typing === "number" && +new Date() < typing) return;

        const ws = client.websocket;
        if (ws.connected) {
            setTyping(+new Date() + 4000);
            ws.send({
                type: "BeginTyping",
                channel: channel._id,
            });
        }
    }

    function stopTyping(force?: boolean) {
        if (force || typing) {
            const ws = client.websocket;
            if (ws.connected) {
                setTyping(false);
                ws.send({
                    type: "EndTyping",
                    channel: channel._id,
                });
            }
        }
    }

    const debouncedStopTyping = useCallback(debounce(stopTyping, 1000), [
        channel._id,
    ]);
    const {
        onChange,
        onKeyUp,
        onKeyDown,
        onFocus,
        onBlur,
        ...autoCompleteProps
    } = useAutoComplete(setMessage, {
        users: { type: "channel", id: channel._id },
        channels:
            channel.channel_type === "TextChannel"
                ? { server: channel.server }
                : undefined,
    });

    return (
        <>
            <AutoComplete {...autoCompleteProps} />
            <FilePreview
                state={uploadState}
                addFile={() =>
                    uploadState.type === "attached" &&
                    grabFiles(
                        20_000_000,
                        (files) =>
                            setUploadState({
                                type: "attached",
                                files: [...uploadState.files, ...files],
                            }),
                        () =>
                            openScreen({ id: "error", error: "FileTooLarge" }),
                        true,
                    )
                }
                removeFile={(index) => {
                    if (uploadState.type !== "attached") return;
                    if (uploadState.files.length === 1) {
                        setUploadState({ type: "none" });
                    } else {
                        setUploadState({
                            type: "attached",
                            files: uploadState.files.filter(
                                (_, i) => index !== i,
                            ),
                        });
                    }
                }}
            />
            <ReplyBar
                channel={channel._id}
                replies={replies}
                setReplies={setReplies}
            />
            <Base>
                {permissions & ChannelPermission.UploadFiles ? (
                    <Action>
                        <FileUploader
                            size={24}
                            behaviour="multi"
                            style="attachment"
                            fileType="attachments"
                            maxFileSize={20_000_000}
                            attached={uploadState.type !== "none"}
                            uploading={
                                uploadState.type === "uploading" ||
                                uploadState.type === "sending"
                            }
                            remove={async () =>
                                setUploadState({ type: "none" })
                            }
                            onChange={(files) =>
                                setUploadState({ type: "attached", files })
                            }
                            cancel={() =>
                                uploadState.type === "uploading" &&
                                uploadState.cancel.cancel("cancel")
                            }
                            append={(files) => {
                                if (files.length === 0) return;

                                if (uploadState.type === "none") {
                                    setUploadState({ type: "attached", files });
                                } else if (uploadState.type === "attached") {
                                    setUploadState({
                                        type: "attached",
                                        files: [...uploadState.files, ...files],
                                    });
                                }
                            }}
                        />
                    </Action>
                ) : undefined}
                <TextAreaAutoSize
                    autoFocus
                    hideBorder
                    maxRows={20}
                    id="message"
                    onKeyUp={onKeyUp}
                    value={draft ?? ""}
                    padding="var(--message-box-padding)"
                    onKeyDown={(e) => {
                        if (onKeyDown(e)) return;

                        if (
                            e.key === "ArrowUp" &&
                            (!draft || draft.length === 0)
                        ) {
                            e.preventDefault();
                            internalEmit("MessageRenderer", "edit_last");
                            return;
                        }

                        if (
                            !e.shiftKey &&
                            e.key === "Enter" &&
                            !isTouchscreenDevice
                        ) {
                            e.preventDefault();
                            return send();
                        }

                        debouncedStopTyping(true);
                    }}
                    placeholder={
                        channel.channel_type === "DirectMessage"
                            ? translate("app.main.channel.message_who", {
                                  person: client.users.get(
                                      client.channels.getRecipient(channel._id),
                                  )?.username,
                              })
                            : channel.channel_type === "SavedMessages"
                            ? translate("app.main.channel.message_saved")
                            : translate("app.main.channel.message_where", {
                                  channel_name: channel.name,
                              })
                    }
                    disabled={
                        uploadState.type === "uploading" ||
                        uploadState.type === "sending"
                    }
                    onChange={(e) => {
                        setMessage(e.currentTarget.value);
                        startTyping();
                        onChange(e);
                    }}
                    onFocus={onFocus}
                    onBlur={onBlur}
                />
                <Action>
                    {/*<IconButton onClick={emojiPicker}>
                        <HappyAlt size={20} />
                </IconButton>*/}
                    <IconButton
                        className="mobile"
                        onClick={send}
                        onMouseDown={(e) => e.preventDefault()}>
                        <Send size={20} />
                    </IconButton>
                </Action>
            </Base>
        </>
    );
}
