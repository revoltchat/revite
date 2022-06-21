import { X } from "@styled-icons/boxicons-regular";
import { observer } from "mobx-react-lite";
import { Server } from "revolt.js";

import styles from "./ServerInfo.module.scss";

import { Modal } from "@revoltchat/ui";

import Markdown from "../../../components/markdown/Markdown";
import { getChannelName } from "../../revoltjs/util";

import ServerBadge from "../../../components/common/ServerBadge";

interface Props {
    server: Server;
    onClose: () => void;
}

export const ServerInfo = observer(({ server, onClose }: Props) => {

	//const bannerURL = server.generateBannerURL({ width: 480 });

    return (
		<Modal onClose={onClose}
			// this looks like shit with most banners
			//style={{
			//	backgroundImage: bannerURL ? `url('${bannerURL}')` : undefined,
			//}}
			>
            <div className={styles.info}>
                <div className={styles.header}>
					<ServerBadge server={server} />
                    <h1>{server.name}</h1>
                    <div onClick={onClose}>
                        <X size={36} />
                    </div>
                </div>
                <p>
                    <Markdown content={server.description!} />
                </p>
            </div>
        </Modal>
    );
});

