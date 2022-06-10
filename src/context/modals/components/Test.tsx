import { Modal } from "@revoltchat/ui";

import { ModalProps } from "../types";

export default function Test({ onClose }: ModalProps<"test">) {
    return <Modal title="I am a sub modal!" onClose={onClose} />;
}
