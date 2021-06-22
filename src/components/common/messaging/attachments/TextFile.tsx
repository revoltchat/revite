import axios from 'axios';
import Preloader from '../../../ui/Preloader';
import styles from './Attachment.module.scss';
import { Attachment } from 'revolt.js/dist/api/objects';
import { useContext, useEffect, useState } from 'preact/hooks';
import RequiresOnline from '../../../../context/revoltjs/RequiresOnline';
import { AppContext, StatusContext } from '../../../../context/revoltjs/RevoltClient';

interface Props {
    attachment: Attachment;
}

const fileCache: { [key: string]: string } = {};

export default function TextFile({ attachment }: Props) {
    const [ content, setContent ] = useState<undefined | string>(undefined);
    const [ loading, setLoading ] = useState(false);
    const status = useContext(StatusContext);
    const client = useContext(AppContext);

    const url = client.generateFileURL(attachment)!;

    useEffect(() => {
        if (typeof content !== 'undefined') return;
        if (loading) return;
        setLoading(true);

        let cached = fileCache[attachment._id];
        if (cached) {
            setContent(cached);
            setLoading(false);
        } else {
            axios.get(url)
                .then(res => {
                    setContent(res.data);
                    fileCache[attachment._id] = res.data;
                    setLoading(false);
                })
                .catch(() => {
                    console.error("Failed to load text file. [", attachment._id, "]");
                    setLoading(false)
                })
        }
    }, [ content, loading, status ]);

    return (
        <div className={styles.textContent} data-loading={typeof content === 'undefined'}>
            {
                content ?
                    <pre><code>{ content }</code></pre>
                    : <RequiresOnline>
                        <Preloader type="ring" />
                    </RequiresOnline>
            }
        </div>
    )
}
