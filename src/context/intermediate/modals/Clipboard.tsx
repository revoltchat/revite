import { Text } from "preact-i18n";

import Modal from "../../../components/ui/Modal";

interface Props {
	onClose: () => void;
	text: string;
}

export function ClipboardModal({ onClose, text }: Props) {
	return (
		<Modal
			visible={true}
			onClose={onClose}
			title={<Text id="app.special.modals.clipboard.unavailable" />}
			actions={[
				{
					onClick: onClose,
					confirmation: true,
					text: <Text id="app.special.modals.actions.close" />,
				},
			]}>
			{location.protocol !== "https:" && (
				<p>
					<Text id="app.special.modals.clipboard.https" />
				</p>
			)}
			<Text id="app.special.modals.clipboard.copy" />{" "}
			<code style={{ userSelect: "all" }}>{text}</code>
		</Modal>
	);
}
