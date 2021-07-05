import MarkdownIt from "markdown-it";
import { RE_MENTIONS } from "revolt.js";
import { useContext } from "preact/hooks";
import { MarkdownProps } from "./Markdown";
import styles from "./Markdown.module.scss";
import { generateEmoji } from "../common/Emoji";
import { internalEmit } from "../../lib/eventEmitter";
import { emojiDictionary } from "../../assets/emojis";
import { AppContext } from "../../context/revoltjs/RevoltClient";

import Prism from "prismjs";
import "katex/dist/katex.min.css";
import "prismjs/themes/prism-tomorrow.css";

import MarkdownKatex from "@traptitech/markdown-it-katex";
import MarkdownSpoilers from "@traptitech/markdown-it-spoiler";

// @ts-ignore
import MarkdownEmoji from "markdown-it-emoji/dist/markdown-it-emoji-bare";
// @ts-ignore
import MarkdownSup from "markdown-it-sup";
// @ts-ignore
import MarkdownSub from "markdown-it-sub";

// TODO: global.d.ts file for defining globals
declare global {
    interface Window {
        copycode: (element: HTMLDivElement) => void
    }
}


// Handler for code block copy.
if (typeof window !== "undefined") {
    window.copycode = function(element: HTMLDivElement) {
        try {
            let code = element.parentElement?.parentElement?.children[1];
            if (code) {
                navigator.clipboard.writeText(code.textContent?.trim() ?? '');
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
        
        return `<pre class="code"><code>${md.utils.escapeHtml(str)}</code></pre>`;
    }
})
.disable("image")
.use(MarkdownEmoji, { defs: emojiDictionary })
.use(MarkdownSpoilers)
.use(MarkdownSup)
.use(MarkdownSub)
.use(MarkdownKatex, {
    throwOnError: false,
    maxExpand: 0
});

// ? Force links to open _blank.
// From: https://github.com/markdown-it/markdown-it/blob/master/docs/architecture.md#renderer
const defaultRender =
    md.renderer.rules.link_open ||
    function(tokens, idx, options, _env, self) {
        return self.renderToken(tokens, idx, options);
    };

// TODO: global.d.ts file for defining globals
declare global {
    interface Window {
        internalHandleURL: (element: HTMLAnchorElement) => void
    }
}

// Handler for internal links, pushes events to React using magic.
if (typeof window !== "undefined") {
    window.internalHandleURL = function(element: HTMLAnchorElement) {
        const url = new URL(element.href, location.href);
        const pathname = url.pathname;

        if (pathname.startsWith("/@")) {
            internalEmit("Intermediate", "openProfile", pathname.substr(2));
        } else {
            internalEmit("Intermediate", "navigate", pathname);
        }
    };
}

md.renderer.rules.link_open = function(tokens, idx, options, env, self) {
    let internal;
    const hIndex = tokens[idx].attrIndex("href");
    if (hIndex >= 0) {
        try {
            // For internal links, we should use our own handler to use react-router history.
            // @ts-ignore
            const href = tokens[idx].attrs[hIndex][1];
            const url = new URL(href, location.href);

            if (url.hostname === location.hostname) {
                internal = true;
                // I'm sorry.
                tokens[idx].attrPush([
                    "onclick",
                    "internalHandleURL(this); return false"
                ]);

                if (url.pathname.startsWith("/@")) {
                    tokens[idx].attrPush(["data-type", "mention"]);
                }
            }
        } catch (err) {
            // Ignore the error, treat as normal link.
        }
    }

    if (!internal) {
        // Add target=_blank for external links.
        const aIndex = tokens[idx].attrIndex("target");

        if (aIndex < 0) {
            tokens[idx].attrPush(["target", "_blank"]);
        } else {
            try {
                // @ts-ignore
                tokens[idx].attrs[aIndex][1] = "_blank";
            } catch (_) {}
        }
    }

    return defaultRender(tokens, idx, options, env, self);
};

md.renderer.rules.emoji = function(token, idx) {
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
        }
    );

    const useLargeEmojis = disallowBigEmoji ? false : content.replace(RE_TWEMOJI, '').trim().length === 0;

    return (
        <span
            className={styles.markdown}
            dangerouslySetInnerHTML={{
                __html: md.render(newContent)
            }}
            data-large-emojis={useLargeEmojis}
            onClick={ev => {
                if (ev.target) {
                    let element = ev.currentTarget;
                    if (element.classList.contains("spoiler")) {
                        element.classList.add("shown");
                    }
                }
            }}
        />
    );
}
