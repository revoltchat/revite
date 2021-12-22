import { Check, Shield } from "@styled-icons/boxicons-regular";
import { Badges as UserBadges } from "revolt-api/types/Users";
import { Server } from "revolt.js/dist/maps/Servers";
import { User } from "revolt.js/dist/maps/Users";
import styled from "styled-components";

import { Localizer, Text } from "preact-i18n";

import Tooltip from "./Tooltip";

const BadgeContainer = styled.div`
    gap: 8px;
    display: flex;
    margin-top: 4px;
    flex-direction: row;

    img {
        width: 32px;
        height: 32px;
    }
`;

type Props = { object: Server | User };

export default function BadgesContainer({ object }: Props) {
    return (
        <Localizer>
            {object instanceof User ? (
                <BadgeContainer>
                    {object.badges! & UserBadges.Founder ? (
                        <Tooltip
                            content={
                                <Text id="app.special.popovers.user_profile.badges.founder" />
                            }>
                            <img src="/assets/badges/founder.svg" />
                        </Tooltip>
                    ) : (
                        <></>
                    )}
                    {object.badges! & UserBadges.Developer ? (
                        <Tooltip
                            content={<Text id="app.navigation.tabs.dev" />}>
                            <img src="/assets/badges/developer.svg" />
                        </Tooltip>
                    ) : (
                        <></>
                    )}
                    {object.badges! & UserBadges.Translator ? (
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
                    {object.badges! & UserBadges.EarlyAdopter ? (
                        <Tooltip
                            content={
                                <Text id="app.special.popovers.user_profile.badges.early_adopter" />
                            }>
                            <img src="/assets/badges/early_adopter.svg" />
                        </Tooltip>
                    ) : (
                        <></>
                    )}
                    {object.badges! & UserBadges.PlatformModeration ? (
                        <Tooltip
                            content={
                                <Text id="app.special.popovers.user_profile.badges.moderation" />
                            }>
                            <img src="/assets/badges/moderation.svg" />
                        </Tooltip>
                    ) : (
                        <></>
                    )}
                    {object.badges! & UserBadges.ResponsibleDisclosure ? (
                        <Tooltip
                            content={
                                <Text id="app.special.popovers.user_profile.badges.responsible_disclosure" />
                            }>
                            <Shield size={32} color="gray" />
                        </Tooltip>
                    ) : (
                        <></>
                    )}
                    {object.badges! & UserBadges.Supporter ? (
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
                    {object.badges! & UserBadges.ReservedRelevantJokeBadge1 ? (
                        <Tooltip content="sus">
                            <img src="/assets/badges/amog.svg" />
                        </Tooltip>
                    ) : (
                        <></>
                    )}
                    {object.badges! & UserBadges.Paw ? (
                        <Tooltip content="🦊">
                            <img src="/assets/badges/paw.svg" />
                        </Tooltip>
                    ) : (
                        <></>
                    )}
                    {object._id === "01EX2NCWQ0CHS3QJF0FEQS1GR4" ? (
                        <Tooltip content="🦝">
                            <img src="/assets/badges/raccoon.svg" />
                        </Tooltip>
                    ) : (
                        <></>
                    )}
                </BadgeContainer>
            ) : (
                <BadgeContainer>
                    {object.flags! === 1 ? (
                        <Tooltip
                            content={
                                <Text id="app.special.server-badges.official" />
                            }
                            placement={"bottom-start"}>
                            <svg width="20" height="20">
                                <image
                                    xlinkHref="/assets/badges/verified.svg"
                                    height="20"
                                    width="20"
                                />
                                <image
                                    xlinkHref="/assets/badges/revolt_r.svg"
                                    height="15"
                                    width="15"
                                    x="2"
                                    y="3"
                                    style={
                                        "justify-content: center; align-items: center; filter: brightness(0);"
                                    }
                                />
                            </svg>
                        </Tooltip>
                    ) : (
                        <></>
                    )}

                    {object.flags! === 2 ? (
                        <Tooltip
                            content={
                                <Text id="app.special.server-badges.verified" />
                            }
                            placement={"bottom-start"}>
                            <svg width="20" height="20">
                                <image
                                    xlinkHref="/assets/badges/verified.svg"
                                    height="20"
                                    width="20"
                                />
                                <foreignObject
                                    x="2"
                                    y="2"
                                    width="15"
                                    height="15">
                                    <Check
                                        size={15}
                                        color="black"
                                        strokeWidth={8}
                                    />
                                </foreignObject>
                            </svg>
                        </Tooltip>
                    ) : (
                        <></>
                    )}
                </BadgeContainer>
            )}
        </Localizer>
    );
}
