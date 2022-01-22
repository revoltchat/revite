import {
    BarChartAlt2,
    Microphone,
    MicrophoneOff,
    PhoneOff,
    VolumeFull,
    VolumeMute,
} from "@styled-icons/boxicons-solid";
import { Hashnode, Speakerdeck, Teamspeak } from "@styled-icons/simple-icons";
import { observer } from "mobx-react-lite";
import styled from "styled-components/macro";

import { Text } from "preact-i18n";
import { useMemo } from "preact/hooks";

import VoiceClient from "../../../lib/vortex/VoiceClient";
import { voiceState, VoiceStatus } from "../../../lib/vortex/VoiceState";
import { Button } from "@revoltchat/ui/lib/components/atoms/inputs/Button";

import { useIntermediate } from "../../../context/intermediate/Intermediate";
import { useClient } from "../../../context/revoltjs/RevoltClient";

import Tooltip from "../../../components/common/Tooltip";
import UserIcon from "../../../components/common/user/UserIcon";

interface Props {
    id: string;
}

const VoiceBase = styled.div`
    margin-top: 48px;
    padding: 20px;
    background: var(--secondary-background);

    .status {
        flex: 1 0;
        display: flex;
        position: absolute;
        align-items: center;

        padding: 10px;
        font-size: 13px;
        font-weight: 500;
        user-select: none;
        gap: 6px;

        color: var(--success);
        border-radius: var(--border-radius);
        background: var(--primary-background);

        svg {
            cursor: help;
        }
    }

    display: flex;
    flex-direction: column;

    .participants {
        margin: 40px 20px;
        justify-content: center;
        user-select: none;
        display: flex;
        gap: 16px;

        div:hover img {
            opacity: 0.8;
        }

        .disconnected {
            opacity: 0.5;
        }
    }

    .actions {
        display: flex;
        justify-content: center;
        gap: 10px;
    }
`;

export default observer(({ id }: Props) => {
    if (voiceState.roomId !== id) return null;

    const { openScreen } = useIntermediate();

    const client = useClient();
    const self = client.users.get(client.user!._id);

    const keys = Array.from(voiceState.participants.keys());
    const users = useMemo(() => {
        return keys.map((key) => client.users.get(key));
        // eslint-disable-next-line
    }, [keys]);

    return (
        <VoiceBase>
            <div className="participants">
                {users && users.length !== 0
                    ? users.map((user, index) => {
                          const id = keys![index];
                          return (
                              <div key={id}>
                                  <UserIcon
                                      size={80}
                                      target={user}
                                      status={false}
                                      voice={
                                          client.user?._id === id &&
                                          voiceState.isDeaf()
                                              ? "deaf"
                                              : voiceState.participants!.get(id)
                                                    ?.audio
                                              ? undefined
                                              : "muted"
                                      }
                                      onClick={() =>
                                          openScreen({
                                              id: "profile",
                                              user_id: id,
                                          })
                                      }
                                  />
                              </div>
                          );
                      })
                    : self !== undefined && (
                          <div key={self._id} className="disconnected">
                              <UserIcon
                                  size={80}
                                  target={self}
                                  status={false}
                              />
                          </div>
                      )}
            </div>
            <div className="status">
                <BarChartAlt2 size={16} />
                {voiceState.status === VoiceStatus.CONNECTED && (
                    <Text id="app.main.channel.voice.connected" />
                )}
            </div>
            <div className="actions">
                <Tooltip content={"Leave call"} placement={"top"}>
                    <Button palette="error" onClick={voiceState.disconnect}>
                        <PhoneOff width={20} />
                    </Button>
                </Tooltip>
                {voiceState.isProducing("audio") ? (
                    <Tooltip content={"Mute microphone"} placement={"top"}>
                        <Button
                            onClick={() => voiceState.stopProducing("audio")}>
                            <Microphone width={20} />
                        </Button>
                    </Tooltip>
                ) : (
                    <Tooltip content={"Unmute microphone"} placement={"top"}>
                        <Button
                            onClick={() => voiceState.startProducing("audio")}>
                            <MicrophoneOff width={20} />
                        </Button>
                    </Tooltip>
                )}
                {voiceState.isDeaf() ? (
                    <Tooltip content={"Undeafen"} placement={"top"}>
                        <Button onClick={() => voiceState.stopDeafen()}>
                            <VolumeMute width={20} />
                        </Button>
                    </Tooltip>
                ) : (
                    <Tooltip content={"Deafen"} placement={"top"}>
                        <Button onClick={() => voiceState.startDeafen()}>
                            <VolumeFull width={20} />
                        </Button>
                    </Tooltip>
                )}
            </div>
        </VoiceBase>
    );
});
