import { X } from "@styled-icons/boxicons-regular";

import { Column, H1, IconButton, Modal, Row } from "@revoltchat/ui";

import Markdown from "../../../components/markdown/Markdown";
import { modalController } from "../ModalController";
import { ModalProps } from "../types";

export default function ChannelInfo({
    channel,
    ...props
}: ModalProps<"channel_info">) {
    return (
        <Modal
            {...props}
            title={
                <Row centred>
                    <Column grow>
                        <H1>{`#${channel.name}`}</H1>
                    </Column>
                    <IconButton onClick={modalController.close}>
                        <X size={36} />
                    </IconButton>
                </Row>
            }>
            <Markdown content={channel.description!} />
        </Modal>
    );
}
