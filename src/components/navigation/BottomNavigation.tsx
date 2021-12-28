import { Message, Group } from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import { useHistory, useLocation } from "react-router";
import styled, { css } from "styled-components";

import ConditionalLink from "../../lib/ConditionalLink";

import { useApplicationState } from "../../mobx/State";

import { useClient } from "../../context/revoltjs/RevoltClient";

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

export default observer(() => {
    const client = useClient();
    const layout = useApplicationState().layout;
    const user = client.users.get(client.user!._id);

    const history = useHistory();
    const path = useLocation().pathname;

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
                                    return;
                                }
                            }

                            history.push(layout.getLastHomePath());
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
});
