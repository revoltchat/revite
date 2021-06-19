import { IntermediateContext, useIntermediate } from "./Intermediate";
import { useContext } from "preact/hooks";

import { UserPicker } from "./popovers/UserPicker";
import { SpecialInputModal } from "./modals/Input";
import { SpecialPromptModal } from "./modals/Prompt";
import { UserProfile } from "./popovers/UserProfile";
import { ImageViewer } from "./popovers/ImageViewer";
import { ChannelInfo } from "./popovers/ChannelInfo";

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
        case "special_prompt":
            return <SpecialPromptModal onClose={onClose} {...screen} />;
        case "special_input":
            return <SpecialInputModal onClose={onClose} {...screen} />;
    }

    return null;
}
