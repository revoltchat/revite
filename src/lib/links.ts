/**
 * Type of link
 */
type LinkType =
    | {
          type: "navigate";
          path: string;
      }
    | { type: "external"; href: string; url: URL }
    | { type: "none" };

/**
 * Allowed origins for relative navigation
 */
const ALLOWED_ORIGINS = [
    location.hostname,
    "app.revolt.chat",
    "nightly.revolt.chat",
    "local.revolt.chat",
    "rolt.chat",
];

/**
 * Determine what kind of link we are dealing with and sanitise any malicious input
 * @param href Input URL
 * @returns Link Type
 */
export function determineLink(href?: string): LinkType {
    let internal,
        url: URL | null = null;

    if (href) {
        try {
            url = new URL(href, location.href);

            if (ALLOWED_ORIGINS.includes(url.hostname)) {
                const path = url.pathname.replace(/[^A-z0-9/]/g, "");
                return { type: "navigate", path };
            }
        } catch (err) {}

        if (!internal && url) {
            return { type: "external", href, url };
        }
    }

    return { type: "none" };
}
