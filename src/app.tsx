import { CheckAuth } from "./context/revoltjs/CheckAuth";
import { Route, Switch } from "react-router-dom";
import Context from "./context";

import { Login } from "./pages/login/Login";

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
                        <h1>revolt app</h1>
                    </CheckAuth>
                </Route>
            </Switch>
        </Context>
    );
}
