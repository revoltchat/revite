import { Text } from "preact-i18n";
import styles from "../Login.module.scss";
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
            return ["Gmail", "https://gmail.com"];
        case "tuta.io":
            return ["Tutanota", "https://mail.tutanota.com"];
        case "outlook.com":
            return ["Outlook", "https://outlook.live.com"];
        case "yahoo.com":
            return ["Yahoo", "https://mail.yahoo.com"];
        case "wp.pl":
            return ["WP Poczta", "https://poczta.wp.pl"];
        case "protonmail.com":
        case "protonmail.ch":
            return ["ProtonMail", "https://mail.protonmail.com"];
        case "seznam.cz":
        case "email.cz":
        case "post.cz":
            return ["Seznam", "https://email.seznam.cz"];
        default:
            return [domain, `https://${domain}`];
    }
}

export function MailProvider({ email }: Props) {
    const provider = mapMailProvider(email);
    if (!provider) return null;

    return (
        <div className={styles.mailProvider}>
            <a href={provider[1]} target="_blank">
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
