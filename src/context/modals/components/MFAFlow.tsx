import { Archive } from "@styled-icons/boxicons-regular";
import { Key, Keyboard } from "@styled-icons/boxicons-solid";
import { API } from "revolt.js";

import { Text } from "preact-i18n";
import { useCallback, useEffect, useState } from "preact/hooks";

import {
    Category,
    CategoryButton,
    InputBox,
    Modal,
    Preloader,
} from "@revoltchat/ui";

import { noopTrue } from "../../../lib/js";

import { useApplicationState } from "../../../mobx/State";

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
    if (type === "Password") {
        return (
            <>
                <Category compact>
                    <Text id={`login.${type.toLowerCase()}`} />
                </Category>
                <InputBox
                    type="password"
                    value={(value as { password: string })?.password}
                    onChange={(e) =>
                        onChange({ password: e.currentTarget.value })
                    }
                />
            </>
        );
    } else {
        return null;
    }
}

/**
 * MFA ticket creation flow
 */
export default function MFAFlow({
    callback,
    onClose,
    ...props
}: ModalProps<"mfa_flow">) {
    const state = useApplicationState();

    const [methods, setMethods] = useState<API.MFAMethod[] | undefined>(
        props.state === "unknown" ? props.available_methods : undefined,
    );

    const [selectedMethod, setSelected] = useState<API.MFAMethod>();
    const [response, setResponse] = useState<API.MFAResponse>();

    useEffect(() => {
        if (!methods && props.state === "known") {
            props.client.api.get("/auth/mfa/methods").then(setMethods);
        }
    }, []);

    const generateTicket = useCallback(async () => {
        if (response) {
            let ticket;

            if (props.state === "known") {
                ticket = await props.client.api.put(
                    "/auth/mfa/ticket",
                    response,
                );
            } else {
                ticket = await state.config
                    .createClient()
                    .api.put("/auth/mfa/ticket", response, {
                        headers: {
                            "X-MFA-Ticket": props.ticket.token,
                        },
                    });
            }

            callback(ticket);
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
                              children: "Back",
                              onClick: () => setSelected(undefined),
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
