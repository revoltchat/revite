import { observer } from "mobx-react-lite";
import { Prompt, useHistory } from "react-router-dom";

import { useEffect } from "preact/hooks";

import { modalController } from "./ModalController";

export default observer(() => {
    const history = useHistory();

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

    return (
        <>
            {modalController.rendered}
            <Prompt
                when={modalController.isVisible}
                message={(_, action) => {
                    if (action === "POP") {
                        modalController.pop("close");
                        setTimeout(() => history.push(history.location), 0);

                        return false;
                    }

                    return true;
                }}
            />
        </>
    );
});
