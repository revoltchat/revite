import "katex/dist/katex.min.css";
import rehypeKatex from "rehype-katex";
import rehypePrism from "rehype-prism";
import rehypeReact from "rehype-react";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import styled, { css } from "styled-components";
import { unified } from "unified";

import { createElement } from "preact";
import { memo } from "preact/compat";
import { useEffect, useMemo, useState } from "preact/hooks";

import { MarkdownProps } from "./Markdown";
import { RenderCodeblock } from "./plugins/Codeblock";
import { RenderAnchor } from "./plugins/anchors";
import { remarkChannels, RenderChannel } from "./plugins/channels";
import { isOnlyEmoji, remarkEmoji, RenderEmoji } from "./plugins/emoji";
import { remarkMention, RenderMention } from "./plugins/mentions";
import { passThroughComponents } from "./plugins/remarkRegexComponent";
import { remarkSpoiler, RenderSpoiler } from "./plugins/spoiler";
import { remarkTimestamps, timestampHandler } from "./plugins/timestamps";
import "./prism";

/**
 * Null element
 */
const Null: React.FC = () => null;

/**
 * Custom Markdown components
 */
const components = {
    emoji: RenderEmoji,
    mention: RenderMention,
    spoiler: RenderSpoiler,
    channel: RenderChannel,
    a: RenderAnchor,
    p: styled.p`
        margin: 0;

        > code {
            padding: 1px 4px;
            flex-shrink: 0;
        }
    `,
    h1: styled.h1`
        margin: 0.2em 0;
    `,
    h2: styled.h2`
        margin: 0.2em 0;
    `,
    h3: styled.h3`
        margin: 0.2em 0;
    `,
    h4: styled.h4`
        margin: 0.2em 0;
    `,
    h5: styled.h5`
        margin: 0.2em 0;
    `,
    h6: styled.h6`
        margin: 0.2em 0;
    `,
    pre: RenderCodeblock,
    code: styled.code`
        color: white;
        background: var(--block);

        font-size: 90%;
        font-family: var(--monospace-font), monospace;

        border-radius: 3px;
        box-decoration-break: clone;
    `,
    table: styled.table`
        border-collapse: collapse;

        th,
        td {
            padding: 6px;
            border: 1px solid var(--tertiary-foreground);
        }
    `,
    ul: styled.ul`
        list-style-position: inside;
        padding-left: 10px;
        margin: 0.2em 0;
    `,
    ol: styled.ol`
        list-style-position: inside;
        padding-left: 10px;
        margin: 0.2em 0;
    `,
    li: styled.li`
        ${(props) =>
            props.class === "task-list-item" &&
            css`
                list-style-type: none;
            `}
    `,
    blockquote: styled.blockquote`
        margin: 2px 0;
        padding: 2px 0;
        background: var(--hover);
        border-radius: var(--border-radius);
        border-inline-start: 4px solid var(--tertiary-background);

        > * {
            margin: 0 8px;
        }
    `,
    // Block image elements
    img: Null,
    // Catch literally everything else just in case
    video: Null,
    figure: Null,
    picture: Null,
    source: Null,
    audio: Null,
    script: Null,
    style: Null,
};

/**
 * Unified Markdown renderer
 */
const render = unified()
    .use(remarkParse)
    .use(remarkBreaks)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkSpoiler)
    .use(remarkChannels)
    .use(remarkTimestamps)
    .use(remarkEmoji)
    .use(remarkMention)
    .use(remarkRehype, {
        handlers: {
            ...passThroughComponents("emoji", "spoiler", "mention", "channel"),
            timestamp: timestampHandler,
        },
    })
    .use(rehypeKatex, {
        maxSize: 10,
        maxExpand: 0,
        trust: false,
        strict: false,
        output: "html",
        throwOnError: false,
        errorColor: "var(--error)",
    })
    .use(rehypePrism)
    // @ts-expect-error typings do not
    // match between Preact and React
    .use(rehypeReact, {
        createElement,
        Fragment,
        components,
    });

/**
 * Markdown parent container
 */
const Container = styled.div<{ largeEmoji: boolean }>`
    .math-display {
        overflow-x: auto;
    }

    --emoji-size: ${(props) => (props.largeEmoji ? "3em" : "1.25em")};
`;

/**
 * Remark renderer component
 */
export default memo(({ content, disallowBigEmoji }: MarkdownProps) => {
    const [Content, setContent] = useState<React.ReactElement>(null!);

    useEffect(() => {
        render.process(content!).then((file) => setContent(file.result));
    }, [content]);

    const largeEmoji = useMemo(
        () => !disallowBigEmoji && isOnlyEmoji(content!),
        [content, disallowBigEmoji],
    );

    return <Container largeEmoji={largeEmoji}>{Content}</Container>;
});
