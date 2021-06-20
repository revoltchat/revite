export function defer(cb: () => void) {
    setTimeout(cb, 0);
}
