import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
    appId: "chat.revolt.mobile",
    appName: "Revolt",
    webDir: "dist",
    bundledWebRuntime: false,
    server: {
        hostname: "app.revolt.chat",
    },
};

export default config;
