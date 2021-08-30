import styles from "./Panes.module.scss";
import { Text } from "preact-i18n";

import { connectState } from "../../../redux/connector";

import { voiceState, VoiceStatus } from "../../../lib/vortex/VoiceState";

import ComboBox from "../../../components/ui/ComboBox";
import {useEffect, useState} from "preact/hooks";

export function Component() {
    const [mediaDevices, setMediaDevices] = useState<MediaDeviceInfo[] | undefined>(undefined);

    useEffect(() => {
        navigator
            .mediaDevices
            .enumerateDevices()
            .then( devices => {
                setMediaDevices(devices)
            })
    }, []);

    return (
        <>
        <div>
            <h3>
                <Text id="app.settings.pages.audio.input_device" />
            </h3>
            <ComboBox
                value={window.localStorage.getItem("audioInputDevice") ?? 0}
                onChange={(e) => changeAudioDevice(e.currentTarget.value, "input")}>
                {
                    mediaDevices?.filter(device => device.kind === "audioinput").map(device => {
                        return (
                            <option value={device.deviceId} key={device.deviceId}>
                                {device.label}
                            </option>
                        )
                    })
                }
            </ComboBox>
        </div>
        </>
    );
}

function changeAudioDevice(deviceId: string, deviceType: string) {
    if(deviceType === "input") {
        window.localStorage.setItem("audioInputDevice", deviceId)
        if(voiceState.isProducing("audio")) {
            voiceState.stopProducing("audio");
            voiceState.startProducing("audio");
        }
    }else if(deviceType === "output") {
        window.localStorage.setItem("audioOutputDevice", deviceId)
    }
}

export const Audio = connectState(Component, () => {
    return;
});
