//import { isModalClosing } from "../../components/ui/Modal";
import { Screen } from "./Intermediate";
import { InputModal } from "./modals/Input";
import { OnboardingModal } from "./modals/Onboarding";
import { PromptModal } from "./modals/Prompt";

export interface Props {
    screen: Screen;
    openScreen: (screen: Screen) => void;
}

export default function Modals({ screen, openScreen }: Props) {
    const onClose = () =>
        //isModalClosing || screen.id === "onboarding"
        openScreen({ id: "none" });
    //            : internalEmit("Modal", "close");

    switch (screen.id) {
        case "_prompt":
            return <PromptModal onClose={onClose} {...screen} />;
        case "_input":
            return <InputModal onClose={onClose} {...screen} />;
        case "onboarding":
            return <OnboardingModal onClose={onClose} {...screen} />;
    }

    return null;
}
