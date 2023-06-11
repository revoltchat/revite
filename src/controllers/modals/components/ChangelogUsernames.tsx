import Lottie, { LottieRefCurrentProps } from "lottie-react";

import { useEffect, useRef } from "preact/hooks";

import { Button, Column, InputBox, Modal, Row } from "@revoltchat/ui";

import { useClient } from "../../client/ClientController";
import { modalController } from "../ModalController";
import { ModalProps } from "../types";
import usernameAnim from "./legacy/usernameUpdateLottie.json";

/**
 * Changelog: Username update
 */
export default function ChangelogUsernames({
    onClose,
    signal,
}: ModalProps<"changelog_usernames">) {
    const client = useClient();

    const lottieRef = useRef<LottieRefCurrentProps>();

    useEffect(() => {
        if (lottieRef.current) {
            const timer = setTimeout(() => lottieRef.current!.play(), 2500);
            return () => clearTimeout(timer);
        }
    }, [lottieRef]);

    return (
        <Modal onClose={onClose} signal={signal} transparent>
            {
                (
                    <Column gap="0">
                        <div
                            style={{
                                background: "black",
                                borderStartStartRadius: "12px",
                                borderStartEndRadius: "12px",
                                display: "grid",
                                placeItems: "center",
                                padding: "1.5em",
                            }}>
                            <Lottie
                                lottieRef={lottieRef as never}
                                animationData={usernameAnim}
                                autoplay={false}
                                loop={false}
                                style={{ width: "240px" }}
                            />
                        </div>
                        <div
                            style={{
                                padding: "1em",
                                background: "var(--secondary-header)",
                                textAlign: "center",
                            }}>
                            <Column
                                gap="6px"
                                style={{
                                    alignItems: "center",
                                }}>
                                <span
                                    style={{
                                        fontSize: "1.5em",
                                        fontWeight: 700,
                                        marginBottom: "12px",
                                    }}>
                                    Usernames are Changing
                                </span>
                                <span
                                    style={{
                                        color: "var(--secondary-foreground)",
                                        fontSize: "0.9em",
                                        fontWeight: 500,
                                    }}>
                                    We've changed how usernames work on Revolt.
                                    Now you can set a display name in addition
                                    to a username with a number tag for easier
                                    sharing.
                                </span>
                                <span
                                    style={{
                                        color: "var(--secondary-foreground)",
                                        fontSize: "0.9em",
                                        fontWeight: 500,
                                    }}>
                                    Here's how your new username looks:
                                </span>
                                <InputBox
                                    value={
                                        client.user!.display_name ??
                                        client.user!.username
                                    }
                                    style={{
                                        maxWidth: "180px",
                                    }}
                                    disabled
                                />
                                <InputBox
                                    value={
                                        client.user.username +
                                        "#" +
                                        client.user.discriminator
                                    }
                                    style={{
                                        maxWidth: "180px",
                                    }}
                                    disabled
                                />
                                <a
                                    href="https://revolt.chat/posts/evolving-usernames"
                                    target="_blank">
                                    Read more about this change
                                </a>
                            </Column>
                        </div>
                        <Row
                            style={{
                                padding: "1em",
                                borderEndStartRadius: "12px",
                                borderEndEndRadius: "12px",
                                background: "var(--secondary-background)",
                                textAlign: "center",
                                justifyContent: "end",
                            }}>
                            <Button palette="plain" onClick={onClose}>
                                Skip for now
                            </Button>
                            <Button
                                palette="accent"
                                onClick={() => {
                                    modalController.openLink(
                                        "/settings/profile",
                                    );
                                    onClose();
                                }}>
                                Edit Profile
                            </Button>
                        </Row>
                    </Column>
                ) as any
            }
        </Modal>
    );
}
