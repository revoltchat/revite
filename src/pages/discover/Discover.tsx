import { Compass } from "@styled-icons/boxicons-solid";
import { reaction } from "mobx";
import { useHistory, useLocation } from "react-router-dom";
import styled, { css } from "styled-components/macro";

import { useEffect, useMemo, useRef, useState } from "preact/hooks";

import { Header, Preloader } from "@revoltchat/ui";

import { isTouchscreenDevice } from "../../lib/isTouchscreenDevice";

import { useApplicationState } from "../../mobx/State";

import { Overrides } from "../../context/Theme";

import { modalController } from "../../controllers/modals/ModalController";

const Container = styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: column;

    ${() =>
        isTouchscreenDevice
            ? css`
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  position: fixed;

                  padding-bottom: 50px;
                  background: var(--background);
              `
            : css`
                  background: var(--background);
              `}
`;

const Frame = styled.iframe<{ loaded: boolean }>`
    border: none;

    ${() =>
        !isTouchscreenDevice &&
        css`
            background: var(--secondary-background);
            border-start-start-radius: 8px;
            border-end-start-radius: 8px;
        `}

    ${() =>
        isTouchscreenDevice &&
        css`
            padding-top: 56px;
        `}

    ${(props) =>
        props.loaded
            ? css`
                  height: 100%;
              `
            : css`
                  display: none;
              `}
`;

const Loader = styled.div`
    flex-grow: 1;

    ${() =>
        !isTouchscreenDevice &&
        css`
            background: var(--secondary-background);
            border-start-start-radius: 8px;
            border-end-start-radius: 8px;
        `}
`;

const TRUSTED_HOSTS = [
    "local.revolt.chat:3000",
    "local.revolt.chat:3001",
    "rvlt.gg",
];

const REMOTE = "https://rvlt.gg";

export default function Discover() {
    const state = useApplicationState();

    const history = useHistory();
    const { pathname, search } = useLocation();

    const path = useMemo(() => {
        const query = new URLSearchParams(search);
        query.set("embedded", "true");
        return `${pathname}?${query.toString()}`;
    }, []);

    const [loaded, setLoaded] = useState(false);
    const ref = useRef<HTMLIFrameElement>(null!);

    function sendTheme(theme?: Overrides) {
        ref.current?.contentWindow?.postMessage(
            JSON.stringify({
                source: "revolt",
                type: "theme",
                theme: theme ?? state.settings.theme.computeVariables(),
            }),
            "*",
        );
    }

    useEffect(
        () =>
            reaction(() => state.settings.theme.computeVariables(), sendTheme),
        [],
    );

    useEffect(() => state.layout.setLastDiscoverPath(path), []);

    useEffect(() => {
        function onMessage(message: MessageEvent) {
            const url = new URL(message.origin);
            if (!TRUSTED_HOSTS.includes(url.host)) return;

            try {
                const data = JSON.parse(message.data);
                if (data.source === "discover") {
                    switch (data.type) {
                        case "init": {
                            sendTheme();
                            break;
                        }
                        case "path": {
                            history.replace(data.path);
                            state.layout.setLastDiscoverPath(data.path);
                            break;
                        }
                        case "navigate": {
                            modalController.openLink(data.url);
                            break;
                        }
                        case "applyTheme": {
                            state.settings.theme.hydrate({
                                ...data.theme.variables,
                                css: data.theme.css,
                            });
                            break;
                        }
                    }
                }
            } catch (err) {
                if (import.meta.env.DEV) {
                    console.error(err);
                }
            }
        }

        window.addEventListener("message", onMessage);
        return () => window.removeEventListener("message", onMessage);
    }, [ref]);

    return (
        <Container>
            {isTouchscreenDevice && (
                <Header palette="primary" withTransparency>
                    <Compass size={27} />
                    Discover
                </Header>
            )}
            {!loaded && (
                <Loader>
                    <Preloader type="ring" />
                </Loader>
            )}
            <Frame
                ref={ref}
                loaded={loaded}
                crossOrigin="anonymous"
                onLoad={() => setLoaded(true)}
                src={REMOTE + path}
            />
        </Container>
    );
}
