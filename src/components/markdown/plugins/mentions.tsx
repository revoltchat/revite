import { RE_MENTIONS } from "revolt.js";
import styled from "styled-components";

import { clientController } from "../../../controllers/client/ClientController";
import UserShort from "../../common/user/UserShort";
import { createComponent, CustomComponentProps } from "./remarkRegexComponent";

const Mention = styled.a`
    gap: 4px;
    flex-shrink: 0;
    padding-left: 2px;
    padding-right: 6px;
    align-items: center;
    display: inline-flex;
    vertical-align: middle;

    cursor: pointer;

    font-weight: 600;
    text-decoration: none !important;
    background: var(--secondary-background);
    border-radius: calc(var(--border-radius) * 2);

    transition: 0.1s ease filter;

    &:hover {
        filter: brightness(0.75);
    }

    &:active {
        filter: brightness(0.65);
    }

    svg {
        width: 1em;
        height: 1em;
    }
`;

export function RenderMention({ match }: CustomComponentProps) {
    return (
        <Mention>
            <UserShort
                showServerIdentity
                user={clientController.getAvailableClient().users.get(match)}
            />
        </Mention>
    );
}

export const remarkMention = createComponent("mention", RE_MENTIONS, (match) =>
    clientController.getAvailableClient().users.has(match),
);
