import { createBrowserHistory } from "history";

export const history = createBrowserHistory({
    basename: import.meta.env.BASE_URL,
});
