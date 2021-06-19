import { Suspense, lazy } from "preact/compat";

const Renderer = lazy(() => import('./Renderer'));

export interface MarkdownProps {
    content?: string;
    disallowBigEmoji?: boolean;
}

export default function Markdown(props: MarkdownProps) {
    return (
        // @ts-expect-error
        <Suspense fallback="Getting ready to render Markdown...">
            <Renderer {...props} />
        </Suspense>
    )
}
