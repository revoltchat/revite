import { ArrowBack, X } from "@styled-icons/boxicons-regular";
import { Helmet } from "react-helmet";
import { useHistory, useParams } from "react-router-dom";

import styles from "./Settings.module.scss";
import classNames from "classnames";
import { createRef } from "preact";
import { Text } from "preact-i18n";
import { useCallback, useMemo, useRef, useState } from "preact/hooks";

import { isTouchscreenDevice } from "../../lib/isTouchscreenDevice";

import { useApplicationState } from "../../mobx/State";
import {
    KeybindAction,
    KeybindSequence,
    KeyCombo,
} from "../../mobx/stores/Keybinds";

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
    const [keybinds] = useState(() => state.keybinds);
    const { page } = useParams<{ page: string }>();

    const [closing, setClosing] = useState(false);
    const exitSettings = useCallback(() => {
        if (history.length > 1) {
            setClosing(true);

            setTimeout(() => {
                history.goBack();
            }, 100);
        } else {
            history.push("/");
        }
    }, [history]);

    const modalRef = createRef<HTMLDivElement>();

    keybinds.useAction(
        KeybindAction.NavigatePreviousContextSettings,
        (e) => exitSettings(),
        [exitSettings],
    );

    // useMemo isn't really doing anything here.
    const exitKeybind = useMemo(
        () =>
            KeybindSequence.stringifyFull(
                state.keybinds
                    .getKeybinds(KeybindAction.NavigatePreviousContext)[0]
                    .sequence.map(KeyCombo.stringifyShort),
            ),
        [keybinds.keybinds],
    );

    const pageRef = useRef<string>();

    return (
        <div
            ref={modalRef}
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
                <div className={styles.sidebar}>
                    <div className={styles.scrollbox}>
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
                            <div
                                className={styles.action}
                                style={{
                                    // note: doesn't update reactively.
                                    "--key-esc": `"${exitKeybind}"`,
                                }}>
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
