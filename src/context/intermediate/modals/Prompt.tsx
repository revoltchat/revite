import { observer } from "mobx-react-lite";
import { useHistory } from "react-router-dom";
import { Channel, Message as MessageI, Server, User } from "revolt.js";
import { ulid } from "ulid";

import styles from "./Prompt.module.scss";
import { Text } from "preact-i18n";
import { useContext, useEffect, useState } from "preact/hooks";

import { Category, Modal, InputBox, Radio } from "@revoltchat/ui";
import type { Action } from "@revoltchat/ui/esm/components/design/atoms/display/Modal";

import { TextReact } from "../../../lib/i18n";

import Message from "../../../components/common/messaging/Message";
import UserIcon from "../../../components/common/user/UserIcon";
import { I18nError } from "../../Locale";
import { AppContext } from "../../revoltjs/RevoltClient";
import { takeError } from "../../revoltjs/util";
import { useIntermediate } from "../Intermediate";

interface Props {
    onClose: () => void;
    question: Children;
    content?: Children;
    disabled?: boolean;
    actions: Action[];
    error?: string;
}

export function PromptModal({
    onClose,
    question,
    content,
    actions,
    disabled,
    error,
}: Props) {
    return (
        <Modal
            title={question}
            actions={actions}
            onClose={onClose}
            disabled={disabled}>
            {error && (
                <Category>
                    <I18nError error={error} />
                </Category>
            )}
            {content}
        </Modal>
    );
}

type SpecialProps = { onClose: () => void } & (
    | { type: "leave_group"; target: Channel }
    | { type: "close_dm"; target: Channel }
    | { type: "leave_server"; target: Server }
    | { type: "delete_server"; target: Server }
    | { type: "delete_channel"; target: Channel }
    | { type: "delete_bot"; target: string; name: string; cb?: () => void }
    | { type: "delete_message"; target: MessageI }
    | {
          type: "create_invite";
          target: Channel;
      }
    | { type: "kick_member"; target: Server; user: User }
    | { type: "ban_member"; target: Server; user: User }
    | { type: "unfriend_user"; target: User }
    | { type: "block_user"; target: User }
    | {
          type: "create_channel";
          target: Server;
          cb?: (
              channel: Channel & {
                  channel_type: "TextChannel" | "VoiceChannel";
              },
          ) => void;
      }
    | { type: "create_category"; target: Server }
);

export const SpecialPromptModal = observer((props: SpecialProps) => {
    const client = useContext(AppContext);
    const history = useHistory();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<undefined | string>(undefined);

    const { onClose } = props;
    switch (props.type) {
        case "leave_group":
        case "close_dm":
        case "leave_server":
        case "delete_server":
        case "delete_channel":
        case "delete_bot":
        case "unfriend_user":
        case "block_user": {
            const EVENTS = {
                close_dm: ["confirm_close_dm", "close"],
                delete_server: ["confirm_delete", "delete"],
                delete_channel: ["confirm_delete", "delete"],
                delete_bot: ["confirm_delete", "delete"],
                leave_group: ["confirm_leave", "leave"],
                leave_server: ["confirm_leave", "leave"],
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
                <PromptModal
                    onClose={onClose}
                    question={
                        <Text
                            id={`app.special.modals.prompt.${event[0]}`}
                            fields={{ name }}
                        />
                    }
                    actions={[
                        {
                            confirmation: true,
                            palette: "error",
                            children: (
                                <Text
                                    id={`app.special.modals.actions.${event[1]}`}
                                />
                            ),
                            onClick: async () => {
                                setProcessing(true);

                                try {
                                    switch (props.type) {
                                        case "unfriend_user":
                                            await props.target.removeFriend();
                                            break;
                                        case "block_user":
                                            await props.target.blockUser();
                                            break;
                                        case "leave_group":
                                        case "close_dm":
                                        case "delete_channel":
                                        case "leave_server":
                                        case "delete_server":
                                            if (props.type != "delete_channel")
                                                history.push("/");
                                            props.target.delete();
                                            break;
                                        case "delete_bot":
                                            client.bots.delete(props.target);
                                            props.cb?.();
                                            break;
                                    }

                                    return true;
                                } catch (err) {
                                    setError(takeError(err));
                                    setProcessing(false);
                                    return false;
                                }
                            },
                        },
                        {
                            children: (
                                <Text id="app.special.modals.actions.cancel" />
                            ),
                            onClick: onClose,
                        },
                    ]}
                    content={
                        <TextReact
                            id={`app.special.modals.prompt.${event[0]}_long`}
                            fields={{ name: <b>{name}</b> }}
                        />
                    }
                    disabled={processing}
                    error={error}
                />
            );
        }
        case "delete_message": {
            return (
                <PromptModal
                    onClose={onClose}
                    question={<Text id={"app.context_menu.delete_message"} />}
                    actions={[
                        {
                            confirmation: true,
                            palette: "error",
                            children: (
                                <Text id="app.special.modals.actions.delete" />
                            ),
                            onClick: async () => {
                                setProcessing(true);

                                try {
                                    props.target.delete();
                                    return true;
                                } catch (err) {
                                    setError(takeError(err));
                                    setProcessing(false);
                                    return false;
                                }
                            },
                        },
                        {
                            children: (
                                <Text id="app.special.modals.actions.cancel" />
                            ),
                            onClick: onClose,
                            palette: "plain",
                        },
                    ]}
                    content={
                        <>
                            <h5>
                                <Text
                                    id={`app.special.modals.prompt.confirm_delete_message_long`}
                                />
                            </h5>
                            <Message
                                message={props.target}
                                head={true}
                                contrast
                            />
                        </>
                    }
                    disabled={processing}
                    error={error}
                />
            );
        }
        case "create_invite": {
            const [code, setCode] = useState("abcdef");
            const { writeClipboard } = useIntermediate();

            useEffect(() => {
                setProcessing(true);

                props.target
                    .createInvite()
                    .then(({ _id }) => setCode(_id))
                    .catch((err) => setError(takeError(err)))
                    .finally(() => setProcessing(false));
            }, [props.target]);

            return (
                <PromptModal
                    onClose={onClose}
                    question={<Text id={`app.context_menu.create_invite`} />}
                    actions={[
                        {
                            children: (
                                <Text id="app.special.modals.actions.ok" />
                            ),
                            confirmation: true,
                            onClick: onClose,
                        },
                        {
                            children: <Text id="app.context_menu.copy_link" />,
                            onClick: () =>
                                writeClipboard(
                                    `${window.location.protocol}//${window.location.host}/invite/${code}`,
                                ),
                        },
                    ]}
                    content={
                        processing ? (
                            <Text id="app.special.modals.prompt.create_invite_generate" />
                        ) : (
                            <div className={styles.invite}>
                                <Text id="app.special.modals.prompt.create_invite_created" />
                                <code>{code}</code>
                            </div>
                        )
                    }
                    disabled={processing}
                    error={error}
                />
            );
        }
        case "kick_member": {
            return (
                <PromptModal
                    onClose={onClose}
                    question={<Text id={`app.context_menu.kick_member`} />}
                    actions={[
                        {
                            children: (
                                <Text id="app.special.modals.actions.kick" />
                            ),
                            palette: "error",
                            confirmation: true,
                            onClick: async () => {
                                setProcessing(true);

                                try {
                                    client.members
                                        .getKey({
                                            server: props.target._id,
                                            user: props.user._id,
                                        })
                                        ?.kick();

                                    return true;
                                } catch (err) {
                                    setError(takeError(err));
                                    setProcessing(false);
                                    return false;
                                }
                            },
                        },
                        {
                            children: (
                                <Text id="app.special.modals.actions.cancel" />
                            ),
                            onClick: onClose,
                        },
                    ]}
                    content={
                        <div className={styles.column}>
                            <UserIcon target={props.user} size={64} />
                            <Text
                                id="app.special.modals.prompt.confirm_kick"
                                fields={{ name: props.user?.username }}
                            />
                        </div>
                    }
                    disabled={processing}
                    error={error}
                />
            );
        }
        case "ban_member": {
            const [reason, setReason] = useState<string | undefined>(undefined);

            return (
                <PromptModal
                    onClose={onClose}
                    question={<Text id={`app.context_menu.ban_member`} />}
                    actions={[
                        {
                            children: (
                                <Text id="app.special.modals.actions.ban" />
                            ),
                            palette: "error",

                            confirmation: true,
                            onClick: async () => {
                                setProcessing(true);

                                try {
                                    await props.target.banUser(props.user._id, {
                                        reason,
                                    });

                                    return true;
                                } catch (err) {
                                    setError(takeError(err));
                                    setProcessing(false);
                                    return false;
                                }
                            },
                        },
                        {
                            children: (
                                <Text id="app.special.modals.actions.cancel" />
                            ),
                            onClick: onClose,
                        },
                    ]}
                    content={
                        <div className={styles.column}>
                            <UserIcon target={props.user} size={64} />
                            <Text
                                id="app.special.modals.prompt.confirm_ban"
                                fields={{ name: props.user?.username }}
                            />
                            <Category>
                                <Text id="app.special.modals.prompt.confirm_ban_reason" />
                            </Category>
                            <InputBox
                                value={reason ?? ""}
                                onChange={(e) =>
                                    setReason(e.currentTarget.value)
                                }
                            />
                        </div>
                    }
                    disabled={processing}
                    error={error}
                />
            );
        }
        case "create_channel": {
            const [name, setName] = useState("");
            const [type, setType] = useState<"Text" | "Voice">("Text");
            const history = useHistory();

            return (
                <PromptModal
                    onClose={onClose}
                    question={<Text id="app.context_menu.create_channel" />}
                    actions={[
                        {
                            confirmation: true,
                            palette: "secondary",

                            children: (
                                <Text id="app.special.modals.actions.create" />
                            ),
                            onClick: async () => {
                                setProcessing(true);

                                try {
                                    const channel =
                                        await props.target.createChannel({
                                            type,
                                            name,
                                        });

                                    if (props.cb) {
                                        props.cb(channel as any);
                                    } else {
                                        history.push(
                                            `/server/${props.target._id}/channel/${channel._id}`,
                                        );
                                    }

                                    return true;
                                } catch (err) {
                                    setError(takeError(err));
                                    setProcessing(false);
                                    return false;
                                }
                            },
                        },
                        {
                            children: (
                                <Text id="app.special.modals.actions.cancel" />
                            ),
                            onClick: onClose,
                        },
                    ]}
                    content={
                        <>
                            <Category>
                                <Text id="app.main.servers.channel_type" />
                            </Category>
                            <Radio
                                title={
                                    <Text id="app.main.servers.text_channel" />
                                }
                                value={type === "Text"}
                                onSelect={() => setType("Text")}
                            />
                            <Radio
                                title={
                                    <Text id="app.main.servers.voice_channel" />
                                }
                                value={type === "Voice"}
                                onSelect={() => setType("Voice")}
                            />
                            <Category>
                                <Text id="app.main.servers.channel_name" />
                            </Category>
                            <InputBox
                                value={name}
                                onChange={(e) => setName(e.currentTarget.value)}
                            />
                        </>
                    }
                    disabled={processing}
                    error={error}
                />
            );
        }
        case "create_category": {
            const [name, setName] = useState("");

            return (
                <PromptModal
                    onClose={onClose}
                    question={<Text id="app.context_menu.create_category" />}
                    actions={[
                        {
                            confirmation: true,
                            palette: "secondary",
                            children: (
                                <Text id="app.special.modals.actions.create" />
                            ),
                            onClick: async () => {
                                setProcessing(true);
                                try {
                                    props.target.edit({
                                        categories: [
                                            ...(props.target.categories ?? []),
                                            {
                                                id: ulid(),
                                                title: name,
                                                channels: [],
                                            },
                                        ],
                                    });

                                    setProcessing(false);
                                    return true;
                                } catch (err) {
                                    setError(takeError(err));
                                    setProcessing(false);
                                    return false;
                                }
                            },
                        },
                        {
                            children: (
                                <Text id="app.special.modals.actions.cancel" />
                            ),
                            onClick: onClose,
                        },
                    ]}
                    content={
                        <>
                            <Category>
                                <Text id="app.main.servers.category_name" />
                            </Category>
                            <InputBox
                                value={name}
                                onChange={(e) => setName(e.currentTarget.value)}
                            />
                        </>
                    }
                    disabled={processing}
                    error={error}
                />
            );
        }
        default:
            return null;
    }
});
