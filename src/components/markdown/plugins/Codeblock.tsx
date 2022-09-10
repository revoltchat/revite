import styled from "styled-components";

import { useCallback, useRef } from "preact/hooks";

import { Tooltip } from "@revoltchat/ui";

import { modalController } from "../../../controllers/modals/ModalController";

/**
 * Base codeblock styles
 */
const Base = styled.pre`
    padding: 1em;
    overflow-x: scroll;
    background: var(--block);
    border-radius: var(--border-radius);
`;

/**
 * Copy codeblock contents button styles
 */
const Lang = styled.div`
    font-family: var(--monospace-font);
    width: fit-content;
    padding-bottom: 8px;

    a {
        color: #111;
        cursor: pointer;
        padding: 2px 6px;
        font-weight: 600;
        user-select: none;
        display: inline-block;
        background: var(--accent);

        font-size: 10px;
        text-transform: uppercase;
        box-shadow: 0 2px #787676;
        border-radius: calc(var(--border-radius) / 3);

        &:active {
            transform: translateY(1px);
            box-shadow: 0 1px #787676;
        }
    }
`;

/**
 * Render a codeblock with copy text button
 */
export const RenderCodeblock: React.FC<{ class: string }> = ({
    children,
    ...props
}) => {
    const ref = useRef<HTMLPreElement>(null);

    let text = "text";
    if (props.class) {
        text = props.class.split("-")[1];
    }

    const onCopy = useCallback(() => {
        const text = ref.current?.querySelector("code")?.innerText;
        text && modalController.writeText(text);
    }, [ref]);

    return (
        <Base ref={ref}>
            <Lang>
                <Tooltip content="Copy to Clipboard" placement="top">
                    {/**
                    // @ts-expect-error Preact-React */}
                    <a onClick={onCopy}>{text}</a>
                </Tooltip>
            </Lang>
            {children}
        </Base>
    );
};
