import axios from "axios";
import { Attachment } from "revolt-api/types/Autumn";

import styles from "./Attachment.module.scss";
import { useContext, useEffect, useState } from "preact/hooks";

import { Preloader } from "@revoltchat/ui/lib/components/atoms/indicators/Preloader";

import RequiresOnline from "../../../../context/revoltjs/RequiresOnline";
import {
    AppContext,
    StatusContext,
} from "../../../../context/revoltjs/RevoltClient";

interface Props {
    attachment: Attachment;
}

const fileCache: { [key: string]: string } = {};

export default function TextFile({ attachment }: Props) {
    const [content, setContent] = useState<undefined | string>(undefined);
    const [loading, setLoading] = useState(false);
    const status = useContext(StatusContext);
    const client = useContext(AppContext);

    const url = client.generateFileURL(attachment)!;

    useEffect(() => {
        if (typeof content !== "undefined") return;
        if (loading) return;

        if (attachment.size > 100_000) {
            setContent(
                "This file is > 100 KB, for your sake I did not load it.\nSee tracking issue here for previews: https://github.com/revoltchat/revite/issues/35",
            );
            return;
        }

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
    }, [content, loading, status, attachment._id, attachment.size, url]);

    return (
        <div
            className={styles.textContent}
            data-loading={typeof content === "undefined"}>
            {content ? (
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
