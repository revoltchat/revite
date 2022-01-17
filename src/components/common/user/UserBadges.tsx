import { Shield } from "@styled-icons/boxicons-regular";
import { Badges } from "revolt-api/types/Users";
import styled from "styled-components/macro";

import { Localizer, Text } from "preact-i18n";

import Tooltip from "../Tooltip";

const BadgesBase = styled.div`
    gap: 8px;
    display: flex;
    margin-top: 4px;
    flex-direction: row;

    img {
        width: 32px;
        height: 32px;
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
                        <Shield size={32} color="gray" />
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
