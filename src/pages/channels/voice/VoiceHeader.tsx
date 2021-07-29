import { BarChart } from "@styled-icons/boxicons-regular";
import { observable } from "mobx";
import { observer } from "mobx-react-lite";
import styled from "styled-components";

import { Text } from "preact-i18n";
import { useContext } from "preact/hooks";

import { useData } from "../../../mobx/State";

import {
    VoiceContext,
    VoiceOperationsContext,
    VoiceStatus,
} from "../../../context/Voice";
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
    const { status, participants, roomId } = useContext(VoiceContext);
    if (roomId !== id) return null;

    const { isProducing, startProducing, stopProducing, disconnect } =
        useContext(VoiceOperationsContext);

    const store = useData();
    const client = useClient();
    const self = store.users.get(client.user!._id);

    //const ctx = useForceUpdate();
    //const self = useSelf(ctx);
    const keys = participants ? Array.from(participants.keys()) : undefined;
    const users = keys?.map((key) => store.users.get(key));

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
                                          participants!.get(id)?.audio
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
                {status === VoiceStatus.CONNECTED && (
                    <Text id="app.main.channel.voice.connected" />
                )}
            </div>
            <div className="actions">
                <Button error onClick={disconnect}>
                    <Text id="app.main.channel.voice.leave" />
                </Button>
                {isProducing("audio") ? (
                    <Button onClick={() => stopProducing("audio")}>
                        <Text id="app.main.channel.voice.mute" />
                    </Button>
                ) : (
                    <Button onClick={() => startProducing("audio")}>
                        <Text id="app.main.channel.voice.unmute" />
                    </Button>
                )}
            </div>
        </VoiceBase>
    );
});

/**{voice.roomId === id && (
                        <div className={styles.rtc}>
                            <div className={styles.participants}>
                                {participants.length !== 0 ? participants.map((user, index) => {
                                    const id = participantIds[index];
                                    return (
                                        <div key={id}>
                                            <UserIcon
                                                size={80}
                                                user={user}
                                                status={false}
                                                voice={
                                                    voice.participants.get(id)
                                                        ?.audio
                                                        ? undefined
                                                        : "muted"
                                                }
                                            />
                                        </div>
                                    );
                                }) : self !== undefined && (
                                    <div key={self._id} className={styles.disconnected}>
                                            <UserIcon
                                                size={80}
                                                user={self}
                                                status={false}
                                            />
                                        </div>
                                )}
                            </div>
                            <div className={styles.status}>
                                <BarChart size={20} />
                                { voice.status === VoiceStatus.CONNECTED && <Text id="app.main.channel.voice.connected" /> }
                            </div>
                            <div className={styles.actions}>
                                <Button
                                    style="error"
                                    onClick={() =>
                                        voice.operations.disconnect()
                                    }
                                >
                                    <Text id="app.main.channel.voice.leave" />
                                </Button>
                                {voice.operations.isProducing("audio") ? (
                                    <Button
                                        onClick={() =>
                                            voice.operations.stopProducing(
                                                "audio"
                                            )
                                        }
                                    >
                                        <Text id="app.main.channel.voice.mute" />
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() =>
                                            voice.operations.startProducing(
                                                "audio"
                                            )
                                        }
                                    >
                                        <Text id="app.main.channel.voice.unmute" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    )} */
