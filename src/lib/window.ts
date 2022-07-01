/**
 * Inject a key into the window's globals.
 * @param key Key
 * @param value Value
 */
export function injectWindow(key: string, value: any) {
    (window as any)[key] = value;
}

/**
 * Inject a controller into the global controllers object.
 * @param key Key
 * @param value Value
 */
export function injectController(key: string, value: any) {
    (window as any).controllers = {
        ...((window as any).controllers ?? {}),
        [key]: value,
    };
}
