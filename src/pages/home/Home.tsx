import {
    Home as HomeIcon,
    MessageDots,
    MessageAdd,
    Lock,
} from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import { Link } from "react-router-dom";
import styled from "styled-components/macro";

import styles from "./Home.module.scss";
import { Text } from "preact-i18n";

import { CategoryButton } from "@revoltchat/ui";

import wideSVG from "/assets/wide.svg";

import { PageHeader } from "../../components/ui/Header";
import { useClient } from "../../controllers/client/ClientController";

const Overlay = styled.div`
    display: grid;
    height: 100%;
    overflow-y: scroll;

    > * {
        grid-area: 1 / 1;
    }

    .content {
        z-index: 1;
    }

    h3 {
        padding-top: 1rem;
    }
`;

const DisabledButtonWrapper = styled.div`
    opacity: 0.5;
    pointer-events: none;
`;

export default observer(() => {
    const client = useClient();

    const servers = [
        {
            id: "01J544PT4T3WQBVBSDK3TBFZW7",
            name: "PepChat Official",
            description:
                "Get your questions answered and stay up-to-date with the state of the project.",
            inviteCode: "pepchatdiscover",
            disabled: false,
        },
        {
            id: "01J5ZQMJSQ5AFZJJ3S204JK5Q4",
            name: "Elite Group Buy (EGB)",
            description: "Group buy peptides, amino blends & more.",
            inviteCode: "elitegroupbuydiscover",
            disabled: false,
        },
        {
            id: "01J63A8HQ8S10MM4B3K85VMYBW",
            name: "Wonderland",
            description: "Peptide life social group.",
            inviteCode: "wonderlanddiscover",
            disabled: false,
        },
        {
            id: "01J545CBXQRWZZAASZQ6THKE96",
            name: "Qingdao Sigma Chemical (QSC)",
            description:
                "China wholesale bioactive compounds. (International, US, EU, Canada and Australia domestic)",
            inviteCode: "qscdiscover",
            disabled: false,
        },
        {
            id: "01J5TQYA639STTEX7SH5KXC96M",
            name: "Joe Lu's Hideout",
            description: "Peptide group buys.",
            inviteCode: "placeholder",
            disabled: true,
        },
        {
            id: "01J64CC6710N7CCWBBT625VXQ3",
            name: "The Raven Nest",
            description:
                "Group buys, protocols, social, and all things peptides.",
            inviteCode: "placeholder",
            disabled: true,
        },
        {
            id: "01J5Z5QBQWREPZZPMVKJNCBDP2",
            name: "Joyous",
            description: "Peptide group buys.",
            inviteCode: "placeholder",
            disabled: true,
        },
        {
            id: "01J5VPXSS0EK69QD69RX6SKZHW",
            name: "Kimmes Korner",
            description: "Peptide group buys.",
            inviteCode: "placeholder",
            disabled: true,
        },
        {
            id: "placeholder",
            name: "Polypeptide Universe",
            description: "The science of peptides in depth.",
            inviteCode: "placeholder",
            disabled: true,
        },
        {
            id: "placeholder",
            name: "Deb's Peptalk",
            description:
                "Group buys, protocols, social, and all things peptides.",
            inviteCode: "placeholder",
            disabled: true,
        },
    ];

    const renderServerButton = (server) => {
        const isServerJoined = client.servers.get(server.id);
        const linkTo = isServerJoined
            ? `/server/${server.id}`
            : `/invite/${server.inviteCode}`;

        const buttonContent = (
            <CategoryButton
                key={server.id}
                action={server.disabled ? undefined : "chevron"}
                icon={
                    server.disabled ? (
                        <Lock size={32} />
                    ) : isServerJoined ? (
                        <MessageDots size={32} />
                    ) : (
                        <MessageAdd size={32} />
                    )
                }
                description={server.description}>
                {server.name}
            </CategoryButton>
        );

        if (server.disabled) {
            return (
                <DisabledButtonWrapper>{buttonContent}</DisabledButtonWrapper>
            );
        } else {
            return (
                <Link to={linkTo} key={server.id}>
                    {buttonContent}
                </Link>
            );
        }
    };

    return (
        <div className={styles.home}>
            <Overlay>
                <div className="content">
                    <PageHeader icon={<HomeIcon size={24} />} withTransparency>
                        <Text id="app.navigation.tabs.home" />
                    </PageHeader>
                    <div className={styles.homeScreen}>
                        <h3>
                            <Text id="app.special.modals.onboarding.welcome" />
                            <br />
                            <img src={wideSVG} />
                        </h3>
                        <div className={styles.actions}>
                            {servers.map(renderServerButton)}
                        </div>
                    </div>
                </div>
            </Overlay>{" "}
        </div>
    );
});
