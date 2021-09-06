import { useEffect, useState } from "preact/hooks"
import styled from "styled-components"
import { Theme, generateVariables } from '../../../context/Theme'
import { dispatch } from "../../../redux"

export const fetchManifest = (): Promise<Manifest> =>
  fetch(`//bree.dev/revolt-themes/manifest.json`).then(res => res.json())

export const fetchTheme = (slug: string): Promise<Theme> =>
  fetch(`//bree.dev/revolt-themes/theme_${slug}.json`).then(res => res.json())

interface ThemeMetadata {
  name: string,
  creator: string,
  description: string
}

type Manifest = {
  generated: string,
  themes: Record<string, ThemeMetadata>
}

// TODO: ability to preview / display the settings set like in the appearance pane
const ThemeInfo = styled.div`
  display: grid;
  grid: 
    "preview name creator" min-content
    "preview desc desc" 1fr
    / 200px 1fr 1fr;
    
  gap: 0.5rem 1rem;
  padding: 0.5rem;
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
    
    display: grid;
    grid: 1fr / 1fr;

    align-items: center;
    justify-content: center;
    text-align: center;
    cursor: pointer;
    
    background-color: var(--secondary-background);
    border-radius: var(--border-radius);

    overflow: hidden;
    
    opacity: 0;
    transition: 0.25s opacity;

    > * {
      grid-area: 1 / 1;
    }

    svg {
      height: 100%;
      width: 100%;
      object-fit: contain;
    }
  }

  .name {
    grid-area: name;
  }

  .creator {
    grid-area: creator;
    justify-self: end;
  }

  .description {
    grid-area: desc;
  }
`

const ThemeList = styled.div`
  display: grid;
  gap: 1rem;
`

import previewPath from '../assets/preview.svg'

const ThemedSVG = styled.svg<{ theme: Theme }>`
  ${props => props.theme && generateVariables(props.theme)}
`

type ThemePreviewProps = Omit<JSX.HTMLAttributes<SVGSVGElement>, "as"> & {
  slug?: string,
  theme?: Theme
  onThemeLoaded?: (theme: Theme) => void
};

const ThemePreview = ({ theme, ...props }: ThemePreviewProps) => {
  return <ThemedSVG {...props} theme={theme} width="24" height="24" aria-hidden="true" data-loaded={!!theme}>
    <use href={`${previewPath}#preview`} width="100%" height="100%" />
  </ThemedSVG >
}

export function ThemeShop() {
  // setThemeList is for adding more / lazy loading in the future
  const [themeList, setThemeList] = useState<[string, ThemeMetadata][] | null>(null);
  const [themeData, setThemeData] = useState<Record<string, Theme>>({});

  async function fetchThemeList() {
    const manifest = await fetchManifest()
    setThemeList(Object.entries(manifest.themes))
  }

  async function getTheme(slug: string) {
    const theme = await fetchTheme(slug);
    setThemeData(data => ({ ...data, [slug]: theme }))
  }

  useEffect(() => {
    fetchThemeList()
  }, [])

  useEffect(() => {
    themeList?.forEach(([slug]) => {
      getTheme(slug)
    })
  }, [themeList])

  return (
    <ThemeList>
      {themeList?.map(([slug, theme]) => {
        return <ThemeInfo key={slug} data-loaded={Reflect.has(themeData, slug)}>
          <div class="name">{theme.name}</div>
          {/* Maybe id's of the users should be included as well / instead? */}
          <div class="creator">@{theme.creator}</div>
          <div class="description">{theme.description}</div>
          <div class="preview">
            <ThemePreview
              slug={slug}
              theme={themeData[slug]}
              // todo: add option to set or override the current theme
              onClick={() => dispatch({
                type: "SETTINGS_SET_THEME",
                theme: {
                  custom: themeData[slug],
                }
              })}
            />
          </div>
        </ThemeInfo>
      })}
    </ThemeList>
  )
}