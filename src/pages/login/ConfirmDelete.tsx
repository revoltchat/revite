import { Check } from "@styled-icons/boxicons-regular";
import { useParams } from "react-router-dom";
import styled from "styled-components";

import { Text } from "preact-i18n";
import { useEffect, useState } from "preact/hooks";

import { Modal, Preloader } from "@revoltchat/ui";

import { useApi } from "../../controllers/client/ClientController";

const Centre = styled.div`
    display: flex;
    justify-content: center;
`;

export default function ConfirmDelete() {
    const api = useApi();
    const [deleted, setDeleted] = useState(true);
    const { token } = useParams<{ token: string }>();

    useEffect(() => {
        api.put("/auth/account/delete", { token }).then(() => setDeleted(true));
    }, []);

    return (
        <Modal
            title={
                <Text id={`${ 
                    deleted
                        ? 'app.special.modals.account.delete.confirmation'
                        : 'generic.please_wait'
                }`} />
            }
            description={
                deleted ? (
                    <>
                        <Text id="app.special.modals.account.delete.long.a" />{" "}
                        <a href="mailto:contact@revolt.chat">
                            <Text id="app.special.modals.account.delete.long.b" />
                        </a>{" "}
                        <Text id="app.special.modals.account.delete.long.c" />
                    </>
                ) : (
                    <Text id="generic.contacting_server" />
                )
            }
            nonDismissable>
            {deleted ? (
                <Centre>
                    <Check size={48} />
                </Centre>
            ) : (
                <Preloader type="ring" />
            )}
        </Modal>
    );
}
