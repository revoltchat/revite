import IconButton from "../ui/IconButton";
import UserIcon from "../common/user/UserIcon";
import styled, { css } from "styled-components";
import { useSelf } from "../../context/revoltjs/hooks";
import { useHistory, useLocation } from "react-router";
import ConditionalLink from "../../lib/ConditionalLink";
import { Message, Group } from "@styled-icons/boxicons-solid";

const NavigationBase = styled.div`
    z-index: 100;
    height: 50px;
    display: flex;
    background: var(--secondary-background);
`;

const Button = styled.a<{ active: boolean }>`
    flex: 1;

    > a, > div, > a > div {
        width: 100%;
        height: 100%;
    }

    ${ props => props.active && css`
        background: var(--hover);
    ` }
`;

export default function BottomNavigation() {
    const user = useSelf();
    const history = useHistory();
    const path = useLocation().pathname;

    const friendsActive = path.startsWith("/friends");
    const settingsActive = path.startsWith("/settings");
    const homeActive = !(friendsActive || settingsActive);

    return (
        <NavigationBase>
            <Button active={homeActive}>
                <IconButton
                    onClick={() => {
                        if (!homeActive) {
                            if (settingsActive) {
                                if (history.length > 0) {
                                    history.goBack();
                                } else {
                                    history.push('/');
                                }
                            }
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
            <Button active={settingsActive}>
                <ConditionalLink active={settingsActive} to="/settings">
                    <IconButton>
                        <UserIcon target={user} size={26} status={true} />
                    </IconButton>
                </ConditionalLink>
            </Button>
        </NavigationBase>
    );
}
