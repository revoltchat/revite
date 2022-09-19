import classNames from "classnames";
import { useState } from "preact/hooks";
import { API } from "revolt.js";
import styles from "./Embed.module.scss";


export default function EmbedSpoiler(){
    
    const [visible, setVisible] = useState(true);

    return (
    <div className={classNames(styles.spoiler_container, visible ? null : styles.hidden)} onClick={() => setVisible(!visible)}>
        <h1 className={classNames(styles.spoiler_title)}>SPOILER</h1>
    </div>
    );
}
