import { OverlappingPanels } from "react-overlapping-panels";
import { Switch, Route } from "react-router-dom";

import Home from './home/Home';

export default function App() {
    return (
        <OverlappingPanels
            width="100vw"
            height="100%">
            <Switch>
                <Route path="/">
                    <Home />
                </Route>
            </Switch>
        </OverlappingPanels>
    );
};
