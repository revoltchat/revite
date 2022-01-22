import { useEffect, useRef } from "preact/hooks";

import { internalEmit } from "../../lib/eventEmitter";

//import { isModalClosing } from "@revoltchat/ui/lib/components/atoms/layout/Modal";
import { Screen } from "./Intermediate";
import { ClipboardModal } from "./modals/Clipboard";
import { ErrorModal } from "./modals/Error";
import { ExternalLinkModal } from "./modals/ExternalLinkPrompt";
import { InputModal } from "./modals/Input";
import { OnboardingModal } from "./modals/Onboarding";
import { PromptModal } from "./modals/Prompt";
import { SignedOutModal } from "./modals/SignedOut";
import { TokenRevealModal } from "./modals/TokenReveal";

export interface Props {
    screen: Screen;
    openScreen: (screen: Screen) => void;
}

var closing = false;
export default function Modals({ screen, openScreen }: Props) {
    const onClose = (force?: boolean) => {
        if (screen.id === "none") return;
        if (force === true || screen.id === "onboarding" || closing) {
            openScreen({ id: "none" });
        } else {
            internalEmit("Modal", "requestClose");
            closing = true;
        }
    };

    useEffect(() => {
        closing = false;
    }, [screen.id]);

    switch (screen.id) {
        case "_prompt":
            return <PromptModal onClose={onClose} {...screen} />;
        case "_input":
            return <InputModal onClose={onClose} {...screen} />;
        case "error":
            return <ErrorModal onClose={onClose} {...screen} />;
        case "signed_out":
            return <SignedOutModal onClose={onClose} {...screen} />;
        case "clipboard":
            return <ClipboardModal onClose={onClose} {...screen} />;
        case "token_reveal":
            return <TokenRevealModal onClose={onClose} {...screen} />;
        case "onboarding":
            return <OnboardingModal onClose={onClose} {...screen} />;
        case "external_link_prompt":
            return <ExternalLinkModal onClose={onClose} {...screen} />;
    }

    return null;
}
