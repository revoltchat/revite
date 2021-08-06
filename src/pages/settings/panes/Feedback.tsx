import { Github } from "@styled-icons/boxicons-logos";
import { ListOl } from "@styled-icons/boxicons-regular";

import styles from "./Panes.module.scss";
import { Localizer, Text } from "preact-i18n";
import { useState } from "preact/hooks";

import { useClient } from "../../../context/revoltjs/RevoltClient";

import Button from "../../../components/ui/Button";
import InputBox from "../../../components/ui/InputBox";
import Radio from "../../../components/ui/Radio";
import TextArea from "../../../components/ui/TextArea";
import CategoryButton from "../../../components/ui/fluent/CategoryButton";

export function Feedback() {
    const client = useClient();
    const [other, setOther] = useState("");
    const [description, setDescription] = useState("");
    const [state, setState] = useState<"ready" | "sending" | "sent">("ready");
    const [checked, setChecked] = useState<
        "Bug" | "Feature Request" | "__other_option__"
    >("Bug");

    async function onSubmit(ev: JSX.TargetedEvent<HTMLFormElement, Event>) {
        ev.preventDefault();
        setState("sending");

        await fetch(`https://workers.revolt.chat/feedback`, {
            method: "POST",
            body: JSON.stringify({
                checked,
                other,
                description,
                name: client.user!.username,
            }),
            mode: "no-cors",
        });

        setState("sent");
        setChecked("Bug");
        setDescription("");
        setOther("");
    }

    return (
        <form className={styles.feedback} onSubmit={onSubmit}>
            <a
                href="https://github.com/revoltchat/revolt/discussions"
                target="_blank"
                rel="noreferrer">
                <CategoryButton
                    hover
                    action="external"
                    icon={<Github size={24} />}
                    description="Suggest new Revolt features on GitHub discussions.">
                    Submit feature suggestion
                </CategoryButton>
            </a>
            <a
                href="https://github.com/revoltchat/revite/issues/new"
                target="_blank"
                rel="noreferrer">
                <CategoryButton
                    hover
                    action="external"
                    icon={<ListOl size={24} />}
                    description="To help us more easily triage issues, you can create an issue on GitHub.">
                    Create a new GitHub issue
                </CategoryButton>
            </a>
            <h3>
                <Text id="app.settings.pages.feedback.report" />
            </h3>
            <div className={styles.options}>
                <Radio
                    checked={checked === "Bug"}
                    disabled={state === "sending"}
                    onSelect={() => setChecked("Bug")}>
                    <Text id="app.settings.pages.feedback.bug" />
                </Radio>
                <Radio
                    disabled={state === "sending"}
                    checked={checked === "__other_option__"}
                    onSelect={() => setChecked("__other_option__")}>
                    <Localizer>
                        <InputBox
                            value={other}
                            disabled={state === "sending"}
                            name="entry.1151440373.other_option_response"
                            onChange={(e) => setOther(e.currentTarget.value)}
                            placeholder={
                                (
                                    <Text id="app.settings.pages.feedback.other" />
                                ) as unknown as string
                            }
                        />
                    </Localizer>
                </Radio>
            </div>
            <h3>
                <Text id="app.settings.pages.feedback.describe" />
            </h3>
            <TextArea
                // maxRows={10}
                value={description}
                id="entry.685672624"
                disabled={state === "sending"}
                onChange={(ev) => setDescription(ev.currentTarget.value)}
            />
            <p>
                <Button type="submit" contrast>
                    <Text id="app.settings.pages.feedback.send" />
                </Button>
            </p>
        </form>
    );
}
