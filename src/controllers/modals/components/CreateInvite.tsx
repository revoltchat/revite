import styled from "styled-components";

import { Text } from "preact-i18n";
import { useEffect, useState } from "preact/hooks";

import { ModalForm } from "@revoltchat/ui";

import { noopAsync } from "../../../lib/js";

import { takeError } from "../../../context/revoltjs/util";

import { modalController } from "../ModalController";
import { ModalProps } from "../types";

/**
 * Code block which displays invite
 */
const Invite = styled.div`
    display: flex;
    flex-direction: column;

    code {
        padding: 1em;
        user-select: all;
        font-size: 1.4em;
        text-align: center;
        font-family: var(--monospace-font);
    }
`;

/**
 * Create invite modal
 */
export default function CreateInvite({
    target,
    ...props
}: ModalProps<"create_invite">) {
    const [processing, setProcessing] = useState(false);
    const [code, setCode] = useState("abcdef");

    // Generate an invite code
    useEffect(() => {
        setProcessing(true);

        target
            .createInvite()
            .then(({ _id }) => setCode(_id))
            .catch((err) =>
                modalController.push({ type: "error", error: takeError(err) }),
            )
            .finally(() => setProcessing(false));
    }, [target]);

    return (
        <ModalForm
            {...props}
            title={<Text id={`app.context_menu.create_invite`} />}
            schema={{
                message: "custom",
            }}
            data={{
                message: {
                    element: processing ? (
                        <Text id="app.special.modals.prompt.create_invite_generate" />
                    ) : (
                        <Invite>
                            <Text id="app.special.modals.prompt.create_invite_created" />
                            <code>{code}</code>
                        </Invite>
                    ),
                },
            }}
            callback={noopAsync}
        />
    );
}
