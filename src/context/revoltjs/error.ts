export function takeError(
    error: any
): string {
    const type = error?.response?.data?.type;
    let id = type;
    if (!type) {
        if (error?.response?.status === 403) {
            return "Unauthorized";
        } else if (error && (!!error.isAxiosError && !error.response)) {
            return "NetworkError";
        }

        console.error(error);
        return "UnknownError";
    }

    return id;
}
