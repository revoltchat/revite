import { X } from "@styled-icons/boxicons-regular";

import { Text } from "preact-i18n";

import { Column, H1, IconButton, Modal, Row } from "@revoltchat/ui";

import Markdown from "../../../components/markdown/Markdown";
import { report } from "../../safety";
import { modalController } from "../ModalController";
import { ModalProps } from "../types";

export default function ServerInfo({
    server,
    ...props
}: ModalProps<"server_info">) {
    return (
        <Modal
            {...props}
            title={
                <Row centred>
                    <Column grow>
                        <H1>{server.name}</H1>
                    </Column>
                    <IconButton onClick={modalController.close}>
                        <X size={36} />
                    </IconButton>
                </Row>
            }
            actions={[
                {
                    onClick: () => {
                        modalController.push({
                            type: "server_identity",
                            member: server.member!,
                        });
                        return true;
                    },
                    children: "Edit Identity",
                    palette: "primary",
                },
                {
                    onClick: () => {
                        modalController.push({
                            type: "report",
                            target: server,
                        });
                        return true;
                    },
                    children: <Text id="app.special.modals.actions.report" />,
                    palette: "error",
                },
            ]}>
            <Markdown content={server.description!} />
        </Modal>
    );
}
