import { action, computed, makeAutoObservable } from "mobx";
import { ulid } from "ulid";

import MFAFlow from "./components/MFAFlow";
import Test from "./components/Test";
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

        makeAutoObservable(this);
        this.pop = this.pop.bind(this);
    }

    /**
     * Display a new modal on the stack
     * @param modal Modal data
     */
    @action push(modal: T) {
        this.stack = [
            ...this.stack,
            {
                ...modal,
                key: ulid(),
            },
        ];
    }

    /**
     * Remove the top modal from the stack
     */
    @action pop() {
        this.stack = this.stack.slice(0, this.stack.length - 1);
    }

    /**
     * Render modals
     */
    @computed render() {
        return (
            <>
                {this.stack.map((modal) => {
                    const Component = this.components[modal.type];
                    return <Component {...modal} onClose={this.pop} />;
                })}
            </>
        );
    }
}

export const modalController = new ModalController<Modal>({
    mfa_flow: MFAFlow,
    test: Test,
});
