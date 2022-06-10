import { observer } from "mobx-react-lite";

import { modalController } from ".";

export default observer(() => {
    return modalController.render();
});
