import { RE_MENTIONS } from "revolt.js";
import styled from "styled-components";

import { clientController } from "../../../controllers/client/ClientController";
import UserShort from "../../common/user/UserShort";
import { createComponent, CustomComponentProps } from "./remarkRegexComponent";

const Mention = styled.a`
    gap: 4px;
    padding: 0 6px;
    flex-shrink: 0;
    align-items: center;
    display: inline-flex;

    font-weight: 600;
    background: var(--secondary-background);
    border-radius: calc(var(--border-radius) * 2);

    &:hover {
        text-decoration: none;
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
