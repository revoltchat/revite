import styles from "../Login.module.scss";
import { Text } from "preact-i18n";

import { Button } from "@revoltchat/ui";

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
        case "outlook.jp":
        case "outlook.fr":
        case "outlook.dk":
        case "outlook.com.ar":
        case "outlook.com.au":
        case "outlook.at":
        case "outlook.be":
        case "outlook.com.br":
        case "outlook.cl":
        case "outlook.cz":
        case "outlook.com.gr":
        case "outlook.co.il":
        case "outlook.in":
        case "outlook.co.id":
        case "outlook.ie":
        case "outlook.it":
        case "outlook.hu":
        case "outlook.kr":
        case "outlook.lv":
        case "outlook.my":
        case "outlook.co.nz":
        case "outlook.com.pe":
        case "outlook.ph":
        case "outlook.pt":
        case "outlook.sa":
        case "outlook.sg":
        case "outlook.sk":
        case "outlook.es":
        case "outlook.co.th":
        case "outlook.com.tr":
        case "outlook.com.vn":
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
            return ["iCloud Mail", "https://mail.icloud.com/"];
        case "mail.com":
        case "email.com":
            return ["mail.com", "https://www.mail.com/mail/"];
        case "yandex.ru":
        case "yandex.by":
        case "yandex.ua":
        case "yandex.com":
            return ["Yandex Mail", "https://mail.yandex.com/"];
        case "hey.com":
            return ["HEY", "https://app.hey.com/"];
        case "mail.ru":
        case "bk.ru":
        case "inbox.ru":
        case "list.ru":
        case "internet.ru":
            return ["Mail.ru", "https://mail.ru/"];
        case "rambler.ru":
        case "lenta.ru":
        case "autorambler.ru":
        case "myrambler.ru":
        case "ro.ru":
        case "rambler.ua":
            return ["Rambler", "https://rambler.ru/"];
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
