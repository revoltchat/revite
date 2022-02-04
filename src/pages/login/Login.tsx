import { Twitter, Github, Mastodon } from "@styled-icons/boxicons-logos";
import { observer } from "mobx-react-lite";
import { Helmet } from "react-helmet";
import { Route, Switch } from "react-router-dom";

import styles from "./Login.module.scss";
import { Text } from "preact-i18n";

import { useApplicationState } from "../../mobx/State";

import LocaleSelector from "../../components/common/LocaleSelector";
import wideSVG from "/assets/ChatNet.svg";

import { Titlebar } from "../../components/native/Titlebar";
import { FormCreate } from "./forms/FormCreate";
import { FormLogin } from "./forms/FormLogin";
import { FormReset, FormSendReset } from "./forms/FormReset";
import { FormResend, FormVerify } from "./forms/FormVerify";

export default observer(() => {
    const state = useApplicationState();
    const theme = state.settings.theme;

    return (
        <>
            {window.isNative && !window.native.getConfig().frame && (
                <Titlebar overlay />
            )}
            <div className={styles.login}>
                <Helmet>
                    <meta
                        name="theme-color"
                        content={theme.getVariable("background")}
                    />
                </Helmet>
                <div className={styles.content}>
                    <div className={styles.nav}>
                        <a className={styles.logo}>
                            {!("native" in window) && (
                                <img src={wideSVG} draggable={false} />
                            )}
                        </a>
                        <LocaleSelector />
                    </div>
                    {/*<div className={styles.middle}>*/}
                    <div className={styles.form}>
                        {/*<div style={styles.version}>
                            API: <code>{configuration?.revolt ?? "???"}</code>{" "}
                            &middot; revolt.js: <code>{LIBRARY_VERSION}</code>{" "}
                            &middot; App: <code>{APP_VERSION}</code>
                        </div>*/}
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
                    {/*<div className={styles.loginQR}></div>*/}
                    {/*</div>*/}
                    <div className={styles.bottom}>
                        <div className={styles.links}>
                            <div className={styles.socials}>
                                <a
                                    href="https://github.com/dislistme/revite"
                                    target="_blank">
                                    <Github size={24} />
                                </a>
                                <a
                                    href="https://twitter.com/revoltchat"
                                    target="_blank">
                                    <Twitter size={24} />
                                </a>
                                <a
                                    href="https://mastodon.social/@revoltchat"
                                    target="_blank">
                                    <Mastodon size={24} />
                                </a>
                            </div>
                            <div className={styles.bullet} />
                            <div className={styles.revolt}>
                                <a
                                    href="https://revolt.chat/about"
                                    target="_blank"
                                    rel="noreferrer">
                                    <Text id="general.about" />
                                </a>
                                <a
                                    href="https://revolt.chat/terms"
                                    target="_blank"
                                    rel="noreferrer">
                                    <Text id="general.tos" />
                                </a>
                                <a
                                    href="https://revolt.chat/privacy"
                                    target="_blank"
                                    rel="noreferrer">
                                    <Text id="general.privacy" />
                                </a>
                            </div>
                        </div>
                        <a
                            className={styles.attribution}
                            href="https://unsplash.com/@fakurian"
                            target="_blank">
                            <Text id="general.image_by" /> &lrm;@fakurian (TO BE CHANGED) &rlm;·
                            unsplash.com
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
});
