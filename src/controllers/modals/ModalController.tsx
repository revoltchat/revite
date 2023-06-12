import {
    action,
    computed,
    makeObservable,
    observable,
    runInAction,
} from "mobx";
import type { Client, API } from "revolt.js";
import { ulid } from "ulid";

import { determineLink } from "../../lib/links";
import { injectController } from "../../lib/window";

import { getApplicationState } from "../../mobx/State";

import { history } from "../../context/history";

import AddFriend from "./components/AddFriend";
import BanMember from "./components/BanMember";
import Changelog from "./components/Changelog";
import ChangelogUsernames from "./components/ChangelogUsernames";
import ChannelInfo from "./components/ChannelInfo";
import Clipboard from "./components/Clipboard";
import ConfirmLeave from "./components/ConfirmLeave";
import Confirmation from "./components/Confirmation";
import CreateBot from "./components/CreateBot";
import CreateCategory from "./components/CreateCategory";
import CreateChannel from "./components/CreateChannel";
import CreateGroup from "./components/CreateGroup";
import CreateInvite from "./components/CreateInvite";
import CreateRole from "./components/CreateRole";
import CreateServer from "./components/CreateServer";
import CustomStatus from "./components/CustomStatus";
import DeleteMessage from "./components/DeleteMessage";
import Error from "./components/Error";
import ImageViewer from "./components/ImageViewer";
import KickMember from "./components/KickMember";
import LinkWarning from "./components/LinkWarning";
import MFAEnableTOTP from "./components/MFAEnableTOTP";
import MFAFlow from "./components/MFAFlow";
import MFARecovery from "./components/MFARecovery";
import ModifyAccount from "./components/ModifyAccount";
import ModifyDisplayname from "./components/ModifyDisplayname";
import OutOfDate from "./components/OutOfDate";
import PendingFriendRequests from "./components/PendingFriendRequests";
import ReportContent from "./components/Report";
import ReportSuccess from "./components/ReportSuccess";
import ServerIdentity from "./components/ServerIdentity";
import ServerInfo from "./components/ServerInfo";
import ShowToken from "./components/ShowToken";
import SignOutSessions from "./components/SignOutSessions";
import SignedOut from "./components/SignedOut";
import UserPicker from "./components/UserPicker";
import { OnboardingModal } from "./components/legacy/Onboarding";
import { UserProfile } from "./components/legacy/UserProfile";
import { Modal } from "./types";

type Components = Record<string, React.FC<any>>;

/**
 * Handles layering and displaying modals to the user.
 */
class ModalController<T extends Modal> {
    stack: T[] = [];
    components: Components;

    constructor(components: Components) {
        this.components = components;

        makeObservable(this, {
            stack: observable,
            push: action,
            pop: action,
            remove: action,
            rendered: computed,
            isVisible: computed,
        });

        this.close = this.close.bind(this);

        // Inject globally
        injectController("modal", this);
    }

    /**
     * Display a new modal on the stack
     * @param modal Modal data
     */
    push(modal: T) {
        this.stack = [
            ...this.stack,
            {
                ...modal,
                key: ulid(),
            },
        ];
    }

    /**
     * Remove the top modal from the screen
     * @param signal What action to trigger
     */
    pop(signal: "close" | "confirm" | "force") {
        this.stack = this.stack.map((entry, index) =>
            index === this.stack.length - 1 ? { ...entry, signal } : entry,
        );
    }

    /**
     * Close the top modal
     */
    close() {
        this.pop("close");
    }

    /**
     * Remove the keyed modal from the stack
     */
    remove(key: string) {
        this.stack = this.stack.filter((x) => x.key !== key);
    }

    /**
     * Render modals
     */
    get rendered() {
        return (
            <>
                {this.stack.map((modal) => {
                    const Component = this.components[modal.type];
                    return (
                        // ESLint does not understand spread operator
                        // eslint-disable-next-line
                        <Component
                            {...modal}
                            onClose={() => this.remove(modal.key!)}
                        />
                    );
                })}
            </>
        );
    }

    /**
     * Whether a modal is currently visible
     */
    get isVisible() {
        return this.stack.length > 0;
    }
}

/**
 * Modal controller with additional helpers.
 */
class ModalControllerExtended extends ModalController<Modal> {
    /**
     * Perform MFA flow
     * @param client Client
     */
    mfaFlow(client: Client) {
        return runInAction(
            () =>
                new Promise((callback: (ticket?: API.MFATicket) => void) =>
                    this.push({
                        type: "mfa_flow",
                        state: "known",
                        client,
                        callback,
                    }),
                ),
        );
    }

    /**
     * Open TOTP secret modal
     * @param client Client
     */
    mfaEnableTOTP(secret: string, identifier: string) {
        return runInAction(
            () =>
                new Promise((callback: (value?: string) => void) =>
                    this.push({
                        type: "mfa_enable_totp",
                        identifier,
                        secret,
                        callback,
                    }),
                ),
        );
    }

    /**
     * Write text to the clipboard
     * @param text Text to write
     */
    writeText(text: string) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
        } else {
            this.push({
                type: "clipboard",
                text,
            });
        }
    }

    /**
     * Safely open external or internal link
     * @param href Raw URL
     * @param trusted Whether we trust this link
     * @param mismatch Whether to always open link warning
     * @returns Whether to cancel default event
     */
    openLink(href?: string, trusted?: boolean, mismatch?: boolean) {
        const link = determineLink(href);
        const settings = getApplicationState().settings;

        if (mismatch) {
            if (href) {
                modalController.push({
                    type: "link_warning",
                    link: href,
                    callback: () => this.openLink(href, true) as true,
                });
            }

            return true;
        }

        switch (link.type) {
            case "navigate": {
                history.push(link.path);
                break;
            }
            case "external": {
                if (
                    !trusted &&
                    !settings.security.isTrustedOrigin(link.url.hostname)
                ) {
                    modalController.push({
                        type: "link_warning",
                        link: link.href,
                        callback: () => this.openLink(href, true) as true,
                    });
                } else {
                    window.open(link.href, "_blank", "noreferrer");
                }
            }
        }

        return true;
    }
}

export const modalController = new ModalControllerExtended({
    add_friend: AddFriend,
    ban_member: BanMember,
    changelog: Changelog,
    channel_info: ChannelInfo,
    clipboard: Clipboard,
    leave_group: ConfirmLeave,
    close_dm: Confirmation,
    leave_server: ConfirmLeave,
    delete_server: Confirmation,
    delete_channel: Confirmation,
    delete_bot: Confirmation,
    block_user: Confirmation,
    unfriend_user: Confirmation,
    create_category: CreateCategory,
    create_channel: CreateChannel,
    create_group: CreateGroup,
    create_invite: CreateInvite,
    create_role: CreateRole,
    create_server: CreateServer,
    create_bot: CreateBot,
    custom_status: CustomStatus,
    delete_message: DeleteMessage,
    error: Error,
    image_viewer: ImageViewer,
    kick_member: KickMember,
    link_warning: LinkWarning,
    mfa_flow: MFAFlow,
    mfa_recovery: MFARecovery,
    mfa_enable_totp: MFAEnableTOTP,
    modify_account: ModifyAccount,
    onboarding: OnboardingModal,
    out_of_date: OutOfDate,
    pending_friend_requests: PendingFriendRequests,
    server_identity: ServerIdentity,
    server_info: ServerInfo,
    show_token: ShowToken,
    signed_out: SignedOut,
    sign_out_sessions: SignOutSessions,
    user_picker: UserPicker,
    user_profile: UserProfile,
    report: ReportContent,
    report_success: ReportSuccess,
    modify_displayname: ModifyDisplayname,
    changelog_usernames: ChangelogUsernames,
});
