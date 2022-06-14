import "./styles/index.scss";
import { render } from "preact";

import { App } from "./pages/app";
import "./updateWorker";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
render(<App />, document.getElementById("app")!);
