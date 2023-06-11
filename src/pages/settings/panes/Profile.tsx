import { Markdown } from "@styled-icons/boxicons-logos";
import { UserCircle } from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import { useHistory } from "react-router-dom";
import { API } from "revolt.js";

import styles from "./Panes.module.scss";
import { Text } from "preact-i18n";
import { useCallback, useContext, useEffect, useState } from "preact/hooks";

import { Button, LineDivider, Tip, CategoryButton } from "@revoltchat/ui";

import TextAreaAutoSize from "../../../lib/TextAreaAutoSize";
import { useTranslation } from "../../../lib/i18n";

import AutoComplete, {
    useAutoComplete,
} from "../../../components/common/AutoComplete";
import { useSession } from "../../../controllers/client/ClientController";
import { FileUploader } from "../../../controllers/client/jsx/legacy/FileUploads";
import { modalController } from "../../../controllers/modals/ModalController";
import { UserProfile } from "../../../controllers/modals/components/legacy/UserProfile";

export const Profile = observer(() => {
    const translate = useTranslation();
    const session = useSession()!;
    const client = session.client!;
    const history = useHistory();

    const [profile, setProfile] = useState<undefined | API.UserProfile>(
        undefined,
    );

    // ! FIXME: temporary solution
    // ! we should just announce profile changes through WS
    const refreshProfile = useCallback(() => {
        client
            .user!.fetchProfile()
            .then((profile) => setProfile(profile ?? {}));
    }, [client.user, setProfile]);

    useEffect(() => {
        if (profile === undefined && session.state === "Online") {
            refreshProfile();
        }
    }, [profile, session.state, refreshProfile]);

    const [changed, setChanged] = useState(false);
    function setContent(content?: string) {
        setProfile({ ...profile, content });
        if (!changed) setChanged(true);
    }

    function switchPage(to: string) {
        history.replace(`/settings/${to}`);
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
        <div className={styles.user}>
            <h3>
                <Text id="app.special.modals.actions.preview" />
            </h3>
            <div className={styles.preview}>
                <UserProfile
                    user_id={client.user!._id}
                    isPlaceholder={true}
                    placeholderProfile={profile}
                    {...({} as any)}
                />
            </div>
            <div className={styles.titleNew}>
                Display Name
                <div className={styles.new}>NEW</div>
            </div>
            <CategoryButton
                onClick={() =>
                    modalController.push({ type: "modify_displayname" })
                }
                icon={<UserCircle size={24} />}
                action="chevron"
                description={"Change your display name to whatever you like"}>
                Display Name
            </CategoryButton>
            {/*<h3>Badges</h3>
            <div className={styles.badgePicker}>
                <div className={styles.overlay} />
                <div className={styles.container}>
                    <div className={styles.check}>a</div>
                    <div className={styles.check}>b</div>
                    <div className={styles.check}>c</div>
                </div>
                <div className={styles.overlay2} />
            </div>*/}
            <hr />
            <div className={styles.row}>
                <div className={styles.pfp}>
                    <h3>
                        <Text id="app.settings.pages.profile.profile_picture" />
                    </h3>
                    <FileUploader
                        width={92}
                        height={92}
                        style="icon"
                        fileType="avatars"
                        behaviour="upload"
                        maxFileSize={4_000_000}
                        onUpload={(avatar) => client.users.edit({ avatar })}
                        remove={() => client.users.edit({ remove: ["Avatar"] })}
                        defaultPreview={client.user!.generateAvatarURL(
                            { max_side: 256 },
                            true,
                        )}
                        previewURL={client.user!.generateAvatarURL(
                            { max_side: 256 },
                            true,
                        )}
                    />
                </div>
                <div className={styles.background}>
                    <h3>
                        <Text id="app.settings.pages.profile.custom_background" />
                    </h3>
                    <FileUploader
                        height={92}
                        style="banner"
                        behaviour="upload"
                        fileType="backgrounds"
                        maxFileSize={6_000_000}
                        onUpload={async (background) => {
                            await client.users.edit({
                                profile: { background },
                            });
                            refreshProfile();
                        }}
                        remove={async () => {
                            await client.users.edit({
                                remove: ["ProfileBackground"],
                            });
                            setProfile({ ...profile, background: undefined });
                        }}
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
                </div>
            </div>
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
            <div className={styles.markdown}>
                <Markdown size="24" />
                <h5>
                    Descriptions support Markdown formatting,{" "}
                    <a
                        href="https://developers.revolt.chat/markdown"
                        target="_blank"
                        rel="noreferrer">
                        learn more here
                    </a>
                    .
                </h5>
            </div>
            <p>
                <Button
                    palette="secondary"
                    onClick={() => {
                        setChanged(false);
                        client.users.edit({
                            profile: { content: profile?.content },
                        });
                    }}
                    disabled={!changed}>
                    <Text id="app.special.modals.actions.save" />
                </Button>
            </p>

            <LineDivider />
            <Tip>
                <span>
                    Want to change your username?{" "}
                    <a onClick={() => switchPage("account")}>
                        Head over to your account settings.
                    </a>
                </span>
            </Tip>
        </div>
    );
});
