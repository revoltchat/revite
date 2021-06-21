import styled, { css } from "styled-components";
import { Link } from "react-router-dom";
import IconButton from "../ui/IconButton";
import UserIcon from "../common/user/UserIcon";
import { useSelf } from "../../context/revoltjs/hooks";
import { useHistory, useLocation } from "react-router";
import { MessageCircle, Users } from "@styled-icons/feather";

const NavigationBase = styled.div`
    z-index: 10;
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
                    <MessageCircle size={26} />
                </IconButton>
            </Button>
            <Button active={friendsActive}>
                <Link to="/friends">
                    <IconButton>
                        <Users size={26} />
                    </IconButton>
                </Link>
            </Button>
            <Button active={settingsActive}>
                <Link to="/settings">
                    <IconButton>
                        <UserIcon target={user} size={26} status={true} />
                    </IconButton>
                </Link>
            </Button>
        </NavigationBase>
    );
}
