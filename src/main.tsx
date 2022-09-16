import "./styles/index.scss";
import { render } from "preact";

import "../external/lang/Languages.patch";
import { App } from "./pages/app";
import "./updateWorker";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
render(<App />, document.getElementById("app")!);
