import { Message, Group, Compass } from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import { useHistory, useLocation } from "react-router";
import styled, { css } from "styled-components/macro";

import { Centred, IconButton } from "@revoltchat/ui";

import ConditionalLink from "../../lib/ConditionalLink";

import { useApplicationState } from "../../mobx/State";

import { useClient } from "../../controllers/client/ClientController";
import UserIcon from "../common/user/UserIcon";

const Base = styled.div`
    background: var(--secondary-background);
`;

const Navbar = styled.div`
    z-index: 500;
    display: flex;
    margin: 0 auto;
    max-width: 500px;
    height: var(--bottom-navigation-height);
`;

/**
 * I've decided that this whole component
 * needs to be re-written 👍👍👍👍👍👍
 */

const Button = styled.a<{ active: boolean }>`
    flex: 1;
    color: var(--foreground);

    // ok
    * {
        color: var(--foreground) !important;
    }

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
    const discoverActive = path.startsWith("/discover");
    const homeActive = !(friendsActive || settingsActive || discoverActive);

    return (
        <Base>
            <Navbar>
                <Button active={homeActive}>
                    <Centred
                        onClick={() => {
                            if (settingsActive) {
                                if (history.length > 0) {
                                    history.replace(layout.getLastPath());
                                    return;
                                }
                            }

                            const path = layout.getLastHomePath();
                            if (path.startsWith("/friends")) {
                                history.push("/");
                            } else {
                                history.push(path);
                            }
                        }}>
                        <Message size={24} />
                    </Centred>
                </Button>
                <Button active={friendsActive}>
                    <IconButton>
                        <ConditionalLink active={friendsActive} to="/friends">
                            <Group size={25} />
                        </ConditionalLink>
                    </IconButton>
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
                <Button active={discoverActive}>
                    <IconButton>
                        <ConditionalLink
                            active={discoverActive}
                            to="/discover/servers">
                            <Compass size={24} />
                        </ConditionalLink>
                    </IconButton>
                </Button>
                <Button active={settingsActive}>
                    <IconButton>
                        <ConditionalLink active={settingsActive} to="/settings">
                            <UserIcon target={user} size={26} status={true} />
                        </ConditionalLink>
                    </IconButton>
                </Button>
            </Navbar>
        </Base>
    );
});
