import { Text } from "preact-i18n";
import styles from './Prompt.module.scss';
import { Children } from "../../../types/Preact";
import { useIntermediate } from "../Intermediate";
import InputBox from "../../../components/ui/InputBox";
import Overline from "../../../components/ui/Overline";
import UserIcon from "../../../components/common/UserIcon";
import Modal, { Action } from "../../../components/ui/Modal";
import { Channels, Servers } from "revolt.js/dist/api/objects";
import { useContext, useEffect, useState } from "preact/hooks";
import { AppContext } from "../../revoltjs/RevoltClient";
import { mapMessage, takeError } from "../../revoltjs/util";
import Message from "../../../components/common/messaging/Message";

interface Props {
    onClose: () => void;
    question: Children;
    content?: Children;
    disabled?: boolean;
    actions: Action[];
    error?: string;
}

export function PromptModal({ onClose, question, content, actions, disabled, error }: Props) {
    return (
        <Modal
            visible={true}
            title={question}
            actions={actions}
            onClose={onClose}
            disabled={disabled}>
            { error && <Overline error={error} type="error" /> }
            { content }
        </Modal>
    );
}

type SpecialProps = { onClose: () => void } & (
    { type: "leave_group", target: Channels.GroupChannel } |
    { type: "close_dm", target: Channels.DirectMessageChannel } |
    { type: "leave_server", target: Servers.Server } |
    { type: "delete_server", target: Servers.Server } |
    { type: "delete_channel", target: Channels.TextChannel } |
    { type: "delete_message", target: Channels.Message } |
    { type: "create_invite", target: Channels.TextChannel | Channels.GroupChannel } |
    { type: "kick_member", target: Servers.Server, user: string } |
    { type: "ban_member", target: Servers.Server, user: string }
)

export function SpecialPromptModal(props: SpecialProps) {
    const client = useContext(AppContext);
    const [ processing, setProcessing ] = useState(false);
    const [ error, setError ] = useState<undefined | string>(undefined);

    const { onClose } = props;
    switch (props.type) {
        case 'leave_group':
        case 'close_dm':
        case 'leave_server':
        case 'delete_server': 
        case 'delete_channel': {
            const EVENTS = {
                'close_dm':       'confirm_close_dm',
                'delete_server':  'confirm_delete',
                'delete_channel': 'confirm_delete',
                'leave_group':    'confirm_leave',
                'leave_server':   'confirm_leave'
            };

            let event = EVENTS[props.type];
            let name = props.type === 'close_dm' ? client.users.get(client.channels.getRecipient(props.target._id))?.username : props.target.name;

            return (
                <PromptModal
                    onClose={onClose}
                    question={<Text
                        id={`app.special.modals.prompt.${event}`}
                        fields={{ name }}
                    />}
                    actions={[
                        {
                            confirmation: true,
                            contrast: true,
                            error: true,
                            text: <Text id="app.special.modals.actions.delete" />,
                            onClick: async () => {
                                setProcessing(true);

                                try {
                                    if (props.type === 'leave_group' || props.type === 'close_dm' || props.type === 'delete_channel') {
                                        await client.channels.delete(props.target._id);
                                    } else {
                                        await client.servers.delete(props.target._id);
                                    }

                                    onClose();
                                } catch (err) {
                                    setError(takeError(err));
                                    setProcessing(false);
                                }
                            }
                        },
                        { text: <Text id="app.special.modals.actions.cancel" />, onClick: onClose }
                    ]}
                    content={<Text id={`app.special.modals.prompt.${event}_long`} />}
                    disabled={processing}
                    error={error}
                />
            )
        }
        case 'delete_message': {
            return (
                <PromptModal
                    onClose={onClose}
                    question={<Text id={'app.context_menu.delete_message'} />}
                    actions={[
                        {
                            confirmation: true,
                            contrast: true,
                            error: true,
                            text: <Text id="app.special.modals.actions.delete" />,
                            onClick: async () => {
                                setProcessing(true);

                                try {
                                    await client.channels.deleteMessage(props.target.channel, props.target._id);

                                    onClose();
                                } catch (err) {
                                    setError(takeError(err));
                                    setProcessing(false);
                                }
                            }
                        },
                        { text: <Text id="app.special.modals.actions.cancel" />, onClick: onClose }
                    ]}
                    content={<>
                        <Text id={`app.special.modals.prompt.confirm_delete_message_long`} />
                        <Message message={mapMessage(props.target)} head={true} contrast />
                    </>}
                    disabled={processing}
                    error={error}
                />
            )
        }
        case "create_invite": {
            const [ code, setCode ] = useState('abcdef');
            const { writeClipboard } = useIntermediate();

            useEffect(() => {
                setProcessing(true);

                client.channels.createInvite(props.target._id)
                    .then(code => setCode(code))
                    .catch(err => setError(takeError(err)))
                    .finally(() => setProcessing(false));
            }, []);

            return (
                <PromptModal
                    onClose={onClose}
                    question={<Text id={`app.context_menu.create_invite`} />}
                    actions={[
                        {
                            text: <Text id="app.special.modals.actions.ok" />,
                            confirmation: true,
                            onClick: onClose
                        },
                        {
                            text: <Text id="app.context_menu.copy_link" />,
                            onClick: () => writeClipboard(`${window.location.protocol}//${window.location.host}/invite/${code}`)
                        }
                    ]}
                    content={
                        processing ?
                            <Text id="app.special.modals.prompt.create_invite_generate" />
                          : <div className={styles.invite}>
                              <Text id="app.special.modals.prompt.create_invite_created" />
                              <code>{code}</code>
                            </div>
                    }
                    disabled={processing}
                    error={error}
                />
            )
        }
        case "kick_member": {
            const user = client.users.get(props.user);

            return (
                <PromptModal
                    onClose={onClose}
                    question={<Text id={`app.context_menu.kick_member`} />}
                    actions={[
                        {
                            text: <Text id="app.special.modals.actions.kick" />,
                            contrast: true,
                            error: true,
                            confirmation: true,
                            onClick: async () => {
                                setProcessing(true);
                                
                                try {
                                    await client.servers.members.kickMember(props.target._id, props.user);
                                    onClose();
                                } catch (err) {
                                    setError(takeError(err));
                                    setProcessing(false);
                                }
                            }
                        },
                        { text: <Text id="app.special.modals.actions.cancel" />, onClick: onClose }
                    ]}
                    content={<div className={styles.column}>
                        <UserIcon target={user} size={64} />
                        <Text
                            id="app.special.modals.prompt.confirm_kick"
                            fields={{ name: user?.username }} />
                    </div>}
                    disabled={processing}
                    error={error}
                />
            )
        }
        case "ban_member": {
            const [ reason, setReason ] = useState<string | undefined>(undefined);
            const user = client.users.get(props.user);

            return (
                <PromptModal
                    onClose={onClose}
                    question={<Text id={`app.context_menu.ban_member`} />}
                    actions={[
                        {
                            text: <Text id="app.special.modals.actions.ban" />,
                            contrast: true,
                            error: true,
                            confirmation: true,
                            onClick: async () => {
                                setProcessing(true);
                                
                                try {
                                    await client.servers.banUser(props.target._id, props.user, { reason });
                                    onClose();
                                } catch (err) {
                                    setError(takeError(err));
                                    setProcessing(false);
                                }
                            }
                        },
                        { text: <Text id="app.special.modals.actions.cancel" />, onClick: onClose }
                    ]}
                    content={<div className={styles.column}>
                        <UserIcon target={user} size={64} />
                        <Text
                            id="app.special.modals.prompt.confirm_ban"
                            fields={{ name: user?.username }} />
                        <Overline><Text id="app.special.modals.prompt.confirm_ban_reason" /></Overline>
                        <InputBox value={reason ?? ''} onChange={e => setReason(e.currentTarget.value)} />
                    </div>}
                    disabled={processing}
                    error={error}
                />
            )
        }
        default: return null;
    }
}
