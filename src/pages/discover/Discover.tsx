import { LeftArrowAlt } from "@styled-icons/boxicons-regular";
import { Compass } from "@styled-icons/boxicons-solid";
import { useHistory } from "react-router-dom";
import styled, { css } from "styled-components";

import { useEffect, useState } from "preact/hooks";

import { isTouchscreenDevice } from "../../lib/isTouchscreenDevice";

import { useApplicationState } from "../../mobx/State";

import { useIntermediate } from "../../context/intermediate/Intermediate";

import Header from "../../components/ui/Header";
import IconButton from "../../components/ui/IconButton";
import Preloader from "../../components/ui/Preloader";

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
                  background: var(--background);
              `
            : css`
                  background: var(--secondary-background);
              `}
`;

const Frame = styled.iframe<{ loaded: boolean }>`
    border: 0;

    ${(props) =>
        props.loaded
            ? css`
                  flex-grow: 1;
              `
            : css`
                  display: none;
              `}
`;

const Loader = styled.div`
    flex-grow: 1;
`;

export default function Discover() {
    const layout = useApplicationState().layout;
    const { openLink } = useIntermediate();
    const history = useHistory();

    const [loaded, setLoaded] = useState(false);

    useEffect(() => layout.setLastSection("discover"), []);

    useEffect(() => {
        function onMessage(message: MessageEvent) {
            let data = JSON.parse(message.data);
            if (data.source === "discover") {
                switch (data.type) {
                    case "navigate": {
                        openLink(data.url);
                        break;
                    }
                }
            }
        }

        window.addEventListener("message", onMessage);
        return () => window.removeEventListener("message", onMessage);
    });

    return (
        <Container>
            {isTouchscreenDevice && (
                <Header placement="primary">
                    <IconButton
                        onClick={() => history.push(layout.getLastPath())}>
                        <LeftArrowAlt
                            size={27}
                            style={{ marginInlineEnd: "8px" }}
                        />
                    </IconButton>
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
                loaded={loaded}
                crossOrigin="anonymous"
                onLoad={() => setLoaded(true)}
                src="https://rvlt.gg/discover/servers?embedded=true"
            />
        </Container>
    );
}
