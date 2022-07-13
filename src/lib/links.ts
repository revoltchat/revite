type LinkType =
    | {
          type: "navigate";
          path: string;
      }
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
                return { type: "navigate", path };
            }
        } catch (err) {}

        if (!internal && url) {
            if (!url.protocol.startsWith("javascript")) {
                return { type: "external", href, url };
            }
        }
    }

    return { type: "none" };
}
