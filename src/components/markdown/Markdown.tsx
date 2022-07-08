import { Suspense, lazy } from "preact/compat";

const Renderer = lazy(() => import("./RemarkRenderer"));

export interface MarkdownProps {
    content?: string | null;
    disallowBigEmoji?: boolean;
}

export default function Markdown(props: MarkdownProps) {
    return (
        // @ts-expect-error Typings mis-match.
        <Suspense fallback={props.content}>
            <Renderer {...props} />
        </Suspense>
    );
}
