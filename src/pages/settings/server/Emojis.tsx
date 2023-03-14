import { observer } from "mobx-react-lite";
import { Server } from "revolt.js";
import styled from "styled-components";

import { Text } from "preact-i18n";

import { Button, Column, Row, Stacked, Tip } from "@revoltchat/ui";

import UserShort from "../../../components/common/user/UserShort";
import { EmojiUploader } from "../../../components/settings/customisation/EmojiUploader";

interface Props {
    server: Server;
}

const Emoji = styled(Row)`
    padding: 8px;
    border-radius: var(--border-radius);
    background: var(--secondary-background);
`;

const Preview = styled.img`
    width: 32px;
    height: 32px;
    object-fit: contain;
    border-radius: var(--border-radius);
`;

export const Emojis = observer(({ server }: Props) => {
    const emoji = [...server.client.emojis.values()].filter(
        (x) => x.parent.type === "Server" && x.parent.id === server._id,
    );

    return (
        <Column>
            <Tip palette="warning">
                <span>
                    This UI was never finished and will be polished in the{" "}
                    <a
                        style={{ color: "inherit", fontWeight: "600" }}
                        href="https://github.com/revoltchat/frontend/issues/14"
                        target="_blank"
                        rel="noreferrer">
                        new client
                    </a>
                    .<br />
                    <br />
                    Also please note that emoji names must be lowercase
                    alphanumeric!
                </span>
            </Tip>
            {server.havePermission("ManageCustomisation") && (
                <EmojiUploader server={server} />
            )}
            <h3>
                <Text id="app.settings.server_pages.emojis.title" />
                {" – "}
                {emoji.length}
            </h3>
            {emoji.map((emoji) => (
                <Emoji key={emoji._id} centred>
                    <Stacked>
                        <Preview src={emoji.imageURL} />
                    </Stacked>
                    <span>{`:${emoji.name}:`}</span>
                    <Row centred>
                        <UserShort user={emoji.creator} />
                    </Row>
                    {server.havePermission("ManageCustomisation") && (
                        <Button palette="plain" onClick={() => emoji.delete()}>
                            <Text id="app.special.modals.actions.delete" />
                        </Button>
                    )}
                </Emoji>
            ))}
        </Column>
    );
});
