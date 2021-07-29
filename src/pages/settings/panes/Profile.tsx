import { Users } from "revolt.js/dist/api/objects";

import styles from "./Panes.module.scss";
import { IntlContext, Text, translate } from "preact-i18n";
import { useContext, useEffect, useState } from "preact/hooks";

import TextAreaAutoSize from "../../../lib/TextAreaAutoSize";

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

export function Profile() {
    const { intl } = useContext(IntlContext);
    const status = useContext(StatusContext);

    const client = useClient();

    const [profile, setProfile] = useState<undefined | Users.Profile>(
        undefined,
    );

    // ! FIXME: temporary solution
    // ! we should just announce profile changes through WS
    function refreshProfile() {
        client.users
            .fetchProfile(client.user!._id)
            .then((profile) => setProfile(profile ?? {}));
    }

    useEffect(() => {
        if (profile === undefined && status === ClientStatus.ONLINE) {
            refreshProfile();
        }
    }, [status]);

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
                    onClose={() => {}}
                />
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
                        onUpload={(avatar) => client.users.editUser({ avatar })}
                        remove={() =>
                            client.users.editUser({ remove: "Avatar" })
                        }
                        defaultPreview={client.users.getAvatarURL(
                            client.user!._id,
                            { max_side: 256 },
                            true,
                        )}
                        previewURL={client.users.getAvatarURL(
                            client.user!._id,
                            { max_side: 256 },
                            true,
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
                            await client.users.editUser({
                                profile: { background },
                            });
                            refreshProfile();
                        }}
                        remove={async () => {
                            await client.users.editUser({
                                remove: "ProfileBackground",
                            });
                            setProfile({ ...profile, background: undefined });
                        }}
                        previewURL={
                            profile?.background
                                ? client.users.getBackgroundURL(
                                      profile,
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
                    "",
                    (intl as any).dictionary as Record<string, unknown>,
                )}
                onKeyUp={onKeyUp}
                onKeyDown={onKeyDown}
                onFocus={onFocus}
                onBlur={onBlur}
            />
            <p>
                <Button
                    contrast
                    onClick={() => {
                        setChanged(false);
                        client.users.editUser({
                            profile: { content: profile?.content },
                        });
                    }}
                    disabled={!changed}>
                    <Text id="app.special.modals.actions.save" />
                </Button>
            </p>
        </div>
    );
}
