/* eslint-disable react-hooks/rules-of-hooks */
import MarkdownKatex from "@traptitech/markdown-it-katex";
import MarkdownSpoilers from "@traptitech/markdown-it-spoiler";
import "katex/dist/katex.min.css";
import MarkdownIt from "markdown-it";
// @ts-expect-error No typings.
import MarkdownEmoji from "markdown-it-emoji/dist/markdown-it-emoji-bare";
// @ts-expect-error No typings.
import MarkdownSub from "markdown-it-sub";
// @ts-expect-error No typings.
import MarkdownSup from "markdown-it-sup";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import { RE_MENTIONS } from "revolt.js";

import styles from "./Markdown.module.scss";
import { useCallback, useContext } from "preact/hooks";

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
            const code = element.parentElement?.parentElement?.children[1];
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
        const v = Prism.languages[lang];
        if (v) {
            const out = Prism.highlight(str, v, lang);
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
        maxSize: 10,
        strict: false,
        errorColor: "var(--error)",
    });

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

// ! FIXME: Move to library
const RE_CHANNELS = /<#([A-z0-9]{26})>/g;

export default function Renderer({ content, disallowBigEmoji }: MarkdownProps) {
    const client = useContext(AppContext);
    if (typeof content === "undefined") return null;
    if (content.length === 0) return null;

    // We replace the message with the mention at the time of render.
    // We don't care if the mention changes.
    const newContent = content
        .replace(RE_MENTIONS, (sub: string, ...args: unknown[]) => {
            const id = args[0] as string,
                user = client.users.get(id);

            if (user) {
                return `[@${user.username}](/@${id})`;
            }

            return sub;
        })
        .replace(RE_CHANNELS, (sub: string, ...args: unknown[]) => {
            const id = args[0] as string,
                channel = client.channels.get(id);

            if (channel?.channel_type === "TextChannel") {
                return `[#${channel.name}](/server/${channel.server_id}/channel/${id})`;
            }

            return sub;
        });

    const useLargeEmojis = disallowBigEmoji
        ? false
        : content.replace(RE_TWEMOJI, "").trim().length === 0;

    const toggle = useCallback((ev: MouseEvent) => {
        if (ev.currentTarget) {
            const element = ev.currentTarget as HTMLDivElement;
            if (element.classList.contains("spoiler")) {
                element.classList.add("shown");
            }
        }
    }, []);

    const handleLink = useCallback((ev: MouseEvent) => {
        if (ev.currentTarget) {
            const element = ev.currentTarget as HTMLAnchorElement;
            const url = new URL(element.href, location.href);
            const pathname = url.pathname;

            if (pathname.startsWith("/@")) {
                const id = pathname.substr(2);
                if (/[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}/.test(id)) {
                    ev.preventDefault();
                    internalEmit("Intermediate", "openProfile", id);
                }
            } else {
                ev.preventDefault();
                internalEmit("Intermediate", "navigate", pathname);
            }
        }
    }, []);

    return (
        <span
            ref={(el) => {
                if (el) {
                    el.querySelectorAll<HTMLDivElement>(".spoiler").forEach(
                        (element) => {
                            element.removeEventListener("click", toggle);
                            element.addEventListener("click", toggle);
                        },
                    );

                    el.querySelectorAll<HTMLAnchorElement>("a").forEach(
                        (element) => {
                            element.removeEventListener("click", handleLink);
                            element.removeAttribute("data-type");
                            element.removeAttribute("target");

                            let internal;
                            const href = element.href;
                            if (href) {
                                try {
                                    const url = new URL(href, location.href);

                                    if (url.hostname.replace(/^[^.]+\./g, "") === location.hostname.replace(/^[^.]+\./g, "") && ["nightly.", "app.", "local."].includes(url.hostname.match(/^[^.]+\./g)?.[0] ?? "")) {
                                        internal = true;
                                        element.addEventListener(
                                            "click",
                                            handleLink,
                                        );

                                        if (url.pathname.startsWith("/@")) {
                                            element.setAttribute(
                                                "data-type",
                                                "mention",
                                            );
                                        }
                                    }
                                } catch (err) {}
                            }

                            if (!internal) {
                                element.setAttribute("target", "_blank");
                            }
                        },
                    );
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
