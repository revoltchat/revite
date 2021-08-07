import { action, makeAutoObservable, runInAction } from "mobx";
import { Channel } from "revolt.js/dist/maps/Channels";
import { Nullable, toNullable } from "revolt.js/dist/util/null";

import type { ProduceType, VoiceUser } from "./Types";
import type VoiceClient from "./VoiceClient";

export enum VoiceStatus {
    LOADING = 0,
    UNAVAILABLE,
    ERRORED,
    READY = 3,
    CONNECTING = 4,
    UNLOADED = 5,
    AUTHENTICATING,
    RTC_CONNECTING,
    CONNECTED,
    // RECONNECTING
}

// This is an example of how to implement MobX state.
// * Note for better implementation:
// * MobX state should be implemented on the VoiceClient itself.
class VoiceStateReference {
    client?: VoiceClient;
    connecting?: boolean;

    status: VoiceStatus;
    roomId: Nullable<string>;
    participants: Map<string, VoiceUser>;

    constructor() {
        this.roomId = null;
        this.status = VoiceStatus.UNLOADED;
        this.participants = new Map();

        makeAutoObservable(this, {
            client: false,
            connecting: false,
        });
    }

    // This takes information from the voice
    // client and applies it to the state here.
    @action syncState() {
        if (!this.client) return;
        this.roomId = toNullable(this.client.roomId);
        this.participants.clear();
        this.client.participants.forEach((v, k) => this.participants.set(k, v));
    }

    // This imports and constructs the voice client.
    @action async loadVoice() {
        if (this.status !== VoiceStatus.UNLOADED) return;
        this.status = VoiceStatus.LOADING;

        try {
            const { default: VoiceClient } = await import("./VoiceClient");
            const client = new VoiceClient();

            runInAction(() => {
                if (!client.supported()) {
                    this.status = VoiceStatus.UNAVAILABLE;
                } else {
                    this.status = VoiceStatus.READY;
                    this.client = client;
                }
            });
        } catch (err) {
            console.error("Failed to load voice library!", err);
            runInAction(() => {
                this.status = VoiceStatus.UNAVAILABLE;
            });
        }
    }

    // Connect to a voice channel.
    @action async connect(channel: Channel) {
        if (!this.client?.supported()) throw new Error("RTC is unavailable");

        this.connecting = true;
        this.status = VoiceStatus.CONNECTING;

        try {
            const call = await channel.joinCall();

            await this.client.connect("wss://voso.revolt.chat/ws", channel._id);

            runInAction(() => {
                this.status = VoiceStatus.AUTHENTICATING;
            });

            await this.client.authenticate(call.token);

            runInAction(() => {
                this.status = VoiceStatus.RTC_CONNECTING;
            });

            await this.client.initializeTransports();
        } catch (err) {
            console.error(err);

            runInAction(() => {
                this.status = VoiceStatus.READY;
            });

            return channel;
        }

        runInAction(() => {
            this.status = VoiceStatus.CONNECTED;
            this.connecting = false;
        });

        return channel;
    }

    // Disconnect from current channel.
    @action disconnect() {
        if (!this.client?.supported()) throw new Error("RTC is unavailable");

        this.connecting = false;
        this.status = VoiceStatus.READY;

        this.client.disconnect();
    }

    isProducing(type: ProduceType) {
        switch (type) {
            case "audio":
                return this.client?.audioProducer !== undefined;
        }
    }

    async startProducing(type: ProduceType) {
        switch (type) {
            case "audio": {
                if (this.client?.audioProducer !== undefined)
                    return console.log("No audio producer."); // ! TODO: let the user know

                if (navigator.mediaDevices === undefined)
                    return console.log("No media devices."); // ! TODO: let the user know

                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                });

                await this.client?.startProduce(
                    mediaStream.getAudioTracks()[0],
                    "audio",
                );
            }
        }
    }

    stopProducing(type: ProduceType) {
        this.client?.stopProduce(type);
    }
}

export const voiceState = new VoiceStateReference();
