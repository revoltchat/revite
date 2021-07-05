import { useContext } from "preact/hooks";

import { IntermediateContext, useIntermediate } from "./Intermediate";
import { SpecialInputModal } from "./modals/Input";
import { SpecialPromptModal } from "./modals/Prompt";
import { ChannelInfo } from "./popovers/ChannelInfo";
import { ImageViewer } from "./popovers/ImageViewer";
import { ModifyAccountModal } from "./popovers/ModifyAccount";
import { PendingRequests } from "./popovers/PendingRequests";
import { UserPicker } from "./popovers/UserPicker";
import { UserProfile } from "./popovers/UserProfile";

export default function Popovers() {
	const { screen } = useContext(IntermediateContext);
	const { openScreen } = useIntermediate();

	const onClose = () => openScreen({ id: "none" });

	switch (screen.id) {
		case "profile":
			return <UserProfile {...screen} onClose={onClose} />;
		case "user_picker":
			return <UserPicker {...screen} onClose={onClose} />;
		case "image_viewer":
			return <ImageViewer {...screen} onClose={onClose} />;
		case "channel_info":
			return <ChannelInfo {...screen} onClose={onClose} />;
		case "pending_requests":
			return <PendingRequests {...screen} onClose={onClose} />;
		case "modify_account":
			return <ModifyAccountModal onClose={onClose} {...screen} />;
		case "special_prompt":
			return <SpecialPromptModal onClose={onClose} {...screen} />;
		case "special_input":
			return <SpecialInputModal onClose={onClose} {...screen} />;
	}

	return null;
}
