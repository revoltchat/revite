import { User } from "revolt.js";
import Header from "../ui/Header";
import UserIcon from "./UserIcon";
import UserStatus from './UserStatus';
import styled from "styled-components";
import { Localizer } from 'preact-i18n';
import { Settings } from "@styled-icons/feather";
import { isTouchscreenDevice } from "../../lib/isTouchscreenDevice";

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
    function openPresenceSelector() {
        // openContextMenu("Status");
    }

    function writeClipboard(a: string) {
        alert('unimplemented');
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
                    {/*<Tooltip content={<Text id="app.special.copy_username" />}>*/}
                        <span className="username"
                            onClick={() => writeClipboard(user.username)}>
                            @{user.username}
                        </span>
                    {/*</Tooltip>*/}
                </Localizer>
                <span className="status"
                    onClick={openPresenceSelector}>
                    <UserStatus user={user} />
                </span>
            </HeaderBase>
            { !isTouchscreenDevice && <div className="actions">
                {/*<IconButton to="/settings">*/}
                    <Settings size={24} />
                {/*</IconButton>*/}
            </div> }
        </Header>
    )
}
