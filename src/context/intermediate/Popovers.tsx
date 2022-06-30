import { useContext } from "preact/hooks";

import { IntermediateContext, useIntermediate } from "./Intermediate";
import { SpecialInputModal } from "./modals/Input";
import { SpecialPromptModal } from "./modals/Prompt";

export default function Popovers() {
    const { screen } = useContext(IntermediateContext);
    const { openScreen } = useIntermediate();

    const onClose = () =>
        //isModalClosing
        openScreen({ id: "none" });
    //: internalEmit("Modal", "close");

    switch (screen.id) {
        case "special_prompt":
            // @ts-expect-error someone figure this out :)
            return <SpecialPromptModal onClose={onClose} {...screen} />;
        case "special_input":
            // @ts-expect-error someone figure this out :)
            return <SpecialInputModal onClose={onClose} {...screen} />;
    }

    return null;
}
