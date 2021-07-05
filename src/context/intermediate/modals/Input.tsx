import { useHistory } from "react-router";
import { ulid } from "ulid";

import { Text } from "preact-i18n";
import { useContext, useState } from "preact/hooks";

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
                    text: <Text id="app.special.modals.actions.ok" />,
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
                    text: <Text id="app.special.modals.actions.cancel" />,
                    onClick: onClose,
                },
            ]}
            onClose={onClose}>
            <form>
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
            </form>
        </Modal>
    );
}

type SpecialProps = { onClose: () => void } & (
    | {
          type:
              | "create_group"
              | "create_server"
              | "set_custom_status"
              | "add_friend";
      }
    | { type: "create_role"; server: string; callback: (id: string) => void }
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
                        const role = await client.servers.createRole(
                            props.server,
                            name,
                        );
                        props.callback(role.id);
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
                        client.users.editUser({
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
                    callback={(username) => client.users.addFriend(username)}
                />
            );
        }
        default:
            return null;
    }
}
