// ! FIXME: this code is garbage, need to replace
import { Key, Clipboard, Globe, Plus } from "@styled-icons/boxicons-regular";
import { LockAlt, HelpCircle } from "@styled-icons/boxicons-solid";
import type { AxiosError } from "axios";
import { observer } from "mobx-react-lite";
import { API, User } from "revolt.js";
import styled from "styled-components/macro";

import styles from "./Panes.module.scss";
import { Text } from "preact-i18n";
import { useCallback, useEffect, useState } from "preact/hooks";

import {
    Button,
    CategoryButton,
    Checkbox,
    InputBox,
    Tip,
} from "@revoltchat/ui";

import TextAreaAutoSize from "../../../lib/TextAreaAutoSize";
import { internalEmit } from "../../../lib/eventEmitter";
import { useTranslation } from "../../../lib/i18n";
import { stopPropagation } from "../../../lib/stopPropagation";

import AutoComplete, {
    useAutoComplete,
} from "../../../components/common/AutoComplete";
import CollapsibleSection from "../../../components/common/CollapsibleSection";
import Tooltip from "../../../components/common/Tooltip";
import UserIcon from "../../../components/common/user/UserIcon";
import { useClient } from "../../../controllers/client/ClientController";
import { FileUploader } from "../../../controllers/client/jsx/legacy/FileUploads";
import { modalController } from "../../../controllers/modals/ModalController";

interface Data {
    _id: string;
    username: string;
    public: boolean;
    interactions_url?: string;
}

interface Changes {
    name?: string;
    public?: boolean;
    interactions_url?: string;
    remove?: "InteractionsURL"[];
}

const BotBadge = styled.div`
    display: inline-block;
    flex-shrink: 0;
    height: 1.3em;
    padding: 0px 4px;
    font-size: 0.7em;
    user-select: none;
    margin-inline-start: 2px;
    text-transform: uppercase;

    color: var(--accent-contrast);
    background: var(--accent);
    border-radius: calc(var(--border-radius) / 2);
`;

interface Props {
    bot: API.Bot;
    onDelete(): void;
    onUpdate(changes: Changes): void;
}

function BotCard({ bot, onDelete, onUpdate }: Props) {
    const client = useClient();
    const translate = useTranslation();
    const [user, setUser] = useState<User>(client.users.get(bot._id)!);
    const [data, setData] = useState<Data>({
        _id: bot._id,
        username: user.username,
        public: bot.public,
        interactions_url: bot.interactions_url as any,
    });
    const [error, setError] = useState<string | JSX.Element>("");
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [usernameRef, setUsernameRef] = useState<HTMLInputElement | null>(
        null,
    );
    const [interactionsRef, setInteractionsRef] =
        useState<HTMLInputElement | null>(null);

    const [profile, setProfile] = useState<undefined | API.UserProfile>(
        undefined,
    );

    const refreshProfile = useCallback(() => {
        client.api
            .get(`/users/${bot._id as ""}/profile`, undefined, {
                headers: { "x-bot-token": bot.token },
            })
            .then((profile) => setProfile(profile ?? {}));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, setProfile]);

    useEffect(() => {
        if (profile === undefined && editMode) refreshProfile();
    }, [profile, editMode, refreshProfile]);

    const [changed, setChanged] = useState(false);
    function setContent(content?: string) {
        setProfile({ ...profile, content });
        if (!changed) setChanged(true);
    }

    async function save() {
        const changes: Changes = {};
        if (data.username !== user!.username) changes.name = data.username;
        if (data.public !== bot.public) changes.public = data.public;
        if (data.interactions_url === "") changes.remove = ["InteractionsURL"];
        else if (data.interactions_url !== bot.interactions_url)
            changes.interactions_url = data.interactions_url;
        setSaving(true);
        setError("");
        try {
            if (Object.keys(changes).length > 0)
                await client.bots.edit(bot._id, changes);
            if (changed) await editBotContent(profile?.content ?? undefined);
            onUpdate(changes);
            setChanged(false);
            setEditMode(false);
        } catch (e) {
            const err = e as AxiosError;
            if (err.isAxiosError && err.response?.data?.type) {
                switch (err.response.data.type) {
                    case "UsernameTaken":
                        setError("That username is taken!");
                        break;
                    default:
                        setError(`Error: ${err.response.data.type}`);
                        break;
                }
            } else setError(err.toString());
        }
        setSaving(false);
    }

    async function editBotAvatar(avatar?: string) {
        setSaving(true);
        setError("");
        await client.api.patch(
            "/users/@me",
            avatar ? { avatar } : { remove: ["Avatar"] },
            {
                headers: { "x-bot-token": bot.token },
            },
        );

        const res = await client.bots.fetch(bot._id);
        if (!avatar) res.user.update({}, ["Avatar"]);
        setUser(res.user);
        setSaving(false);
    }

    async function editBotBackground(background?: string) {
        setSaving(true);
        setError("");
        await client.api.patch(
            "/users/@me",
            background
                ? { profile: { background } }
                : { remove: ["ProfileBackground"] },
            {
                headers: { "x-bot-token": bot.token },
            },
        );

        if (!background) setProfile({ ...profile, background: undefined });
        else refreshProfile();
        setSaving(false);
    }

    async function editBotContent(content?: string) {
        setSaving(true);
        setError("");
        await client.api.patch(
            "/users/@me",
            content ? { profile: { content } } : { remove: ["ProfileContent"] },
            {
                headers: { "x-bot-token": bot.token },
            },
        );

        if (!content) setProfile({ ...profile, content: undefined });
        else refreshProfile();
        setSaving(false);
    }

    const {
        onChange,
        onKeyUp,
        onKeyDown,
        onFocus,
        onBlur,
        ...autoCompleteProps
    } = useAutoComplete(setContent, {
        users: { type: "all" },
    });

    return (
        <div key={bot._id} className={styles.botCard}>
            <div className={styles.infocontainer}>
                <div className={styles.infoheader}>
                    <div className={styles.container}>
                        {!editMode ? (
                            <UserIcon
                                className={styles.avatar}
                                target={user}
                                size={42}
                                onClick={() =>
                                    modalController.push({
                                        type: "user_profile",
                                        user_id: user._id,
                                    })
                                }
                            />
                        ) : (
                            <FileUploader
                                width={42}
                                height={42}
                                style="icon"
                                fileType="avatars"
                                behaviour="upload"
                                maxFileSize={4_000_000}
                                onUpload={(avatar) => editBotAvatar(avatar)}
                                remove={() => editBotAvatar()}
                                defaultPreview={user.generateAvatarURL(
                                    { max_side: 256 },
                                    true,
                                )}
                                previewURL={user.generateAvatarURL(
                                    { max_side: 256 },
                                    true,
                                )}
                            />
                        )}

                        {!editMode ? (
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
                                            <Text id="app.settings.pages.bots.unique_id" />
                                        }>
                                        <HelpCircle size={16} />
                                    </Tooltip>
                                    <Tooltip
                                        content={
                                            <Text id="app.special.copy" />
                                        }>
                                        <a
                                            onClick={() =>
                                                modalController.writeText(
                                                    user!._id,
                                                )
                                            }>
                                            {user!._id}
                                        </a>
                                    </Tooltip>
                                </div>
                            </div>
                        ) : (
                            <InputBox
                                style={{ width: "100%" }}
                                ref={setUsernameRef}
                                value={data.username}
                                disabled={saving}
                                onChange={(e) =>
                                    setData({
                                        ...data,
                                        username: e.currentTarget.value,
                                    })
                                }
                            />
                        )}
                    </div>

                    {!editMode && (
                        <Tooltip
                            content={
                                <Text
                                    id={`app.settings.pages.bots.${
                                        bot.public ? "public" : "private"
                                    }_bot_tip`}
                                />
                            }>
                            {bot.public ? (
                                <Globe size={24} />
                            ) : (
                                <LockAlt size={24} />
                            )}
                        </Tooltip>
                    )}
                </div>
                <Button
                    disabled={saving}
                    onClick={() => {
                        if (editMode) {
                            setData({
                                _id: bot._id,
                                username: user!.username,
                                public: bot.public,
                                interactions_url: bot.interactions_url as any,
                            });
                            usernameRef!.value = user!.username;
                            interactionsRef!.value = bot.interactions_url || "";
                            setError("");
                            setEditMode(false);
                        } else setEditMode(true);
                    }}
                    palette="secondary">
                    <Text
                        id={`app.special.modals.actions.${
                            editMode ? "cancel" : "edit"
                        }`}
                    />
                </Button>
            </div>
            {!editMode && (
                <CategoryButton
                    account
                    icon={<Key size={24} />}
                    onClick={() => modalController.writeText(bot.token)}
                    description={
                        <>
                            {"••••• "}
                            <a
                                onClick={(ev) =>
                                    stopPropagation(
                                        ev,
                                        modalController.push({
                                            type: "show_token",
                                            token: bot.token,
                                            name: user!.username,
                                        }),
                                    )
                                }>
                                <Text id="app.special.modals.actions.reveal" />
                            </a>
                        </>
                    }
                    action={<Clipboard size={18} />}>
                    <Text id="app.settings.pages.bots.token" />
                </CategoryButton>
            )}
            {editMode && (
                <div className={styles.botSection}>
                    <CollapsibleSection
                        defaultValue={false}
                        id={`bot_profile_${bot._id}`}
                        summary={<Text id="app.settings.pages.bots.profile" />}>
                        <h3>
                            <Text id="app.settings.pages.profile.custom_background" />
                        </h3>
                        <FileUploader
                            height={92}
                            style="banner"
                            behaviour="upload"
                            fileType="backgrounds"
                            maxFileSize={6_000_000}
                            onUpload={(background) =>
                                editBotBackground(background)
                            }
                            remove={() => editBotBackground()}
                            previewURL={
                                profile?.background
                                    ? client.generateFileURL(
                                          profile.background,
                                          { width: 1000 },
                                          true,
                                      )
                                    : undefined
                            }
                        />
                        <h3>
                            <Text id="app.settings.pages.profile.info" />
                        </h3>
                        <AutoComplete detached {...autoCompleteProps} />
                        <TextAreaAutoSize
                            maxRows={10}
                            minHeight={200}
                            maxLength={2000}
                            value={profile?.content ?? ""}
                            disabled={typeof profile === "undefined"}
                            onChange={(ev) => {
                                onChange(ev);
                                setContent(ev.currentTarget.value);
                            }}
                            placeholder={translate(
                                `app.settings.pages.profile.${
                                    typeof profile === "undefined"
                                        ? "fetching"
                                        : "placeholder"
                                }`,
                            )}
                            onKeyUp={onKeyUp}
                            onKeyDown={onKeyDown}
                            onFocus={onFocus}
                            onBlur={onBlur}
                        />
                    </CollapsibleSection>
                    <Checkbox
                        value={data.public}
                        disabled={saving}
                        title={<Text id="app.settings.pages.bots.public_bot" />}
                        description={
                            <Text id="app.settings.pages.bots.public_bot_desc" />
                        }
                        onChange={(v) => setData({ ...data, public: v })}
                    />
                    <h3>
                        <Text id="app.settings.pages.bots.interactions_url" />
                    </h3>
                    <h5>
                        <Text id="app.settings.pages.bots.reserved" />
                    </h5>
                    <InputBox
                        palette="secondary"
                        ref={setInteractionsRef}
                        value={data.interactions_url}
                        disabled={saving}
                        onChange={(e) =>
                            setData({
                                ...data,
                                interactions_url: e.currentTarget.value,
                            })
                        }
                    />
                </div>
            )}

            {error && (
                <div className={styles.botSection}>
                    <Tip palette="error">{error}</Tip>
                </div>
            )}

            <div className={styles.buttonRow}>
                {editMode && (
                    <>
                        <Button onClick={save}>
                            <Text id="app.special.modals.actions.save" />
                        </Button>
                        <Button
                            palette="error"
                            onClick={async () => {
                                setSaving(true);
                                modalController.push({
                                    type: "delete_bot",
                                    target: bot._id,
                                    name: user.username,
                                    cb: onDelete,
                                });
                            }}>
                            <Text id="app.special.modals.actions.delete" />
                        </Button>
                    </>
                )}
                {!editMode && (
                    <>
                        <Button
                            onClick={() =>
                                modalController.writeText(
                                    `${window.origin}/bot/${bot._id}`,
                                )
                            }>
                            <Text id="app.settings.pages.bots.copy_invite" />
                        </Button>
                        <Button
                            onClick={() =>
                                internalEmit(
                                    "Intermediate",
                                    "navigate",
                                    `/bot/${bot._id}`,
                                )
                            }>
                            <Text id="app.settings.pages.bots.add" />
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}

export const MyBots = observer(() => {
    const client = useClient();
    const [bots, setBots] = useState<API.Bot[] | undefined>(undefined);

    useEffect(() => {
        client.bots.fetchOwned().then(({ bots }) => setBots(bots));
        // eslint-disable-next-line
    }, []);

    return (
        <div className={styles.myBots}>
            <CategoryButton
                account
                icon={<Plus size={24} />}
                onClick={() =>
                    modalController.push({
                        type: "create_bot",
                        onCreate: (bot) => setBots([...(bots ?? []), bot]),
                    })
                }
                action="chevron">
                <Text id="app.settings.pages.bots.create_bot" />
            </CategoryButton>
            <h5>
                By creating a bot, you are agreeing to the {` `}
                <a
                    href="https://revolt.chat/aup"
                    target="_blank"
                    rel="noreferrer">
                    Acceptable Usage Policy
                </a>
                .
            </h5>
            <hr />
            <h3>
                <Text id="app.settings.pages.bots.title" />
            </h3>
            <div className={styles.botList}>
                {bots?.map((bot) => {
                    return (
                        <BotCard
                            key={bot._id}
                            bot={bot}
                            onDelete={() =>
                                setBots(bots.filter((x) => x._id !== bot._id))
                            }
                            onUpdate={(changes: Changes) =>
                                setBots(
                                    bots.map((x) => {
                                        if (x._id === bot._id) {
                                            if (
                                                "public" in changes &&
                                                typeof changes.public ===
                                                    "boolean"
                                            )
                                                x.public = changes.public;
                                            if ("interactions_url" in changes)
                                                x.interactions_url =
                                                    changes.interactions_url;
                                            if (
                                                changes.remove?.includes(
                                                    "InteractionsURL",
                                                )
                                            )
                                                x.interactions_url = undefined;
                                        }
                                        return x;
                                    }),
                                )
                            }
                        />
                    );
                })}
            </div>
        </div>
    );
});
