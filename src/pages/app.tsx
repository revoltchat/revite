import { CheckAuth } from "../context/revoltjs/CheckAuth";
import Preloader from "../components/ui/Preloader";
import { Route, Switch } from "react-router-dom";
import Context from "../context";

import { lazy, Suspense } from "preact/compat";
const Login = lazy(() => import('./login/Login'));
const RevoltApp = lazy(() => import('./RevoltApp'));

export function App() {
    return (
        <Context>
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
