import { Text } from "preact-i18n";

import { ModalForm } from "@revoltchat/ui";

import { noop } from "../../../lib/js";

import { useClient } from "../../client/ClientController";
import { ModalProps } from "../types";

/**
 * Add friend modal
 */
export default function AddFriend({ ...props }: ModalProps<"add_friend">) {
    const client = useClient();

    return (
        <ModalForm
            {...props}
            title="Add Friend"
            schema={{
                username: "text",
            }}
            data={{
                username: {
                    field: "Username",
                    placeholder: "username#1234",
                },
            }}
            callback={({ username }) =>
                client.api.post(`/users/friend`, { username }).then(noop)
            }
            submit={{
                children: <Text id="app.special.modals.actions.ok" />,
            }}
        />
    );
}
