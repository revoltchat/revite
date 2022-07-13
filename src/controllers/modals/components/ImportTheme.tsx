import { Text } from "preact-i18n";

import { ModalForm } from "@revoltchat/ui";

import { state } from "../../../mobx/State";

import { ModalProps } from "../types";

/**
 * Import theme modal
 */
export default function ImportTheme({ ...props }: ModalProps<"import_theme">) {
    return (
        <ModalForm
            {...props}
            title={<Text id="app.settings.pages.appearance.import_theme" />}
            schema={{
                data: "text",
            }}
            data={{
                data: {
                    field: (
                        <Text id="app.settings.pages.appearance.theme_data" />
                    ) as React.ReactChild,
                },
            }}
            callback={async ({ data }) =>
                state.settings.theme.hydrate(JSON.parse(data))
            }
            submit={{
                children: <Text id="app.special.modals.actions.ok" />,
            }}
        />
    );
}
