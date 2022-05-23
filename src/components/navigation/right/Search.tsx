import { Link, useParams } from "react-router-dom";
import { Message as MessageI } from "revolt.js";
import styled from "styled-components/macro";

import { Text } from "preact-i18n";
import { useEffect, useState } from "preact/hooks";

import { Button } from "@revoltchat/ui";

import { useClient } from "../../../context/revoltjs/RevoltClient";

import Message from "../../common/messaging/Message";
import InputBox from "../../ui/InputBox";
import Overline from "../../ui/Overline";
import Preloader from "../../ui/Preloader";

import { GenericSidebarBase, GenericSidebarList } from "../SidebarBase";

type SearchState =
    | {
          type: "waiting";
      }
    | {
          type: "loading";
      }
    | {
          type: "results";
          results: MessageI[];
      };

const SearchBase = styled.div`
    padding: 6px;

    input {
        width: 100%;
    }

    .list {
        gap: 4px;
        margin: 8px 0;
        display: flex;
        flex-direction: column;
    }

    .message {
        margin: 2px;
        padding: 6px;
        overflow: hidden;
        border-radius: var(--border-radius);

        color: var(--foreground);
        background: var(--primary-background);

        &:hover {
            background: var(--hover);
        }

        > * {
            pointer-events: none;
        }
    }

    .sort {
        gap: 4px;
        margin: 6px 0;
        display: flex;

        > * {
            flex: 1;
            min-width: 0;
        }
    }
`;

interface Props {
    close: () => void;
}

export function SearchSidebar({ close }: Props) {
    const channel = useClient().channels.get(
        useParams<{ channel: string }>().channel,
    )!;

    type Sort = "Relevance" | "Latest" | "Oldest";
    const [sort, setSort] = useState<Sort>("Latest");
    const [query, setQuery] = useState("");

    const [state, setState] = useState<SearchState>({ type: "waiting" });

    async function search() {
        if (!query) return;
        setState({ type: "loading" });
        const data = await channel.searchWithUsers({ query, sort });
        setState({ type: "results", results: data.messages });
    }

    useEffect(() => {
        search();
        // eslint-disable-next-line
    }, [sort]);

    return (
        <GenericSidebarBase data-scroll-offset="with-padding">
            <GenericSidebarList>
                <SearchBase>
                    <Overline type="accent" block hover>
                        <a onClick={close}>« back to members</a>
                    </Overline>
                    <Overline type="subtle" block>
                        <Text id="app.main.channel.search.title" />
                    </Overline>
                    <InputBox
                        value={query}
                        onKeyDown={(e) => e.key === "Enter" && search()}
                        onChange={(e) => setQuery(e.currentTarget.value)}
                    />
                    <div class="sort">
                        {["Latest", "Oldest", "Relevance"].map((key) => (
                            <Button
                                key={key}
                                compact
                                palette={sort === key ? "accent" : "primary"}
                                onClick={() => setSort(key as Sort)}>
                                <Text
                                    id={`app.main.channel.search.sort.${key.toLowerCase()}`}
                                />
                            </Button>
                        ))}
                    </div>
                    {state.type === "loading" && <Preloader type="ring" />}
                    {state.type === "results" && (
                        <div class="list">
                            {state.results.map((message) => {
                                let href = "";
                                if (channel?.channel_type === "TextChannel") {
                                    href += `/server/${channel.server_id}`;
                                }

                                href += `/channel/${message.channel_id}/${message._id}`;

                                return (
                                    <Link to={href} key={message._id}>
                                        <div class="message">
                                            <Message
                                                message={message}
                                                head
                                                hideReply
                                            />
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </SearchBase>
            </GenericSidebarList>
        </GenericSidebarBase>
    );
}
