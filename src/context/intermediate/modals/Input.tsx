import { useHistory } from "react-router";
import { Server } from "revolt.js";

import { Text } from "preact-i18n";
import { useContext, useState } from "preact/hooks";

import { Category, InputBox, Modal } from "@revoltchat/ui";

import { useClient } from "../../../controllers/client/ClientController";
import { I18nError } from "../../Locale";
import { takeError } from "../../revoltjs/util";

interface Props {
    onClose: () => void;
    question: Children;
    field?: Children;
    description?: Children;
    defaultValue?: string;
    callback: (value: string) => Promise<void>;
}

export function InputModal({
    onClose,
    question,
    field,
    description,
    defaultValue,
    callback,
}: Props) {
    const [processing, setProcessing] = useState(false);
    const [value, setValue] = useState(defaultValue ?? "");
    const [error, setError] = useState<undefined | string>(undefined);

    return (
        <Modal
            title={question}
            description={description}
            disabled={processing}
            actions={[
                {
                    confirmation: true,
                    children: <Text id="app.special.modals.actions.ok" />,
                    onClick: () => {
                        setProcessing(true);
                        callback(value)
                            .then(onClose)
                            .catch((err) => {
                                setError(takeError(err));
                                setProcessing(false);
                            });
                    },
                },
                {
                    children: <Text id="app.special.modals.actions.cancel" />,
                    onClick: onClose,
                },
            ]}
            onClose={onClose}>
            {field ? (
                <Category>
                    <I18nError error={error}>{field}</I18nError>
                </Category>
            ) : (
                error && (
                    <Category>
                        <I18nError error={error} />
                    </Category>
                )
            )}
            <InputBox
                value={value}
                style={{ width: "100%" }}
                onChange={(e) => setValue(e.currentTarget.value)}
            />
        </Modal>
    );
}

type SpecialProps = { onClose: () => void } & (
    | {
          type:
              | "create_group"
              | "create_server"
              | "set_custom_status"
              | "add_friend";
      }
    | { type: "create_role"; server: Server; callback: (id: string) => void }
);

export function SpecialInputModal(props: SpecialProps) {
    const history = useHistory();
    const client = useClient();

    const { onClose } = props;
    switch (props.type) {
        default:
            return null;
    }
}
