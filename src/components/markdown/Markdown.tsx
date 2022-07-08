import { Suspense, lazy } from "preact/compat";

const Renderer = lazy(() => import("./RemarkRenderer"));

export interface MarkdownProps {
    content: string;
    disallowBigEmoji?: boolean;
}

export default function Markdown(props: MarkdownProps) {
    if (!props.content) return null;

    return (
        // @ts-expect-error Typings mis-match.
        <Suspense fallback={props.content}>
            <Renderer {...props} />
        </Suspense>
    );
}
