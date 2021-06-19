import styles from "./Settings.module.scss";
import { TextArea, TextAreaProps } from "../../components/ui/TextArea";

export function SettingsTextArea(props: TextAreaProps) {
    return <TextArea {...props} className={styles.textarea} padding={16} />;
}
