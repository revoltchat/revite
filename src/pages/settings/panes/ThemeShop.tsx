import { Plus } from "@styled-icons/boxicons-regular";
import styled from "styled-components";

import { useEffect, useState } from "preact/hooks";

import { dispatch } from "../../../redux";

import { Theme, generateVariables, ThemeOptions } from "../../../context/Theme";

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
        font-family: inherit;

        .hover {
            opacity: 0;
            font-family: inherit;
            font-weight: 700;
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
                Browse hundreds of themes, created and curated by the community.
            </h5>
            <Tip warning hideSeparator>
                This section is under construction.
            </Tip>
            <ThemeList>
                {themeList?.map(([slug, theme]) => (
                    <ThemeInfo
                        key={slug}
                        data-loaded={Reflect.has(themeData, slug)}>
                        <button
                            class="preview"
                            onClick={() => {
                                dispatch({
                                    type: "THEMES_SET_THEME",
                                    theme: {
                                        slug,
                                        meta: theme,
                                        theme: themeData[slug],
                                    },
                                });

                                dispatch({
                                    type: "SETTINGS_SET_THEME",
                                    theme: { base: slug },
                                });
                            }}>
                            <div class="previewBox">
                                <div class="hover">Use theme</div>
                                <ThemePreview
                                    slug={slug}
                                    theme={themeData[slug]}
                                />
                            </div>
                        </button>
                        <h1 class="name">{theme.name}</h1>
                        {/* Maybe id's of the users should be included as well / instead? */}
                        <div class="creator">by {theme.creator}</div>
                        <h5 class="description">{theme.description}</h5>
                    </ThemeInfo>
                ))}
            </ThemeList>
        </ThemeShopRoot>
    );
}
