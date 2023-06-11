import dayjs from "dayjs";
import styled, { css } from "styled-components";

import { Text } from "preact-i18n";
import { useMemo, useState } from "preact/hooks";

import { CategoryButton, Column, Modal } from "@revoltchat/ui";
import type { Action } from "@revoltchat/ui/esm/components/design/atoms/display/Modal";

import { noopTrue } from "../../../lib/js";

import {
    changelogEntries,
    changelogEntryArray,
    ChangelogPost,
} from "../../../assets/changelogs";
import Markdown from "../../../components/markdown/Markdown";
import { ModalProps } from "../types";

const Image = styled.img<{ shadow?: boolean }>`
    border-radius: var(--border-radius);

    ${(props) =>
        props.shadow &&
        css`
            filter: drop-shadow(4px 4px 10px rgba(0, 0, 0, 0.5));
        `}
`;

function RenderLog({ post }: { post: ChangelogPost }) {
    return (
        <Column>
            {post.content.map((entry) =>
                typeof entry === "string" ? (
                    <Markdown content={entry} />
                ) : entry.type === "element" ? (
                    entry.element
                ) : (
                    <Image src={entry.src} shadow={entry.shadow} />
                ),
            )}
        </Column>
    );
}

/**
 * Changelog modal
 */
export default function Changelog({
    initial,
    onClose,
    signal,
}: ModalProps<"changelog">) {
    const [log, setLog] = useState(initial);

    const entry = useMemo(
        () => (log ? changelogEntries[log] : undefined),
        [log],
    );

    const actions = useMemo(() => {
        const arr: Action[] = [
            {
                palette: "primary",
                children: <Text id="app.special.modals.actions.close" />,
                onClick: noopTrue,
            },
        ];

        if (log) {
            arr.push({
                palette: "plain-secondary",
                children: <Text id="app.special.modals.changelogs.older" />,
                onClick: () => {
                    setLog(undefined);
                    return false;
                },
            });
        }

        return arr;
    }, [log]);

    return (
        <Modal
            title={
                entry?.title ?? (
                    <Text id="app.special.modals.changelogs.title" />
                )
            }
            description={
                entry ? (
                    dayjs(entry.date).calendar()
                ) : (
                    <Text id="app.special.modals.changelogs.description" />
                )
            }
            actions={actions}
            onClose={onClose}
            signal={signal}>
            {entry ? (
                <RenderLog post={entry} />
            ) : (
                <Column>
                    {changelogEntryArray.map((entry, index) => (
                        <CategoryButton
                            key={index}
                            onClick={() => setLog(index + 1)}>
                            {entry.title}
                        </CategoryButton>
                    ))}
                </Column>
            )}
        </Modal>
    );
}
