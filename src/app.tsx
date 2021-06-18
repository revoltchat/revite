import { CheckAuth } from "./context/revoltjs/CheckAuth";
import { Route, Switch } from "react-router-dom";
import Context from "./context";

import { Login } from "./pages/login/Login";

import { useForceUpdate, useSelf, useUser } from "./context/revoltjs/hooks";

function Test() {
    const ctx = useForceUpdate();

    let self = useSelf(ctx);
    let bree = useUser('01EZZJ98RM1YVB1FW9FG221CAN', ctx);

    return (
        <div>
            <h1>logged in as { self?.username }</h1>
            <h4>bree: { JSON.stringify(bree) }</h4>
        </div>
    )
}

export function App() {
    return (
        <Context>
            <Switch>
                <Route path="/login">
                    <CheckAuth>
                        <Login />
                    </CheckAuth>
                </Route>
                <Route path="/">
                    <CheckAuth auth>
                        <Test />
                    </CheckAuth>
                </Route>
            </Switch>
        </Context>
    );
}
