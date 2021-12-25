import { Route, Switch } from "react-router-dom";

import { lazy, Suspense } from "preact/compat";

import ErrorBoundary from "../lib/ErrorBoundary";

import Context from "../context";
import { CheckAuth } from "../context/revoltjs/CheckAuth";

import Masks from "../components/ui/Masks";
import Preloader from "../components/ui/Preloader";

import Invite from "./invite/Invite";

const Login = lazy(() => import("./login/Login"));
const RevoltApp = lazy(() => import("./RevoltApp"));

export function App() {
    return (
        <ErrorBoundary>
            <Context>
                <Masks />
                {/* 
                // @ts-expect-error typings mis-match between preact... and preact? */}
                <Suspense fallback={<Preloader type="spinner" />}>
                    <Switch>
                        <Route path="/login/verify/:token">
                            <Login />
                        </Route>
                        <Route path="/login/reset/:token">
                            <Login />
                        </Route>
                        <Route path="/invite/:code">
                            <Invite />
                        </Route>
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
        </ErrorBoundary>
    );
}
