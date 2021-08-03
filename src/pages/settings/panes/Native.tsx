import { useEffect, useState } from "preact/hooks";

import { SyncOptions } from "../../../redux/reducers/sync";

import Button from "../../../components/ui/Button";
import Checkbox from "../../../components/ui/Checkbox";

interface Props {
    options?: SyncOptions;
}

export function Native(props: Props) {
    const [config, setConfig] = useState(window.native.getConfig());
    const [autoStart, setAutoStart] = useState<boolean | undefined>();
    const fetchValue = () => window.native.getAutoStart().then(setAutoStart);

    const [hintReload, setHintReload] = useState(false);
    const [hintRelaunch, setHintRelaunch] = useState(false);
    const [confirmDev, setConfirmDev] = useState(false);

    useEffect(() => {
        fetchValue();
    }, []);

    return (
        <div>
            <h3>App Behavior</h3>
            <Checkbox
                checked={autoStart ?? false}
                disabled={typeof autoStart === "undefined"}
                onChange={async (v) => {
                    if (v) {
                        await window.native.enableAutoStart();
                    } else {
                        await window.native.disableAutoStart();
                    }

                    setAutoStart(v);
                }}
                description="Launch Revolt when you log into your computer.">
                Start with computer
            </Checkbox>
            <Checkbox
                checked={config.hardwareAcceleration}
                onChange={async (hardwareAcceleration) => {
                    window.native.set(
                        "hardwareAcceleration",
                        hardwareAcceleration,
                    );
                    setHintRelaunch(true);
                    setConfig({
                        ...config,
                        hardwareAcceleration,
                    });
                }}
                description="Use the GPU to render the app, disable if you run into visual issues.">
                Hardware Acceleration
            </Checkbox>
            <Checkbox
                checked={!config.frame}
                onChange={(frame) => {
                    window.native.set("frame", !frame);
                    setHintRelaunch(true);
                    setConfig({
                        ...config,
                        frame: !frame,
                    });
                }}
                description={<>Let Revolt use its own window frame.</>}>
                Custom window frame
            </Checkbox>
            <Checkbox
                checked={config.discordRPC}
                onChange={(discordRPC) => {
                    window.native.set("discordRPC", discordRPC);
                    setConfig({
                        ...config,
                        discordRPC,
                    });
                }}
                description={<>Rep Revolt on your Discord status.</>}>
                Discord RPC
            </Checkbox>
            <Checkbox
                checked={config.build === "nightly"}
                onChange={(nightly) => {
                    const build = nightly ? "nightly" : "stable";
                    window.native.set("build", build);
                    setHintReload(true);
                    setConfig({
                        ...config,
                        build,
                    });
                }}
                description={<>Use the beta branch of Revolt.</>}>
                Revolt Nightly
            </Checkbox>
            <p style={{ display: "flex", gap: "8px" }}>
                <Button
                    contrast
                    compact
                    disabled={!hintReload}
                    onClick={window.native.reload}>
                    Reload Page
                </Button>
                <Button
                    contrast
                    compact
                    disabled={!hintRelaunch}
                    onClick={window.native.relaunch}>
                    Reload App
                </Button>
            </p>
            <h3 style={{ marginTop: "4em" }}>Local Development Mode</h3>
            {config.build === "dev" ? (
                <p>
                    <Button
                        contrast
                        compact
                        onClick={() => {
                            window.native.set("build", "stable");
                            window.native.reload();
                        }}>
                        Exit Development Mode
                    </Button>
                </p>
            ) : (
                <>
                    <Checkbox
                        checked={confirmDev}
                        onChange={setConfirmDev}
                        description={
                            <>
                                This will change the app to the 'dev' branch,
                                instead loading the app from a local server on
                                your machine.
                                <br />
                                <b>
                                    Without a server running,{" "}
                                    <span style={{ color: "var(--error)" }}>
                                        the app will not load!
                                    </span>
                                </b>
                            </>
                        }>
                        I understand there's no going back.
                    </Checkbox>
                    <p>
                        <Button
                            error
                            compact
                            disabled={!confirmDev}
                            onClick={() => {
                                window.native.set("build", "dev");
                                window.native.reload();
                            }}>
                            Enter Development Mode
                        </Button>
                    </p>
                </>
            )}
        </div>
    );
}
