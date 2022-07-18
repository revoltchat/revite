import { Route, Switch } from "react-router-dom";

import { lazy, Suspense } from "preact/compat";

import { Masks, Preloader } from "@revoltchat/ui";

import ErrorBoundary from "../lib/ErrorBoundary";

import Context from "../context";

import { CheckAuth } from "../controllers/client/jsx/CheckAuth";
import Invite from "./invite/Invite";

const Login = lazy(() => import("./login/Login"));
const ConfirmDelete = lazy(() => import("./login/ConfirmDelete"));
const RevoltApp = lazy(() => import("./RevoltApp"));

const LoadSuspense: React.FC = ({ children }) => (
    // @ts-expect-error Typing issue between Preact and Preact.
    <Suspense fallback={<Preloader type="ring" />}>{children}</Suspense>
);

export function App() {
    return (
        <ErrorBoundary section="client">
            <Context>
                <Masks />
                <Switch>
                    <Route path="/login/verify/:token">
                        <LoadSuspense>
                            <Login />
                        </LoadSuspense>
                    </Route>
                    <Route path="/login/reset/:token">
                        <LoadSuspense>
                            <Login />
                        </LoadSuspense>
                    </Route>
                    <Route path="/delete/:token">
                        <LoadSuspense>
                            <ConfirmDelete />
                        </LoadSuspense>
                    </Route>
                    <Route path="/invite/:code">
                        <CheckAuth blockRender>
                            <Invite />
                        </CheckAuth>
                        <CheckAuth auth blockRender>
                            <Invite />
                        </CheckAuth>
                    </Route>
                    <Route path="/login">
                        <CheckAuth>
                            <LoadSuspense>
                                <Login />
                            </LoadSuspense>
                        </CheckAuth>
                    </Route>
                    <Route path="/">
                        <CheckAuth auth>
                            <LoadSuspense>
                                <RevoltApp />
                            </LoadSuspense>
                        </CheckAuth>
                    </Route>
                </Switch>
            </Context>
        </ErrorBoundary>
    );
}
