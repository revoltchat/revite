import { Brush } from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import { Link } from "react-router-dom";
// @ts-expect-error shade-blend-color does not have typings.
import pSBC from "shade-blend-color";

import { Text } from "preact-i18n";

import { CategoryButton, ObservedInputElement } from "@revoltchat/ui";

import { useApplicationState } from "../../../mobx/State";

import { ThemeBaseSelector } from "./legacy/ThemeBaseSelector";

/**
 * ! LEGACY
 * Component providing a way to switch the base theme being used.
 */
export const ShimThemeBaseSelector = observer(() => {
    const theme = useApplicationState().settings.theme;
    return (
        <ThemeBaseSelector
            value={theme.isModified() ? undefined : theme.getBase()}
            setValue={(base) => {
                theme.setBase(base);
                theme.reset();
            }}
        />
    );
});

export default function ThemeSelection() {
    const theme = useApplicationState().settings.theme;

    return (
        <>
            {/** Allow users to change base theme */}
            <ShimThemeBaseSelector />
            {/** Provide a link to the theme shop */}
            <Link to="/discover/themes" replace>
                <CategoryButton
                    icon={<Brush size={24} />}
                    action="chevron"
                    description={
                        <Text id="app.settings.pages.appearance.discover.description" />
                    }>
                    <Text id="app.settings.pages.appearance.discover.title" />
                </CategoryButton>
            </Link>
            <hr />
            <h3>
                <Text id="app.settings.pages.appearance.accent_selector" />
            </h3>
            <ObservedInputElement
                type="colour"
                value={theme.getVariable("accent")}
                onChange={(colour) => {
                    theme.setVariable("accent", colour as string);
                    theme.setVariable("scrollbar-thumb", pSBC(-0.2, colour));
                }}
            />
        </>
    );
}
