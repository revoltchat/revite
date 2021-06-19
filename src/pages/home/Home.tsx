import { useChannels, useForceUpdate, useServers, useUser } from "../../context/revoltjs/hooks";
import ChannelIcon from "../../components/common/ChannelIcon";
import ServerIcon from "../../components/common/ServerIcon";
import UserIcon from "../../components/common/UserIcon";
import PaintCounter from "../../lib/PaintCounter";

export function Nested() {
    const ctx = useForceUpdate();

    let user = useUser('01EX2NCWQ0CHS3QJF0FEQS1GR4', ctx)!;
    let user2 = useUser('01EX40TVKYNV114H8Q8VWEGBWQ', ctx)!;
    let user3 = useUser('01F5GV44HTXP3MTCD2VPV42DPE', ctx)!;

    let channels = useChannels(undefined, ctx);
    let servers = useServers(undefined, ctx);

    return (
        <>
            <h3>Nested component</h3>
            <PaintCounter />
            @{ user.username } is { user.online ? 'online' : 'offline' }<br/><br/>

            <h3>UserIcon Tests</h3>
            <UserIcon size={64} target={user} />
            <UserIcon size={64} target={user} status />
            <UserIcon size={64} target={user} voice='muted' />
            <UserIcon size={64} attachment={user2.avatar} />
            <UserIcon size={64} attachment={user3.avatar} />
            <UserIcon size={64} attachment={user3.avatar} animate />

            <h3>Channels</h3>
            { channels.map(channel =>
                channel &&
                channel.channel_type !== 'SavedMessages' &&
                channel.channel_type !== 'DirectMessage' &&
                <ChannelIcon size={48} target={channel} />
            ) }

            <h3>Servers</h3>
            { servers.map(server =>
                server &&
                <ServerIcon size={48} target={server} />
            ) }

            <br/><br/>
            <p>{ 'test long paragraph'.repeat(2000) }</p>
        </>
    )
}

export default function Home() {
    return (
        <div style={{ overflowY: 'scroll', height: '100vh' }}>
            <h1>HOME</h1>
            <PaintCounter />
            <Nested />
        </div>
    );
}
