import { Cog } from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import { Link } from "react-router-dom";
import { User } from "revolt.js";
import styled from "styled-components/macro";

import { openContextMenu } from "preact-context-menu";
import { Text, Localizer } from "preact-i18n";

import { Header, IconButton } from "@revoltchat/ui";

import { isTouchscreenDevice } from "../../../lib/isTouchscreenDevice";

import { modalController } from "../../../controllers/modals/ModalController";
import Tooltip from "../Tooltip";
import UserStatus from "./UserStatus";

const HeaderBase = styled.div`
    gap: 0;
    flex-grow: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;

    * {
        min-width: 0;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    .new-name {
        font-size: 16px;
        font-weight: 600;
    }

    .username {
        cursor: pointer;
        font-size: 13px;
        font-weight: 600;
    }

    .status {
        cursor: pointer;
        font-size: 12px;
        margin-top: -2px;
    }
`;

interface Props {
    user: User;
}

export default observer(({ user }: Props) => {
    return (
        <Header topBorder palette="secondary">
            <HeaderBase>
                <div className="new-name">
                    {user.display_name ?? user.username}
                </div>
                <Localizer>
                    <Tooltip content={<Text id="app.special.copy_username" />}>
                        <span
                            className="username"
                            onClick={() =>
                                modalController.writeText(user.username)
                            }>
                            {user.username}
                            {"#"}
                            {user.discriminator}
                        </span>
                    </Tooltip>
                </Localizer>
                <span
                    className="status"
                    onClick={() => openContextMenu("Status")}>
                    <UserStatus user={user} />
                </span>
            </HeaderBase>
            {!isTouchscreenDevice && (
                <div className="actions">
                    <Link to="/settings">
                        <IconButton>
                            <Cog size={24} />
                        </IconButton>
                    </Link>
                </div>
            )}
        </Header>
    );
});
