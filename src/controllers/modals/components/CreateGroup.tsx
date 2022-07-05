import { useHistory } from "react-router-dom";

import { Text } from "preact-i18n";

import { ModalForm } from "@revoltchat/ui";

import { mapError } from "../../../context/revoltjs/util";

import { useClient } from "../../client/ClientController";
import { ModalProps } from "../types";

/**
 * Group creation modal
 */
export default function CreateGroup({ ...props }: ModalProps<"create_group">) {
    const history = useHistory();
    const client = useClient();

    return (
        <ModalForm
            {...props}
            title={<Text id="app.main.groups.create" />}
            schema={{
                name: "text",
            }}
            data={{
                name: {
                    field: (
                        <Text id="app.main.groups.name" />
                    ) as React.ReactChild,
                },
            }}
            callback={async ({ name }) => {
                const group = await client.channels
                    .createGroup({
                        name,
                        users: [],
                    })
                    .catch(mapError);

                history.push(`/channel/${group._id}`);
            }}
        />
    );
}
