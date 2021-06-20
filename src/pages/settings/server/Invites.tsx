import styles from './Panes.module.scss';
import { XCircle } from "@styled-icons/feather";
import { useEffect, useState } from "preact/hooks";
import Preloader from "../../../components/ui/Preloader";
import IconButton from "../../../components/ui/IconButton";
import UserIcon from "../../../components/common/user/UserIcon";
import { getChannelName } from "../../../context/revoltjs/util";
import { Invites as InvitesNS, Servers } from "revolt.js/dist/api/objects";
import { useChannels, useForceUpdate, useUsers } from "../../../context/revoltjs/hooks";

interface Props {
    server: Servers.Server;
}

export function Invites({ server }: Props) {
    const [invites, setInvites] = useState<InvitesNS.ServerInvite[] | undefined>(undefined);

    const ctx = useForceUpdate();
    const [deleting, setDelete] = useState<string[]>([]);
    const users = useUsers(invites?.map(x => x.creator) ?? [], ctx);
    const channels = useChannels(invites?.map(x => x.channel) ?? [], ctx);

    useEffect(() => {
        ctx.client.servers.fetchInvites(server._id)
            .then(invites => setInvites(invites))
    }, [ ]);

    return (
        <div className={styles.invites}>
            { typeof invites === 'undefined' && <Preloader /> }
            {
                invites?.map(
                    invite => {
                        let creator = users.find(x => x?._id === invite.creator);
                        let channel = channels.find(x => x?._id === invite.channel);

                        return (
                            <div className={styles.invite}
                                data-deleting={deleting.indexOf(invite._id) > -1}>
                                <code>{ invite._id }</code>
                                <span>
                                    <UserIcon target={creator} size={24} /> {creator?.username ?? 'unknown'}
                                </span>
                                <span>{ (channel && creator) ? getChannelName(ctx.client, channel, true) : '#unknown' }</span>
                                <IconButton
                                    onClick={async () => {
                                        setDelete([
                                            ...deleting,
                                            invite._id
                                        ]);

                                        await ctx.client.deleteInvite(invite._id);
                                        
                                        setInvites(
                                            invites?.filter(
                                                x => x._id !== invite._id
                                            )
                                        );
                                    }}
                                    disabled={deleting.indexOf(invite._id) > -1}>
                                    <XCircle size={24} />
                                </IconButton>
                            </div>
                        )
                    }
                )
            }
        </div>
    );
}
