import { Users } from "revolt.js/dist/api/objects";

import styles from "./UserPicker.module.scss";
import { Text } from "preact-i18n";
import { useState } from "preact/hooks";

import { useData } from "../../../mobx/State";

import UserCheckbox from "../../../components/common/user/UserCheckbox";
import Modal from "../../../components/ui/Modal";

interface Props {
    omit?: string[];
    onClose: () => void;
    callback: (users: string[]) => Promise<void>;
}

export function UserPicker(props: Props) {
    const [selected, setSelected] = useState<string[]>([]);
    const omit = [...(props.omit || []), "00000000000000000000000000"];

    const store = useData();

    return (
        <Modal
            visible={true}
            title={<Text id="app.special.popovers.user_picker.select" />}
            onClose={props.onClose}
            actions={[
                {
                    children: <Text id="app.special.modals.actions.ok" />,
                    onClick: () => props.callback(selected).then(props.onClose),
                },
            ]}>
            <div className={styles.list}>
                {[...store.users.values()]
                    .filter(
                        (x) =>
                            x &&
                            x.relationship === Users.Relationship.Friend &&
                            !omit.includes(x._id),
                    )
                    .map((x) => (
                        <UserCheckbox
                            user={x}
                            checked={selected.includes(x._id)}
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
