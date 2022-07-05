import styled from "styled-components/macro";

import { Text } from "preact-i18n";

import mutantSVG from "./assets/mutant_emoji.svg";
import notoSVG from "./assets/noto_emoji.svg";
import openmojiSVG from "./assets/openmoji_emoji.svg";
import twemojiSVG from "./assets/twemoji_emoji.svg";

import { EmojiPack } from "../../../common/Emoji";

const Container = styled.div`
    gap: 12px;
    display: flex;
    flex-direction: column;

    .row {
        gap: 12px;
        display: flex;

        > div {
            flex: 1;
            display: flex;
            flex-direction: column;
        }
    }

    .button {
        padding: 2rem 1.2rem;
        display: grid;
        place-items: center;

        cursor: pointer;
        transition: border 0.3s;
        background: var(--hover);
        border: 3px solid transparent;
        border-radius: var(--border-radius);

        img {
            max-width: 100%;
        }

        &[data-active="true"] {
            cursor: default;
            background: var(--secondary-background);
            border: 3px solid var(--accent);

            &:hover {
                border: 3px solid var(--accent);
            }
        }

        &:hover {
            background: var(--secondary-background);
            border: 3px solid var(--tertiary-background);
        }
    }

    h4 {
        text-transform: unset !important;

        a {
            opacity: 0.7;
            color: var(--accent);
            font-weight: 600;
            &:hover {
                text-decoration: underline;
            }
        }

        @media only screen and (max-width: 800px) {
            a {
                display: block;
            }
        }
    }
`;

interface Props {
    value?: EmojiPack;
    setValue: (pack: EmojiPack) => void;
}

export function EmojiSelector({ value, setValue }: Props) {
    return (
        <>
            <h3>
                <Text id="app.settings.pages.appearance.emoji_pack" />
            </h3>
            <Container>
                <div className="row">
                    <div>
                        <div
                            className="button"
                            onClick={() => setValue("mutant")}
                            data-active={!value || value === "mutant"}>
                            <img
                                loading="eager"
                                src={mutantSVG}
                                draggable={false}
                                onContextMenu={(e) => e.preventDefault()}
                            />
                        </div>
                        <h4>
                            Mutant Remix{" "}
                            <a
                                href="https://mutant.revolt.chat"
                                target="_blank"
                                rel="noreferrer">
                                (by Revolt)
                            </a>
                        </h4>
                    </div>
                    <div>
                        <div
                            className="button"
                            onClick={() => setValue("twemoji")}
                            data-active={value === "twemoji"}>
                            <img
                                loading="eager"
                                src={twemojiSVG}
                                draggable={false}
                                onContextMenu={(e) => e.preventDefault()}
                            />
                        </div>
                        <h4>Twemoji</h4>
                    </div>
                </div>
                <div className="row">
                    <div>
                        <div
                            className="button"
                            onClick={() => setValue("openmoji")}
                            data-active={value === "openmoji"}>
                            <img
                                loading="eager"
                                src={openmojiSVG}
                                draggable={false}
                                onContextMenu={(e) => e.preventDefault()}
                            />
                        </div>
                        <h4>Openmoji</h4>
                    </div>
                    <div>
                        <div
                            className="button"
                            onClick={() => setValue("noto")}
                            data-active={value === "noto"}>
                            <img
                                loading="eager"
                                src={notoSVG}
                                draggable={false}
                                onContextMenu={(e) => e.preventDefault()}
                            />
                        </div>
                        <h4>Noto Emoji</h4>
                    </div>
                </div>
            </Container>
        </>
    );
}
