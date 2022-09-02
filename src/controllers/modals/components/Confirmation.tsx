import { useHistory } from "react-router-dom";

import { Text } from "preact-i18n";

import { ModalForm } from "@revoltchat/ui";

import { TextReact } from "../../../lib/i18n";

import { clientController } from "../../client/ClientController";
import { ModalProps } from "../types";

/**
 * Confirmation modal
 */
export default function Confirmation(
    props: ModalProps<
        | "close_dm"
        | "delete_server"
        | "delete_channel"
        | "delete_bot"
        | "block_user"
        | "unfriend_user"
    >,
) {
    const history = useHistory();

    const EVENTS = {
        close_dm: ["confirm_close_dm", "close"],
        delete_server: ["confirm_delete", "delete"],
        delete_channel: ["confirm_delete", "delete"],
        delete_bot: ["confirm_delete", "delete"],
        unfriend_user: ["unfriend_user", "remove"],
        block_user: ["block_user", "block"],
    };

    const event = EVENTS[props.type];
    let name;
    switch (props.type) {
        case "unfriend_user":
        case "block_user":
            name = props.target.username;
            break;
        case "close_dm":
            name = props.target.recipient?.username;
            break;
        case "delete_bot":
            name = props.name;
            break;
        default:
            name = props.target.name;
    }

    return (
        <ModalForm
            {...props}
            title={
                <Text
                    id={`app.special.modals.prompt.${event[0]}`}
                    fields={{ name }}
                />
            }
            description={
                <TextReact
                    id={`app.special.modals.prompt.${event[0]}_long`}
                    fields={{ name: <b>{name}</b> }}
                />
            }
            data={{}}
            schema={{}}
            callback={async () => {
                switch (props.type) {
                    case "unfriend_user":
                        await props.target.removeFriend();
                        break;
                    case "block_user":
                        await props.target.blockUser();
                        break;
                    case "close_dm":
                    case "delete_channel":
                    case "delete_server":
                        if (props.type != "delete_channel") history.push("/");

                        props.target.delete();
                        break;
                    case "delete_bot":
                        clientController
                            .getAvailableClient()
                            .bots.delete(props.target);
                        props.cb?.();
                        break;
                }
            }}
            submit={{
                palette: "error",
                children: (
                    <Text id={`app.special.modals.actions.${event[1]}`} />
                ),
            }}
        />
    );
}
