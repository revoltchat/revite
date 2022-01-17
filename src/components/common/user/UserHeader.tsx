import { Cog } from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import { Link } from "react-router-dom";
import { User } from "revolt.js/dist/maps/Users";
import styled from "styled-components/macro";

import { openContextMenu } from "preact-context-menu";
import { Text, Localizer } from "preact-i18n";

import { isTouchscreenDevice } from "../../../lib/isTouchscreenDevice";

import { useIntermediate } from "../../../context/intermediate/Intermediate";

import Header from "../../ui/Header";
import IconButton from "../../ui/IconButton";

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

    .username {
        cursor: pointer;
        font-size: 16px;
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
    const { writeClipboard } = useIntermediate();

    return (
        <Header topBorder placement="secondary">
            <HeaderBase>
                <Localizer>
                    <Tooltip content={<Text id="app.special.copy_username" />}>
                        <span
                            className="username"
                            onClick={() => writeClipboard(user.username)}>
                            @{user.username}
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
