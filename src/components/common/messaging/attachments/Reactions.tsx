import { observer } from "mobx-react-lite";
import { Message } from "revolt.js";
import styled, { css } from "styled-components";

import { useCallback } from "preact/hooks";

import { useClient } from "../../../../controllers/client/ClientController";
import { RenderEmoji } from "../../../markdown/plugins/emoji";

interface Props {
    message: Message;
}

/**
 * Reaction list element
 */
const List = styled.div`
    gap: 0.4em;
    display: flex;
    flex-wrap: wrap;
    margin-top: 0.2em;
    align-items: center;
`;

/**
 * List divider
 */
const Divider = styled.div`
    width: 1px;
    height: 14px;
    background: var(--tertiary-foreground);
`;

/**
 * Reaction styling
 */
const Reaction = styled.div<{ active: boolean }>`
    padding: 0.4em;
    cursor: pointer;
    user-select: none;
    vertical-align: middle;
    border: 1px solid transparent;
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
            border-color: var(--accent);
        `}
`;

/**
 * Render reactions on a message
 */
export const Reactions = observer(({ message }: Props) => {
    const client = useClient();

    /**
     * Render individual reaction entries
     */
    const Entry = useCallback(
        observer(({ id, user_ids }: { id: string; user_ids?: Set<string> }) => {
            const active = user_ids?.has(client.user!._id) || false;

            return (
                <Reaction
                    active={active}
                    onClick={() =>
                        active ? message.unreact(id) : message.react(id)
                    }>
                    <RenderEmoji match={id} /> {user_ids?.size || 0}
                </Reaction>
            );
        }),
        [],
    );

    /**
     * Determine two lists of 'required' and 'optional' reactions
     */
    const { required, optional } = (() => {
        const required = new Set<string>();
        const optional = new Set<string>();

        if (message.interactions?.reactions) {
            for (const reaction of message.interactions.reactions) {
                required.add(reaction);
            }
        }

        for (const key of message.reactions.keys()) {
            if (!required.has(key)) {
                optional.add(key);
            }
        }

        return {
            required,
            optional,
        };
    })();

    // Don't render list if nothing is going to show anyways
    if (required.size === 0 && optional.size === 0) return null;

    return (
        <List>
            {Array.from(required, (id) => (
                <Entry key={id} id={id} user_ids={message.reactions.get(id)} />
            ))}
            {required.size !== 0 && optional.size !== 0 && <Divider />}
            {Array.from(optional, (id) => (
                <Entry key={id} id={id} user_ids={message.reactions.get(id)} />
            ))}
        </List>
    );
});
