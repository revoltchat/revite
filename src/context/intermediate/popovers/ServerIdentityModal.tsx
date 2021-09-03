import { observer } from "mobx-react-lite";
import { Server } from "revolt.js/dist/maps/Servers";

import styles from "./ServerIdentityModal.module.scss";
import { useEffect, useState } from "preact/hooks";

import Button from "../../../components/ui/Button";
import InputBox from "../../../components/ui/InputBox";
import Modal from "../../../components/ui/Modal";
import Overline from "../../../components/ui/Overline";

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
    const [currentNickname, setCurrentNickname] = useState("");
    useEffect(() => {
        setNickname(member.nickname ?? "");
        setCurrentNickname(member.nickname ?? "");
    }, [member.nickname]);

    return (
        <Modal
            visible={true}
            title={`Change Identity on ${server.name}`}
            onClose={onClose}>
            <div className={styles.identityMain}>
                <div>
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
                </div>
                <div>
                    <Overline type="subtle">Nickname</Overline>
                    <InputBox
                        value={nickname}
                        placeholder={client.user!.username}
                        onChange={(e) => setNickname(e.currentTarget.value)}
                    />
                    <div className={styles.buttons}>
                        <Button
                            disabled={nickname === currentNickname}
                            onClick={() => member.edit({ nickname })}>
                            Save
                        </Button>
                        {currentNickname !== "" && (
                            <Button
                                plain
                                onClick={() =>
                                    member.edit({ remove: "Nickname" })
                                }>
                                Remove
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
});
