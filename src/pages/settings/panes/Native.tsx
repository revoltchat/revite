import { Text } from "preact-i18n";
import { useEffect, useState } from "preact/hooks";

import Button from "../../../components/ui/Button";
import Checkbox from "../../../components/ui/Checkbox";

export function Native() {
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
            <h3>
                <Text id="app.settings.pages.native.app_behavior" />
            </h3>
            <h5>
                <Text id="app.settings.pages.native.tip_restart" />
            </h5>
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
                    <Text id="app.settings.pages.native.description.start_with_computer" />
                }>
                <Text id="app.settings.pages.native.option.start_with_computer" />
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
                    <Text id="app.settings.pages.native.description.discord_status" />
                }>
                <Text id="app.settings.pages.native.option.discord_status" />
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
                    <Text id="app.settings.pages.native.description.nightly" />
                }>
                <Text id="app.settings.pages.native.option.nightly" />
            </Checkbox>
            <h3>
                <Text id="app.settings.pages.native.titlebar" />
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
                    <Text id="app.settings.pages.native.description.custom_window_frame" />
                }>
                <Text id="app.settings.pages.native.option.custom_window_frame" />
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
                    <Text id="app.settings.pages.native.description.quick_action_btn" />
                }>
                <Text id="app.settings.pages.native.option.quick_action_btn" />
            </Checkbox>
            <h3>
                <Text id="app.settings.pages.native.advanced" />
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
                    <Text id="app.settings.pages.native.description.hardware_accel" />
                }>
                <Text id="app.settings.pages.native.option.hardware_accel" />
            </Checkbox>
            <p style={{ display: "flex", gap: "8px" }}>
                <Button
                    contrast
                    compact
                    disabled={!hintReload}
                    onClick={window.native.reload}>
                    <Text id="app.settings.pages.native.reload_page" />
                </Button>
                <Button
                    contrast
                    compact
                    disabled={!hintRelaunch}
                    onClick={window.native.relaunch}>
                    <Text id="app.settings.pages.native.reload_app" />
                </Button>
            </p>
            <h3 style={{ marginTop: "4em" }}>
                <Text id="app.settings.pages.native.local_dev_mode" />
            </h3>
            {config.build === "dev" ? (
                <>
                    <h5>
                        <Text id="app.settings.pages.native.dev_mode_currently_on" />
                    </h5>
                    <Button
                        contrast
                        compact
                        onClick={() => {
                            window.native.set("build", "stable");
                            window.native.reload();
                        }}>
                        <Text id="app.settings.pages.native.exit_dev_mode" />
                    </Button>
                </>
            ) : (
                <>
                    <Checkbox
                        checked={confirmDev}
                        onChange={setConfirmDev}
                        description={
                            <>
                                <Text id="app.settings.pages.native.local_dev_option_description" />
                                <br />
                                <b>
                                    <Text id="app.settings.pages.native.local_dev_option_desc_without_running" />{" "}
                                    <span style={{ color: "var(--error)" }}>
                                        <Text id="app.settings.pages.native.local_dev_option_desc_wont_load" />
                                    </span>
                                </b>
                            </>
                        }>
                        <Text id="app.settings.pages.native.local_dev_option_title" />
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
                            <Text id="app.settings.pages.native.enter_dev_mode" />
                        </Button>
                    </p>
                </>
            )}
        </div>
    );
}
