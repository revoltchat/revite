import { Route, Switch } from "react-router-dom";

import { lazy, Suspense } from "preact/compat";

import ErrorBoundary from "../lib/ErrorBoundary";
import FakeClient from "../lib/FakeClient";
import Masks from "@revoltchat/ui/lib/components/lib/Masks";

import Context from "../context";
import { CheckAuth } from "../context/revoltjs/CheckAuth";

import Preloader from "../components/ui/Preloader";

import Invite from "./invite/Invite";

const Login = lazy(() => import("./login/Login"));
const RevoltApp = lazy(() => import("./RevoltApp"));

export function App() {
    return (
        <ErrorBoundary section="client">
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
                            <CheckAuth blockRender>
                                <FakeClient>
                                    <Invite />
                                </FakeClient>
                            </CheckAuth>
                            <CheckAuth auth blockRender>
                                <Invite />
                            </CheckAuth>
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
