import { action, makeAutoObservable, runInAction } from "mobx";
import { Channel, Nullable, toNullable } from "revolt.js";

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

        this.syncState = this.syncState.bind(this);
        this.connect = this.connect.bind(this);
        this.disconnect = this.disconnect.bind(this);

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

            client.on("startProduce", this.syncState);
            client.on("stopProduce", this.syncState);
            client.on("userJoined", this.syncState);
            client.on("userLeft", this.syncState);
            client.on("userStartProduce", this.syncState);
            client.on("userStopProduce", this.syncState);

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

            await this.client.connect(
                channel.client.configuration!.features.voso.ws,
                channel._id,
            );

            runInAction(() => {
                this.status = VoiceStatus.AUTHENTICATING;
            });

            await this.client.authenticate(call.token);
            this.syncState();

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
        this.connecting = false;
        this.status = VoiceStatus.READY;

        this.client?.disconnect();
        this.syncState();
    }

    isProducing(type: ProduceType) {
        switch (type) {
            case "audio":
                return this.client?.audioProducer !== undefined;
        }
    }

    isDeaf() {
        if (!this.client) return false;

        return this.client.isDeaf;
    }

    async startDeafen() {
        if (!this.client) return console.log("No client object"); // ! TODO: let the user know
        if (this.client.isDeaf) return;

        this.client.isDeaf = true;
        this.client?.consumers.forEach((consumer) => {
            consumer.audio?.pause();
        });

        this.syncState();
    }
    async stopDeafen() {
        if (!this.client) return console.log("No client object"); // ! TODO: let the user know
        if (!this.client.isDeaf) return;

        this.client.isDeaf = false;
        this.client?.consumers.forEach((consumer) => {
            consumer.audio?.resume();
        });

        this.syncState();
    }

    async startProducing(type: ProduceType) {
        switch (type) {
            case "audio": {
                if (this.client?.audioProducer !== undefined)
                    return console.log("No audio producer."); // ! TODO: let the user know

                if (navigator.mediaDevices === undefined)
                    return console.log("No media devices."); // ! TODO: let the user know

                const mediaDevice =
                    window.localStorage.getItem("audioInputDevice");

                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    audio: mediaDevice ? { deviceId: mediaDevice } : true,
                });

                await this.client?.startProduce(
                    mediaStream.getAudioTracks()[0],
                    "audio",
                );
            }
        }

        this.syncState();
    }

    async stopProducing(type: ProduceType) {
        await this.client?.stopProduce(type);

        this.syncState();
    }
}

export const voiceState = new VoiceStateReference();
