import { useContext } from "preact/hooks";

import { IntermediateContext, useIntermediate } from "./Intermediate";
import { SpecialInputModal } from "./modals/Input";
import { SpecialPromptModal } from "./modals/Prompt";
import { CreateBotModal } from "./popovers/CreateBot";
import { ImageViewer } from "./popovers/ImageViewer";
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
        case "create_bot":
            // @ts-expect-error someone figure this out :)
            return <CreateBotModal onClose={onClose} {...screen} />;
        case "special_prompt":
            // @ts-expect-error someone figure this out :)
            return <SpecialPromptModal onClose={onClose} {...screen} />;
        case "special_input":
            // @ts-expect-error someone figure this out :)
            return <SpecialInputModal onClose={onClose} {...screen} />;
    }

    return null;
}
