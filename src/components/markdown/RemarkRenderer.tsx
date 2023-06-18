import "katex/dist/katex.min.css";
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
import { useLayoutEffect, useMemo, useState } from "preact/hooks";

// @ts-expect-error no typings
import rehypeKatex from "@revoltchat/rehype-katex";

import { MarkdownProps } from "./Markdown";
import { handlers } from "./hast";
import { RenderCodeblock } from "./plugins/Codeblock";
import { RenderAnchor } from "./plugins/anchors";
import { remarkChannels, RenderChannel } from "./plugins/channels";
import { isOnlyEmoji, remarkEmoji, RenderEmoji } from "./plugins/emoji";
import { remarkHtmlToText } from "./plugins/htmlToText";
import { remarkMention, RenderMention } from "./plugins/mentions";
import { remarkSpoiler, RenderSpoiler } from "./plugins/spoiler";
import { remarkTimestamps } from "./plugins/timestamps";
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
    .use(remarkHtmlToText)
    .use(remarkRehype, {
        handlers,
    })
    .use(rehypeKatex, {
        maxSize: 10,
        maxExpand: 0,
        maxLength: 512,
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
    // Allow scrolling block math
    .math-display {
        overflow-x: auto;
    }

    // Set emoji size
    --emoji-size: ${(props) => (props.largeEmoji ? "3em" : "1.25em")};

    // Underline link hover
    a:hover {
        text-decoration: underline;
    }
`;

/**
 * Regex for matching execessive recursion of blockquotes and lists
 */
const RE_RECURSIVE = /(^(?:[>*+-][^\S\r\n]*){5})(?:[>*+-][^\S\r\n]*)+(.*$)/gm;

/**
 * Regex for matching multi-line blockquotes
 */
const RE_BLOCKQUOTE = /^([^\S\r\n]*>[^\n]+\n?)+/gm;

/**
 * Regex for matching HTML tags
 */
const RE_HTML_TAGS = /^(<\/?[a-zA-Z0-9]+>)(.*$)/gm;

/**
 * Regex for matching empty lines
 */
const RE_EMPTY_LINE = /^\s*?$/gm;

/**
 * Regex for matching line starting with plus
 */
const RE_PLUS = /^\s*\+(?:$|[^+])/gm;

/**
 * Sanitise Markdown input before rendering
 * @param content Input string
 * @returns Sanitised string
 */
function sanitise(content: string) {
    return (
        content
            // Strip excessive blockquote or list indentation
            .replace(RE_RECURSIVE, (_, m0, m1) => m0 + m1)

            // Append empty character if string starts with html tag
            // This is to avoid inconsistencies in rendering Markdown inside/after HTML tags
            // https://github.com/revoltchat/revite/issues/733
            .replace(RE_HTML_TAGS, (match) => `\u200E${match}`)

            // Append empty character if line starts with a plus
            // which would usually open a new list but we want
            // to avoid that behaviour in our case.
            .replace(RE_PLUS, (match) => `\u200E${match}`)

            // Replace empty lines with non-breaking space
            // because remark renderer is collapsing empty
            // or otherwise whitespace-only lines of text
            .replace(RE_EMPTY_LINE, "‎")

            // Ensure empty line after blockquotes for correct rendering
            .replace(RE_BLOCKQUOTE, (match) => `${match}\n`)
    );
}

/**
 * Remark renderer component
 */
export default memo(({ content, disallowBigEmoji }: MarkdownProps) => {
    const sanitisedContent = useMemo(() => sanitise(content), [content]);

    const [Content, setContent] = useState<React.ReactElement>(null!);

    useLayoutEffect(() => {
        render
            .process(sanitisedContent)
            .then((file) => setContent(file.result));
    }, [sanitisedContent]);

    const largeEmoji = useMemo(
        () => !disallowBigEmoji && isOnlyEmoji(content!),
        [content, disallowBigEmoji],
    );

    return <Container largeEmoji={largeEmoji}>{Content}</Container>;
});
