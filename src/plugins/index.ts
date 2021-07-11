import { Children } from "../types/Preact";

export interface PluginEvent<T> {
    cancel: () => void;
    target: T;
}

export interface PluginEvents {
    "Message:Send": (
        event: PluginEvent<{ content?: string; files?: File[] }>,
    ) => void;
    "Misc:Test": (event: PluginEvent<string>) => void;
}

export interface Plugin {
    render?: () => Children;
    events?: Partial<PluginEvents>;
}

class Singleton {
    listeners: {
        [key in keyof PluginEvents]?: PluginEvents[key][];
    };

    constructor() {
        this.listeners = {};
    }

    private getListenerArray<K extends keyof PluginEvents>(
        key: K,
    ): PluginEvents[K][] {
        const arr = this.listeners[key];
        if (arr) return arr as PluginEvents[K][];

        this.listeners[key] = [];
        return this.listeners[key]! as PluginEvents[K][];
    }

    addListener<K extends keyof PluginEvents>(key: K, fn: PluginEvents[K]) {
        this.getListenerArray(key).push(fn);
    }

    emit<K extends keyof PluginEvents>(
        key: K,
        target: Parameters<PluginEvents[K]>[0]["target"],
    ): boolean {
        let canceled = false;

        const ev: PluginEvent<any> = {
            cancel: () => (canceled = true),
            target,
        };

        const arr = this.getListenerArray(key);
        for (const listener of arr) {
            listener(ev);
            if (canceled) break;
        }

        return canceled;
    }
}

export const PluginSingleton = new Singleton();

PluginSingleton.addListener("Message:Send", (event) => {
    const { content } = event.target;
    if (content?.startsWith(";sus")) {
        event.target.content = "baka!";
    } else if (content?.startsWith(";amogus")) {
        alert("fat");
        event.cancel();
    }
});
