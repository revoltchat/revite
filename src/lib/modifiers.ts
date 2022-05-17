/**
 * Utility file for detecting whether the
 * shift key is currently pressed or not.
 */

export let shiftKeyPressed = false;

if (typeof window !== "undefined") {
    document.addEventListener("keydown", (ev) => {
        if (ev.shiftKey) shiftKeyPressed = true;
        else shiftKeyPressed = false;
    });

    document.addEventListener("keyup", (ev) => {
        if (ev.shiftKey) shiftKeyPressed = true;
        else shiftKeyPressed = false;
    });
}
