import MarkdownKatex from "@traptitech/markdown-it-katex";
import MarkdownSpoilers from "@traptitech/markdown-it-spoiler";
import "katex/dist/katex.min.css";
import MarkdownIt from "markdown-it";
// @ts-ignore
import MarkdownEmoji from "markdown-it-emoji/dist/markdown-it-emoji-bare";
// @ts-ignore
import MarkdownSub from "markdown-it-sub";
// @ts-ignore
import MarkdownSup from "markdown-it-sup";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import { RE_MENTIONS } from "revolt.js";

import styles from "./Markdown.module.scss";
import { useCallback, useContext, useRef } from "preact/hooks";

import { internalEmit } from "../../lib/eventEmitter";

import { AppContext } from "../../context/revoltjs/RevoltClient";

import { generateEmoji } from "../common/Emoji";

import { emojiDictionary } from "../../assets/emojis";
import { MarkdownProps } from "./Markdown";

// TODO: global.d.ts file for defining globals
declare global {
    interface Window {
        copycode: (element: HTMLDivElement) => void;
    }
}

// Handler for code block copy.
if (typeof window !== "undefined") {
    window.copycode = function (element: HTMLDivElement) {
        try {
            let code = element.parentElement?.parentElement?.children[1];
            if (code) {
                navigator.clipboard.writeText(code.textContent?.trim() ?? "");
            }
        } catch (e) {}
    };
}

export const md: MarkdownIt = MarkdownIt({
    breaks: true,
    linkify: true,
    highlight: (str, lang) => {
        let v = Prism.languages[lang];
        if (v) {
            let out = Prism.highlight(str, v, lang);
            return `<pre class="code"><div class="lang"><div onclick="copycode(this)">${lang}</div></div><code class="language-${lang}">${out}</code></pre>`;
        }

        return `<pre class="code"><code>${md.utils.escapeHtml(
            str,
        )}</code></pre>`;
    },
})
    .disable("image")
    .use(MarkdownEmoji, { defs: emojiDictionary })
    .use(MarkdownSpoilers)
    .use(MarkdownSup)
    .use(MarkdownSub)
    .use(MarkdownKatex, {
        throwOnError: false,
        maxExpand: 0,
    });

// ? Force links to open _blank.
// From: https://github.com/markdown-it/markdown-it/blob/master/docs/architecture.md#renderer
const defaultRender =
    md.renderer.rules.link_open ||
    function (tokens, idx, options, _env, self) {
        return self.renderToken(tokens, idx, options);
    };

// TODO: global.d.ts file for defining globals
declare global {
    interface Window {
        internalHandleURL: (element: HTMLAnchorElement) => void;
    }
}

md.renderer.rules.emoji = function (token, idx) {
    return generateEmoji(token[idx].content);
};

const RE_TWEMOJI = /:(\w+):/g;

export default function Renderer({ content, disallowBigEmoji }: MarkdownProps) {
    const client = useContext(AppContext);
    if (typeof content === "undefined") return null;
    if (content.length === 0) return null;

    // We replace the message with the mention at the time of render.
    // We don't care if the mention changes.
    let newContent = content.replace(
        RE_MENTIONS,
        (sub: string, ...args: any[]) => {
            const id = args[0],
                user = client.users.get(id);

            if (user) {
                return `[@${user.username}](/@${id})`;
            }

            return sub;
        },
    );

    const useLargeEmojis = disallowBigEmoji
        ? false
        : content.replace(RE_TWEMOJI, "").trim().length === 0;

    const toggle = useCallback((ev: MouseEvent) => {
        if (ev.currentTarget) {
            let element = ev.currentTarget as HTMLDivElement;
            if (element.classList.contains("spoiler")) {
                element.classList.add("shown");
            }
        }
    }, []);

    const handleLink = useCallback((ev: MouseEvent) => {
        ev.preventDefault();
        if (ev.currentTarget) {
            const element = ev.currentTarget as HTMLAnchorElement;
            const url = new URL(element.href, location.href);
            const pathname = url.pathname;

            if (pathname.startsWith("/@")) {
                internalEmit("Intermediate", "openProfile", pathname.substr(2));
            } else {
                internalEmit("Intermediate", "navigate", pathname);
            }
        }
    }, []);

    return (
        <span
            ref={el => {
                if (el) {
                    (el.querySelectorAll<HTMLDivElement>('.spoiler'))
                        .forEach(element => {
                            element.removeEventListener('click', toggle);
                            element.addEventListener('click', toggle);
                        });

                    (el.querySelectorAll<HTMLAnchorElement>('a'))
                        .forEach(element => {
                            element.removeEventListener('click', handleLink);
                            element.removeAttribute('data-type');
                            element.removeAttribute('target');

                            let internal;
                            const href = element.href;
                            if (href) {
                                try {
                                    const url = new URL(href, location.href);

                                    if (url.hostname === location.hostname) {
                                        internal = true;
                                        element.addEventListener('click', handleLink);

                                        if (url.pathname.startsWith('/@')) {
                                            element.setAttribute('data-type', 'mention');
                                        }
                                    }
                                } catch (err) {}
                            }

                            if (!internal) {
                                element.setAttribute('target', '_blank');
                            }
                        });
                }
            }}
            className={styles.markdown}
            dangerouslySetInnerHTML={{
                __html: md.render(newContent),
            }}
            data-large-emojis={useLargeEmojis}
        />
    );
}
