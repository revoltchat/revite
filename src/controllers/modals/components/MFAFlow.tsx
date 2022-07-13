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

import { ModalProps } from "../types";

/**
 * Mapping of MFA methods to icons
 */
const ICONS: Record<API.MFAMethod, React.FC<any>> = {
    Password: Keyboard,
    Totp: Key,
    Recovery: Archive,
};

/**
 * Component for handling challenge entry
 */
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

            {type === "Totp" && (
                <InputBox
                    value={(value as { totp_code: string })?.totp_code}
                    onChange={(e) =>
                        onChange({ totp_code: e.currentTarget.value })
                    }
                />
            )}

            {type === "Recovery" && (
                <InputBox
                    value={(value as { recovery_code: string })?.recovery_code}
                    onChange={(e) =>
                        onChange({ recovery_code: e.currentTarget.value })
                    }
                />
            )}
        </>
    );
}

/**
 * MFA ticket creation flow
 */
export default function MFAFlow({
    onClose,
    signal,
    ...props
}: ModalProps<"mfa_flow">) {
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
            title={<Text id="app.special.modals.confirm" />}
            description={
                <Text
                    id={`app.special.modals.mfa.${
                        selectedMethod ? "confirm" : "select_method"
                    }`}
                />
            }
            actions={
                selectedMethod
                    ? [
                          {
                              palette: "primary",
                              children: (
                                  <Text id="app.special.modals.actions.confirm" />
                              ),
                              onClick: generateTicket,
                              confirmation: true,
                          },
                          {
                              palette: "plain",
                              children: (
                                  <Text
                                      id={`app.special.modals.actions.${
                                          methods!.length === 1
                                              ? "cancel"
                                              : "back"
                                      }`}
                                  />
                              ),
                              onClick: () => {
                                  if (methods!.length === 1) {
                                      props.callback();
                                      return true;
                                  }
                                  setSelected(undefined);
                              },
                          },
                      ]
                    : [
                          {
                              palette: "plain",
                              children: (
                                  <Text id="app.special.modals.actions.cancel" />
                              ),
                              onClick: () => {
                                  props.callback();
                                  return true;
                              },
                          },
                      ]
            }
            // If we are logging in or have selected a method,
            // don't allow the user to dismiss the modal by clicking off.
            // This is to just generally prevent annoying situations
            // where you accidentally close the modal while logging in
            // or when switching to your password manager.
            nonDismissable={
                props.state === "unknown" ||
                typeof selectedMethod !== "undefined"
            }
            signal={signal}
            onClose={() => {
                props.callback();
                onClose();
            }}>
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
                                <Text id={`login.${method.toLowerCase()}`} />
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
