import { Refresh } from "@styled-icons/boxicons-regular";

import { useEffect, useState } from "preact/hooks";

import Button from "../../../components/ui/Button";
import Checkbox from "../../../components/ui/Checkbox";
import Tip from "../../../components/ui/Tip";
import CategoryButton from "../../../components/ui/fluent/CategoryButton";
import RLogo from "../assets/revolt_r.svg";

export function Native() {
    if (typeof window.native === "undefined") return null;
    /* eslint-disable react-hooks/rules-of-hooks */

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
        <div style={{ marginTop: "10px" }}>
            <Tip hideSeparator>Some options might require a restart.</Tip>
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
                checked={config.minimiseToTray}
                onChange={(minimiseToTray) => {
                    window.native.set("minimiseToTray", minimiseToTray);
                    setConfig({
                        ...config,
                        minimiseToTray,
                    });
                }}
                description="Instead of closing, Revolt will hide in your tray.">
                Minimise to Tray
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
                description="Rep Revolt on your Discord status.">
                Enable Discord status
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
                description="Use the beta branch of Revolt.">
                Revolt Nightly
            </Checkbox>
            <h3>Titlebar</h3>
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
            <Checkbox //FIXME: In Titlebar.tsx, enable .quick css
                disabled={true}
                checked={!config.frame}
                onChange={(frame) => {
                    window.native.set("frame", !frame);
                    setHintRelaunch(true);
                    setConfig({
                        ...config,
                        frame: !frame,
                    });
                }}
                description="Show mute/deafen buttons on the titlebar.">
                Enable quick action buttons
            </Checkbox>
            <h3>Advanced</h3>
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
                description="Uses your GPU to render the app, disable if you run into visual issues.">
                Hardware Acceleration
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
                <>
                    <h5>Development mode is currently on.</h5>
                    <Button
                        contrast
                        compact
                        onClick={() => {
                            window.native.set("build", "stable");
                            window.native.reload();
                        }}>
                        Exit Development Mode
                    </Button>
                </>
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
                                <br />
                                <code>yarn dev --port 3001</code>
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
            <hr />
            <CategoryButton
                icon={<img src={RLogo} draggable={false} />}
                description={<span>version {window.nativeVersion}</span>}
                action={<Refresh size={24} />}>
                Revolt for Desktop
            </CategoryButton>
        </div>
    );
}
