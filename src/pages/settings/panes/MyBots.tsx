import { Key, Clipboard, Globe, Plus } from "@styled-icons/boxicons-regular";
import { LockAlt, HelpCircle } from "@styled-icons/boxicons-solid";
import type { AxiosError } from "axios";
import { observer } from "mobx-react-lite";
import { Bot } from "revolt-api/types/Bots";
import { Profile as ProfileI } from "revolt-api/types/Users";
import { User } from "revolt.js/dist/maps/Users";
import styled from "styled-components/macro";

import styles from "./Panes.module.scss";
import { Text } from "preact-i18n";
import { useCallback, useEffect, useState } from "preact/hooks";

import TextAreaAutoSize from "../../../lib/TextAreaAutoSize";
import { internalEmit } from "../../../lib/eventEmitter";
import { useTranslation } from "../../../lib/i18n";
import { stopPropagation } from "../../../lib/stopPropagation";
import { Button } from "@revoltchat/ui/lib/components/atoms/inputs/Button";
import { Checkbox } from "@revoltchat/ui/lib/components/atoms/inputs/Checkbox";

import { useIntermediate } from "../../../context/intermediate/Intermediate";
import { FileUploader } from "../../../context/revoltjs/FileUploads";
import { useClient } from "../../../context/revoltjs/RevoltClient";

import AutoComplete, {
    useAutoComplete,
} from "../../../components/common/AutoComplete";
import CollapsibleSection from "../../../components/common/CollapsibleSection";
import Tooltip from "../../../components/common/Tooltip";
import UserIcon from "../../../components/common/user/UserIcon";
import InputBox from "../../../components/ui/InputBox";
import Tip from "../../../components/ui/Tip";
import CategoryButton from "../../../components/ui/fluent/CategoryButton";

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
    remove?: "InteractionsURL";
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
    bot: Bot;
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
        interactions_url: bot.interactions_url,
    });
    const [error, setError] = useState<string | JSX.Element>("");
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [usernameRef, setUsernameRef] = useState<HTMLInputElement | null>(
        null,
    );
    const [interactionsRef, setInteractionsRef] =
        useState<HTMLInputElement | null>(null);
    const { writeClipboard, openScreen } = useIntermediate();

    const [profile, setProfile] = useState<undefined | ProfileI>(undefined);

    const refreshProfile = useCallback(() => {
        client
            .request(
                "GET",
                `/users/${bot._id}/profile` as "/users/id/profile",
                {
                    headers: { "x-bot-token": bot.token },
                    transformRequest: (data, headers) => {
                        // Remove user headers for this request
                        delete headers["x-user-id"];
                        delete headers["x-session-token"];
                        return data;
                    },
                },
            )
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
        if (data.interactions_url === "") changes.remove = "InteractionsURL";
        else if (data.interactions_url !== bot.interactions_url)
            changes.interactions_url = data.interactions_url;
        setSaving(true);
        setError("");
        try {
            await client.bots.edit(bot._id, changes);
            if (changed) await editBotContent(profile?.content);
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
        await client.request("PATCH", "/users/id", {
            headers: { "x-bot-token": bot.token },
            transformRequest: (data, headers) => {
                // Remove user headers for this request
                delete headers["x-user-id"];
                delete headers["x-session-token"];
                return data;
            },
            data: JSON.stringify(avatar ? { avatar } : { remove: "Avatar" }),
        });

        const res = await client.bots.fetch(bot._id);
        if (!avatar) res.user.update({}, "Avatar");
        setUser(res.user);
        setSaving(false);
    }

    async function editBotBackground(background?: string) {
        setSaving(true);
        setError("");
        await client.request("PATCH", "/users/id", {
            headers: { "x-bot-token": bot.token },
            transformRequest: (data, headers) => {
                // Remove user headers for this request
                delete headers["x-user-id"];
                delete headers["x-session-token"];
                return data;
            },
            data: JSON.stringify(
                background
                    ? { profile: { background } }
                    : { remove: "ProfileBackground" },
            ),
        });

        if (!background) setProfile({ ...profile, background: undefined });
        else refreshProfile();
        setSaving(false);
    }

    async function editBotContent(content?: string) {
        setSaving(true);
        setError("");
        await client.request("PATCH", "/users/id", {
            headers: { "x-bot-token": bot.token },
            transformRequest: (data, headers) => {
                // Remove user headers for this request
                delete headers["x-user-id"];
                delete headers["x-session-token"];
                return data;
            },
            data: JSON.stringify(
                content
                    ? { profile: { content } }
                    : { remove: "ProfileContent" },
            ),
        });

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
                                    openScreen({
                                        id: "profile",
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
                                                writeClipboard(user!._id)
                                            }>
                                            {user!._id}
                                        </a>
                                    </Tooltip>
                                </div>
                            </div>
                        ) : (
                            <InputBox
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
                                interactions_url: bot.interactions_url,
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
                    onClick={() => writeClipboard(bot.token)}
                    description={
                        <>
                            {"••••• "}
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
                        palette="secondary"
                        value={data.public}
                        disabled={saving}
                        description={
                            <Text id="app.settings.pages.bots.public_bot_desc" />
                        }
                        onChange={(v) => setData({ ...data, public: v })}>
                        <Text id="app.settings.pages.bots.public_bot" />
                    </Checkbox>
                    <h3>
                        <Text id="app.settings.pages.bots.interactions_url" />
                    </h3>
                    <h5>
                        <Text id="app.settings.pages.bots.reserved" />
                    </h5>
                    <InputBox
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
                    <Tip error hideSeparator>
                        {error}
                    </Tip>
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
                                openScreen({
                                    id: "special_prompt",
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
                                writeClipboard(
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
    const [bots, setBots] = useState<Bot[] | undefined>(undefined);

    useEffect(() => {
        client.bots.fetchOwned().then(({ bots }) => setBots(bots));
        // eslint-disable-next-line
    }, []);

    const { openScreen } = useIntermediate();

    return (
        <div className={styles.myBots}>
            <CategoryButton
                account
                icon={<Plus size={24} />}
                onClick={() =>
                    openScreen({
                        id: "create_bot",
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
                                                changes.remove ===
                                                "InteractionsURL"
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
