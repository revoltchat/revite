import { Compass, PlusCircle } from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import { Text } from "preact-i18n";
import { useEffect, useState } from "preact/hooks";

import CategoryButton from "../../../components/ui/fluent/CategoryButton";
import Modal from "../../../components/ui/Modal";
import { useIntermediate } from "../Intermediate";

interface Props {
    onClose: () => void;
}

export const NewServerModal = observer(({ onClose }: Props) => {
    const { openScreen } = useIntermediate();
    return (
        <Modal
            visible={true}
            title={
                "What would you like to do?"
                // <Text
                //     id={"app.special.popovers.new_server.title"}
                // />
            }
            onClose={onClose}>
            <a
                onClick={() =>
                    openScreen({
                        id: "special_input",
                        type: "create_server",
                    })
                }>
                <CategoryButton
                    icon={<PlusCircle size={24} />}
                    action="chevron"
                    description={"Start your own server"}
                    hover>
                    <Text id="app.main.servers.create" />
                </CategoryButton>
            </a>
            <a
                onClick={() =>
                    openScreen({
                        id: "special_input",
                        type: "join_server",
                    })
                }>
                <CategoryButton
                    icon={<Compass size={24} />}
                    action="chevron"
                    description={"Join an existing server using an invite code"}
                    hover>
                    Join a server
                </CategoryButton>
            </a>
        </Modal> // <Text id="app.main.servers.join" />
    );
});
