import { Children } from "../../../types/Preact";
import { Username } from "./UserShort";
import styled from "styled-components";
import UserStatus from "./UserStatus";
import Tooltip from "../Tooltip";
import { User } from "revolt.js";

interface Props {
    user?: User,
    children: Children
}

const Base = styled.div`
    display: flex;
    flex-direction: column;

    .username {
        font-weight: 600;
    }

    .status {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
`;

export default function UserHover({ user, children }: Props) {
    return (
        <Tooltip placement="right-end" content={
            <Base>
                <Username className="username" user={user} />
                <span className="status">
                    <UserStatus user={user} />
                </span>
            </Base>
        }>
            { children }
        </Tooltip>
    )
}
