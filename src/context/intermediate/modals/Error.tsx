import { Text } from "preact-i18n";

import { ModalBound } from "../../../components/util/ModalBound";

interface Props {
    onClose: () => void;
    error: string;
}

export function ErrorModal({ onClose, error }: Props) {
    return (
        <ModalBound
            onClose={onClose}
            title={<Text id="app.special.modals.error" />}
            actions={[
                {
                    onClick: onClose,
                    confirmation: true,
                    children: <Text id="app.special.modals.actions.ok" />,
                },
                {
                    onClick: () => location.reload(),
                    children: <Text id="app.special.modals.actions.reload" />,
                },
            ]}>
            <Text id={`error.${error}`}>{error}</Text>
        </ModalBound>
    );
}
