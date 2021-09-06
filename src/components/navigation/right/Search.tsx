import { Link, useParams } from "react-router-dom";
import { Message as MessageI } from "revolt.js/dist/maps/Messages";
import styled from "styled-components";

import { Text } from "preact-i18n";
import { useEffect, useState } from "preact/hooks";

import { useTranslation } from "../../../lib/i18n";

import { useClient } from "../../../context/revoltjs/RevoltClient";

import ComboBox from "../../../components/ui/ComboBox";
import Message from "../../common/messaging/Message";
import Button from "../../ui/Button";
import InputBox from "../../ui/InputBox";
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
    const translate = useTranslation();
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
        <GenericSidebarBase>
            <GenericSidebarList>
                <SearchBase>
                    <InputBox
                        placeholder={translate("app.main.channel.search.title")}
                        value={query}
                        onKeyDown={(e) => e.key === "Enter" && search()}
                        onChange={(e) => setQuery(e.currentTarget.value)}
                    />
                    <div class="sort">
                        <Button accent onClick={close}>
                            <Text id="app.main.channel.search.back" />
                        </Button>
                        <ComboBox
                            value={sort}
                            onChange={(e) =>
                                setSort(e.currentTarget.value as Sort)
                            }>
                            {["Latest", "Oldest", "Relevance"].map((key) => (
                                <option value={key} key={key}>
                                    {key}
                                </option>
                            ))}
                        </ComboBox>
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
