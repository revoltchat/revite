import { CheckAuth } from "./context/revoltjs/CheckAuth";
import Preloader from "./components/ui/Preloader";
import { Route, Switch } from "react-router-dom";
import Context from "./context";

import { lazy, Suspense } from "preact/compat";
const Login = lazy(() => import('./pages/login/Login'));
const RevoltApp = lazy(() => import('./pages/App'));

export function App() {
    return (
        <Context>
            {/* 
            // @ts-expect-error */}
            <Suspense fallback={<Preloader />}>
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
