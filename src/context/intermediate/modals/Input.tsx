import { autorun } from "mobx";
import { useHistory } from "react-router";
import { Server } from "revolt.js/dist/maps/Servers";
import { ulid } from "ulid";

import { Text } from "preact-i18n";
import { useContext, useState } from "preact/hooks";

import { defer } from "../../../lib/defer";

import InputBox from "../../../components/ui/InputBox";
import Modal from "../../../components/ui/Modal";
import Overline from "../../../components/ui/Overline";

import { Children } from "../../../types/Preact";
import { AppContext } from "../../revoltjs/RevoltClient";
import { takeError } from "../../revoltjs/util";

interface Props {
    onClose: () => void;
    question: Children;
    field?: Children;
    defaultValue?: string;
    callback: (value: string) => Promise<void>;
}

export function InputModal({
    onClose,
    question,
    field,
    defaultValue,
    callback,
}: Props) {
    const [processing, setProcessing] = useState(false);
    const [value, setValue] = useState(defaultValue ?? "");
    const [error, setError] = useState<undefined | string>(undefined);

    return (
        <Modal
            visible={true}
            title={question}
            disabled={processing}
            actions={[
                {
                    confirmation: true,
                    children: <Text id="app.special.modals.actions.ok" />,
                    onClick: () => {
                        setProcessing(true);
                        callback(value)
                            .then(onClose)
                            .catch((err) => {
                                setError(takeError(err));
                                setProcessing(false);
                            });
                    },
                },
                {
                    children: <Text id="app.special.modals.actions.cancel" />,
                    onClick: onClose,
                },
            ]}
            onClose={onClose}>
            {field ? (
                <Overline error={error} block>
                    {field}
                </Overline>
            ) : (
                error && <Overline error={error} type="error" block />
            )}
            <InputBox
                value={value}
                onChange={(e) => setValue(e.currentTarget.value)}
            />
        </Modal>
    );
}

type SpecialProps = { onClose: () => void } & (
    | {
          type:
              | "create_group"
              | "create_server"
              | "join_server"
              | "set_custom_status"
              | "add_friend";
      }
    | { type: "create_role"; server: Server; callback: (id: string) => void }
);

export function SpecialInputModal(props: SpecialProps) {
    const history = useHistory();
    const client = useContext(AppContext);

    const { onClose } = props;
    switch (props.type) {
        case "create_group": {
            return (
                <InputModal
                    onClose={onClose}
                    question={<Text id="app.main.groups.create" />}
                    field={<Text id="app.main.groups.name" />}
                    callback={async (name) => {
                        const group = await client.channels.createGroup({
                            name,
                            nonce: ulid(),
                            users: [],
                        });

                        history.push(`/channel/${group._id}`);
                    }}
                />
            );
        }
        case "create_server": {
            return (
                <InputModal
                    onClose={onClose}
                    question={<Text id="app.main.servers.create" />}
                    field={<Text id="app.main.servers.name" />}
                    callback={async (name) => {
                        const server = await client.servers.createServer({
                            name,
                            nonce: ulid(),
                        });

                        history.push(`/server/${server._id}`);
                    }}
                />
            );
        }
        case "create_role": {
            return (
                <InputModal
                    onClose={onClose}
                    question={
                        <Text id="app.settings.permissions.create_role" />
                    }
                    field={<Text id="app.settings.permissions.role_name" />}
                    callback={async (name) => {
                        const role = await props.server.createRole(name);
                        props.callback(role.id);
                    }}
                />
            );
        }
        case "join_server": {
            return (
                <InputModal
                    onClose={onClose}
                    question={<Text id="app.main.servers.join" />}
                    field={"Invite code"}
                    callback={async (rawCode) => {
                        // if the user provides an invite link, get rid of the url and just pass the invite code
                        // prettier-ignore
                        const regex = new RegExp(
                            "http(s?):\/\/(app|nightly|rvlt|localhost).(revolt.chat|gg\/|\d{3,5})(\/invite\/)?", // localhost doesn't quite work yet
                        );
                        const code = rawCode.replace(regex, "");
                        const serv = await client.fetchInvite(code);
                        if (typeof serv === "undefined")
                            console.log("Something went wrong.");

                        if (client.servers.get(serv.server_id)) {
                            history.push(
                                `/server/${serv.server_id}/channel/${serv.channel_id}`,
                            );
                        }
                        const dispose = autorun(() => {
                            const server = client.servers.get(serv.server_id);

                            defer(() => {
                                if (server) {
                                    client.unreads!.markMultipleRead(
                                        server.channel_ids,
                                    );

                                    history.push(
                                        `/server/${server._id}/channel/${serv.channel_id}`,
                                    );
                                }
                            });

                            dispose();
                        });
                        await client.joinInvite(code);
                    }}
                />
            );
        }
        case "set_custom_status": {
            return (
                <InputModal
                    onClose={onClose}
                    question={<Text id="app.context_menu.set_custom_status" />}
                    field={<Text id="app.context_menu.custom_status" />}
                    defaultValue={client.user?.status?.text}
                    callback={(text) =>
                        client.users.edit({
                            status: {
                                ...client.user?.status,
                                text: text.trim().length > 0 ? text : undefined,
                            },
                        })
                    }
                />
            );
        }
        case "add_friend": {
            return (
                <InputModal
                    onClose={onClose}
                    question={"Add Friend"}
                    callback={(username) =>
                        client
                            .req(
                                "PUT",
                                `/users/${username}/friend` as "/users/id/friend",
                            )
                            .then(undefined)
                    }
                />
            );
        }
        default:
            return null;
    }
}
