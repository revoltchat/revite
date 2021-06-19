import { Text } from "preact-i18n";
import styles from "../Login.module.scss";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { useContext, useEffect } from "preact/hooks";
import Preloader from "../../../components/ui/Preloader";
import { AppContext } from "../../../context/revoltjs/RevoltClient";

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
    }, []);

    if (!client.configuration?.features.captcha.enabled)
        return <Preloader />;

    return (
        <div>
            <HCaptcha
                sitekey={client.configuration.features.captcha.key}
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
