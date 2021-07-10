import { Search } from "@styled-icons/boxicons-regular";
import { Message, Group, Inbox } from "@styled-icons/boxicons-solid";
import { useHistory, useLocation } from "react-router";
import styled, { css } from "styled-components";

import ConditionalLink from "../../lib/ConditionalLink";

import { connectState } from "../../redux/connector";
import { LastOpened } from "../../redux/reducers/last_opened";

import { useSelf } from "../../context/revoltjs/hooks";

import UserIcon from "../common/user/UserIcon";
import IconButton from "../ui/IconButton";

const Base = styled.div`
    background: var(--secondary-background);
`;

const Navbar = styled.div`
    z-index: 100;
    max-width: 500px;
    margin: 0 auto;
    display: flex;
    height: var(--bottom-navigation-height);
`;

const Button = styled.a<{ active: boolean }>`
    flex: 1;

    > a,
    > div,
    > a > div {
        width: 100%;
        height: 100%;
    }

    > div,
    > a > div {
        padding: 0 20px;
    }

    ${(props) =>
        props.active &&
        css`
            background: var(--hover);
        `}
`;

interface Props {
    lastOpened: LastOpened;
}

export function BottomNavigation({ lastOpened }: Props) {
    const user = useSelf();
    const history = useHistory();
    const path = useLocation().pathname;

    const channel_id = lastOpened["home"];

    const friendsActive = path.startsWith("/friends");
    const settingsActive = path.startsWith("/settings");
    const homeActive = !(friendsActive || settingsActive);

    return (
        <Base>
            <Navbar>
                <Button active={homeActive}>
                    <IconButton
                        onClick={() => {
                            if (settingsActive) {
                                if (history.length > 0) {
                                    history.goBack();
                                }
                            }

                            if (channel_id) {
                                history.push(`/channel/${channel_id}`);
                            } else {
                                history.push("/");
                            }
                        }}>
                        <Message size={24} />
                    </IconButton>
                </Button>
                <Button active={friendsActive}>
                    <ConditionalLink active={friendsActive} to="/friends">
                        <IconButton>
                            <Group size={25} />
                        </IconButton>
                    </ConditionalLink>
                </Button>
                {/*<Button active={searchActive}>
                    <ConditionalLink active={searchActive} to="/search">
                        <IconButton>
                            <Search size={25} />
                        </IconButton>
                    </ConditionalLink>
                </Button>
                <Button active={inboxActive}>
                    <ConditionalLink active={inboxActive} to="/inbox">
                        <IconButton>
                            <Inbox size={25} />
                        </IconButton>
                    </ConditionalLink>
                </Button>*/}
                <Button active={settingsActive}>
                    <ConditionalLink active={settingsActive} to="/settings">
                        <IconButton>
                            <UserIcon target={user} size={26} status={true} />
                        </IconButton>
                    </ConditionalLink>
                </Button>
            </Navbar>
        </Base>
    );
}

export default connectState(BottomNavigation, (state) => {
    return {
        lastOpened: state.lastOpened,
    };
});
