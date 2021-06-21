// import classNames from "classnames";
// import { memo } from "preact/compat";
// import styles from "./TextArea.module.scss";
// import { useState, useEffect, useRef, useLayoutEffect } from "preact/hooks";
import styled, { css } from "styled-components";

export interface TextAreaProps {
    code?: boolean;
    padding?: number;
    lineHeight?: number;
    hideBorder?: boolean;
}

export const TEXT_AREA_BORDER_WIDTH = 2;
export const DEFAULT_TEXT_AREA_PADDING = 16;
export const DEFAULT_LINE_HEIGHT = 20;

export default styled.textarea<TextAreaProps>`
    width: 100%;
    resize: none;
    display: block;
    color: var(--foreground);
    background: var(--secondary-background);
    padding: ${ props => props.padding ?? DEFAULT_TEXT_AREA_PADDING }px;
    line-height: ${ props => props.lineHeight ?? DEFAULT_LINE_HEIGHT }px;

    ${ props => props.hideBorder && css`
        border: none;
    ` }

    ${ props => !props.hideBorder && css`
        border-radius: 4px;
        transition: border-color .2s ease-in-out;
        border: ${TEXT_AREA_BORDER_WIDTH}px solid transparent;
    ` }

    &:focus {
        outline: none;

        ${ props => !props.hideBorder && css`
            border: ${TEXT_AREA_BORDER_WIDTH}px solid var(--accent);
        ` }
    }

    ${ props => props.code ? css`
        font-family: 'Fira Mono', 'Courier New', Courier, monospace;
    ` : css`
        font-family: 'Open Sans', sans-serif;
    ` }
`;

/*export interface TextAreaProps {
    id?: string;
    value: string;
    maxRows?: number;
    padding?: number;
    minHeight?: number;
    disabled?: boolean;
    maxLength?: number;
    className?: string;
    autoFocus?: boolean;
    forceFocus?: boolean;
    placeholder?: string;
    onKeyDown?: (ev: KeyboardEvent) => void;
    onKeyUp?: (ev: KeyboardEvent) => void;
    onChange: (
        value: string,
        ev: JSX.TargetedEvent<HTMLTextAreaElement, Event>
    ) => void;
    onFocus?: (current: HTMLTextAreaElement) => void;
    onBlur?: () => void;
}

const lineHeight = 20;

export const TextAreaB = memo((props: TextAreaProps) => {
    const padding = props.padding ? props.padding * 2 : 0;

    const [height, setHeightState] = useState(
        props.minHeight ?? lineHeight + padding
    );
    const ghost = useRef<HTMLDivElement>();
    const ref = useRef<HTMLTextAreaElement>();

    function setHeight(h: number = lineHeight) {
        let newHeight = Math.min(
            Math.max(
                lineHeight,
                props.maxRows ? Math.min(h, props.maxRows * lineHeight) : h
            ),
            props.minHeight ?? Infinity
        );

        if (props.padding) newHeight += padding;
        if (height !== newHeight) {
            setHeightState(newHeight);
        }
    }

    function onChange(ev: JSX.TargetedEvent<HTMLTextAreaElement, Event>) {
        props.onChange(ev.currentTarget.value, ev);
    }

    useLayoutEffect(() => {
        setHeight(ghost.current.clientHeight);
    }, [ghost, props.value]);

    useEffect(() => {
        if (props.autoFocus) ref.current.focus();
    }, [props.value]);

    const inputSelected = () =>
        ["TEXTAREA", "INPUT"].includes(document.activeElement?.nodeName ?? "");

    useEffect(() => {
        if (props.forceFocus) {
            ref.current.focus();
        }

        if (props.autoFocus && !inputSelected()) {
            ref.current.focus();
        }

        // ? if you are wondering what this is
        // ? it is a quick and dirty hack to fix
        // ? value not setting correctly
        // ? I have no clue what's going on
        ref.current.value = props.value;

        if (!props.autoFocus) return;
        function keyDown(e: KeyboardEvent) {
            if ((e.ctrlKey && e.key !== "v") || e.altKey || e.metaKey) return;
            if (e.key.length !== 1) return;
            if (ref && !inputSelected()) {
                ref.current.focus();
            }
        }

        document.body.addEventListener("keydown", keyDown);
        return () => document.body.removeEventListener("keydown", keyDown);
    }, [ref]);

    useEffect(() => {
        function focus(textarea_id: string) {
            if (props.id === textarea_id) {
                ref.current.focus();
            }
        }

        // InternalEventEmitter.addListener("focus_textarea", focus);
        // return () =>
            // InternalEventEmitter.removeListener("focus_textarea", focus);
    }, [ref]);

    return (
        <div className={classNames(styles.container, props.className)}>
            <textarea
                id={props.id}
                name={props.id}
                style={{ height }}
                value={props.value}
                onChange={onChange}
                disabled={props.disabled}
                maxLength={props.maxLength}
                className={styles.textarea}
                onKeyDown={props.onKeyDown}
                placeholder={props.placeholder}
                onContextMenu={e => e.stopPropagation()}
                onKeyUp={ev => {
                    setHeight(ghost.current.clientHeight);
                    props.onKeyUp && props.onKeyUp(ev);
                }}
                ref={ref}
                onFocus={() => props.onFocus && props.onFocus(ref.current)}
                onBlur={props.onBlur}
            />
            <div className={styles.hide}>
                <div className={styles.ghost} ref={ghost}>
                    {props.value
                        ? props.value
                              .split("\n")
                              .map(x => `‎${x}`)
                              .join("\n")
                        : undefined ?? "‎\n"}
                </div>
            </div>
        </div>
    );
});*/
