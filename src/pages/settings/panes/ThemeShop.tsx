/**
 * ! DEPRECATED FILE
 * ! DO NOT IMPORT
 *
 * Replaced by Revolt Discover
 */
import { Check } from "@styled-icons/boxicons-regular";
import {
    Star,
    Brush,
    Bookmark,
    BarChartAlt2,
} from "@styled-icons/boxicons-solid";
import styled from "styled-components/macro";

import { Text } from "preact-i18n";
import { useEffect, useState } from "preact/hooks";

import { useApplicationState } from "../../../mobx/State";

import { Theme, generateVariables } from "../../../context/Theme";

import Tip from "../../../components/ui/Tip";
import previewPath from "../assets/preview.svg";

import { GIT_REVISION } from "../../../revision";

export const fetchManifest = (): Promise<Manifest> =>
    fetch(`${import.meta.env.VITE_THEMES_URL}/manifest.json`).then((res) =>
        res.json(),
    );

export const fetchTheme = (slug: string): Promise<Theme> =>
    fetch(`${import.meta.env.VITE_THEMES_URL}/theme_${slug}.json`).then((res) =>
        res.json(),
    );

export interface ThemeMetadata {
    name: string;
    creator: string;
    commit?: string;
    description: string;
}

export type Manifest = {
    generated: string;
    themes: Record<string, ThemeMetadata>;
};

// TODO: ability to preview / display the settings set like in the appearance pane
const ThemeInfo = styled.article`
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 1rem;
    border-radius: var(--border-radius);
    background: var(--secondary-background);

    &[data-loaded] {
        .preview {
            opacity: 1;
        }
    }

    .preview {
        grid-area: preview;
        aspect-ratio: 323 / 202;

        background-color: var(--secondary-background);
        border-radius: calc(var(--border-radius) / 2);

        // prep style for later
        outline: 3px solid transparent;

        // hide random svg parts, crop border on firefox
        overflow: hidden;

        // hide until loaded
        opacity: 0;

        // style button
        border: 0;
        margin: 0;
        padding: 0;

        transition: 0.25s opacity, 0.25s outline;

        > * {
            grid-area: 1 / 1;
        }

        svg {
            height: 100%;
            width: 100%;
            object-fit: contain;
        }

        &:hover,
        &:active,
        &:focus-visible {
            outline: 3px solid var(--tertiary-background);
        }
    }

    .name {
        margin-top: 5px !important;
        grid-area: name;
        margin: 0;
    }

    .creator {
        grid-area: creator;
        justify-self: end;
        font-size: 0.75rem;
    }

    .description {
        margin-bottom: 5px;
        grid-area: desc;
    }

    .previewBox {
        position: relative;
        height: 100%;
        width: 100%;

        .hover {
            opacity: 0;
            font-family: var(--font), sans-serif;
            font-variant-ligatures: var(--ligatures);
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            height: 100%;
            width: 100%;
            z-index: 10;
            position: absolute;
            background: rgba(0, 0, 0, 0.5);
            cursor: pointer;
            transition: opacity 0.2s ease-in-out;

            &:hover {
                opacity: 1;
            }
        }

        > svg {
            height: 100%;
        }
    }
`;

const ThemeList = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
`;

const Banner = styled.div`
    display: flex;
    flex-direction: column;
`;

const Category = styled.div`
    display: flex;
    gap: 8px;
    align-items: center;

    .title {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-grow: 1;
    }

    .view {
        font-size: 12px;
    }
`;

const ActiveTheme = styled.div`
    display: flex;
    flex-direction: column;
    background: var(--secondary-background);
    padding: 0;
    border-radius: var(--border-radius);
    gap: 8px;
    overflow: hidden;

    .active-indicator {
        display: flex;
        gap: 6px;
        align-items: center;
        background: var(--accent);
        width: 100%;
        padding: 5px 10px;
        font-size: 13px;
        font-weight: 400;
        color: white;
    }
    .title {
        font-size: 1.2rem;
        font-weight: 600;
    }

    .author {
        font-size: 12px;
        margin-bottom: 5px;
    }

    .theme {
        width: 124px;
        height: 80px;
        background: var(--tertiary-background);
        border-radius: 4px;
    }

    .container {
        display: flex;
        gap: 16px;
        padding: 10px 16px 16px;
    }
`;

const ThemedSVG = styled.svg<{ theme: Theme }>`
    ${(props) => props.theme && generateVariables(props.theme)}
`;

type ThemePreviewProps = Omit<JSX.HTMLAttributes<SVGSVGElement>, "as"> & {
    slug?: string;
    theme?: Theme;
    onThemeLoaded?: (theme: Theme) => void;
};

const ThemePreview = ({ theme, ...props }: ThemePreviewProps) => {
    return (
        <ThemedSVG
            {...props}
            theme={theme}
            width="323"
            height="202"
            aria-hidden="true"
            data-loaded={!!theme}>
            <use href={`${previewPath}#preview`} width="100%" height="100%" />
        </ThemedSVG>
    );
};

const ThemeShopRoot = styled.div`
    display: grid;
    gap: 1rem;

    h5 {
        margin-bottom: 0;
    }
`;

export function ThemeShop() {
    // setThemeList is for adding more / lazy loading in the future
    const [themeList, setThemeList] = useState<
        [string, ThemeMetadata][] | null
    >(null);
    const [themeData, setThemeData] = useState<Record<string, Theme>>({});

    const themes = useApplicationState().settings.theme;

    async function fetchThemeList() {
        const manifest = await fetchManifest();
        setThemeList(
            Object.entries(manifest.themes).filter((x) =>
                x[1].commit ? x[1].commit === GIT_REVISION : true,
            ),
        );
    }

    async function getTheme(slug: string) {
        const theme = await fetchTheme(slug);
        setThemeData((data) => ({ ...data, [slug]: theme }));
    }

    useEffect(() => {
        fetchThemeList();
    }, []);

    useEffect(() => {
        themeList?.forEach(([slug]) => {
            getTheme(slug);
        });
    }, [themeList]);

    return (
        <ThemeShopRoot>
            <h5>
                <Text id="app.settings.pages.theme_shop.description" />
            </h5>
            {/*<LoadFail>
                <h5>
                    Oops! Couldn't load the theme shop. Make sure you're
                    connected to the internet and try again.
                </h5>
            </LoadFail>*/}
            <Tip warning hideSeparator>
                The Theme Shop is currently under construction.
            </Tip>

            {/* FIXME INTEGRATE WITH MOBX */}
            {/*<ActiveTheme>
                <div class="active-indicator">
                    <Check size="16" />
                    <Text id="app.settings.pages.theme_shop.active" />
                </div>
                <div class="container">
                    <div class="theme">theme svg goes here</div>
                    <div class="info">
                        <div class="title">Theme Title</div>
                        <div class="author">
                            <Text id="app.settings.pages.theme_shop.by" />{" "}
                            Author
                        </div>
                        <h5>This is a theme description.</h5>
                    </div>
                </div>
            </ActiveTheme>
            <InputBox placeholder="<Text id="app.settings.pages.theme_shop.search" />" contrast />
            <Category>
                <div class="title">
                    <Bookmark size={16} />
                    <Text id="app.settings.pages.theme_shop.category.saved" />
                </div>
                <a class="view">
                    <Text id="app.settings.pages.theme_shop.category.manage" />
                </a>
            </Category>

            <Category>
                <div class="title">
                    <Star size={16} />
                    <Text id="app.settings.pages.theme_shop.category.new" />
                </div>
                <a class="view">
                    <Text id="app.settings.pages.theme_shop.category.viewall" />
                </a>
            </Category>

            <Category>
                <div class="title">
                    <BarChartAlt2 size={16} />
                    <Text id="app.settings.pages.theme_shop.category.highest" />
                </div>
                <a class="view">
                    <Text id="app.settings.pages.theme_shop.category.viewall" />
                </a>
            </Category>

            <Category>
                <div class="title">
                    <Brush size={16} />
                    <Text id="app.settings.pages.theme_shop.category.default" />
                </div>
                <a class="view">
                    <Text id="app.settings.pages.theme_shop.category.viewall" />
                </a>
            </Category>*/}
            <hr />
            <ThemeList>
                {themeList?.map(([slug, theme]) => (
                    <ThemeInfo
                        key={slug}
                        data-loaded={Reflect.has(themeData, slug)}>
                        <button
                            class="preview"
                            onClick={() =>
                                themes.hydrate(themeData[slug], true)
                            }>
                            <div class="previewBox">
                                <div class="hover">
                                    <Text id="app.settings.pages.theme_shop.use" />
                                </div>
                                <ThemePreview
                                    slug={slug}
                                    theme={themeData[slug]}
                                />
                            </div>
                        </button>
                        <h1 class="name">{theme.name}</h1>
                        {/* Maybe id's of the users should be included as well / instead? */}
                        <div class="creator">
                            <Text
                                id="app.settings.pages.theme_shop.by"
                                fields={{
                                    creator: theme.creator
                                }}
                            />
                        </div>
                        <h5 class="description">{theme.description}</h5>
                    </ThemeInfo>
                ))}
            </ThemeList>
        </ThemeShopRoot>
    );
}
