import { observer } from "mobx-react-lite";
import { Server } from "revolt.js/dist/maps/Servers";

import { useEffect, useState } from "preact/hooks";

import Button from "../../../components/ui/Button";
import InputBox from "../../../components/ui/InputBox";
import Modal from "../../../components/ui/Modal";
import Overline from "../../../components/ui/Overline";
import Tip from "../../../components/ui/Tip";

import { FileUploader } from "../../revoltjs/FileUploads";
import { useClient } from "../../revoltjs/RevoltClient";

interface Props {
    server: Server;
    onClose: () => void;
}

export const ServerIdentityModal = observer(({ server, onClose }: Props) => {
    const client = useClient();
    const member = client.members.getKey({
        server: server._id,
        user: client.user!._id,
    });

    if (!member) return null;

    const [nickname, setNickname] = useState("");
    useEffect(() => setNickname(member.nickname ?? ""), [member.nickname]);

    return (
        <Modal visible={true} onClose={onClose}>
            <Tip warning hideSeparator>
                This section is under construction.
            </Tip>
            <Overline type="subtle">Nickname</Overline>
            <p>
                <InputBox
                    value={nickname}
                    onChange={(e) => setNickname(e.currentTarget.value)}
                />
            </p>
            <p>
                <Button onClick={() => member.edit({ nickname })}>Save</Button>
            </p>
            <p>
                <Button onClick={() => member.edit({ remove: "Nickname" })}>
                    Remove
                </Button>
            </p>
            <Overline type="subtle">Avatar</Overline>
            <FileUploader
                width={80}
                height={80}
                style="icon"
                fileType="avatars"
                behaviour="upload"
                maxFileSize={4_000_000}
                onUpload={(avatar) => member.edit({ avatar })}
                remove={() => member.edit({ remove: "Avatar" })}
                defaultPreview={client.generateFileURL(
                    member.avatar ?? undefined,
                    { max_side: 256 },
                    true,
                )}
                previewURL={client.generateFileURL(
                    member.avatar ?? undefined,
                    { max_side: 256 },
                    true,
                )}
            />
        </Modal>
    );
});
