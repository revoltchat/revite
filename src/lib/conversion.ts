export function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");
    const rawData = window.atob(base64);

    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export function mapToRecord<K extends symbol | string | number, V>(
    map: Map<K, V>,
) {
    const record = {} as Record<K, V>;
    map.forEach((v, k) => (record[k] = v));
    return record;
}
