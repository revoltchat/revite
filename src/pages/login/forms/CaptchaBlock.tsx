import HCaptcha from "@hcaptcha/react-hcaptcha";

import styles from "../Login.module.scss";
import { Text } from "preact-i18n";
import { useContext, useEffect } from "preact/hooks";

import { AppContext } from "../../../context/revoltjs/RevoltClient";

import Preloader from "../../../components/ui/Preloader";

export interface CaptchaProps {
    onSuccess: (token?: string) => void;
    onCancel: () => void;
}

export function CaptchaBlock(props: CaptchaProps) {
    const client = useContext(AppContext);

    useEffect(() => {
        if (!client.configuration?.features.captcha.enabled) {
            props.onSuccess();
        }
    }, [client.configuration?.features.captcha.enabled, props]);

    if (!client.configuration?.features.captcha.enabled)
        return <Preloader type="spinner" />;

    return (
        <div>
            <HCaptcha
                sitekey={client.configuration.features.captcha.key}
                onVerify={(token) => props.onSuccess(token)}
            />
            <div className={styles.footer}>
                <a onClick={props.onCancel}>
                    <Text id="login.cancel" />
                </a>
            </div>
        </div>
    );
}
