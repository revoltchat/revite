export function debounce(cb: Function, duration: number) {
    // Store the timer variable.
    let timer: NodeJS.Timeout;
    // This function is given to React.
    return (...args: any[]) => {
        // Get rid of the old timer.
        clearTimeout(timer);
        // Set a new timer.
        timer = setTimeout(() => {
            // Instead calling the new function.
            // (with the newer data)
            cb(...args);
        }, duration);
    };
}
