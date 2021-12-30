/**
 * Schedule a task at the end of the Event Loop
 * @param cb Callback
 */
export const defer = (cb: () => void) => setTimeout(cb, 0);

/**
 * Schedule a task at the end of the second Event Loop
 * @param cb Callback
 */
export const chainedDefer = (cb: () => void) => defer(() => defer(cb));
