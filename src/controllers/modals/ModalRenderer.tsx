import { observer } from "mobx-react-lite";

import { useEffect } from "preact/hooks";

import { modalController } from "./ModalController";

export default observer(() => {
    useEffect(() => {
        function keyUp(event: KeyboardEvent) {
            if (event.key === "Escape") {
                modalController.pop("close");
            } else if (event.key === "Enter") {
                modalController.pop("confirm");
            }
        }

        document.addEventListener("keyup", keyUp);
        return () => document.removeEventListener("keyup", keyUp);
    }, []);

    return modalController.rendered;
});
