import { Check } from "@styled-icons/boxicons-regular";
import { UserPlus } from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import { Profile } from "revolt-api/types/Users";
import { ChannelPermission } from "revolt.js/dist/api/permissions";
import { Server } from "revolt.js/dist/maps/Servers";

import styles from "./ServerInfo.module.scss";
import { Localizer, Text } from "preact-i18n";
import { useEffect, useState } from "preact/hooks";

import BadgesContainer from "../../../components/common/BadgesContainer";
import ServerIcon from "../../../components/common/ServerIcon";
import Tooltip from "../../../components/common/Tooltip";
import UserIcon from "../../../components/common/user/UserIcon";
import { Username } from "../../../components/common/user/UserShort";
import IconButton from "../../../components/ui/IconButton";
import Modal from "../../../components/ui/Modal";

import Markdown from "../../../components/markdown/Markdown";
import { useClient } from "../../revoltjs/RevoltClient";
import { useIntermediate } from "../Intermediate";

interface Props {
    server: Server;
    user_id: string;
    dummy?: boolean;
    onClose?: () => void;
    dummyProfile?: Profile;
}

export const ServerInfo = observer(
    ({ server, onClose, dummy, dummyProfile }: Props) => {
        const client = useClient();
        const { openScreen, writeClipboard } = useIntermediate();

        const [profile, setProfile] = useState<undefined | null | Profile>(
            undefined,
        );

        useEffect(() => {
            if (dummy) {
                setProfile(dummyProfile);
            }
        }, [dummy, dummyProfile]);

        const backgroundURL = server.generateBannerURL({ width: 480 });

        const invChannel = server.channels[0];
        const canCreateInv =
            invChannel &&
            (invChannel.permission & ChannelPermission.InviteOthers) > 0;

        return (
            <Modal
                visible
                border={dummy}
                padding={false}
                onClose={onClose}
                dontModal={dummy}>
                <div
                    className={styles.header}
                    data-force={profile?.background ? "light" : undefined}
                    style={{
                        backgroundImage:
                            backgroundURL &&
                            `linear-gradient( rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7) ), url('${backgroundURL}')`,
                    }}>
                    <div className={styles.profile}>
                        <ServerIcon
                            size={80}
                            target={server}
                            animate
                            hover={typeof server.icon !== "undefined"}
                            onClick={() =>
                                server.icon &&
                                openScreen({
                                    id: "image_viewer",
                                    attachment: server.icon,
                                })
                            }
                        />
                        <div className={styles.details}>
                            <Localizer>
                                <span
                                    className={styles.username}
                                    onClick={() => writeClipboard(server.name)}>
                                    {server.name}
                                </span>
                            </Localizer>
                        </div>
                        {canCreateInv ? (
                            <Localizer>
                                <Tooltip
                                    content={
                                        <Text id="app.context_menu.create_invite" />
                                    }>
                                    <IconButton
                                        onClick={() => {
                                            openScreen({
                                                id: "special_prompt",
                                                type: "create_invite",
                                                target: invChannel,
                                            });
                                        }}>
                                        <UserPlus size={30} />
                                    </IconButton>
                                </Tooltip>
                            </Localizer>
                        ) : undefined}
                    </div>
                </div>
                <div className={styles.content}>
                    <div>
                        <>
                            <div className={styles.category}>server owner</div>
                            <div
                                onClick={() =>
                                    openScreen({
                                        id: "profile",
                                        user_id: server.owner,
                                    })
                                }
                                className={styles.entry}
                                key={server.owner}>
                                <UserIcon
                                    size={32}
                                    target={client.users.get(server.owner)}
                                />
                                <span>
                                    <Username
                                        user={client.users.get(server.owner)}
                                    />
                                </span>
                            </div>
                        </>

                        {server.flags ? (
                            <>
                                <div className={styles.category}>Badges</div>
                                <BadgesContainer
                                    badges={server.flags}
                                    id={server._id}
                                    type="server"
                                />
                            </>
                        ) : undefined}
                        <div className={styles.category}>description</div>
                        {server.description ? (
                            <Markdown content={server.description} />
                        ) : (
                            <div className={styles.noDescription}>
                                <Text id="app.special.popovers.server_info.no_description" />
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        );
    },
);
