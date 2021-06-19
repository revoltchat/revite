import Tooltip from "./Tooltip";
import { User } from "revolt.js";
import Header from "../ui/Header";
import UserIcon from "./UserIcon";
import { Text } from "preact-i18n";
import UserStatus from './UserStatus';
import styled from "styled-components";
import { Localizer } from 'preact-i18n';
import { Link } from "react-router-dom";
import IconButton from "../ui/IconButton";
import { Settings } from "@styled-icons/feather";
import { openContextMenu } from "preact-context-menu";
import { isTouchscreenDevice } from "../../lib/isTouchscreenDevice";
import { useIntermediate } from "../../context/intermediate/Intermediate";

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
    user: User
}

export default function UserHeader({ user }: Props) {
    const { writeClipboard } = useIntermediate();

    function openPresenceSelector() {
        openContextMenu("Status");
    }

    return (
        <Header placement="secondary">
            <UserIcon
                target={user}
                size={32}
                status
                onClick={openPresenceSelector}
            />
            <HeaderBase>
                <Localizer>
                    <Tooltip content={<Text id="app.special.copy_username" />}>
                        <span className="username"
                            onClick={() => writeClipboard(user.username)}>
                            @{user.username}
                        </span>
                    </Tooltip>
                </Localizer>
                <span className="status"
                    onClick={openPresenceSelector}>
                    <UserStatus user={user} />
                </span>
            </HeaderBase>
            { !isTouchscreenDevice && <div className="actions">
                <Link to="/settings">
                    <IconButton>
                        <Settings size={24} />
                    </IconButton>
                </Link>
            </div> }
        </Header>
    )
}
