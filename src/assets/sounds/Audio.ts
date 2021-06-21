import message from './message.mp3';
import call_join from './call_join.mp3';
import call_leave from './call_leave.mp3';

const SoundMap: { [key in Sounds]: string } = {
    message,
    call_join,
    call_leave
}

export type Sounds = 'message' | 'call_join' | 'call_leave';

export function playSound(sound: Sounds) {
    let file = SoundMap[sound];
    let el = new Audio(file);
    try {
        el.play();
    } catch (err) {
        console.error('Failed to play audio file', file, err);
    }
}
