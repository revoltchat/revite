import styles from "./UserPicker.module.scss";
import { Text } from "preact-i18n";
import { useState } from "preact/hooks";

import { Modal } from "@revoltchat/ui";

import UserCheckbox from "../../../components/common/user/UserCheckbox";
import { useClient } from "../../revoltjs/RevoltClient";

interface Props {
    omit?: string[];
    onClose: () => void;
    callback: (users: string[]) => Promise<void>;
}

export function UserPicker(props: Props) {
    const [selected, setSelected] = useState<string[]>([]);
    const omit = [...(props.omit || []), "00000000000000000000000000"];

    const client = useClient();

    return (
        <Modal
            title={<Text id="app.special.popovers.user_picker.select" />}
            onClose={props.onClose}
            actions={[
                {
                    children: <Text id="app.special.modals.actions.ok" />,
                    onClick: () => props.callback(selected).then(() => true),
                },
            ]}>
            <div className={styles.list}>
                {[...client.users.values()]
                    .filter(
                        (x) =>
                            x &&
                            x.relationship === "Friend" &&
                            !omit.includes(x._id),
                    )
                    .map((x) => (
                        <UserCheckbox
                            key={x._id}
                            user={x}
                            value={selected.includes(x._id)}
                            onChange={(v) => {
                                if (v) {
                                    setSelected([...selected, x._id]);
                                } else {
                                    setSelected(
                                        selected.filter((y) => y !== x._id),
                                    );
                                }
                            }}
                        />
                    ))}
            </div>
        </Modal>
    );
}
