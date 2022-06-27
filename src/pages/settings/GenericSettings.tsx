import { ArrowBack, X } from "@styled-icons/boxicons-regular";
import { Helmet } from "react-helmet";
import { useHistory, useParams } from "react-router-dom";

import styles from "./Settings.module.scss";
import classNames from "classnames";
import { Text } from "preact-i18n";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";

import { Category, Header, IconButton, LineDivider } from "@revoltchat/ui";

import { isTouchscreenDevice } from "../../lib/isTouchscreenDevice";

import { useApplicationState } from "../../mobx/State";

import ButtonItem from "../../components/navigation/items/ButtonItem";
import { modalController } from "../../controllers/modals/ModalController";

interface Props {
    pages: {
        category?: Children;
        divider?: boolean;
        id: string;
        icon: Children;
        title: Children;
        hidden?: boolean;
        hideTitle?: boolean;
    }[];
    custom?: Children;
    children: Children;
    defaultPage: string;
    showExitButton?: boolean;
    switchPage: (to?: string) => void;
    category: "pages" | "channel_pages" | "server_pages";
    indexHeader?: Children;
}

export function GenericSettings({
    pages,
    switchPage,
    category,
    custom,
    children,
    defaultPage,
    showExitButton,
    indexHeader,
}: Props) {
    const history = useHistory();
    const state = useApplicationState();
    const theme = state.settings.theme;
    const { page } = useParams<{ page: string }>();

    const [closing, setClosing] = useState(false);
    const exitSettings = useCallback(() => {
        setClosing(true);

        setTimeout(() => {
            history.replace(state.layout.getLastPath());
        }, 200);
    }, [history]);

    useEffect(() => {
        function keyDown(e: KeyboardEvent) {
            if (e.key === "Escape") {
                if (modalController.isVisible) return;

                exitSettings();
            }
        }

        document.body.addEventListener("keydown", keyDown);
        return () => document.body.removeEventListener("keydown", keyDown);
    }, [exitSettings]);

    const pageRef = useRef<string>();

    return (
        <div
            className={classNames(styles.settings, {
                [styles.closing]: closing,
                [styles.native]: window.isNative,
            })}
            data-mobile={isTouchscreenDevice}>
            <Helmet>
                <meta
                    name="theme-color"
                    content={
                        isTouchscreenDevice
                            ? theme.getVariable("background")
                            : theme.getVariable("secondary-background")
                    }
                />
            </Helmet>
            {isTouchscreenDevice && (
                <Header palette="primary" withTransparency>
                    {typeof page === "undefined" ? (
                        <>
                            {showExitButton && (
                                <IconButton onClick={exitSettings}>
                                    <X
                                        size={27}
                                        style={{ marginInlineEnd: "8px" }}
                                    />
                                </IconButton>
                            )}
                            <Text id="app.settings.title" />
                        </>
                    ) : (
                        <>
                            <IconButton onClick={() => switchPage()}>
                                <ArrowBack
                                    size={24}
                                    style={{ marginInlineEnd: "10px" }}
                                />
                            </IconButton>
                            <Text
                                id={`app.settings.${category}.${page}.title`}
                            />
                        </>
                    )}
                </Header>
            )}
            {(!isTouchscreenDevice || typeof page === "undefined") && (
                <div className={styles.sidebar}>
                    <div
                        className={styles.scrollbox}
                        data-scroll-offset={
                            isTouchscreenDevice ? "with-padding" : undefined
                        }>
                        <div className={styles.container}>
                            {isTouchscreenDevice && indexHeader}
                            {pages.map((entry, i) =>
                                entry.hidden ? undefined : (
                                    <>
                                        {entry.category && (
                                            <Category>
                                                {entry.category}
                                            </Category>
                                        )}
                                        <ButtonItem
                                            active={
                                                page === entry.id ||
                                                (i === 0 &&
                                                    !isTouchscreenDevice &&
                                                    typeof page === "undefined")
                                            }
                                            onClick={() => switchPage(entry.id)}
                                            compact>
                                            {entry.icon} {entry.title}
                                        </ButtonItem>
                                        {entry.divider && (
                                            <LineDivider compact />
                                        )}
                                    </>
                                ),
                            )}
                            {custom}
                        </div>
                    </div>
                </div>
            )}
            {(!isTouchscreenDevice || typeof page === "string") && (
                <div className={styles.content}>
                    <div
                        className={styles.scrollbox}
                        data-scroll-offset={
                            isTouchscreenDevice ? "with-padding" : undefined
                        }
                        ref={(ref) => {
                            // Force scroll to top if page changes.
                            if (ref) {
                                if (pageRef.current !== page) {
                                    ref.scrollTop = 0;
                                    pageRef.current = page;
                                }
                            }
                        }}>
                        <div className={styles.contentcontainer}>
                            {!isTouchscreenDevice &&
                                !pages.find(
                                    (x) => x.id === page && x.hideTitle,
                                ) && (
                                    <h1>
                                        <Text
                                            id={`app.settings.${category}.${
                                                page ?? defaultPage
                                            }.title`}
                                        />
                                    </h1>
                                )}
                            {children}
                        </div>
                        {!isTouchscreenDevice && (
                            <div className={styles.action}>
                                <div
                                    onClick={exitSettings}
                                    className={styles.closeButton}>
                                    <X size={28} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
