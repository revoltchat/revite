// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function takeError(error: any): string {
    if (error.response) {
        const type = error.response.data?.type;
        if (type) {
            return type;
        }

        switch (error.response.status) {
            case 429:
                return "TooManyRequests";
            case 401:
                return "Unauthorized"
            case 403:
                return "Forbidden";
            default:
                return "UnknownError";
        }
    } else if (error.request) {
        return "NetworkError";
    }

    console.error(error);
    return "UnknownError";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapError(error: any): never {
    throw takeError(error);
}
