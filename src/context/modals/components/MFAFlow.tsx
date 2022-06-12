import { Archive } from "@styled-icons/boxicons-regular";
import { Key, Keyboard } from "@styled-icons/boxicons-solid";
import { API } from "revolt.js";

import { Text } from "preact-i18n";
import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useState,
} from "preact/hooks";

import {
    Category,
    CategoryButton,
    InputBox,
    Modal,
    Preloader,
} from "@revoltchat/ui";

import { noopTrue } from "../../../lib/js";

import { ModalProps } from "../types";

const ICONS: Record<API.MFAMethod, React.FC<any>> = {
    Password: Keyboard,
    Totp: Key,
    Recovery: Archive,
};

function ResponseEntry({
    type,
    value,
    onChange,
}: {
    type: API.MFAMethod;
    value?: API.MFAResponse;
    onChange: (v: API.MFAResponse) => void;
}) {
    return (
        <>
            <Category compact>
                <Text id={`login.${type.toLowerCase()}`} />
            </Category>

            {type === "Password" && (
                <InputBox
                    type="password"
                    value={(value as { password: string })?.password}
                    onChange={(e) =>
                        onChange({ password: e.currentTarget.value })
                    }
                />
            )}
        </>
    );
}

/**
 * MFA ticket creation flow
 */
export default function MFAFlow({ onClose, ...props }: ModalProps<"mfa_flow">) {
    const [methods, setMethods] = useState<API.MFAMethod[] | undefined>(
        props.state === "unknown" ? props.available_methods : undefined,
    );

    // Current state of the modal
    const [selectedMethod, setSelected] = useState<API.MFAMethod>();
    const [response, setResponse] = useState<API.MFAResponse>();

    // Fetch available methods if they have not been provided.
    useEffect(() => {
        if (!methods && props.state === "known") {
            props.client.api.get("/auth/mfa/methods").then(setMethods);
        }
    }, []);

    // Always select first available method if only one available.
    useLayoutEffect(() => {
        if (methods && methods.length === 1) {
            setSelected(methods[0]);
        }
    }, [methods]);

    // Callback to generate a new ticket or send response back up the chain.
    const generateTicket = useCallback(async () => {
        if (response) {
            if (props.state === "known") {
                const ticket = await props.client.api.put(
                    "/auth/mfa/ticket",
                    response,
                );

                props.callback(ticket);
            } else {
                props.callback(response);
            }

            return true;
        }

        return false;
    }, [response]);

    return (
        <Modal
            title="Confirm action."
            description={
                selectedMethod
                    ? "Please confirm using selected method."
                    : "Please select a method to authenticate your request."
            }
            actions={
                selectedMethod
                    ? [
                          {
                              palette: "primary",
                              children: "Confirm",
                              onClick: generateTicket,
                              confirmation: true,
                          },
                          {
                              palette: "plain",
                              children:
                                  methods!.length === 1 ? "Cancel" : "Back",
                              onClick: () =>
                                  methods!.length === 1
                                      ? true
                                      : void setSelected(undefined),
                          },
                      ]
                    : [
                          {
                              palette: "plain",
                              children: "Cancel",
                              onClick: noopTrue,
                          },
                      ]
            }
            onClose={onClose}>
            {methods ? (
                selectedMethod ? (
                    <ResponseEntry
                        type={selectedMethod}
                        value={response}
                        onChange={setResponse}
                    />
                ) : (
                    methods.map((method) => {
                        const Icon = ICONS[method];
                        return (
                            <CategoryButton
                                key={method}
                                action="chevron"
                                icon={<Icon size={24} />}
                                onClick={() => setSelected(method)}>
                                {method}
                            </CategoryButton>
                        );
                    })
                )
            ) : (
                <Preloader type="ring" />
            )}
        </Modal>
    );
}
