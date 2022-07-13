import { createBrowserHistory } from "history";

export const history = createBrowserHistory({
    basename: import.meta.env.BASE_URL,
});

export const routeInformation = {
    getServer: () =>
        /server\/([0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26})/.exec(
            history.location.pathname,
        )?.[1],
    getChannel: () =>
        /channel\/([0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26})/.exec(
            history.location.pathname,
        )?.[1],
};
