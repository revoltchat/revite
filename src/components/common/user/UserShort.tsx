import { TimeFive } from "@styled-icons/boxicons-regular";
import { observer } from "mobx-react-lite";
import { useParams } from "react-router-dom";
import { User, API } from "revolt.js";
import styled, { css } from "styled-components/macro";
import { decodeTime } from "ulid";

import { Ref } from "preact";
import { Text } from "preact-i18n";

import { internalEmit } from "../../../lib/eventEmitter";

import { dayjs } from "../../../context/Locale";

import { useClient } from "../../../controllers/client/ClientController";
import { modalController } from "../../../controllers/modals/ModalController";
import Tooltip from "../Tooltip";
import UserIcon from "./UserIcon";

// Configuration constant for easy adjustment
const NEW_MEMBER_THRESHOLD_DAYS = 14;

// Vendor badge flags - reusing existing enum values
const TRUSTED_SELLER_BADGE = 8;           // ResponsibleDisclosure
const VERIFIED_VENDOR_BADGE = 512;        // ReservedRelevantJokeBadge1  
const VERIFIED_MANUFACTURER_BADGE = 1024; // ReservedRelevantJokeBadge2

// Combined mask to check for any vendor badge
const VENDOR_BADGES_MASK = TRUSTED_SELLER_BADGE | VERIFIED_VENDOR_BADGE | VERIFIED_MANUFACTURER_BADGE;

const BotBadge = styled.div`
    display: inline-block;
    flex-shrink: 0;
    height: 1.4em;
    padding: 0 4px;
    font-size: 0.6em;
    user-select: none;
    text-transform: uppercase;
    color: var(--accent-contrast);
    background: var(--accent);
    border-radius: calc(var(--border-radius) / 2);
`;

const NewHereBadge = styled.div`
    display: inline-block;
    flex-shrink: 0;
    height: 1.3em;
    padding: 0 5px;
    font-size: 0.55em;
    font-weight: 600;
    user-select: none;
    text-transform: uppercase;
    color: white;
    background: #3BA55D;
    border-radius: 10px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
`;

const TrustedSellerBadge = styled.img`
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    vertical-align: middle;
`;

const BadgeWrapper = styled.span`
    display: flex;
    align-items: center;
    gap: 4px;
`;

type UsernameProps = Omit<
    JSX.HTMLAttributes<HTMLElement>,
    "children" | "as"
> & {
    user?: User;
    prefixAt?: boolean;
    masquerade?: API.Masquerade;
    showServerIdentity?: boolean | "both";

    override?: string;
    innerRef?: Ref<any>;
};

const Name = styled.span<{ colour?: string | null }>`
    ${(props) =>
        props.colour &&
        (props.colour.includes("gradient")
            ? css`
                  background: ${props.colour};
                  background-clip: text;
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
              `
            : css`
                  color: ${props.colour};
              `)}
`;

export const Username = observer(
    ({
        user,
        prefixAt,
        masquerade,
        showServerIdentity,
        innerRef,
        override,
        ...otherProps
    }: UsernameProps) => {
        let username =
            (user as unknown as { display_name: string })?.display_name ??
            user?.username;
        let color = masquerade?.colour;
        let timed_out: Date | undefined;
        let isNewHere = false;

        if (override) {
            username = override;
        } else if (user && showServerIdentity) {
            const { server } = useParams<{ server?: string }>();
            if (server) {
                const client = useClient();
                const member = client.members.getKey({
                    server,
                    user: user._id,
                });

                if (member) {
                    if (member.nickname) {
                        if (showServerIdentity === "both") {
                            username = `${member.nickname} (${username})`;
                        } else {
                            username = member.nickname;
                        }
                    }

                    if (member.timeout) {
                        timed_out = member.timeout;
                    }

                    if (!color) {
                        for (const [_, { colour }] of member.orderedRoles) {
                            if (colour) {
                                color = colour;
                            }
                        }
                    }
                }
            }
        }

        // Check if user account is new
        if (user) {
            // Extract account creation timestamp from user ID (ULID)
            const accountCreatedAt = decodeTime(user._id);
            const accountAge = dayjs().diff(dayjs(accountCreatedAt), 'day');
            isNewHere = accountAge <= NEW_MEMBER_THRESHOLD_DAYS;
        }

        // Check if user has any vendor badge
        const hasVendorBadge = user && user.badges && (user.badges & VENDOR_BADGES_MASK);

        const el = (
            <>
                <Name {...otherProps} ref={innerRef} colour={color}>
                    {prefixAt ? "@" : undefined}
                    {masquerade?.name ?? username ?? (
                        <Text id="app.main.channel.unknown_user" />
                    )}
                </Name>

                {timed_out && (
                    <Tooltip
                        content={
                            <Text
                                id="app.main.channel.user_timed_out"
                                fields={{
                                    time: dayjs(timed_out).fromNow(true),
                                }}
                            />
                        }>
                        <TimeFive
                            size={16}
                            color="var(--secondary-foreground)"
                        />
                    </Tooltip>
                )}
            </>
        );

        if (user?.bot) {
            return (
                <BadgeWrapper>
                    {el}
                    <BotBadge>
                        {masquerade ? (
                            <Text id="app.main.channel.bridge" />
                        ) : (
                            <Text id="app.main.channel.bot" />
                        )}
                    </BotBadge>
                </BadgeWrapper>
            );
        }

        if (override) {
            return (
                <BadgeWrapper>
                    {el}
                    <BotBadge>
                        <Text id="app.main.channel.bot" />
                    </BotBadge>
                </BadgeWrapper>
            );
        }

        // Add new member badge for users with new accounts
        if (isNewHere) {
            return (
                <BadgeWrapper>
                    {el}
                    <Tooltip content="I'm new here!">
                        <NewHereBadge>NEW</NewHereBadge>
                    </Tooltip>
                </BadgeWrapper>
            );
        }

        // Add vendor badge (for any of the three vendor types)
        if (hasVendorBadge) {
            return (
                <BadgeWrapper>
                    {el}
                    <Tooltip content="Verified Vendor">
                        <TrustedSellerBadge src="/assets/badges/verifiedvendor.svg" />
                    </Tooltip>
                </BadgeWrapper>
            );
        }

        return el;
    },
);

export default function UserShort({
    user,
    size,
    prefixAt,
    masquerade,
    showServerIdentity,
}: {
    user?: User;
    size?: number;
    prefixAt?: boolean;
    masquerade?: API.Masquerade;
    showServerIdentity?: boolean;
}) {
    const openProfile = () =>
        user &&
        modalController.push({ type: "user_profile", user_id: user._id });

    const handleUserClick = (e: MouseEvent) => {
        if (e.shiftKey && user?._id) {
            e.preventDefault();
            internalEmit("MessageBox", "append", `<@${user?._id}>`, "mention");
        } else {
            openProfile();
        }
    };

    return (
        <>
            <UserIcon
                target={user}
                size={size ?? 24}
                masquerade={masquerade}
                onClick={handleUserClick}
                showServerIdentity={showServerIdentity}
            />
            <Username
                user={user}
                prefixAt={prefixAt}
                masquerade={masquerade}
                onClick={handleUserClick}
                showServerIdentity={showServerIdentity}
            />
        </>
    );
}
