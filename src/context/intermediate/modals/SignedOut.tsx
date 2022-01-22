import { Text } from "preact-i18n";

import { ModalBound } from "../../../components/util/ModalBound";

interface Props {
    onClose: () => void;
}

export function SignedOutModal({ onClose }: Props) {
    return (
        <ModalBound
            onClose={onClose}
            title={<Text id="app.special.modals.signed_out" />}
            actions={[
                {
                    onClick: onClose,
                    confirmation: true,
                    children: <Text id="app.special.modals.actions.ok" />,
                },
            ]}
        />
    );
}
