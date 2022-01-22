/* eslint-disable react-hooks/rules-of-hooks */
import styled, { css, keyframes } from "styled-components/macro";

import { createPortal, useCallback, useEffect, useState } from "preact/compat";

import { internalSubscribe } from "../../lib/eventEmitter";
import {
    Button,
    Props as ButtonProps,
} from "@revoltchat/ui/lib/components/atoms/inputs/Button";

import { Children } from "../../types/Preact";

const open = keyframes`
    0% {opacity: 0;}
    70% {opacity: 0;}
    100% {opacity: 1;}
`;

const close = keyframes`
    0% {opacity: 1;}
    70% {opacity: 0;}
    100% {opacity: 0;}
`;

const zoomIn = keyframes`
    0% {transform: scale(0.5);}
    98% {transform: scale(1.01);}
    100% {transform: scale(1);}
`;

const zoomOut = keyframes`
    0% {transform: scale(1);}
    100% {transform: scale(0.5);}
`;

const ModalBase = styled.div`
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9999;
    position: fixed;
    max-height: 100%;
    user-select: none;

    animation-name: ${open};
    animation-duration: 0.2s;

    display: grid;
    overflow-y: auto;
    place-items: center;

    color: var(--foreground);
    background: rgba(0, 0, 0, 0.8);

    &.closing {
        animation-name: ${close};
        animation-fill-mode: forwards;
    }

    &.closing > div {
        animation-name: ${zoomOut};
    }
`;

const ModalContainer = styled.div`
    overflow: hidden;
    max-width: calc(100vw - 20px);
    border-radius: var(--border-radius);

    animation-name: ${zoomIn};
    animation-duration: 0.25s;
    animation-timing-function: cubic-bezier(0.3, 0.3, 0.18, 1.1);
`;

const ModalContent = styled.div<
    { [key in "attachment" | "noBackground" | "border" | "padding"]?: boolean }
>`
    text-overflow: ellipsis;
    border-radius: var(--border-radius);

    h3 {
        font-size: 14px;
        text-transform: uppercase;
        margin: 0;
        margin-bottom: 10px;
        color: var(--foreground);
    }

    h5 {
        margin: 0;
        font-size: 13px;
        font-weight: 500;
        color: var(--secondary-foreground);
    }

    form {
        display: flex;
        flex-direction: column;
        gap: 8px;

        > div {
            margin: 0;
            color: var(--secondary-foreground);
            font-size: 12px;
        }
    }

    ${(props) =>
        !props.noBackground &&
        css`
            background: var(--secondary-header);
        `}

    ${(props) =>
        props.padding &&
        css`
            padding: 1rem;
            min-width: 450px;
        `}

    ${(props) =>
        props.attachment &&
        css`
            border-radius: var(--border-radius) var(--border-radius) 0 0;
        `}

    ${(props) =>
        props.border &&
        css`
            border-radius: var(--border-radius);
            border: 2px solid var(--secondary-background);
        `}
`;

const ModalActions = styled.div`
    gap: 8px;
    display: flex;
    flex-direction: row-reverse;
    padding: 1rem;
    background: var(--secondary-background);
    border-radius: 0 0 var(--border-radius) var(--border-radius);
`;

export type Action = Omit<
    JSX.HTMLAttributes<HTMLButtonElement> & ButtonProps,
    "onClick" | "as"
> & {
    confirmation?: boolean;
    onClick: () => void;
};

interface Props {
    children?: Children;
    title?: Children;
    description?: Children;

    disallowClosing?: boolean;
    noBackground?: boolean;
    dontModal?: boolean;
    padding?: boolean;

    onClose?: () => void;
    actions?: Action[];
    disabled?: boolean;
    border?: boolean;
    visible: boolean;
}

export let isModalClosing = false;

export default function Modal(props: Props) {
    if (!props.visible) return null;

    const content = (
        <ModalContent
            attachment={!!props.actions}
            noBackground={props.noBackground}
            border={props.border}
            padding={props.padding ?? !props.dontModal}>
            {props.title && <h3>{props.title}</h3>}
            {props.description && <h5>{props.description}</h5>}
            {props.children}
        </ModalContent>
    );

    if (props.dontModal) {
        return content;
    }

    const [animateClose, setAnimateClose] = useState(false);
    isModalClosing = animateClose;
    const onClose = useCallback(() => {
        setAnimateClose(true);
        setTimeout(() => props.onClose!(), 2e2);
    }, [setAnimateClose, props]);

    useEffect(() => internalSubscribe("Modal", "close", onClose), [onClose]);

    useEffect(() => {
        if (props.disallowClosing) return;

        function keyDown(e: KeyboardEvent) {
            if (e.key === "Escape") {
                onClose();
            }
        }

        document.body.addEventListener("keydown", keyDown);
        return () => document.body.removeEventListener("keydown", keyDown);
    }, [props.disallowClosing, onClose]);

    const confirmationAction = props.actions?.find(
        (action) => action.confirmation,
    );

    useEffect(() => {
        if (!confirmationAction) return;

        // ! TODO: this may be done better if we
        // ! can focus the button although that
        // ! doesn't seem to work...
        function keyDown(e: KeyboardEvent) {
            if (e.key === "Enter") {
                confirmationAction!.onClick();
            }
        }

        document.body.addEventListener("keydown", keyDown);
        return () => document.body.removeEventListener("keydown", keyDown);
    }, [confirmationAction]);

    return createPortal(
        <ModalBase
            className={animateClose ? "closing" : undefined}
            onClick={(!props.disallowClosing && props.onClose) || undefined}>
            <ModalContainer onClick={(e) => (e.cancelBubble = true)}>
                {content}
                {props.actions && (
                    <ModalActions>
                        {props.actions.map((x, index) => (
                            <Button
                                {...x}
                                key={index}
                                disabled={props.disabled}
                            />
                        ))}
                    </ModalActions>
                )}
            </ModalContainer>
        </ModalBase>,
        document.body,
    );
}
