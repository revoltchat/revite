import TextArea, { DEFAULT_LINE_HEIGHT, DEFAULT_TEXT_AREA_PADDING, TextAreaProps, TEXT_AREA_BORDER_WIDTH } from "../components/ui/TextArea";
import { useEffect, useRef } from "preact/hooks";

type TextAreaAutoSizeProps = Omit<JSX.HTMLAttributes<HTMLTextAreaElement>, 'style' | 'value'> & TextAreaProps & {
    autoFocus?: boolean,
    minHeight?: number,
    maxRows?: number,
    value: string
};

export default function TextAreaAutoSize(props: TextAreaAutoSizeProps) {
    const { autoFocus, minHeight, maxRows, value, padding, lineHeight, hideBorder, children, as, ...textAreaProps } = props;
    const line = lineHeight ?? DEFAULT_LINE_HEIGHT;

    const heightPadding = ((padding ?? DEFAULT_TEXT_AREA_PADDING) + (hideBorder ? 0 : TEXT_AREA_BORDER_WIDTH)) * 2;
    const height = Math.max(Math.min(value.split('\n').length, maxRows ?? Infinity) * line + heightPadding, minHeight ?? 0);
    console.log(value.split('\n').length, line, heightPadding, height);
    const ref = useRef<HTMLTextAreaElement>();

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

    return <TextArea
        ref={ref}
        value={value}
        padding={padding}
        style={{ height }}
        hideBorder={hideBorder}
        lineHeight={lineHeight}
        {...textAreaProps} />;
}
