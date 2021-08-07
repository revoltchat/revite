import { BarChart } from "@styled-icons/boxicons-regular";
import { observer } from "mobx-react-lite";
import styled from "styled-components";

import { Text } from "preact-i18n";
import { useMemo } from "preact/hooks";

import { voiceState, VoiceStatus } from "../../../lib/vortex/VoiceState";

import { useClient } from "../../../context/revoltjs/RevoltClient";

import UserIcon from "../../../components/common/user/UserIcon";
import Button from "../../../components/ui/Button";

interface Props {
    id: string;
}

const VoiceBase = styled.div`
    padding: 20px;
    background: var(--secondary-background);

    .status {
        flex: 1 0;
        display: flex;
        position: absolute;
        align-items: center;

        padding: 10px;
        font-size: 14px;
        font-weight: 600;
        user-select: none;

        color: var(--success);
        border-radius: var(--border-radius);
        background: var(--primary-background);

        svg {
            margin-inline-end: 4px;
            cursor: help;
        }
    }

    display: flex;
    flex-direction: column;

    .participants {
        margin: 20px 0;
        justify-content: center;
        pointer-events: none;
        user-select: none;
        display: flex;
        gap: 16px;

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
                                          voiceState.participants!.get(id)
                                              ?.audio
                                              ? undefined
                                              : "muted"
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
                <BarChart size={20} />
                {voiceState.status === VoiceStatus.CONNECTED && (
                    <Text id="app.main.channel.voice.connected" />
                )}
            </div>
            <div className="actions">
                <Button error onClick={voiceState.disconnect}>
                    <Text id="app.main.channel.voice.leave" />
                </Button>
                {voiceState.isProducing("audio") ? (
                    <Button onClick={() => voiceState.stopProducing("audio")}>
                        <Text id="app.main.channel.voice.mute" />
                    </Button>
                ) : (
                    <Button onClick={() => voiceState.startProducing("audio")}>
                        <Text id="app.main.channel.voice.unmute" />
                    </Button>
                )}
            </div>
        </VoiceBase>
    );
});
