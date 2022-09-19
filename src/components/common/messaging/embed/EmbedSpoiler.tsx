import classNames from "classnames";
import { API } from "revolt.js";
import styles from "./Embed.module.scss";

export default function EmbedSpoiler(){
    return (
    <div className={classNames(styles.spoiler_container)}>
        <h1 className={classNames(styles.spoiler_title)}>SPOILER</h1>
    </div>
    );
}