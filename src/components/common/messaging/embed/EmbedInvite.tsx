import { Group } from "@styled-icons/boxicons-solid";
import { reaction } from "mobx";
import { observer } from "mobx-react-lite";
import { useHistory } from "react-router-dom";
import { Message, API } from "revolt.js";
import styled, { css } from "styled-components/macro";

import { useContext, useEffect, useState } from "preact/hooks";

import { Button } from "@revoltchat/ui";

import { isTouchscreenDevice } from "../../../../lib/isTouchscreenDevice";

import {
    AppContext,
    ClientStatus,
    StatusContext,
} from "../../../../context/revoltjs/RevoltClient";
import { takeError } from "../../../../context/revoltjs/util";

import ServerIcon from "../../../../components/common/ServerIcon";
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
        `}
`;

const EmbedInviteDetails = styled.div`
    flex-grow: 1;
    padding-inline-start: 12px;
    ${() =>
        isTouchscreenDevice &&
        css`
            width: calc(100% - 55px);
        `}
`;

const EmbedInviteName = styled.div`
    font-weight: bold;
    line-height: 1rem;
    max-height: 2rem;
    overflow: hidden;
`;

const EmbedInviteMemberCount = styled.div`
    display: flex;
    align-items: center;
    gap: 2px;
    font-size: 0.8em;

    > svg {
        color: var(--secondary-foreground);
    }
`;

type Props = {
    code: string;
};

export function EmbedInvite({ code }: Props) {
    const history = useHistory();
    const client = useContext(AppContext);
    const status = useContext(StatusContext);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);
    const [joinError, setJoinError] = useState<string | undefined>(undefined);
    const [invite, setInvite] = useState<
        (API.InviteResponse & { type: "Server" }) | undefined
    >(undefined);

    useEffect(() => {
        if (
            typeof invite === "undefined" &&
            (status === ClientStatus.ONLINE || status === ClientStatus.READY)
        ) {
            client
                .fetchInvite(code)
                .then((data) =>
                    setInvite(data as API.InviteResponse & { type: "Server" }),
                )
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
                        <Group size={12} />
                        {invite.member_count.toLocaleString()}{" "}
                        {invite.member_count === 1 ? "member" : "members"}
                    </EmbedInviteMemberCount>
                </EmbedInviteDetails>
                {processing ? (
                    <div>
                        <Preloader type="ring" />
                    </div>
                ) : (
                    <Button
                        onClick={async () => {
                            setProcessing(true);

                            try {
                                await client.joinInvite(invite);

                                history.push(
                                    `/server/${invite.server_id}/channel/${invite.channel_id}`,
                                );
                            } catch (err) {
                                setJoinError(takeError(err));
                            } finally {
                                setProcessing(false);
                            }
                        }}>
                        {client.servers.get(invite.server_id)
                            ? "Joined"
                            : "Join"}
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
                {entries.map(
                    (entry) =>
                        entry !== "discover" && (
                            <EmbedInvite key={entry} code={entry} />
                        ),
                )}
            </>
        );
    }

    return null;
});
