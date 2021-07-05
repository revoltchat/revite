export function determineFileSize(size: number) {
    if (size > 1e6) {
        return `${(size / 1e6).toFixed(2)} MB`;
    } else if (size > 1e3) {
        return `${(size / 1e3).toFixed(2)} KB`;
    }

    return `${size} B`;
}
