import styles from "../Login.module.scss";
import { Text } from "preact-i18n";

import Button from "../../../components/ui/Button";

interface Props {
    email?: string;
}

function mapMailProvider(email?: string): [string, string] | undefined {
    if (!email) return;

    const match = /@(.+)/.exec(email);
    if (match === null) return;

    const domain = match[1];
    switch (domain) {
        case "gmail.com":
        case "googlemail.com":
            return ["Gmail", "https://gmail.com"];
        case "tuta.io":
            return ["Tutanota", "https://mail.tutanota.com"];
        case "outlook.com":
        case "hotmail.com":
            return ["Outlook", "https://outlook.live.com"];
        case "yahoo.com":
            return ["Yahoo", "https://mail.yahoo.com"];
        case "wp.pl":
            return ["WP Poczta", "https://poczta.wp.pl"];
        case "protonmail.com":
        case "protonmail.ch":
        case "pm.me":
            return ["ProtonMail", "https://mail.protonmail.com"];
        case "seznam.cz":
        case "email.cz":
        case "post.cz":
            return ["Seznam", "https://email.seznam.cz"];
        case "zoho.com":
            return ["Zoho Mail", "https://mail.zoho.com/zm/"];
        case "aol.com":
        case "aim.com":
            return ["AOL Mail", "https://mail.aol.com/"];
        case "icloud.com":
            return ["iCloud Mail", "https://mail.aol.com/"];
        case "mail.com":
        case "email.com":
            return ["mail.com", "https://www.mail.com/mail/"];
        case "yandex.com":
            return ["Yandex Mail", "https://mail.yandex.com/"];
        default:
            return [domain, `https://${domain}`];
    }
}

export function MailProvider({ email }: Props) {
    const provider = mapMailProvider(email);
    if (!provider) return null;

    return (
        <div className={styles.mailProvider}>
            <a href={provider[1]} target="_blank" rel="noreferrer">
                <Button>
                    <Text
                        id="login.open_mail_provider"
                        fields={{ provider: provider[0] }}
                    />
                </Button>
            </a>
        </div>
    );
}
