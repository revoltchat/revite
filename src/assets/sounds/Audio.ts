import call_join from "./call_join.mp3";
import call_leave from "./call_leave.mp3";
import message from "./message.mp3";
import outbound from "./outbound.mp3";

const SoundMap: { [key in Sounds]: string } = {
    message,
    outbound,
    call_join,
    call_leave,
};

export type Sounds = "message" | "outbound" | "call_join" | "call_leave";
export const SOUNDS_ARRAY: Sounds[] = [
    "message",
    "outbound",
    "call_join",
    "call_leave",
];

export function playSound(sound: Sounds) {
    let file = SoundMap[sound];
    let el = new Audio(file);
    try {
        el.play();
    } catch (err) {
        console.error("Failed to play audio file", file, err);
    }
}
