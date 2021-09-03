type LinkType =
    | { type: "profile"; id: string }
    | { type: "navigate"; path: string }
    | { type: "external"; href: string; url: URL }
    | { type: "none" };

const ALLOWED_ORIGINS = [
    location.hostname,
    "app.revolt.chat",
    "nightly.revolt.chat",
    "local.revolt.chat",
];

export function determineLink(href?: string): LinkType {
    let internal,
        url: URL | null = null;

    if (href) {
        try {
            url = new URL(href, location.href);

            if (ALLOWED_ORIGINS.includes(url.hostname)) {
                const path = url.pathname;
                if (path.startsWith("/@")) {
                    const id = path.substr(2);
                    if (/[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}/.test(id)) {
                        return { type: "profile", id };
                    }
                } else {
                    return { type: "navigate", path };
                }

                internal = true;
            }
        } catch (err) {}

        if (!internal && url) {
            return { type: "external", href, url };
        }
    }

    return { type: "none" };
}
