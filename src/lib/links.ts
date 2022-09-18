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

const PROTOCOL_WHITELIST = [
    "https",
    "ftp",
    "ftps",
    "mailto",
    "news",
    "irc",
    "gopher",
    "nntp",
    "feed",
    "telnet",
    "mms",
    "rtsp",
    "svn",
    "git",
    "tel",
    "fax",
    "xmpp",
    "magnet",
];

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
            if (PROTOCOL_WHITELIST.includes(url.protocol)) {
                return { type: "external", href, url };
            }
        }
    }

    return { type: "none" };
}
