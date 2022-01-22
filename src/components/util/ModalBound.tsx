import { internalSubscribe } from "../../lib/eventEmitter";
import { Modal, Props } from "@revoltchat/ui/lib/components/atoms/layout/Modal";

export function ModalBound(
    props: Omit<Props, "registerOnClose" | "registerOnConfirm">,
) {
    return (
        <Modal
            {...props}
            registerOnClose={(close) => {
                const onKeyUp = (e: KeyboardEvent) =>
                    e.key === "Escape" && close();

                document.addEventListener("keyup", onKeyUp);
                const unsub = internalSubscribe("Modal", "requestClose", close);

                return () => {
                    document.removeEventListener("keyup", onKeyUp);
                    unsub();
                };
            }}
            registerOnConfirm={(confirm) => {
                const onKeyUp = (e: KeyboardEvent) => {
                    if (e.key === "Enter") {
                        confirm();
                    }
                };

                document.addEventListener("keyup", onKeyUp);
                return () => document.removeEventListener("keyup", onKeyUp);
            }}
        />
    );
}
