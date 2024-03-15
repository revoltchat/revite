import { HappyBeaming, Send, ShieldX } from "@styled-icons/boxicons-solid";
import Axios, { CancelTokenSource } from "axios";
import { observer } from "mobx-react-lite";
import { Channel } from "revolt.js";
import styled, { css } from "styled-components/macro";
import { ulid } from "ulid";

import { Text } from "preact-i18n";
import { memo } from "preact/compat";
import { useCallback, useEffect, useMemo, useState } from "preact/hooks";

import { IconButton, Picker } from "@revoltchat/ui";

import TextAreaAutoSize from "../../../lib/TextAreaAutoSize";
import { debounce } from "../../../lib/debounce";
import { defer } from "../../../lib/defer";
import { internalEmit, internalSubscribe } from "../../../lib/eventEmitter";
import { useTranslation } from "../../../lib/i18n";
import { isTouchscreenDevice } from "../../../lib/isTouchscreenDevice";
import {
    getRenderer,
    SMOOTH_SCROLL_ON_RECEIVE,
} from "../../../lib/renderer/Singleton";

import { state, useApplicationState } from "../../../mobx/State";
import { DraftObject } from "../../../mobx/stores/Draft";
import { Reply } from "../../../mobx/stores/MessageQueue";

import { dayjs } from "../../../context/Locale";

import { emojiDictionary } from "../../../assets/emojis";
import {
    clientController,
    useClient,
} from "../../../controllers/client/ClientController";
import { takeError } from "../../../controllers/client/jsx/error";
import {
    FileUploader,
    grabFiles,
    uploadFile,
} from "../../../controllers/client/jsx/legacy/FileUploads";
import { modalController } from "../../../controllers/modals/ModalController";
import { RenderEmoji } from "../../markdown/plugins/emoji";
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
    z-index: 1;
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
    flex-grow: 1;
    cursor: not-allowed;

    .text {
        padding: var(--message-box-padding);
    }

    > div > div {
        cursor: default;
    }

    svg {
        flex-shrink: 0;
    }
`;

const Action = styled.div`
    > a {
        height: 48px;
        width: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        /*padding: 14px 0 14px 14px;*/
    }

    .mobile {
        width: 62px;
    }

    ${() =>
        !isTouchscreenDevice &&
        css`
            .mobile {
                display: none;
            }
        `}
`;

const FileAction = styled.div`
    > a {
        height: 48px;
        width: 62px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
`;

const FloatingLayer = styled.div`
    position: relative;
`;

const ThisCodeWillBeReplacedAnywaysSoIMightAsWellJustDoItThisWay__Padding = styled.div`
    width: 16px;
`;

// For sed replacement
const RE_SED = new RegExp("^s/([^])*/([^])*$");

// Tests for code block delimiters (``` at start of line)
const RE_CODE_DELIMITER = new RegExp("^```", "gm");

export const HackAlertThisFileWillBeReplaced = observer(
    ({
        onSelect,
        onClose,
    }: {
        onSelect: (emoji: string) => void;
        onClose: () => void;
    }) => {
        const renderEmoji = useMemo(
            () =>
                memo(({ emoji }: { emoji: string }) => (
                    <RenderEmoji match={emoji} {...({} as any)} />
                )),
            [],
        );

        const emojis: Record<string, any> = {
            default: Object.keys(emojiDictionary).map((id) => ({ id })),
        };

        // ! FIXME: also expose typing from component
        const categories: any[] = [];

        for (const server of state.ordering.orderedServers) {
            // ! FIXME: add a separate map on each server for emoji
            const list = [...clientController.getReadyClient()!.emojis.values()]
                .filter(
                    (emoji) =>
                        emoji.parent.type !== "Detached" &&
                        emoji.parent.id === server._id,
                )
                .map(({ _id, name }) => ({ id: _id, name }));

            if (list.length > 0) {
                emojis[server._id] = list;
                categories.push({
                    id: server._id,
                    name: server.name,
                    iconURL: server.generateIconURL({ max_side: 256 }),
                });
            }
        }

        categories.push({
            id: "default",
            name: "Default",
            emoji: "smiley",
        });

        return (
            <Picker
                emojis={emojis}
                categories={categories}
                renderEmoji={renderEmoji}
                onSelect={onSelect}
                onClose={onClose}
            />
        );
    },
);

// ! FIXME: add to app config and load from app config
export const CAN_UPLOAD_AT_ONCE = 5;

export default observer(({ channel }: Props) => {
    const state = useApplicationState();

    const [uploadState, setUploadState] = useState<UploadState>({
        type: "none",
    });
    const [typing, setTyping] = useState<boolean | number>(false);
    const [replies, setReplies] = useState<Reply[]>([]);
    const [picker, setPicker] = useState(false);
    const client = useClient();
    const translate = useTranslation();

    const closePicker = useCallback(() => setPicker(false), []);

    const renderer = getRenderer(channel);

    if (channel.server?.member?.timeout) {
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
                        <Text
                            id="app.main.channel.misc.timed_out"
                            fields={{
                                // TODO: make this reactive
                                time: dayjs().to(
                                    channel.server.member.timeout,
                                    true,
                                ),
                            }}
                        />
                    </div>
                </Blocked>
            </Base>
        );
    }

    if (!channel.havePermission("SendMessage")) {
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

    // Push message content to draft.
    const setMessage = useCallback(
        (content?: string) => {
            const dobj: DraftObject = {
                content,
            };
            state.draft.set(channel._id, dobj);
        },
        [state.draft, channel._id],
    );

    useEffect(() => {
        /**
         *
         * @param content
         * @param action
         */
        function append(content: string, action: "quote" | "mention") {
            const text =
                action === "quote"
                    ? `${content
                          .split("\n")
                          .map((x) => `> ${x}`)
                          .join("\n")}\n\n`
                    : `${content} `;

            if (!state.draft.has(channel._id)) {
                setMessage(text);
            } else {
                setMessage(`${state.draft.get(channel._id)}\n${text}`);
            }
        }

        return internalSubscribe(
            "MessageBox",
            "append",
            append as (...args: unknown[]) => void,
        );
    }, [state.draft, channel._id, setMessage]);

    /**
     * Trigger send message.
     */
    async function send() {
        if (uploadState.type === "uploading" || uploadState.type === "sending")
            return;

        const content = state.draft.get(channel._id)?.content?.trim() ?? "";
        if (uploadState.type !== "none") return sendFile(content);
        if (content.length === 0) return;

        internalEmit("NewMessages", "hide");
        stopTyping();
        setMessage();
        setReplies([]);
        const nonce = ulid();

        // sed style message editing.
        // If the user types for example `s/abc/def`, the string "abc"
        // will be replaced with "def" in their last sent message.
        if (RE_SED.test(content)) {
            renderer.messages.reverse();
            const msg = renderer.messages.find(
                (msg) => msg.author_id === client.user!._id,
            );
            renderer.messages.reverse();

            if (msg?.content) {
                // eslint-disable-next-line prefer-const
                let [_, toReplace, newText, flags] = content.split(/\//);

                if (toReplace == "*") toReplace = msg.content.toString();

                const newContent =
                    toReplace == ""
                        ? msg.content.toString() + newText
                        : msg.content
                              .toString()
                              .replace(new RegExp(toReplace, flags), newText);

                if (newContent != msg.content) {
                    if (newContent.length == 0) {
                        msg.delete().catch(console.error);
                    } else {
                        msg.edit({
                            content: newContent.substr(0, 2000),
                        })
                            .then(() =>
                                defer(() =>
                                    renderer.jumpToBottom(
                                        SMOOTH_SCROLL_ON_RECEIVE,
                                    ),
                                ),
                            )
                            .catch(console.error);
                    }
                }
            }
        } else {
            state.settings.sounds.playSound("outbound");

            state.queue.add(nonce, channel._id, {
                _id: nonce,
                channel: channel._id,
                author: client.user!._id,

                content,
                replies,
            });

            defer(() => renderer.jumpToBottom(SMOOTH_SCROLL_ON_RECEIVE));

            try {
                await channel.sendMessage({
                    content,
                    nonce,
                    replies,
                });
            } catch (error) {
                state.queue.fail(nonce, takeError(error));
            }
        }
    }

    /**
     *
     * @param content
     * @returns
     */
    async function sendFile(content: string) {
        if (uploadState.type !== "attached" && uploadState.type !== "failed")
            return;

        const attachments: string[] = [];
        setMessage;

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
            // eslint-disable-next-line
            if ((err as any)?.message === "cancel") {
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
            await channel.sendMessage({
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
        state.settings.sounds.playSound("outbound");

        if (files.length > CAN_UPLOAD_AT_ONCE) {
            setUploadState({
                type: "attached",
                files: files.slice(CAN_UPLOAD_AT_ONCE),
            });
        } else {
            setUploadState({ type: "none" });
        }
    }

    /**
     *
     * @returns
     */
    function startTyping() {
        if (typeof typing === "number" && +new Date() < typing) return;

        const ws = client.websocket;
        if (ws.connected) {
            setTyping(+new Date() + 2500);
            ws.send({
                type: "BeginTyping",
                channel: channel._id,
            });
        }
    }

    /**
     *
     * @param force
     */
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

    function isInCodeBlock(cursor: number): boolean {
        const content = state.draft.get(channel._id)?.content || "";
        const contentBeforeCursor = content.substring(0, cursor);

        let delimiterCount = 0;
        for (const delimiter of contentBeforeCursor.matchAll(
            RE_CODE_DELIMITER,
        )) {
            delimiterCount++;
        }

        // Odd number of ``` delimiters before cursor => we are in code block
        return delimiterCount % 2 === 1;
    }

    // TODO: change to useDebounceCallback
    // eslint-disable-next-line
    const debouncedStopTyping = useCallback(
        debounce(stopTyping as (...args: unknown[]) => void, 1000),
        [channel._id],
    );
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
                ? { server: channel.server_id! }
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
                            modalController.push({
                                type: "error",
                                error: "FileTooLarge",
                            }),
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
                channel={channel}
                replies={replies}
                setReplies={setReplies}
            />
            <FloatingLayer>
                {picker && (
                    <HackAlertThisFileWillBeReplaced
                        onSelect={(emoji) => {
                            const v = state.draft.get(channel._id);
                            const cnt: DraftObject = {
                                content:
                                    (v?.content ? `${v.content} ` : "") +
                                    `:${emoji}:`,
                            };
                            state.draft.set(channel._id, cnt);
                        }}
                        onClose={closePicker}
                    />
                )}
            </FloatingLayer>
            <Base>
                {channel.havePermission("UploadFiles") ? (
                    <FileAction>
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
                    </FileAction>
                ) : (
                    <ThisCodeWillBeReplacedAnywaysSoIMightAsWellJustDoItThisWay__Padding />
                )}
                <TextAreaAutoSize
                    autoFocus
                    hideBorder
                    maxRows={20}
                    id="message"
                    maxLength={2000}
                    onKeyUp={onKeyUp}
                    value={state.draft.get(channel._id)?.content ?? ""}
                    padding="var(--message-box-padding)"
                    onKeyDown={(e) => {
                        if (e.ctrlKey && e.key === "Enter") {
                            e.preventDefault();
                            return send();
                        }

                        if (onKeyDown(e)) return;

                        if (
                            e.key === "ArrowUp" &&
                            !state.draft.has(channel._id)
                        ) {
                            e.preventDefault();
                            internalEmit("MessageRenderer", "edit_last");
                            return;
                        }

                        if (
                            !e.shiftKey &&
                            !e.isComposing &&
                            e.key === "Enter" &&
                            !isTouchscreenDevice &&
                            !isInCodeBlock(e.currentTarget.selectionStart)
                        ) {
                            e.preventDefault();
                            return send();
                        }

                        if (e.key === "Escape") {
                            if (replies.length > 0) {
                                setReplies(replies.slice(0, -1));
                            } else if (
                                uploadState.type === "attached" &&
                                uploadState.files.length > 0
                            ) {
                                setUploadState({
                                    type:
                                        uploadState.files.length > 1
                                            ? "attached"
                                            : "none",
                                    files: uploadState.files.slice(0, -1),
                                });
                            }
                        }

                        debouncedStopTyping(true);
                    }}
                    placeholder={
                        channel.channel_type === "DirectMessage"
                            ? translate("app.main.channel.message_who", {
                                  person: channel.recipient?.username,
                              })
                            : channel.channel_type === "SavedMessages"
                            ? translate("app.main.channel.message_saved")
                            : translate("app.main.channel.message_where", {
                                  channel_name: channel.name ?? undefined,
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
                    <IconButton onClick={() => setPicker(!picker)}>
                        <HappyBeaming size={24} />
                    </IconButton>
                </Action>
                <Action>
                    <IconButton
                        className={
                            state.settings.get("appearance:show_send_button")
                                ? ""
                                : "mobile"
                        }
                        onClick={send}
                        onMouseDown={(e) => e.preventDefault()}>
                        <Send size={20} />
                    </IconButton>
                </Action>
            </Base>
        </>
    );
});
