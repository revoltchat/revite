import { ulid } from "ulid";
import { Channel } from "revolt.js";
import styled from "styled-components";
import { defer } from "../../../lib/defer";
import IconButton from "../../ui/IconButton";
import { Send } from '@styled-icons/feather';
import Axios, { CancelTokenSource } from "axios";
import { useTranslation } from "../../../lib/i18n";
import { connectState } from "../../../redux/connector";
import { WithDispatcher } from "../../../redux/reducers";
import { takeError } from "../../../context/revoltjs/util";
import TextAreaAutoSize from "../../../lib/TextAreaAutoSize";
import { AppContext } from "../../../context/revoltjs/RevoltClient";
import { isTouchscreenDevice } from "../../../lib/isTouchscreenDevice";
import { internalEmit, internalSubscribe } from "../../../lib/eventEmitter";
import { useCallback, useContext, useEffect, useState } from "preact/hooks";
import { useIntermediate } from "../../../context/intermediate/Intermediate";
import { FileUploader, grabFiles, uploadFile } from "../../../context/revoltjs/FileUploads";
import { SingletonMessageRenderer, SMOOTH_SCROLL_ON_RECEIVE } from "../../../lib/renderer/Singleton";

import FilePreview from './bars/FilePreview';
import { debounce } from "../../../lib/debounce";
import AutoComplete, { useAutoComplete } from "../AutoComplete";

type Props = WithDispatcher & {
    channel: Channel;
    draft?: string;
};

export type UploadState =
    | { type: "none" }
    | { type: "attached"; files: File[] }
    | { type: "uploading"; files: File[]; percent: number; cancel: CancelTokenSource }
    | { type: "sending"; files: File[] }
    | { type: "failed"; files: File[]; error: string };

const Base = styled.div`
    display: flex;
    padding: 0 12px;
    background: var(--message-box);

    textarea {
        font-size: .875rem;
        background: transparent;
    }
`;

const Action = styled.div`
    display: grid;
    place-items: center;
`;

function MessageBox({ channel, draft, dispatcher }: Props) {
    const [ uploadState, setUploadState ] = useState<UploadState>({ type: 'none' });
    const [typing, setTyping] = useState<boolean | number>(false);
    const { openScreen } = useIntermediate();
    const client = useContext(AppContext);
    const translate = useTranslation();

    function setMessage(content?: string) {
        if (content) {
            dispatcher({
                type: "SET_DRAFT",
                channel: channel._id,
                content
            });
        } else {
            dispatcher({
                type: "CLEAR_DRAFT",
                channel: channel._id
            });
        }
    }

    useEffect(() => {
        function append(content: string, action: 'quote' | 'mention') {
            const text =
                action === "quote"
                    ? `${content
                          .split("\n")
                          .map(x => `> ${x}`)
                          .join("\n")}\n\n`
                    : `${content} `;

            if (!draft || draft.length === 0) {
                setMessage(text);
            } else {
                setMessage(`${draft}\n${text}`);
            }
        }

        return internalSubscribe("MessageBox", "append", append);
    }, [ draft ]);

    async function send() {
        if (uploadState.type === 'uploading' || uploadState.type === 'sending') return;
        
        const content = draft?.trim() ?? '';
        if (uploadState.type === 'attached') return sendFile(content);
        if (content.length === 0) return;
        
        stopTyping();
        setMessage();

        const nonce = ulid();
        dispatcher({
            type: "QUEUE_ADD",
            nonce,
            channel: channel._id,
            message: {
                _id: nonce,
                channel: channel._id,
                author: client.user!._id,
                content
            }
        });

        defer(() => SingletonMessageRenderer.jumpToBottom(channel._id, SMOOTH_SCROLL_ON_RECEIVE));

        try {
            await client.channels.sendMessage(channel._id, {
                content,
                nonce
            });
        } catch (error) {
            dispatcher({
                type: "QUEUE_FAIL",
                error: takeError(error),
                nonce
            });
        }
    }

    async function sendFile(content: string) {
        if (uploadState.type !== 'attached') return;
        let attachments = [];

        const cancel = Axios.CancelToken.source();
        const files = uploadState.files;
        stopTyping();
        setUploadState({ type: "uploading", files, percent: 0, cancel });

        try {
            for (let i=0;i<files.length;i++) {
                if (i>0)continue; // ! FIXME: temp, allow multiple uploads on server
                const file = files[i];
                attachments.push(
                    await uploadFile(client.configuration!.features.autumn.url, 'attachments', file, {
                        onUploadProgress: e =>
                        setUploadState({
                            type: "uploading",
                            files,
                            percent: Math.round(((i * 100) + (100 * e.loaded) / e.total) / (files.length)),
                            cancel
                        }),
                        cancelToken: cancel.token
                    })
                );
            }
        } catch (err) {
            if (err?.message === "cancel") {
                setUploadState({
                    type: "attached",
                    files
                });
            } else {
                setUploadState({
                    type: "failed",
                    files,
                    error: takeError(err)
                });
            }

            return;
        }

        setUploadState({
            type: "sending",
            files
        });

        const nonce = ulid();
        try {
            await client.channels.sendMessage(channel._id, {
                content,
                nonce,
                attachment: attachments[0] // ! FIXME: temp, allow multiple uploads on server
            });
        } catch (err) {
            setUploadState({
                type: "failed",
                files,
                error: takeError(err)
            });

            return;
        }

        setMessage();
        setUploadState({ type: "none" });
    }
    
    function startTyping() {
        if (typeof typing === 'number' && + new Date() < typing) return;

        const ws = client.websocket;
        if (ws.connected) {
            setTyping(+ new Date() + 4000);
            ws.send({
                type: "BeginTyping",
                channel: channel._id
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
                    channel: channel._id
                });
            }
        }
    }

    const debouncedStopTyping = useCallback(debounce(stopTyping, 1000), [ channel._id ]);
    const { onChange, onKeyUp, onKeyDown, onFocus, onBlur, ...autoCompleteProps } =
        useAutoComplete(setMessage, {
            users: { type: 'channel', id: channel._id },
            channels: channel.channel_type === 'TextChannel' ? { server: channel.server } : undefined
        });

    return (
        <>
            <AutoComplete {...autoCompleteProps} />
            <FilePreview state={uploadState} addFile={() => uploadState.type === 'attached' &&
                grabFiles(20_000_000, files => setUploadState({ type: 'attached', files: [ ...uploadState.files, ...files ] }),
                    () => openScreen({ id: "error", error: "FileTooLarge" }), true)}
                removeFile={index => {
                    if (uploadState.type !== 'attached') return;
                    if (uploadState.files.length === 1) {
                        setUploadState({ type: 'none' });
                    } else {
                        setUploadState({ type: 'attached', files: uploadState.files.filter((_, i) => index !== i) });
                    }
                }} />
            <Base>
                <Action>
                    <FileUploader
                        size={24}
                        behaviour='multi'
                        style='attachment'
                        fileType='attachments'
                        maxFileSize={20_000_000}

                        attached={uploadState.type !== 'none'}
                        uploading={uploadState.type === 'uploading' || uploadState.type === 'sending'}

                        remove={async () => setUploadState({ type: "none" })}
                        onChange={files => setUploadState({ type: "attached", files })}
                        cancel={() => uploadState.type === 'uploading' && uploadState.cancel.cancel("cancel")}
                        append={files => {
                            if (uploadState.type === 'none') {
                                setUploadState({ type: 'attached', files });
                            } else if (uploadState.type === 'attached') {
                                setUploadState({ type: 'attached', files: [ ...uploadState.files, ...files ] });
                            }
                        }}
                    />
                </Action>
                <TextAreaAutoSize
                    autoFocus
                    hideBorder
                    maxRows={5}
                    padding={14}
                    id="message"
                    value={draft ?? ''}
                    onKeyUp={onKeyUp}
                    onKeyDown={e => {
                        if (onKeyDown(e)) return;

                        if (
                            e.key === "ArrowUp" &&
                            (!draft || draft.length === 0)
                        ) {
                            e.preventDefault();
                            internalEmit("MessageRenderer", "edit_last");
                            return;
                        }

                        if (!e.shiftKey && e.key === "Enter" && !isTouchscreenDevice) {
                            e.preventDefault();
                            return send();
                        }
                        
                        debouncedStopTyping(true);
                    }}
                    placeholder={
                        channel.channel_type === "DirectMessage" ? translate("app.main.channel.message_who", {
                            person: client.users.get(client.channels.getRecipient(channel._id))?.username })
                        : channel.channel_type === "SavedMessages" ? translate("app.main.channel.message_saved")
                        : translate("app.main.channel.message_where", { channel_name: channel.name })
                    }
                    disabled={uploadState.type === 'uploading' || uploadState.type === 'sending'}
                    onChange={e => {
                        setMessage(e.currentTarget.value);
                        startTyping();
                        onChange(e);
                    }}
                    onFocus={onFocus}
                    onBlur={onBlur} />
                <Action>
                    <IconButton onClick={send}>
                        <Send size={20} />
                    </IconButton>
                </Action>
            </Base>
        </>
    )
}

export default connectState<Omit<Props, "dispatcher" | "draft">>(MessageBox, (state, { channel }) => {
    return {
        draft: state.drafts[channel._id]
    }
}, true)
