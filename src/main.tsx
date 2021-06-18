import { render } from "preact";
import "./styles/index.scss";
import { App } from "./app";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
render(<App />, document.getElementById("app")!);
