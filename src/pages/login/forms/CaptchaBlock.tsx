import { Text } from "preact-i18n";
import { useEffect } from "preact/hooks";
import styles from "../Login.module.scss";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import Preloader from "../../../components/ui/Preloader";
import { RevoltClient } from "../../../context/revoltjs/RevoltClient";

export interface CaptchaProps {
    onSuccess: (token?: string) => void;
    onCancel: () => void;
}

export function CaptchaBlock(props: CaptchaProps) {
    useEffect(() => {
        if (!RevoltClient.configuration?.features.captcha.enabled) {
            props.onSuccess();
        }
    }, []);

    if (!RevoltClient.configuration?.features.captcha.enabled)
        return <Preloader />;

    return (
        <div>
            <HCaptcha
                sitekey={RevoltClient.configuration.features.captcha.key}
                onVerify={token => props.onSuccess(token)}
            />
            <div className={styles.footer}>
                <a onClick={props.onCancel}>
                    <Text id="login.cancel" />
                </a>
            </div>
        </div>
    );
}
