import axios from "axios";
import { API } from "revolt.js";

import styles from "./Attachment.module.scss";
import { Text } from "preact-i18n";
import { useEffect, useState } from "preact/hooks";

import { Button, Preloader } from "@revoltchat/ui";

import { useClient } from "../../../../controllers/client/ClientController";
import RequiresOnline from "../../../../controllers/client/jsx/RequiresOnline";

interface Props {
    attachment: API.File;
}

const fileCache: { [key: string]: string } = {};

export default function TextFile({ attachment }: Props) {
    const [gated, setGated] = useState(attachment.size > 100_000);
    const [content, setContent] = useState<undefined | string>(undefined);
    const [loading, setLoading] = useState(false);

    const client = useClient();
    const url = client.generateFileURL(attachment)!;

    useEffect(() => {
        if (typeof content !== "undefined") return;
        if (loading) return;
        if (gated) return;

        setLoading(true);

        const cached = fileCache[attachment._id];
        if (cached) {
            setContent(cached);
            setLoading(false);
        } else {
            axios
                .get(url, { transformResponse: [] })
                .then((res) => {
                    setContent(res.data);
                    fileCache[attachment._id] = res.data;
                    setLoading(false);
                })
                .catch(() => {
                    console.error(
                        "Failed to load text file. [",
                        attachment._id,
                        "]",
                    );
                    setLoading(false);
                });
        }
    }, [content, loading, gated, attachment._id, attachment.size, url]);

    return (
        <div
            className={styles.textContent}
            data-loading={typeof content === "undefined"}>
            {gated ? (
                <Button palette="accent" onClick={() => setGated(false)}>
                    <Text id="app.main.channel.misc.load_file" />
                </Button>
            ) : content ? (
                <pre>
                    <code>{content}</code>
                </pre>
            ) : (
                <RequiresOnline>
                    <Preloader type="ring" />
                </RequiresOnline>
            )}
        </div>
    );
}
