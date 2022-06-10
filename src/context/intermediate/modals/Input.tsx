import { useHistory } from "react-router";
import { Server } from "revolt.js";

import { Text } from "preact-i18n";
import { useContext, useState } from "preact/hooks";

import { Category, InputBox, Modal } from "@revoltchat/ui";

import { I18nError } from "../../Locale";
import { AppContext } from "../../revoltjs/RevoltClient";
import { takeError } from "../../revoltjs/util";

interface Props {
    onClose: () => void;
    question: Children;
    field?: Children;
    description?: Children;
    defaultValue?: string;
    callback: (value: string) => Promise<void>;
}

export function InputModal({
    onClose,
    question,
    field,
    description,
    defaultValue,
    callback,
}: Props) {
    const [processing, setProcessing] = useState(false);
    const [value, setValue] = useState(defaultValue ?? "");
    const [error, setError] = useState<undefined | string>(undefined);

    return (
        <Modal
            title={question}
            description={description}
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
                <Category>
                    <I18nError error={error}>{field}</I18nError>
                </Category>
            ) : (
                error && (
                    <Category>
                        <I18nError error={error} />
                    </Category>
                )
            )}
            <InputBox
                value={value}
                style={{ width: "100%" }}
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
                    description={
                        <div>
                            By creating this server, you agree to the{" "}
                            <a
                                href="https://revolt.chat/aup"
                                target="_blank"
                                rel="noreferrer">
                                Acceptable Use Policy.
                            </a>
                        </div>
                    }
                    callback={async (name) => {
                        const server = await client.servers.createServer({
                            name,
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
        case "set_custom_status": {
            return (
                <InputModal
                    onClose={onClose}
                    question={<Text id="app.context_menu.set_custom_status" />}
                    field={<Text id="app.context_menu.custom_status" />}
                    defaultValue={client.user?.status?.text ?? undefined}
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
                        client.api
                            .put(`/users/${username as ""}/friend`)
                            .then(undefined)
                    }
                />
            );
        }
        default:
            return null;
    }
}
