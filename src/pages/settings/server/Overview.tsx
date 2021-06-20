import { Text } from "preact-i18n";
import styles from './Panes.module.scss';
import Button from "../../../components/ui/Button";
import { Servers } from "revolt.js/dist/api/objects";
import { SettingsTextArea } from "../SettingsTextArea";
import InputBox from "../../../components/ui/InputBox";
import { useContext, useEffect, useState } from "preact/hooks";
import { AppContext } from "../../../context/revoltjs/RevoltClient";
import { FileUploader } from "../../../context/revoltjs/FileUploads";

interface Props {
    server: Servers.Server;
}

export function Overview({ server }: Props) {
    const client = useContext(AppContext);

    const [name, setName] = useState(server.name);
    const [description, setDescription] = useState(server.description ?? '');

    useEffect(() => setName(server.name), [ server.name ]);
    useEffect(() => setDescription(server.description ?? ''), [ server.description ]);

    const [ changed, setChanged ] = useState(false);
    function save() {
        let changes: any = {};
        if (name !== server.name) changes.name = name;
        if (description !== server.description)
            changes.description = description;
        
        client.servers.edit(server._id, changes);
        setChanged(false);
    }

    return (
        <div className={styles.overview}>
            <div className={styles.row}>
                <FileUploader
                    width={80}
                    height={80}
                    style="icon"
                    fileType="icons"
                    behaviour="upload"
                    maxFileSize={2_500_000}
                    onUpload={icon => client.servers.edit(server._id, { icon })}
                    previewURL={client.servers.getIconURL(server._id, { max_side: 256 }, true)}
                    remove={() => client.servers.edit(server._id, { remove: 'Icon' })}
                />
                <div className={styles.name}>
                    <h3>
                        <Text id="app.main.servers.name" />
                    </h3>
                    <InputBox
                        contrast
                        value={name}
                        maxLength={32}
                        onChange={e => {
                            setName(e.currentTarget.value)
                            if (!changed) setChanged(true)
                        }}
                    />
                </div>
            </div>

            <h3>
                <Text id="app.main.servers.description" />
            </h3>
            <SettingsTextArea
                maxRows={10}
                minHeight={60}
                maxLength={1024}
                value={description}
                placeholder={"Add a topic..."}
                onChange={content => {
                    setDescription(content);
                    if (!changed) setChanged(true)
                }}
            />
            <Button onClick={save} contrast disabled={!changed}>
                <Text id="app.special.modals.actions.save" />
            </Button>

            <h3>
                <Text id="app.main.servers.custom_banner" />
            </h3>
            <FileUploader
                height={160}
                style="banner"
                fileType="banners"
                behaviour="upload"
                maxFileSize={6_000_000}
                onUpload={banner => client.servers.edit(server._id, { banner })}
                previewURL={client.servers.getBannerURL(server._id, { width: 1000 }, true)}
                remove={() => client.servers.edit(server._id, { remove: 'Banner' })}
            />
        </div>
    );
}
