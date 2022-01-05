import styles from "./Panes.module.scss";
import { Text } from "preact-i18n";
import { useEffect, useState } from "preact/hooks";

import { TextReact } from "../../../lib/i18n";
import { stopPropagation } from "../../../lib/stopPropagation";
import { voiceState } from "../../../lib/vortex/VoiceState";

import Button from "../../../components/ui/Button";
import ComboBox from "../../../components/ui/ComboBox";
import Overline from "../../../components/ui/Overline";
import Tip from "../../../components/ui/Tip";
import opusSVG from "../assets/opus_logo.svg";

{
    /*import OpusSVG from "../assets/opus_logo.svg";*/
}

const constraints = { audio: true };

// TODO: do not rewrite this code until voice is rewritten!

export function Audio() {
    const [mediaStream, setMediaStream] = useState<MediaStream | undefined>(
        undefined,
    );
    const [mediaDevices, setMediaDevices] = useState<
        MediaDeviceInfo[] | undefined
    >(undefined);
    const [permission, setPermission] = useState<PermissionState | undefined>(
        undefined,
    );
    const [error, setError] = useState<DOMException | undefined>(undefined);

    const askOrGetPermission = async () => {
        try {
            const result = await navigator.mediaDevices.getUserMedia(
                constraints,
            );

            setMediaStream(result);
        } catch (err) {
            // The user has blocked the permission
            setError(err as DOMException);
        }

        try {
            const { state } = await navigator.permissions.query({
                // eslint-disable-next-line
                // @ts-ignore: very few browsers accept this `PermissionName`, but it has been drafted in https://www.w3.org/TR/permissions/#powerful-features-registry
                name: "microphone",
            });

            setPermission(state);
        } catch (err) {
            // the browser might not support `query` functionnality or `PermissionName`
            // nothing to do
        }
    };

    useEffect(() => {
        return () => {
            if (mediaStream) {
                // close microphone access on unmount
                mediaStream.getTracks().forEach((track) => {
                    track.stop();
                });
            }
        };
    }, [mediaStream]);

    useEffect(() => {
        if (!mediaStream) {
            return;
        }

        navigator.mediaDevices.enumerateDevices().then(
            (devices) => {
                setMediaDevices(devices);
            },
            (err) => {
                setError(err as DOMException);
            },
        );
    }, [mediaStream]);

    const handleAskForPermission = (
        ev: JSX.TargetedMouseEvent<HTMLElement>,
    ) => {
        stopPropagation(ev);
        setError(undefined);
        askOrGetPermission();
    };

    return (
        <>
            <div class={styles.audio}>
                {!permission && (
                    <Tip error hideSeparator>
                        <Text id="app.settings.pages.audio.tip_grant_permission" />
                    </Tip>
                )}

                {error && permission === "prompt" && (
                    <Tip error hideSeparator>
                        <Text id="app.settings.pages.audio.tip_retry" />
                        <a onClick={handleAskForPermission}>
                            <Text id="app.settings.pages.audio.button_retry" />
                        </a>
                        .
                    </Tip>
                )}

                <div className={styles.audioRow}>
                    <div className={styles.select}>
                        <h3>
                            <Text id="app.settings.pages.audio.input_device" />
                        </h3>
                        <div class={styles.audioBox}>
                            <ComboBox
                                value={
                                    window.localStorage.getItem(
                                        "audioInputDevice",
                                    ) ?? 0
                                }
                                onChange={(e) =>
                                    changeAudioDevice(
                                        e.currentTarget.value,
                                        "input",
                                    )
                                }>
                                {mediaDevices
                                    ?.filter(
                                        (device) =>
                                            device.kind === "audioinput",
                                    )
                                    .map((device) => {
                                        return (
                                            <option
                                                value={device.deviceId}
                                                key={device.deviceId}>
                                                {device.label || (
                                                    <Text id="app.settings.pages.audio.device_label_NA" />
                                                )}
                                            </option>
                                        );
                                    })}
                            </ComboBox>
                            {/*TOFIX: add logic to sound notches*/}
                            {/*<div className={styles.notches}>
                                <div />
                                <div />
                                <div />
                                <div />
                                <div />
                                <div />
                                <div />
                                <div />
                                <div />
                                <div />
                            </div>*/}
                            {!permission && (
                                <Button
                                    compact
                                    onClick={(e) => handleAskForPermission(e)}
                                    error>
                                    <Text id="app.settings.pages.audio.button_grant" />
                                </Button>
                            )}
                            {error && error.name === "NotAllowedError" && (
                                <Overline
                                    error="AudioPermissionBlock"
                                    type="error"
                                    block
                                />
                            )}
                        </div>
                    </div>
                    <div className={styles.select}>
                        <h3>
                            <Text id="app.settings.pages.audio.output_device" />
                        </h3>
                        {/* TOFIX: create audio output combobox*/}
                        <ComboBox
                            value={
                                window.localStorage.getItem(
                                    "audioOutputDevice",
                                ) ?? 0
                            }
                            onChange={(e) =>
                                changeAudioDevice(
                                    e.currentTarget.value,
                                    "output",
                                )
                            }>
                            {mediaDevices
                                ?.filter(
                                    (device) => device.kind === "audiooutput",
                                )
                                .map((device) => {
                                    return (
                                        <option
                                            value={device.deviceId}
                                            key={device.deviceId}>
                                            {device.label || (
                                                <Text id="app.settings.pages.audio.device_label_NA" />
                                            )}
                                        </option>
                                    );
                                })}
                        </ComboBox>
                        {/*<div className={styles.notches}>
                            <div />
                            <div />
                            <div />
                            <div />
                            <div />
                            <div />
                            <div />
                            <div />
                            <div />
                            <div />
                        </div>*/}
                    </div>
                </div>
            </div>
            <hr />
            <div className={styles.opus}>
                <img height="20" src={opusSVG} draggable={false} />
                Audio codec powered by Opus
            </div>
        </>
    );
}

function changeAudioDevice(deviceId: string, deviceType: string) {
    if (deviceType === "input") {
        window.localStorage.setItem("audioInputDevice", deviceId);
        if (voiceState.isProducing("audio")) {
            voiceState.stopProducing("audio");
            voiceState.startProducing("audio");
        }
    } else if (deviceType === "output") {
        window.localStorage.setItem("audioOutputDevice", deviceId);
    }
}
