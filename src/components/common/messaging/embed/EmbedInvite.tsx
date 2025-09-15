import { Group } from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import { useHistory } from "react-router-dom";
import { Message } from "revolt.js";
import styled, { css } from "styled-components/macro";

import { useEffect, useState } from "preact/hooks";

import { Button, Category, Preloader } from "@revoltchat/ui";

import { isTouchscreenDevice } from "../../../../lib/isTouchscreenDevice";

import { I18nError } from "../../../../context/Locale";

import ServerIcon from "../../../../components/common/ServerIcon";
import { useSession } from "../../../../controllers/client/ClientController";
import { takeError } from "../../../../controllers/client/jsx/error";

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

function isServerInvite(invite: any): boolean {
    // Makes sure something is actually an invite, not.. wiki.rvlt.gg/
    return invite?.type === "Server";
}

function isGroupInvite(invite: any): boolean {
    // Might as well handles these too properly, rather than previous N/A
    return invite?.type === "Group";
}

export function EmbedInvite({ code }: Props) {
    const history = useHistory();
    const session = useSession()!;
    const client = session.client!;
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);
    const [joinError, setJoinError] = useState<string | undefined>(undefined);
    const [invite, setInvite] = useState<any>(undefined);

    useEffect(() => {
        if (
            typeof invite === "undefined" &&
            (session.state === "Online" || session.state === "Ready")
        ) {
            client.api
                .get(`/invites/${code}`)
                .then((raw) => setInvite(raw))
                .catch((err) => setError(takeError(err)));
        }
    }, [client, code, invite, session.state]);

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
                    attachment={
                        invite.type === "Server"
                            ? invite.server_icon
                            : invite.type === "Group"
                            ? invite.user_avatar
                            : undefined
                    }
                    server_name={
                        invite.type === "Server"
                            ? invite.server_name
                            : invite.type === "Group"
                            ? invite.user_name
                            : undefined
                    }
                    size={55}
                />

                <EmbedInviteDetails>
                    {invite.type === "Server" && (
                        <>
                            <EmbedInviteName>
                                {invite.server_name}
                            </EmbedInviteName>
                            <EmbedInviteMemberCount>
                                <Group size={12} />
                                {invite.member_count != null
                                    ? `${invite.member_count.toLocaleString()} ${
                                          invite.member_count === 1
                                              ? "member"
                                              : "members"
                                      }`
                                    : "N/A"}
                            </EmbedInviteMemberCount>
                        </>
                    )}

                    {invite.type === "Group" && (
                        <>
                            <EmbedInviteName>
                                {invite.channel_name}
                            </EmbedInviteName>
                            <div
                                style={{
                                    fontSize: "0.8em",
                                    color: "var(--secondary-foreground)",
                                }}>
                                Group chat by {invite.user_name}
                            </div>
                        </>
                    )}
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
                                if (isServerInvite(invite)) {
                                    history.push(
                                        `/server/${invite.server_id}/channel/${invite.channel_id}`,
                                    );
                                } else if (isGroupInvite(invite)) {
                                    history.push(
                                        `/channel/${invite.channel_id}`,
                                    );
                                }
                            } catch (err) {
                                setJoinError(takeError(err));
                            } finally {
                                setProcessing(false);
                            }
                        }}>
                        {isGroupInvite(invite)
                            ? "View" // Not implementing a proper check here
                            : isServerInvite(invite) &&
                              client.servers.has(invite.server_id)
                            ? "Joined"
                            : "Join"}
                    </Button>
                )}
            </EmbedInviteBase>
            {joinError && (
                <Category>
                    <I18nError error={joinError} />
                </Category>
            )}
        </>
    );
}

const INVITE_PATHS = [
    `${location.hostname}/invite`,
    "app.revolt.chat/invite",
    "local.revolt.chat/invite",
    "rvlt.gg",
];

const RE_INVITE = new RegExp(
    `(?:${INVITE_PATHS.map((x) => x.replaceAll(".", "\\.")).join(
        "|",
    )})/([^\\s/]+)`,
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
