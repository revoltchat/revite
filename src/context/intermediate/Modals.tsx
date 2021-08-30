import { internalEmit } from "../../lib/eventEmitter";

import { isModalClosing } from "../../components/ui/Modal";

import { Screen } from "./Intermediate";
import { ClipboardModal } from "./modals/Clipboard";
import { ErrorModal } from "./modals/Error";
import { InputModal } from "./modals/Input";
import { OnboardingModal } from "./modals/Onboarding";
import { PromptModal } from "./modals/Prompt";
import { SignedOutModal } from "./modals/SignedOut";
import {ExternalLinkModal} from "./modals/ExternalLinkPrompt";
import { TokenRevealModal } from "./modals/TokenReveal";

export interface Props {
    screen: Screen;
    openScreen: (screen: Screen) => void;
}

export default function Modals({ screen, openScreen }: Props) {
    const onClose = () =>
        isModalClosing || screen.id === "onboarding"
            ? openScreen({ id: "none" })
            : internalEmit("Modal", "close");

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
