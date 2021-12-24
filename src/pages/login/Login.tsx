import { observer } from "mobx-react-lite";
import { Helmet } from "react-helmet";
import { Route, Switch } from "react-router-dom";
import { LIBRARY_VERSION } from "revolt.js";

import styles from "./Login.module.scss";
import { Text } from "preact-i18n";

import { useApplicationState } from "../../mobx/State";

import LocaleSelector from "../../components/common/LocaleSelector";
import background from "./background.jpg";

import { Titlebar } from "../../components/native/Titlebar";
import { APP_VERSION } from "../../version";
import { FormCreate } from "./forms/FormCreate";
import { FormLogin } from "./forms/FormLogin";
import { FormReset, FormSendReset } from "./forms/FormReset";
import { FormResend, FormVerify } from "./forms/FormVerify";

export default observer(() => {
    const state = useApplicationState();
    const theme = state.settings.theme;
    const configuration = state.config.get();

    return (
        <>
            {window.isNative && !window.native.getConfig().frame && (
                <Titlebar />
            )}
            <div className={styles.login}>
                <Helmet>
                    <meta
                        name="theme-color"
                        content={theme.getVariable("background")}
                    />
                </Helmet>
                <div className={styles.content}>
                    <div className={styles.attribution}>
                        <span>
                            API: <code>{configuration?.revolt ?? "???"}</code>{" "}
                            &middot; revolt.js: <code>{LIBRARY_VERSION}</code>{" "}
                            &middot; App: <code>{APP_VERSION}</code>
                        </span>
                        <span>
                            <LocaleSelector />
                        </span>
                    </div>
                    <div className={styles.modal}>
                        <Switch>
                            <Route path="/login/create">
                                <FormCreate />
                            </Route>
                            <Route path="/login/resend">
                                <FormResend />
                            </Route>
                            <Route path="/login/verify/:token">
                                <FormVerify />
                            </Route>
                            <Route path="/login/reset/:token">
                                <FormReset />
                            </Route>
                            <Route path="/login/reset">
                                <FormSendReset />
                            </Route>
                            <Route path="/">
                                <FormLogin />
                            </Route>
                        </Switch>
                    </div>
                    <div className={styles.attribution}>
                        <span>
                            <Text id="general.image_by" /> &lrm;@lorenzoherrera
                            &rlm;· unsplash.com
                        </span>
                    </div>
                </div>
                <div
                    className={styles.bg}
                    style={{ background: `url('${background}')` }}
                />
            </div>
        </>
    );
});
