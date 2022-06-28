import { Check } from "@styled-icons/boxicons-regular";
import { useParams } from "react-router-dom";
import styled from "styled-components";

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
            title={deleted ? "Confirmed deletion." : "Please wait..."}
            description={
                deleted ? (
                    <>
                        Your account will be deleted in 7 days.
                        <br />
                        You may contact{" "}
                        <a href="mailto:contact@revolt.chat">
                            Revolt support
                        </a>{" "}
                        to cancel the request if you wish.
                    </>
                ) : (
                    "Contacting the server."
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
