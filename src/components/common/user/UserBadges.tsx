import { Shield } from "@styled-icons/boxicons-regular";
import styled from "styled-components/macro";

import { Localizer, Text } from "preact-i18n";

import Tooltip from "../Tooltip";

enum Badges {
    Developer = 1,
    Translator = 2,
    Supporter = 4,
    ResponsibleDisclosure = 8,
    Founder = 16,
    PlatformModeration = 32,
    ActiveSupporter = 64,
    Paw = 128,
    EarlyAdopter = 256,
    ReservedRelevantJokeBadge1 = 512,
    ReservedRelevantJokeBadge2 = 1024,
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
                {badges & Badges.Founder ? (
                    <Tooltip content="Founder">
                        <img src="/assets/badges/founder.svg" />
                    </Tooltip>
                ) : (
                    <></>
                )}
                {badges & Badges.Developer ? (
                    <Tooltip content="Developer">
                        <img src="/assets/badges/developer.png" />
                    </Tooltip>
                ) : (
                    <></>
                )}
                {badges & Badges.Translator ? (
                    <Tooltip content="First 100 Members">
                        <img src="/assets/badges/first_100_members.svg" />
                    </Tooltip>
                ) : (
                    <></>
                )}
                {badges & Badges.EarlyAdopter ? (
                    <Tooltip content="Top Contributor">
                        <img src="/assets/badges/top-contributor.png" />
                    </Tooltip>
                ) : (
                    <></>
                )}
                {badges & Badges.PlatformModeration ? (
                    <Tooltip content="Administrator">
                        <img src="/assets/badges/administrator.png" />
                    </Tooltip>
                ) : (
                    <></>
                )}
                {badges & Badges.ResponsibleDisclosure ? (
                    <Tooltip content="Trusted Seller">
                        <img src="/assets/badges/trusted-seller.png" />
                    </Tooltip>
                ) : (
                    <></>
                )}
                {badges & Badges.Supporter ? (
                    <Tooltip content="Supporter">
                        <img src="/assets/badges/supporter.png" />
                    </Tooltip>
                ) : (
                    <></>
                )}
                {badges & Badges.ReservedRelevantJokeBadge1 ? (
                    <Tooltip content="Karen">
                        <img src="/assets/badges/karen.png" />
                    </Tooltip>
                ) : (
                    <></>
                )}
                {badges & Badges.ReservedRelevantJokeBadge2 ? (
                    <Tooltip content="Gump">
                        <img src="/assets/badges/gump.png" />
                    </Tooltip>
                ) : (
                    <></>
                )}
                {badges & Badges.Paw ? (
                    <Tooltip content="Clown">
                        <img src="/assets/badges/clown.png" />
                    </Tooltip>
                ) : (
                    <></>
                )}
            </Localizer>
        </BadgesBase>
    );
}
