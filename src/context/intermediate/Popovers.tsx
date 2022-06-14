import { useContext } from "preact/hooks";

import { internalEmit } from "../../lib/eventEmitter";

import { IntermediateContext, useIntermediate } from "./Intermediate";
import { SpecialInputModal } from "./modals/Input";
import { SpecialPromptModal } from "./modals/Prompt";
import { ChannelInfo } from "./popovers/ChannelInfo";
import { CreateBotModal } from "./popovers/CreateBot";
import { ImageViewer } from "./popovers/ImageViewer";
import { ModifyAccountModal } from "./popovers/ModifyAccount";
import { PendingRequests } from "./popovers/PendingRequests";
import { ServerIdentityModal } from "./popovers/ServerIdentityModal";
import { UserPicker } from "./popovers/UserPicker";
import { UserProfile } from "./popovers/UserProfile";

export default function Popovers() {
    const { screen } = useContext(IntermediateContext);
    const { openScreen } = useIntermediate();

    const onClose = () =>
        //isModalClosing
        openScreen({ id: "none" });
    //: internalEmit("Modal", "close");

    switch (screen.id) {
        case "profile":
            // @ts-expect-error someone figure this out :)
            return <UserProfile {...screen} onClose={onClose} />;
        case "user_picker":
            // @ts-expect-error someone figure this out :)
            return <UserPicker {...screen} onClose={onClose} />;
        case "image_viewer":
            return <ImageViewer {...screen} onClose={onClose} />;
        case "channel_info":
            // @ts-expect-error someone figure this out :)
            return <ChannelInfo {...screen} onClose={onClose} />;
        case "pending_requests":
            // @ts-expect-error someone figure this out :)
            return <PendingRequests {...screen} onClose={onClose} />;
        case "modify_account":
            // @ts-expect-error someone figure this out :)
            return <ModifyAccountModal onClose={onClose} {...screen} />;
        case "create_bot":
            // @ts-expect-error someone figure this out :)
            return <CreateBotModal onClose={onClose} {...screen} />;
        case "special_prompt":
            // @ts-expect-error someone figure this out :)
            return <SpecialPromptModal onClose={onClose} {...screen} />;
        case "special_input":
            // @ts-expect-error someone figure this out :)
            return <SpecialInputModal onClose={onClose} {...screen} />;
        case "server_identity":
            // @ts-expect-error someone figure this out :)
            return <ServerIdentityModal onClose={onClose} {...screen} />;
    }

    return null;
}
