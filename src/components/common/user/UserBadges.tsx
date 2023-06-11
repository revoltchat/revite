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
                    <Tooltip
                        content={
                            <Text id="app.special.popovers.user_profile.badges.founder" />
                        }>
                        <img src="/assets/badges/founder.svg" />
                    </Tooltip>
                ) : (
                    <></>
                )}
                {badges & Badges.Developer ? (
                    <Tooltip content={<Text id="app.navigation.tabs.dev" />}>
                        <img src="/assets/badges/developer.svg" />
                    </Tooltip>
                ) : (
                    <></>
                )}
                {badges & Badges.Translator ? (
                    <Tooltip
                        content={
                            <Text id="app.special.popovers.user_profile.badges.translator" />
                        }>
                        <img
                            src="/assets/badges/translator.svg"
                            style={{
                                cursor: "pointer",
                            }}
                            onClick={() => {
                                window.open(
                                    "https://weblate.insrt.uk/projects/revolt/web-app/",
                                    "_blank",
                                );
                            }}
                        />
                    </Tooltip>
                ) : (
                    <></>
                )}
                {badges & Badges.EarlyAdopter ? (
                    <Tooltip
                        content={
                            <Text id="app.special.popovers.user_profile.badges.early_adopter" />
                        }>
                        <img src="/assets/badges/early_adopter.svg" />
                    </Tooltip>
                ) : (
                    <></>
                )}
                {badges & Badges.PlatformModeration ? (
                    <Tooltip
                        content={
                            <Text id="app.special.popovers.user_profile.badges.moderation" />
                        }>
                        <img src="/assets/badges/moderation.svg" />
                    </Tooltip>
                ) : (
                    <></>
                )}
                {badges & Badges.ResponsibleDisclosure ? (
                    <Tooltip
                        content={
                            <Text id="app.special.popovers.user_profile.badges.responsible_disclosure" />
                        }>
                        <Shield size={24} color="gray" />
                    </Tooltip>
                ) : (
                    <></>
                )}
                {badges & Badges.Supporter ? (
                    <Tooltip
                        content={
                            <Text id="app.special.popovers.user_profile.badges.supporter" />
                        }>
                        <img
                            src="/assets/badges/supporter.svg"
                            style={{
                                cursor: "pointer",
                            }}
                            onClick={() => {
                                window.open(
                                    "https://insrt.uk/donate",
                                    "_blank",
                                );
                            }}
                        />
                    </Tooltip>
                ) : (
                    <></>
                )}
                {badges & Badges.ReservedRelevantJokeBadge1 ? (
                    <Tooltip content="sus">
                        <img src="/assets/badges/amog.svg" />
                    </Tooltip>
                ) : (
                    <></>
                )}
                {badges & Badges.ReservedRelevantJokeBadge2 ? (
                    <Tooltip content="It's Morbin Time">
                        <img src="/assets/badges/amorbus.svg" />
                    </Tooltip>
                ) : (
                    <></>
                )}
                {badges & Badges.Paw ? (
                    <Tooltip content="🦊">
                        <img src="/assets/badges/paw.svg" />
                    </Tooltip>
                ) : (
                    <></>
                )}
                {uid === "01EX2NCWQ0CHS3QJF0FEQS1GR4" ? (
                    <Tooltip content="🦝">
                        <img src="/assets/badges/raccoon.svg" />
                    </Tooltip>
                ) : (
                    <></>
                )}
            </Localizer>
        </BadgesBase>
    );
}
