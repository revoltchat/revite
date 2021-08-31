import { observer } from "mobx-react-lite";
import { Bot } from "revolt-api/types/Bots";

import { useEffect, useState } from "preact/hooks";

import { useIntermediate } from "../../../context/intermediate/Intermediate";
import { useClient } from "../../../context/revoltjs/RevoltClient";

import UserShort from "../../../components/common/user/UserShort";
import Button from "../../../components/ui/Button";
import Checkbox from "../../../components/ui/Checkbox";
import InputBox from "../../../components/ui/InputBox";
import Overline from "../../../components/ui/Overline";
import Tip from "../../../components/ui/Tip";

interface Data {
    _id: string;
    username: string;
    public: boolean;
    interactions_url?: string;
}

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
    const { openScreen } = useIntermediate();
    const [bots, setBots] = useState<Bot[] | undefined>(undefined);

    useEffect(() => {
        client.bots.fetchOwned().then(({ bots }) => setBots(bots));
        // eslint-disable-next-line
    }, []);

    const [name, setName] = useState("");
    const { writeClipboard } = useIntermediate();

    return (
        <div>
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
                            .catch(() => {
                                if (name.length < 2) return openScreen({ id: "error", error: "Username must be at least 2 characters long" });
                                else if (name.length > 32) return openScreen({ id: "error", error: "Username must be no longer than 32 characters" });
                                openScreen({ id: "error", error: "Username already taken" });
                            })
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
                            margin: "8px",
                            padding: "12px",
                        }}>
                        <UserShort user={user} />
                        <p>
                            token:{" "}
                            <code style={{ userSelect: "all" }}>
                                {bot.token}
                            </code>
                        </p>
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
