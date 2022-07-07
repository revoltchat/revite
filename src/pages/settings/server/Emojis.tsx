import { observer } from "mobx-react-lite";
import { Server } from "revolt.js";
import styled from "styled-components";

import { Button, Column, Row, Stacked } from "@revoltchat/ui";

import UserShort from "../../../components/common/user/UserShort";
import { EmojiUploader } from "../../../components/settings/customisation/EmojiUploader";
import { modalController } from "../../../controllers/modals/ModalController";

interface Props {
    server: Server;
}

const List = styled.div`
    gap: 8px;
    display: flex;
    flex-wrap: wrap;
`;

const Emoji = styled(Column)`
    padding: 8px;
    border-radius: var(--border-radius);
    background: var(--secondary-background);
`;

const Preview = styled.img`
    width: 72px;
    height: 72px;
    object-fit: contain;
    border-radius: var(--border-radius);
`;

const UserInfo = styled(Row)`
    font-size: 12px;

    svg {
        width: 14px;
        height: 14px;
    }
`;

export const Emojis = observer(({ server }: Props) => {
    const emoji = [...server.client.emojis.values()].filter(
        (x) => x.parent.id === server._id,
    );

    return (
        <Column>
            <EmojiUploader server={server} />
            <h3>Emojis – {emoji.length}</h3>
            <List>
                {emoji.map((emoji) => (
                    <Emoji key={emoji._id} centred>
                        <Stacked>
                            <Preview src={emoji.imageURL} />
                        </Stacked>
                        <span>{`:${emoji.name}:`}</span>
                        <UserInfo centred>
                            <UserShort user={emoji.creator} />
                        </UserInfo>
                        <Button
                            palette="plain"
                            onClick={() =>
                                modalController.writeText(emoji._id)
                            }>
                            Copy ID
                        </Button>
                    </Emoji>
                ))}
            </List>
        </Column>
    );
});
