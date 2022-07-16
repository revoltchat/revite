import { observer } from "mobx-react-lite";
import { Message } from "revolt.js";
import styled, { css } from "styled-components";

import { useClient } from "../../../../controllers/client/ClientController";
import { RenderEmoji } from "../../../markdown/plugins/emoji";

interface Props {
    message: Message;
}

const List = styled.div`
    gap: 0.4em;
    display: flex;
    flex-wrap: wrap;
    margin-top: 0.2em;
`;

const Reaction = styled.div<{ active: boolean }>`
    padding: 0.4em;
    cursor: pointer;
    user-select: none;
    vertical-align: middle;
    color: var(--secondary-foreground);
    border-radius: var(--border-radius);
    background: var(--secondary-background);

    img {
        width: 1.2em;
        height: 1.2em;
        object-fit: contain;
    }

    &:hover {
        filter: brightness(0.9);
    }

    &:active {
        filter: brightness(0.75);
    }

    ${(props) =>
        props.active &&
        css`
            border: 1px solid var(--accent);
        `}
`;

export const Reactions = observer(({ message }: Props) => {
    const client = useClient();
    if (message.reactions.size === 0) return null;

    return (
        <List>
            {Array.from(message.reactions, ([key, user_ids]) => {
                const active = user_ids.has(client.user!._id);

                return (
                    <Reaction
                        key={key}
                        active={active}
                        onClick={() =>
                            active ? message.unreact(key) : message.react(key)
                        }>
                        <RenderEmoji match={key} /> {user_ids.size}
                    </Reaction>
                );
            })}
        </List>
    );
});
