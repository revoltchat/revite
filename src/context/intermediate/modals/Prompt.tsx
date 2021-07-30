import { observer } from "mobx-react-lite";
import { useHistory } from "react-router-dom";
import { Channel } from "revolt.js/dist/maps/Channels";
import { Message as MessageI } from "revolt.js/dist/maps/Messages";
import { Server } from "revolt.js/dist/maps/Servers";
import { User } from "revolt.js/dist/maps/Users";
import { ulid } from "ulid";

import styles from "./Prompt.module.scss";
import { Text } from "preact-i18n";
import { useContext, useEffect, useState } from "preact/hooks";

import { TextReact } from "../../../lib/i18n";

import Message from "../../../components/common/messaging/Message";
import UserIcon from "../../../components/common/user/UserIcon";
import InputBox from "../../../components/ui/InputBox";
import Modal, { Action } from "../../../components/ui/Modal";
import Overline from "../../../components/ui/Overline";
import Radio from "../../../components/ui/Radio";

import { Children } from "../../../types/Preact";
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
            visible={true}
            title={question}
            actions={actions}
            onClose={onClose}
            disabled={disabled}>
            {error && <Overline error={error} type="error" />}
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
    | { type: "delete_message"; target: MessageI }
    | {
          type: "create_invite";
          target: Channel;
      }
    | { type: "kick_member"; target: Server; user: User }
    | { type: "ban_member"; target: Server; user: User }
    | { type: "unfriend_user"; target: User }
    | { type: "block_user"; target: User }
    | { type: "create_channel"; target: Server }
);

export const SpecialPromptModal = observer((props: SpecialProps) => {
    const client = useContext(AppContext);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<undefined | string>(undefined);

    const { onClose } = props;
    switch (props.type) {
        case "leave_group":
        case "close_dm":
        case "leave_server":
        case "delete_server":
        case "delete_channel":
        case "unfriend_user":
        case "block_user": {
            const EVENTS = {
                close_dm: ["confirm_close_dm", "close"],
                delete_server: ["confirm_delete", "delete"],
                delete_channel: ["confirm_delete", "delete"],
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
                            contrast: true,
                            error: true,
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
                                            props.target.delete();
                                            break;
                                        case "leave_server":
                                        case "delete_server":
                                            props.target.delete();
                                            break;
                                    }

                                    onClose();
                                } catch (err) {
                                    setError(takeError(err));
                                    setProcessing(false);
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
                            contrast: true,
                            error: true,
                            children: (
                                <Text id="app.special.modals.actions.delete" />
                            ),
                            onClick: async () => {
                                setProcessing(true);

                                try {
                                    props.target.deleteMessage();
                                    onClose();
                                } catch (err) {
                                    setError(takeError(err));
                                    setProcessing(false);
                                }
                            },
                        },
                        {
                            children: (
                                <Text id="app.special.modals.actions.cancel" />
                            ),
                            onClick: onClose,
                            plain: true,
                        },
                    ]}
                    content={
                        <>
                            <Text
                                id={`app.special.modals.prompt.confirm_delete_message_long`}
                            />
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
                    .then((code) => setCode(code))
                    .catch((err) => setError(takeError(err)))
                    .finally(() => setProcessing(false));
            }, []);

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
                            contrast: true,
                            error: true,
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

                                    onClose();
                                } catch (err) {
                                    setError(takeError(err));
                                    setProcessing(false);
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
                            contrast: true,
                            error: true,
                            confirmation: true,
                            onClick: async () => {
                                setProcessing(true);

                                try {
                                    await props.target.banUser(props.user._id, {
                                        reason,
                                    });
                                    onClose();
                                } catch (err) {
                                    setError(takeError(err));
                                    setProcessing(false);
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
                            <Overline>
                                <Text id="app.special.modals.prompt.confirm_ban_reason" />
                            </Overline>
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
                            contrast: true,
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
                                            nonce: ulid(),
                                        });

                                    history.push(
                                        `/server/${props.target._id}/channel/${channel._id}`,
                                    );
                                    onClose();
                                } catch (err) {
                                    setError(takeError(err));
                                    setProcessing(false);
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
                            <Overline block type="subtle">
                                <Text id="app.main.servers.channel_type" />
                            </Overline>
                            <Radio
                                checked={type === "Text"}
                                onSelect={() => setType("Text")}>
                                <Text id="app.main.servers.text_channel" />
                            </Radio>
                            <Radio
                                checked={type === "Voice"}
                                onSelect={() => setType("Voice")}>
                                <Text id="app.main.servers.voice_channel" />
                            </Radio>
                            <Overline block type="subtle">
                                <Text id="app.main.servers.channel_name" />
                            </Overline>
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
