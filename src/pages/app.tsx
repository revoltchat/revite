import { Route, Switch } from "react-router-dom";

import { lazy, Suspense } from "preact/compat";

import Context from "../context";
import { CheckAuth } from "../context/revoltjs/CheckAuth";

import Masks from "../components/ui/Masks";
import Preloader from "../components/ui/Preloader";

import { Titlebar, USE_TITLEBAR } from "../components/native/Titlebar";

const Login = lazy(() => import("./login/Login"));
const RevoltApp = lazy(() => import("./RevoltApp"));

export function App() {
    return (
        <Context>
            <Masks />
            {USE_TITLEBAR && <Titlebar />}
            {/* 
            // @ts-expect-error */}
            <Suspense fallback={<Preloader type="spinner" />}>
                <Switch>
                    <Route path="/login">
                        <CheckAuth>
                            <Login />
                        </CheckAuth>
                    </Route>
                    <Route path="/">
                        <CheckAuth auth>
                            <RevoltApp />
                        </CheckAuth>
                    </Route>
                </Switch>
            </Suspense>
        </Context>
    );
}
