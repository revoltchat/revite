import { Markdown } from "@styled-icons/boxicons-logos";
import { observer } from "mobx-react-lite";
import { Profile as ProfileI } from "revolt-api/types/Users";

import styles from "./Panes.module.scss";
import { Text } from "preact-i18n";
import { useCallback, useContext, useEffect, useState } from "preact/hooks";

import TextAreaAutoSize from "../../../lib/TextAreaAutoSize";
import { useTranslation } from "../../../lib/i18n";

import { UserProfile } from "../../../context/intermediate/popovers/UserProfile";
import { FileUploader } from "../../../context/revoltjs/FileUploads";
import {
    ClientStatus,
    StatusContext,
    useClient,
} from "../../../context/revoltjs/RevoltClient";

import AutoComplete, {
    useAutoComplete,
} from "../../../components/common/AutoComplete";
import Button from "../../../components/ui/Button";

export const Profile = observer(() => {
    const status = useContext(StatusContext);
    const translate = useTranslation();
    const client = useClient();

    const [profile, setProfile] = useState<undefined | ProfileI>(undefined);

    // ! FIXME: temporary solution
    // ! we should just announce profile changes through WS
    const refreshProfile = useCallback(() => {
        client
            .user!.fetchProfile()
            .then((profile) => setProfile(profile ?? {}));
    }, [client.user, setProfile]);

    useEffect(() => {
        if (profile === undefined && status === ClientStatus.ONLINE) {
            refreshProfile();
        }
    }, [profile, status, refreshProfile]);

    const [changed, setChanged] = useState(false);
    function setContent(content?: string) {
        setProfile({ ...profile, content });
        if (!changed) setChanged(true);
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
                    dummy={true}
                    dummyProfile={profile}
                />
            </div>
            <h3>Badges</h3>
            <div className={styles.badgePicker}>
                <div className={styles.check}>a</div>
                <div className={styles.check}>b</div>
                <div className={styles.check}>c</div>
            </div>
            <div className={styles.row}>
                <div className={styles.pfp}>
                    <h3>
                        <Text id="app.settings.pages.profile.profile_picture" />
                    </h3>
                    <FileUploader
                        width={80}
                        height={80}
                        style="icon"
                        fileType="avatars"
                        behaviour="upload"
                        maxFileSize={4_000_000}
                        onUpload={(avatar) => client.users.edit({ avatar })}
                        remove={() => client.users.edit({ remove: "Avatar" })}
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
                                remove: "ProfileBackground",
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
                    contrast
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
        </div>
    );
});
