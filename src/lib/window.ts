export function injectController(key: string, value: any) {
    (window as any).controllers = {
        ...((window as any).controllers ?? {}),
        [key]: value,
    };
}
