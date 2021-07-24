import { useHistory } from "react-router-dom";
import { Channel } from "revolt.js";
import styled from "styled-components";

import { Text } from "preact-i18n";
import { useState } from "preact/hooks";

import { dispatch, getState } from "../../redux";

import Button from "../ui/Button";
import Checkbox from "../ui/Checkbox";

import { Children } from "../../types/Preact";

const Base = styled.div`
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    user-select: none;
    padding: 12px;

    img {
        height: 150px;
    }

    .subtext {
        color: var(--secondary-foreground);
        margin-bottom: 12px;
        font-size: 14px;
    }

    .actions {
        margin-top: 20px;
        display: flex;
        gap: 12px;
    }
`;

type Props = {
    gated: boolean;
    children: Children;
} & {
    type: "channel";
    channel: Channel;
};

export default function AgeGate(props: Props) {
    const history = useHistory();
    const [consent, setConsent] = useState(
        getState().sectionToggle["nsfw"] ?? false,
    );
    const [ageGate, setAgeGate] = useState(false);

    if (ageGate || !props.gated) {
        return <>{props.children}</>;
    }
    if (
        !(
            props.channel.channel_type === "Group" ||
            props.channel.channel_type === "TextChannel"
        )
    )
        return <>{props.children}</>;

    return (
        <Base>
            <img
                loading="eager"
                src={"https://static.revolt.chat/emoji/mutant/26a0.svg"}
                draggable={false}
            />
            <h2>{props.channel.name}</h2>
            <span className="subtext">
                <Text id={`app.main.channel.nsfw.${props.type}.marked`} />{" "}
                <a href="#">
                    <Text id={`app.main.channel.nsfw.learn_more`} />
                </a>
            </span>

            <Checkbox
                checked={consent}
                onChange={(v) => {
                    setConsent(v);
                    if (v) {
                        dispatch({
                            type: "SECTION_TOGGLE_SET",
                            id: "nsfw",
                            state: true,
                        });
                    } else {
                        dispatch({ type: "SECTION_TOGGLE_UNSET", id: "nsfw" });
                    }
                }}>
                <Text id="app.main.channel.nsfw.confirm" />
            </Checkbox>
            <div className="actions">
                <Button contrast onClick={() => history.goBack()}>
                    <Text id="app.special.modals.actions.back" />
                </Button>
                <Button contrast onClick={() => consent && setAgeGate(true)}>
                    <Text id={`app.main.channel.nsfw.${props.type}.confirm`} />
                </Button>
            </div>
        </Base>
    );
}
