import { Import, Reset } from "@styled-icons/boxicons-regular";
import styled from "styled-components/macro";

import { Text } from "preact-i18n";

import { Button } from "@revoltchat/ui";

import { useApplicationState } from "../../../../mobx/State";

import { modalController } from "../../../../controllers/modals/ModalController";
import Tooltip from "../../../common/Tooltip";

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
    const theme = useApplicationState().settings.theme;

    return (
        <Actions>
            <Tooltip
                content={
                    <Text id="app.settings.pages.appearance.reset_overrides" />
                }>
                <Button
                    palette="secondary"
                    compact="icon"
                    onClick={theme.reset}>
                    <Reset size={22} />
                </Button>
            </Tooltip>
            <div
                className="code"
                onClick={() =>
                    modalController.writeText(JSON.stringify(theme))
                }>
                <Tooltip content={<Text id="app.special.copy" />}>
                    {" "}
                    {JSON.stringify(theme)}
                </Tooltip>
            </div>
            <Tooltip
                content={<Text id="app.settings.pages.appearance.import" />}>
                <Button
                    palette="secondary"
                    compact="icon"
                    onClick={async () => {
                        try {
                            const text = await navigator.clipboard.readText();
                            theme.hydrate(JSON.parse(text));
                        } catch (err) {
                            modalController.push({
                                type: "import_theme",
                            });
                        }
                    }}>
                    <Import size={22} />
                </Button>
            </Tooltip>
        </Actions>
    );
}
