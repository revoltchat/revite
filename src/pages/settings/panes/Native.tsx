import { Refresh } from "@styled-icons/boxicons-regular";

import { Text } from "preact-i18n";
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
            <Tip hideSeparator>
                <Text id="app.settings.pages.native.description"></Text>
            </Tip>
            <h3>
                <Text id="app.settings.pages.native.app_behavior"></Text>
            </h3>
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
                description={
                    <Text id="app.settings.pages.native.start_revolt_startup_desc"></Text>
                }>
                <Text id="app.settings.pages.native.start_revolt_startup"></Text>
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
                description={
                    <Text id="app.settings.pages.native.discord_status"></Text>
                }>
                <Text id="app.settings.pages.native.discord_status_desc"></Text>
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
                description={
                    <Text id="app.settings.pages.native.revolt_nightly"></Text>
                }>
                <Text id="app.settings.pages.native.revolt_nightly_desc"></Text>
            </Checkbox>
            <h3>
                <Text id="app.settings.pages.native.titlebar"></Text>
            </h3>
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
                description={
                    <Text id="app.settings.pages.native.custom_window_frame_desc"></Text>
                }>
                <Text id="app.settings.pages.native.custom_window_frame"></Text>
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
                description={
                    <Text id="app.settings.pages.native.quick_actions_desc"></Text>
                }>
                <Text id="app.settings.pages.native.quick_actions"></Text>
            </Checkbox>
            <h3>
                <Text id="app.settings.pages.native.advanced"></Text>
            </h3>
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
                description={
                    <Text id="app.settings.pages.native.hardware_acceleration_desc"></Text>
                }>
                <Text id="app.settings.pages.native.hardware_acceleration"></Text>
            </Checkbox>
            <p style={{ display: "flex", gap: "8px" }}>
                <Button
                    contrast
                    compact
                    disabled={!hintReload}
                    onClick={window.native.reload}>
                    <Text id="app.settings.pages.native.buttons.reload_page"></Text>
                </Button>
                <Button
                    contrast
                    compact
                    disabled={!hintRelaunch}
                    onClick={window.native.relaunch}>
                    <Text id="app.settings.pages.native.buttons.reload_app"></Text>
                </Button>
            </p>
            <h3 style={{ marginTop: "4em" }}>
                <Text id="app.settings.pages.native.local_development_mode"></Text>
            </h3>
            {config.build === "dev" ? (
                <>
                    <h5>
                        <Text id="app.settings.pages.native.development_mode"></Text>
                    </h5>
                    <Button
                        contrast
                        compact
                        onClick={() => {
                            window.native.set("build", "stable");
                            window.native.reload();
                        }}>
                        <Text id="app.settings.pages.native.buttons.exit_development_mode"></Text>
                    </Button>
                </>
            ) : (
                <>
                    <Checkbox
                        checked={confirmDev}
                        onChange={setConfirmDev}
                        description={
                            <>
                                <Text id="app.settings.pages.native.local_development_mode_desc.a"></Text>
                                <br />
                                <b>
                                    <Text id="app.settings.pages.native.local_development_mode_desc.b"></Text>{" "}
                                    <span style={{ color: "var(--error)" }}>
                                        <Text id="app.settings.pages.native.local_development_mode_desc.c"></Text>
                                    </span>
                                </b>
                                <br />
                                <code>yarn dev --port 3001</code>
                            </>
                        }>
                        <Text id="app.settings.pages.native.actions.enable_dev_mode"></Text>
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
                            <Text id="app.settings.pages.native.buttons.development_mode"></Text>
                        </Button>
                    </p>
                </>
            )}
            <hr />
            <CategoryButton
                icon={<img src={RLogo} draggable={false} />}
                description={
                    <Text
                        id="app.settings.pages.native.revolt_desktop_desc"
                        fields={{ version: window.nativeVersion }}></Text>
                }
                action={<Refresh size={24} />}>
                <Text id="app.settings.pages.native.revolt_desktop"></Text>
            </CategoryButton>
        </div>
    );
}
