type Build = "stable" | "nightly" | "dev";

type NativeConfig = {
    frame: boolean;
    build: Build;
};

declare interface Window {
    isNative?: boolean;
    native: {
        close();
        reload();

        getConfig(): NativeConfig;
        setFrame(frame: boolean);
        setBuild(build: Build);
    };
}
