import { autorun } from "mobx";
import { observer } from "mobx-react-lite";
import { useHistory } from "react-router-dom";
import { RetrievedInvite } from "revolt-api/types/Invites";
import { Message } from "revolt.js/dist/maps/Messages";
import styled, { css } from "styled-components";

import { useContext, useEffect, useState } from "preact/hooks";

import { defer } from "../../../../lib/defer";
import { isTouchscreenDevice } from "../../../../lib/isTouchscreenDevice";

import { dispatch } from "../../../../redux";

import {
    AppContext,
    ClientStatus,
    StatusContext,
} from "../../../../context/revoltjs/RevoltClient";
import { takeError } from "../../../../context/revoltjs/util";

import ServerIcon from "../../../../components/common/ServerIcon";
import Button from "../../../../components/ui/Button";
import Overline from "../../../ui/Overline";
import Preloader from "../../../ui/Preloader";

const EmbedInviteBase = styled.div`
    width: 400px;
    height: 80px;
    background-color: var(--secondary-background);
    border-radius: var(--border-radius);
    display: flex;
    align-items: center;
    padding: 0 12px;
    margin-top: 2px;
    ${() => 
        isTouchscreenDevice &&
        css`
            flex-wrap: wrap;
            height: 130px;
            padding-top: 8px;
            padding-bottom: 10px;
            width: 100%;
            > button {
                width: 100%;
            }
        `
    }
`;

const EmbedInviteDetails = styled.div`
    flex-grow: 1;
    padding-left: 12px;
    ${() => 
        isTouchscreenDevice &&
        css`
            width: calc(100% - 55px);
        `
    }
`;

const EmbedInviteName = styled.div`
    font-weight: bold;
    line-height: 1rem;
    max-height: 2rem;
    overflow: hidden;
`;

const EmbedInviteMemberCount = styled.div`
    font-size: 0.8em;
`;

type Props = {
    code: string;
};

export function EmbedInvite(props: Props) {
    const history = useHistory();
    const client = useContext(AppContext);
    const status = useContext(StatusContext);
    const code = props.code;
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);
    const [joinError, setJoinError] = useState<string | undefined>(undefined);
    const [invite, setInvite] = useState<RetrievedInvite | undefined>(
        undefined,
    );

    useEffect(() => {
        if (
            typeof invite === "undefined" &&
            (status === ClientStatus.ONLINE || status === ClientStatus.READY)
        ) {
            client
                .fetchInvite(code)
                .then((data) => setInvite(data))
                .catch((err) => setError(takeError(err)));
        }
    }, [client, code, invite, status]);

    if (typeof invite === "undefined") {
        return error ? (
            <EmbedInviteBase>
                <ServerIcon size={55} />
                <EmbedInviteDetails>
                    <EmbedInviteName>Invalid invite!</EmbedInviteName>
                </EmbedInviteDetails>
            </EmbedInviteBase>
        ) : (
            <EmbedInviteBase>
                <Preloader type="ring" />
            </EmbedInviteBase>
        );
    }

    return (
        <>
            <EmbedInviteBase>
                <ServerIcon
                    attachment={invite.server_icon}
                    server_name={invite.server_name}
                    size={55}
                />
                <EmbedInviteDetails>
                    <EmbedInviteName>{invite.server_name}</EmbedInviteName>
                    <EmbedInviteMemberCount>
                        {invite.member_count.toLocaleString()} members
                    </EmbedInviteMemberCount>
                </EmbedInviteDetails>
                {processing ? (
                    <div>
                        <Preloader type="ring" />
                    </div>
                ) : (
                    <Button
                        onClick={async () => {
                            try {
                                setProcessing(true);

                                if (invite.type === "Server") {
                                    if (client.servers.get(invite.server_id)) {
                                        history.push(
                                            `/server/${invite.server_id}/channel/${invite.channel_id}`,
                                        );
                                    }

                                    const dispose = autorun(() => {
                                        const server = client.servers.get(
                                            invite.server_id,
                                        );

                                        defer(() => {
                                            if (server) {
                                                dispatch({
                                                    type: "UNREADS_MARK_MULTIPLE_READ",
                                                    channels: server.channel_ids,
                                                });

                                                history.push(
                                                    `/server/${server._id}/channel/${invite.channel_id}`,
                                                );
                                            }
                                        });

                                        dispose();
                                    });
                                }

                                await client.joinInvite(code);
                            } catch (err) {
                                setJoinError(takeError(err));
                                setProcessing(false);
                            }
                        }}>
                        {client.servers.get(invite.server_id) ? "Joined" : "Join"}
                    </Button>
                )}
            </EmbedInviteBase>
            {joinError && <Overline type="error" error={joinError} />}
        </>
    );
}

const INVITE_PATHS = [
    `${location.hostname}/invite`,
    "app.revolt.chat/invite",
    "nightly.revolt.chat/invite",
    "local.revolt.chat/invite",
    "rvlt.gg",
];

const RE_INVITE = new RegExp(
    `(?:${INVITE_PATHS.map((x) => x.replaceAll(".", "\\.")).join(
        "|",
    )})/([A-Za-z0-9]*)`,
    "g",
);

export default observer(({ message }: { message: Message }) => {
    if (typeof message.content !== "string") return null;
    const matches = [...message.content.matchAll(RE_INVITE)];

    if (matches.length > 0) {
        const entries = [
            ...new Set(matches.slice(0, 5).map((x) => x[1])),
        ].slice(0, 5);

        return (
            <>
                {entries.map((entry) => (
                    <EmbedInvite key={entry} code={entry} />
                ))}
            </>
        );
    }

    return null;
});
