type Build = "stable" | "nightly" | "dev";

type NativeConfig = {
    frame: boolean;
    build: Build;
};

declare interface Window {
    isNative?: boolean;
    nativeVersion: string;
    native: {
        min();
        max();
        close();
        reload();
        relaunch();

        getConfig(): NativeConfig;
        setFrame(frame: boolean);
        setBuild(build: Build);

        getAutoStart(): Promise<boolean>;
        enableAutoStart(): Promise<void>;
        disableAutoStart(): Promise<void>;
    };
}
