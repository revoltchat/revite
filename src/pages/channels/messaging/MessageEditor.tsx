import styled from "styled-components";
import TextAreaAutoSize from "../../../lib/TextAreaAutoSize";
import { MessageObject } from "../../../context/revoltjs/util";
import { useContext, useEffect, useState } from "preact/hooks";
import { AppContext } from "../../../context/revoltjs/RevoltClient";
import { isTouchscreenDevice } from "../../../lib/isTouchscreenDevice";
import { IntermediateContext, useIntermediate } from "../../../context/intermediate/Intermediate";

const EditorBase = styled.div`
    display: flex;
    flex-direction: column;

    textarea {
        resize: none;
        padding: 12px;
        border-radius: 3px;
        white-space: pre-wrap;
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
    message: MessageObject
    finish: () => void
}

export default function MessageEditor({ message, finish }: Props) {
    const [ content, setContent ] = useState(message.content as string ?? '');
    const { focusTaken } = useContext(IntermediateContext);
    const { openScreen } = useIntermediate();
    const client = useContext(AppContext);

    async function save() {
        finish();

        if (content.length === 0) {
            // @ts-expect-error
            openScreen({ id: 'special_prompt', type: 'delete_message', target: message });
        } else if (content !== message.content) {
            await client.channels.editMessage(
                message.channel,
                message._id,
                { content }
            );
        }
    }

    // ? Stop editing when pressing ESC.
    useEffect(() => {
        function keyUp(e: KeyboardEvent) {
            if (e.key === "Escape" && !focusTaken) {
                finish();
            }
        }

        document.body.addEventListener("keyup", keyUp);
        return () => document.body.removeEventListener("keyup", keyUp);
    }, [focusTaken]);

    return (
        <EditorBase>
            <TextAreaAutoSize
                forceFocus
                maxRows={3}
                padding={12}
                value={content}
                maxLength={2000}
                onChange={ev => setContent(ev.currentTarget.value)}
                onKeyDown={e => {
                    if (
                        !e.shiftKey &&
                        e.key === "Enter" &&
                        !isTouchscreenDevice
                    ) {
                        e.preventDefault();
                        save();
                    }
                }}
            />
            <span className="caption">
                escape to <a onClick={finish}>cancel</a> &middot;
                enter to <a onClick={save}>save</a>
            </span>
        </EditorBase>
    )
}
