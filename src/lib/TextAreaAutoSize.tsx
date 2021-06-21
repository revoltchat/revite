import styled from "styled-components";
import TextArea, { TextAreaProps } from "../components/ui/TextArea";
import { useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";

type TextAreaAutoSizeProps = Omit<JSX.HTMLAttributes<HTMLTextAreaElement>, 'style' | 'value'> & TextAreaProps & {
    autoFocus?: boolean,
    minHeight?: number,
    maxRows?: number,
    value: string
};

const lineHeight = 20;

const Ghost = styled.div`
    width: 100%;
    overflow: hidden;
    position: relative;

    > div {
        width: 100%;
        white-space: pre-wrap;
        
        top: 0;
        position: absolute;
        visibility: hidden;
    }
`;

export default function TextAreaAutoSize(props: TextAreaAutoSizeProps) {
    const { autoFocus, minHeight, maxRows, value, padding, children, as, ...textAreaProps } = props;

    const heightPadding = (padding ?? 0) * 2;
    const minimumHeight = (minHeight ?? lineHeight) + heightPadding;

    var height = Math.max(Math.min(value.split('\n').length, maxRows ?? Infinity) * lineHeight + heightPadding, minimumHeight);
    const ref = useRef<HTMLTextAreaElement>();

    /*function setHeight(h: number = lineHeight) {
        let newHeight = Math.min(
            Math.max(
                lineHeight,
                maxRows ? Math.min(h, maxRows * lineHeight) : h
            ),
            minHeight ?? Infinity
        );

        if (heightPadding) newHeight += heightPadding;
        if (height !== newHeight) {
            setHeightState(newHeight);
        }
    }*/

    {/*useLayoutEffect(() => {
        setHeight(ghost.current.clientHeight);
    }, [ghost, value]);*/}

    useEffect(() => {
        autoFocus && ref.current.focus();
    }, [value]);
    
    const inputSelected = () =>
        ["TEXTAREA", "INPUT"].includes(document.activeElement?.nodeName ?? "");

    useEffect(() => {
        /* if (props.forceFocus) { // figure out what needed force focus
            ref.current.focus();
        } */

        if (autoFocus && !inputSelected()) {
            ref.current.focus();
        }

        // ? if you are wondering what this is
        // ? it is a quick and dirty hack to fix
        // ? value not setting correctly
        // ? I have no clue what's going on
        ref.current.value = value;

        if (!autoFocus) return;
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

    return <>
        <TextArea
            ref={ref}
            value={value}
            padding={padding}
            style={{ height }}
            {...textAreaProps} />
        {/*<Ghost><div ref={ghost}>
            { props.value.split('\n')
                .map(x => `\u0020${x}`)
                .join('\n') }
        </div></Ghost>*/}
    </>;
}
