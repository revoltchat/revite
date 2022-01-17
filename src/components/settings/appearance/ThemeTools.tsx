import { Import, Reset } from "@styled-icons/boxicons-regular";
import styled from "styled-components/macro";

import { Text } from "preact-i18n";

import { useApplicationState } from "../../../mobx/State";

import { useIntermediate } from "../../../context/intermediate/Intermediate";

import Tooltip from "../../common/Tooltip";
import Button from "../../ui/Button";

const Actions = styled.div`
    gap: 8px;
    display: flex;
    margin: 18px 0 8px 0;

    .code {
        cursor: pointer;
        display: flex;
        align-items: center;
        font-size: 0.875rem;
        min-width: 0;
        flex-grow: 1;
        padding: 8px;
        font-family: var(--monospace-font);
        border-radius: var(--border-radius);
        background: var(--secondary-background);

        > div {
            width: 100%;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }
    }
`;

export default function ThemeTools() {
    const { writeClipboard, openScreen } = useIntermediate();
    const theme = useApplicationState().settings.theme;

    return (
        <Actions>
            <Tooltip
                content={
                    <Text id="app.settings.pages.appearance.reset_overrides" />
                }>
                <Button contrast iconbutton onClick={theme.reset}>
                    <Reset size={22} />
                </Button>
            </Tooltip>
            <div
                class="code"
                onClick={() => writeClipboard(JSON.stringify(theme))}>
                <Tooltip content={<Text id="app.special.copy" />}>
                    {" "}
                    {JSON.stringify(theme)}
                </Tooltip>
            </div>
            <Tooltip
                content={<Text id="app.settings.pages.appearance.import" />}>
                <Button
                    contrast
                    iconbutton
                    onClick={async () => {
                        try {
                            const text = await navigator.clipboard.readText();
                            theme.hydrate(JSON.parse(text));
                        } catch (err) {
                            openScreen({
                                id: "_input",
                                question: (
                                    <Text id="app.settings.pages.appearance.import_theme" />
                                ),
                                field: (
                                    <Text id="app.settings.pages.appearance.theme_data" />
                                ),
                                callback: async (text) =>
                                    theme.hydrate(JSON.parse(text)),
                            });
                        }
                    }}>
                    <Import size={22} />
                </Button>
            </Tooltip>
        </Actions>
    );
}
