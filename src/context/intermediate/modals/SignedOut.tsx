import { Text } from "preact-i18n";

import Modal from "../../../components/ui/Modal";

interface Props {
	onClose: () => void;
}

export function SignedOutModal({ onClose }: Props) {
	return (
		<Modal
			visible={true}
			onClose={onClose}
			title={<Text id="app.special.modals.signed_out" />}
			actions={[
				{
					onClick: onClose,
					confirmation: true,
					text: <Text id="app.special.modals.actions.ok" />,
				},
			]}
		/>
	);
}
