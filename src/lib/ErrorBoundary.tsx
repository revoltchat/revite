import axios from "axios";
import * as stackTrace from "stacktrace-js";
import styled from "styled-components";

import { useEffect, useErrorBoundary } from "preact/hooks";

import { GIT_REVISION } from "../revision";
import { Children } from "../types/Preact";

const CrashContainer = styled.div`
    height: 100%;
    padding: 12px;

    background: black;
    color: white;

    h3 {
        margin: 0;
        margin-bottom: 12px;
    }
`;

interface Props {
    children: Children;
}

const ERROR_URL = "https://reporting.revolt.chat";

export default function ErrorBoundary({ children }: Props) {
    const [error, ignoreError] = useErrorBoundary();

    useEffect(() => {
        if (error) {
            stackTrace.fromError(error).then((stackframes) =>
                axios.post(ERROR_URL, {
                    stackframes,
                    rawStackTrace: error.stack,
                    origin: window.origin,
                    commitSHA: GIT_REVISION,
                    userAgent: navigator.userAgent,
                }),
            );
        }
    }, [error]);

    if (error) {
        return (
            <CrashContainer>
                <h3>Client Crash Report</h3>
                <button onClick={ignoreError}>
                    Ignore error and try to reload app
                </button>
                <button onClick={() => location.reload()}>Refresh page</button>
                <pre>
                    <code>{error?.stack}</code>
                </pre>
                <div>This error has been automatically reported.</div>
            </CrashContainer>
        );
    }

    return <>{children}</>;
}
