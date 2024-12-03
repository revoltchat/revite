import { Shield } from "@styled-icons/boxicons-regular";
import styled from "styled-components/macro";

import { Localizer, Text } from "preact-i18n";

import Tooltip from "../Tooltip";

enum Badges {
    Developer = 1, // Developer
    Translator = 2, // First 100 Members
    Supporter = 4, // Supporter
    ResponsibleDisclosure = 8, // Trusted Seller
    Founder = 16, // Founder
    PlatformModeration = 32, // Administrator
    ActiveSupporter = 64,
    Paw = 128, // Clown
    EarlyAdopter = 256, // Top Contributor
    ReservedRelevantJokeBadge1 = 512, // Karen
    ReservedRelevantJokeBadge2 = 1024, // Gump
}

const BadgesBase = styled.div`
    gap: 8px;
    display: flex;
    flex-direction: row;

    img {
        width: 24px;
        height: 24px;
    }
`;

interface Props {
    badges: number;
    uid?: string;
}

export default function UserBadges({ badges, uid }: Props) {
    return (
        <BadgesBase>
            <Localizer>
                {badges & Badges.Founder && (
                    <Tooltip content="Founder">
                        <img src="/assets/badges/founder.svg" />
                    </Tooltip>
                )}
                {badges & Badges.Developer && (
                    <Tooltip content="Developer">
                        <img src="/assets/badges/developer.png" />
                    </Tooltip>
                )}
                {badges & Badges.Translator && (
                    <Tooltip content="First 100 Members">
                        <img src="/assets/badges/first_100_members.svg" />
                    </Tooltip>
                )}
                {badges & Badges.EarlyAdopter && (
                    <Tooltip content="Top Contributor">
                        <img src="/assets/badges/top-contributor.png" />
                    </Tooltip>
                )}
                {badges & Badges.PlatformModeration && (
                    <Tooltip content="Administrator">
                        <img src="/assets/badges/administrator.png" />
                    </Tooltip>
                )}
                {badges & Badges.ResponsibleDisclosure && (
                    <Tooltip content="Trusted Seller">
                        <img src="/assets/badges/trusted-seller.png" />
                    </Tooltip>
                )}
                {badges & Badges.Supporter && (
                    <Tooltip content="Supporter">
                        <img
                            src="/assets/badges/supporter.png"
                            style={{
                                cursor: "pointer",
                            }}
                        />
                    </Tooltip>
                )}
                {badges & Badges.ReservedRelevantJokeBadge1 && (
                    <Tooltip content="Karen">
                        <img src="/assets/badges/karen.png" />
                    </Tooltip>
                )}
                {badges & Badges.ReservedRelevantJokeBadge2 && (
                    <Tooltip content="Gump">
                        <img src="/assets/badges/gump.png" />
                    </Tooltip>
                )}
                {badges & Badges.Paw && (
                    <Tooltip content="Clown">
                        <img src="/assets/badges/clown.png" />
                    </Tooltip>
                )}
            </Localizer>
        </BadgesBase>
    );
}
