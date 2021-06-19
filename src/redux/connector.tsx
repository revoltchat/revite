/* eslint-disable @typescript-eslint/no-explicit-any */

import { State } from ".";
import { h } from "preact";
import { memo } from "preact/compat";
import { connect, ConnectedComponent } from "react-redux";

export function connectState<T>(
    component: (props: any) => h.JSX.Element | null,
    mapKeys: (state: State, props: T) => any,
    useDispatcher?: boolean,
    memoize?: boolean
): ConnectedComponent<(props: any) => h.JSX.Element | null, T> {
    let c = (
        useDispatcher
            ? connect(mapKeys, (dispatcher) => {
                  return { dispatcher };
              })
            : connect(mapKeys)
    )(component);
    
    return memoize ? memo(c) : c;
}
