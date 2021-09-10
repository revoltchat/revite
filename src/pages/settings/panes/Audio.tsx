import { Text } from "preact-i18n";
import { useEffect, useState } from "preact/hooks";

import { TextReact } from "../../../lib/i18n";
import { stopPropagation } from "../../../lib/stopPropagation";
import { voiceState } from "../../../lib/vortex/VoiceState";

import { connectState } from "../../../redux/connector";

import ComboBox from "../../../components/ui/ComboBox";
import Overline from "../../../components/ui/Overline";
import Tip from "../../../components/ui/Tip";

const constraints = { audio: true };

export function Component() {
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
                // @ts-ignore
                name: "microphone",
            });

            setPermission(state);
        } catch (err) {
            // the browser might not support `query` functionnality
            setError(err as DOMException);
        }
    };

    useEffect(() => {
        askOrGetPermission();
    }, []);

    useEffect(() => {
        return () => {
            if (mediaStream) {
                // close microphone access on unmount
                mediaStream.getTracks().forEach(track => {
                    track.stop()
                })
            }
        }
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
        ev: JSX.TargetedMouseEvent<HTMLAnchorElement>,
    ) => {
        stopPropagation(ev);
        setError(undefined);
        askOrGetPermission();
    };

    return (
        <>
            <div>
                <h3>
                    <Text id="app.settings.pages.audio.input_device" />
                </h3>
                <ComboBox
                    value={window.localStorage.getItem("audioInputDevice") ?? 0}
                    onChange={(e) =>
                        changeAudioDevice(e.currentTarget.value, "input")
                    }>
                    {mediaDevices
                        ?.filter((device) => device.kind === "audioinput")
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
                {error && error.name === "NotAllowedError" && (
                    <Overline error="AudioPermissionBlock" type="error" block />
                )}

                {error && permission === "prompt" && (
                    <Tip>
                        <TextReact
                            id="app.settings.pages.audio.tip_retry"
                            fields={{
                                retryBtn: (
                                    <a onClick={handleAskForPermission}>
                                        <Text id="app.settings.pages.audio.button_retry" />
                                    </a>
                                ),
                            }}
                        />
                    </Tip>
                )}
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

export const Audio = connectState(Component, () => {
    return;
});
