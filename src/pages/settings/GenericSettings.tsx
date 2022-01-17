import { ArrowBack, X } from "@styled-icons/boxicons-regular";
import { Helmet } from "react-helmet";
import { useHistory, useParams } from "react-router-dom";

import styles from "./Settings.module.scss";
import classNames from "classnames";
import { Text } from "preact-i18n";
import {
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "preact/hooks";

import { isTouchscreenDevice } from "../../lib/isTouchscreenDevice";

import { useApplicationState } from "../../mobx/State";

import Category from "../../components/ui/Category";
import Header from "../../components/ui/Header";
import IconButton from "../../components/ui/IconButton";
import LineDivider from "../../components/ui/LineDivider";

import ButtonItem from "../../components/navigation/items/ButtonItem";
import { Children } from "../../types/Preact";

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
        }, 100);
    }, [history]);

    useEffect(() => {
        function keyDown(e: KeyboardEvent) {
            if (e.key === "Escape") {
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
                <Header placement="primary" transparent>
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
                <nav className={styles.sidebar}>
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
                                            <Category
                                                variant="uniform"
                                                text={entry.category}
                                            />
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
                                        {entry.divider && <LineDivider />}
                                    </>
                                ),
                            )}
                            {custom}
                        </div>
                    </div>
                </nav>
            )}
            {(!isTouchscreenDevice || typeof page === "string") && (
                <article className={styles.content}>
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
                            <aside className={styles.action}>
                                <button
                                    onClick={exitSettings}
                                    className={styles.closeButton}>
                                    <X size={28} />
                                </button>
                            </aside>
                        )}
                    </div>
                </article>
            )}
        </div>
    );
}
