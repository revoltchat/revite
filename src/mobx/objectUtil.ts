// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function deleteKey(object: any, key: string) {
    const newObject = { ...object };
    delete newObject[key];
    return newObject;
}
