import { render } from "preact";
import "./styles/index.scss";
import { App } from "./app";

import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
    onNeedRefresh() {
        // ! FIXME: temp
        updateSW(true);
        // show a prompt to user
    },
    onOfflineReady() {
        console.info('Ready to work offline.');
        // show a ready to work offline to user
    },
})

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
render(<App />, document.getElementById("app")!);
