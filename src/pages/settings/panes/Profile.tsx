import styles from "./Panes.module.scss";
import Button from "../../../components/ui/Button";
import { Users } from "revolt.js/dist/api/objects";
import { IntlContext, Text, translate } from "preact-i18n";
import TextAreaAutoSize from "../../../lib/TextAreaAutoSize";
import { useContext, useEffect, useState } from "preact/hooks";
import { FileUploader } from "../../../context/revoltjs/FileUploads";
import { useForceUpdate, useSelf } from "../../../context/revoltjs/hooks";
import { UserProfile } from "../../../context/intermediate/popovers/UserProfile";
import { ClientStatus, StatusContext } from "../../../context/revoltjs/RevoltClient";

export function Profile() {
    const { intl } = useContext(IntlContext) as any;
    const status = useContext(StatusContext);

    const ctx = useForceUpdate();
    const user = useSelf();
    if (!user) return null;

    const [profile, setProfile] = useState<undefined | Users.Profile>(
        undefined
    );

    // ! FIXME: temporary solution
    // ! we should just announce profile changes through WS
    function refreshProfile() {
        ctx.client.users
            .fetchProfile(user!._id)
            .then(profile => setProfile(profile ?? {}));
    }

    useEffect(() => {
        if (profile === undefined && status === ClientStatus.ONLINE) {
            refreshProfile();
        }
    }, [status]);

    const [ changed, setChanged ] = useState(false);

    return (
        <div className={styles.user}>
            <h3>
                <Text id="app.special.modals.actions.preview" />
            </h3>
            <div className={styles.preview}>
                <UserProfile
                    user_id={user._id}
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
                        onUpload={avatar => ctx.client.users.editUser({ avatar })}
                        remove={() => ctx.client.users.editUser({ remove: 'Avatar' })}
                        defaultPreview={ctx.client.users.getAvatarURL(user._id, { max_side: 256 }, true)}
                        previewURL={ctx.client.users.getAvatarURL(user._id, { max_side: 256 }, true, true)}
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
                        onUpload={async background => {
                            await ctx.client.users.editUser({ profile: { background } });
                            refreshProfile();
                        }}
                        remove={async () => {
                            await ctx.client.users.editUser({ remove: 'ProfileBackground' });
                            setProfile({ ...profile, background: undefined });
                        }}
                        previewURL={profile?.background ? ctx.client.users.getBackgroundURL(profile, { width: 1000 }, true) : undefined}
                    />
                </div>
            </div>
            <h3>
                <Text id="app.settings.pages.profile.info" />
            </h3>
            <TextAreaAutoSize
                maxRows={10}
                minHeight={200}
                maxLength={2000}
                value={profile?.content ?? ""}
                disabled={typeof profile === "undefined"}
                onChange={ev => {
                    setProfile({ ...profile, content: ev.currentTarget.value })
                    if (!changed) setChanged(true)
                }}
                placeholder={translate(
                    `app.settings.pages.profile.${
                        typeof profile === "undefined"
                            ? "fetching"
                            : "placeholder"
                    }`,
                    "",
                    intl.dictionary
                )}
            />
            <Button contrast
                onClick={() => {
                    setChanged(false);
                    ctx.client.users.editUser({ profile: { content: profile?.content } })
                }}
                disabled={!changed}>
                <Text id="app.special.modals.actions.save" />
            </Button>
        </div>
    );
}
