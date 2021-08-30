import { Key, Clipboard, Globe } from "@styled-icons/boxicons-regular";
import { LockAlt } from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import { Bot } from "revolt-api/types/Bots";
import styled from "styled-components";

import styles from "./Panes.module.scss";
import { Text } from "preact-i18n";
import { useEffect, useState } from "preact/hooks";

import { stopPropagation } from "../../../lib/stopPropagation";

import { useIntermediate } from "../../../context/intermediate/Intermediate";
import { useClient } from "../../../context/revoltjs/RevoltClient";

import Tooltip from "../../../components/common/Tooltip";
import UserIcon from "../../../components/common/user/UserIcon";
import Button from "../../../components/ui/Button";
import Checkbox from "../../../components/ui/Checkbox";
import InputBox from "../../../components/ui/InputBox";
import Overline from "../../../components/ui/Overline";
import Tip from "../../../components/ui/Tip";
import CategoryButton from "../../../components/ui/fluent/CategoryButton";

interface Data {
    _id: string;
    username: string;
    public: boolean;
    interactions_url?: string;
}

const BotBadge = styled.div`
    display: inline-block;

    height: 1.3em;
    padding: 0px 4px;
    font-size: 0.7em;
    user-select: none;
    margin-inline-start: 2px;
    text-transform: uppercase;

    color: var(--foreground);
    background: var(--accent);
    border-radius: calc(var(--border-radius) / 2);
`;

function BotEditor({ bot }: { bot: Data }) {
    const client = useClient();
    const [data, setData] = useState<Data>(bot);

    function save() {
        const changes: Record<string, string | boolean | undefined> = {};
        if (data.username !== bot.username) changes.name = data.username;
        if (data.public !== bot.public) changes.public = data.public;
        if (data.interactions_url !== bot.interactions_url)
            changes.interactions_url = data.interactions_url;

        client.bots.edit(bot._id, changes);
    }

    return (
        <div>
            <p>
                <InputBox
                    value={data.username}
                    onChange={(e) =>
                        setData({ ...data, username: e.currentTarget.value })
                    }
                />
            </p>
            <p>
                <Checkbox
                    checked={data.public}
                    onChange={(v) => setData({ ...data, public: v })}>
                    is public
                </Checkbox>
            </p>
            <p>interactions url: (reserved for the future)</p>
            <p>
                <InputBox
                    value={data.interactions_url}
                    onChange={(e) =>
                        setData({
                            ...data,
                            interactions_url: e.currentTarget.value,
                        })
                    }
                />
            </p>
            <Button onClick={save}>save</Button>
        </div>
    );
}

export const MyBots = observer(() => {
    const client = useClient();
    const [bots, setBots] = useState<Bot[] | undefined>(undefined);

    useEffect(() => {
        client.bots.fetchOwned().then(({ bots }) => setBots(bots));
        // eslint-disable-next-line
    }, []);

    const [name, setName] = useState("");
    const [editMode, setEditMode] = useState(false);
    const { writeClipboard, openScreen } = useIntermediate();

    return (
        <div className={styles.myBots}>
            <Tip warning hideSeparator>
                This section is under construction.
            </Tip>
            <Overline>create a new bot</Overline>
            <p>
                <InputBox
                    value={name}
                    contrast
                    onChange={(e) => setName(e.currentTarget.value)}
                />
            </p>
            <p>
                <Button
                    contrast
                    onClick={() =>
                        name.length > 0 &&
                        client.bots
                            .create({ name })
                            .then(({ bot }) => setBots([...(bots ?? []), bot]))
                    }>
                    create
                </Button>
            </p>
            <Overline>my bots</Overline>
            {bots?.map((bot) => {
                const user = client.users.get(bot._id);
                return (
                    <div
                        key={bot._id}
                        style={{
                            background: "var(--secondary-background)",
                            margin: "8px 0",
                            padding: "12px",
                        }}>
                        <div className={styles.infoheader}>
                            <div className={styles.container}>
                                <UserIcon
                                    className={styles.avatar}
                                    target={user!}
                                    size={48}
                                    onClick={() =>
                                        openScreen({
                                            id: "profile",
                                            user_id: user!._id,
                                        })
                                    }
                                />
                                <div className={styles.userDetail}>
                                    <div className={styles.userName}>
                                        {user!.username}{" "}
                                        <BotBadge>
                                            <Text id="app.main.channel.bot" />
                                        </BotBadge>
                                    </div>

                                    <div className={styles.userid}>
                                        <Tooltip
                                            content={
                                                <Text id="app.special.copy" />
                                            }>
                                            <a
                                                onClick={() =>
                                                    writeClipboard(
                                                        client.user!._id,
                                                    )
                                                }>
                                                {client.user!._id}
                                            </a>
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>

                            <Tooltip content={bot.public ? "Bot is public. Anyone can invite it." : "Bot is private. Only you can invite it."}>
                                {bot.public ? <Globe size={24} /> : <LockAlt size={24} />}
                            </Tooltip>
                            {/* <Button onClick={() => switchPage("profile")} contrast>
                                <Text id="app.settings.pages.profile.edit_profile" />
                            </Button> */}
                        </div>
                        <CategoryButton
                            account
                            icon={<Key size={24} />}
                            onClick={() => writeClipboard(bot.token)}
                            description={
                                <>
                                    {"••••••••••••••••••••••••••••••••••••"}{" "}
                                    <a
                                        onClick={(ev) =>
                                            stopPropagation(
                                                ev,
                                                openScreen({
                                                    id: "token_reveal",
                                                    token: bot.token,
                                                    username: user!.username,
                                                }),
                                            )
                                        }>
                                        <Text id="app.special.modals.actions.reveal" />
                                    </a>
                                </>
                            }
                            action={<Clipboard size={18} />}>
                            Token
                        </CategoryButton>
                        <BotEditor
                            bot={{
                                ...bot,
                                username: user!.username,
                            }}
                        />
                        <Button
                            error
                            onClick={() =>
                                client.bots
                                    .delete(bot._id)
                                    .then(() =>
                                        setBots(
                                            bots.filter(
                                                (x) => x._id !== bot._id,
                                            ),
                                        ),
                                    )
                            }>
                            delete
                        </Button>
                        <Button
                            onClick={() =>
                                writeClipboard(
                                    `${window.origin}/bot/${bot._id}`,
                                )
                            }>
                            copy invite link
                        </Button>
                    </div>
                );
            })}
        </div>
    );
});
