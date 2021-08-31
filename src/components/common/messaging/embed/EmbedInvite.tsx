import styled from "styled-components";

import { autorun } from "mobx";
import { useHistory } from "react-router-dom";
import { RetrievedInvite } from "revolt-api/types/Invites";

import { useContext, useEffect, useState } from "preact/hooks";

import { defer } from "../../../../lib/defer";

import { dispatch } from "../../../../redux";

import { useClient } from "../../../../context/revoltjs/RevoltClient";

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
`;
const EmbedInviteDetails = styled.div`
    flex-grow: 1;
    padding-left: 12px;
`;
const EmbedInviteName = styled.div`
    font-weight: bold;
`;
const EmbedInviteMemberCount = styled.div`
    font-size: 0.8em;
`;

type Props = {
    code: string
}

export default function EmbedInvite(props: Props) {
    const history = useHistory();
    const client = useContext(AppContext);
    const status = useContext(StatusContext);
    const code = props.code;
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);
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
        return <EmbedInviteBase>
            {error ? (
                <Overline type="error" error={error} />
            ) : (
                <Preloader type="ring" />
            )}
        </EmbedInviteBase>
    }
    
    return <EmbedInviteBase>
        <ServerIcon
            attachment={invite.server_icon}
            server_name={invite.server_name}
            size={55}
        />
        <EmbedInviteDetails>
            <EmbedInviteName>
                {invite.server_name}
            </EmbedInviteName>
            <EmbedInviteMemberCount>
                {invite.member_count} members
            </EmbedInviteMemberCount>
        </EmbedInviteDetails>
        <Button onClick={async () => {
            try {
                setProcessing(true);

                if (invite.type === "Server") {
                    if (
                        client.servers.get(invite.server_id)
                    ) {
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
                                    channels:
                                        server.channel_ids,
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
                setError(takeError(err));
                setProcessing(false);
            }
        }}>
            {client.servers.get(invite.server_id) ? "Joined" : "Join"}
        </Button>
    </EmbedInviteBase>
}
