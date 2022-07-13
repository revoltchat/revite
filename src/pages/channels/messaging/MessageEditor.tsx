import { Message } from "revolt.js";
import styled from "styled-components/macro";

import { useContext, useEffect, useState } from "preact/hooks";

import TextAreaAutoSize from "../../../lib/TextAreaAutoSize";
import { isTouchscreenDevice } from "../../../lib/isTouchscreenDevice";

import AutoComplete, {
    useAutoComplete,
} from "../../../components/common/AutoComplete";
import { modalController } from "../../../controllers/modals/ModalController";

const EditorBase = styled.div`
    display: flex;
    flex-direction: column;

    textarea {
        resize: none;
        padding: 12px;
        white-space: pre-wrap;
        font-size: var(--text-size);
        border-radius: var(--border-radius);
        background: var(--secondary-header);
    }

    .caption {
        padding: 2px;
        font-size: 11px;
        color: var(--tertiary-foreground);

        a {
            cursor: pointer;
            &:hover {
                text-decoration: underline;
            }
        }
    }
`;

interface Props {
    message: Message;
    finish: () => void;
}

export default function MessageEditor({ message, finish }: Props) {
    const [content, setContent] = useState(message.content ?? "");

    async function save() {
        finish();

        if (content.length === 0) {
            modalController.push({
                type: "delete_message",
                target: message,
            });
        } else if (content !== message.content) {
            await message.edit({
                content,
            });
        }
    }

    // ? Stop editing when pressing ESC.
    useEffect(() => {
        function keyUp(e: KeyboardEvent) {
            if (e.key === "Escape" && !modalController.isVisible) {
                finish();
            }
        }

        document.body.addEventListener("keyup", keyUp);
        return () => document.body.removeEventListener("keyup", keyUp);
    }, [finish]);

    const {
        onChange,
        onKeyUp,
        onKeyDown,
        onFocus,
        onBlur,
        ...autoCompleteProps
    } = useAutoComplete((v) => setContent(v ?? ""), {
        users: { type: "channel", id: message.channel!._id },
        channels:
            message.channel!.channel_type === "TextChannel"
                ? { server: message.channel!.server_id! }
                : undefined,
    });

    return (
        <EditorBase>
            <AutoComplete detached {...autoCompleteProps} />
            <TextAreaAutoSize
                forceFocus
                maxRows={10}
                value={content}
                maxLength={2000}
                padding="var(--message-box-padding)"
                onChange={(ev) => {
                    onChange(ev);
                    setContent(ev.currentTarget.value);
                }}
                onKeyDown={(e) => {
                    if (onKeyDown(e)) return;

                    if (
                        !e.shiftKey &&
                        e.key === "Enter" &&
                        !isTouchscreenDevice
                    ) {
                        e.preventDefault();
                        save();
                    }
                }}
                onKeyUp={onKeyUp}
                onFocus={onFocus}
                onBlur={onBlur}
            />
            <span className="caption">
                escape to <a onClick={finish}>cancel</a> &middot; enter to{" "}
                <a onClick={save}>save</a>
            </span>
        </EditorBase>
    );
}
