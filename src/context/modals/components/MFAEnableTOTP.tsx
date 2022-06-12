import { QRCodeSVG } from "qrcode.react";
import styled from "styled-components";

import { useState } from "preact/hooks";

import { Category, Centred, Column, InputBox, Modal } from "@revoltchat/ui";

import { ModalProps } from "../types";

const Code = styled.code`
    user-select: all;
`;

/**
 * TOTP enable modal
 */
export default function MFAEnableTOTP({
    identifier,
    secret,
    callback,
    onClose,
}: ModalProps<"mfa_enable_totp">) {
    const uri = `otpauth://totp/Revolt:${identifier}?secret=${secret}&issuer=Revolt`;
    const [value, setValue] = useState("");

    return (
        <Modal
            title="Enable authenticator app"
            description={
                "Please scan or use the token below in your authentication app."
            }
            actions={[
                {
                    palette: "primary",
                    children: "Continue",
                    onClick: () => {
                        callback(value.trim().replace(/\s/g, ""));
                        return true;
                    },
                    confirmation: true,
                },
                {
                    palette: "plain",
                    children: "Cancel",
                    onClick: () => {
                        callback();
                        return true;
                    },
                },
            ]}
            onClose={() => {
                callback();
                onClose();
            }}>
            <Column>
                <Centred>
                    <QRCodeSVG
                        value={uri}
                        bgColor="transparent"
                        fgColor="var(--foreground)"
                    />
                </Centred>
                <Centred>
                    <Code>{secret}</Code>
                </Centred>
            </Column>

            <Category compact>Enter Code</Category>

            <InputBox
                value={value}
                onChange={(e) => setValue(e.currentTarget.value)}
            />
        </Modal>
    );
}
