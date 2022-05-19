import { API } from "revolt.js";

import styles from "./Attachment.module.scss";
import classNames from "classnames";
import { useContext, useState } from "preact/hooks";

import { useIntermediate } from "../../../../context/intermediate/Intermediate";
import { AppContext } from "../../../../context/revoltjs/RevoltClient";

enum ImageLoadingState {
    Loading,
    Loaded,
    Error,
}

type Props = JSX.HTMLAttributes<HTMLImageElement> & {
    attachment: API.File;
};

export default function ImageFile({ attachment, ...props }: Props) {
    const [loading, setLoading] = useState(ImageLoadingState.Loading);
    const client = useContext(AppContext);
    const { openScreen } = useIntermediate();
    const url = client.generateFileURL(attachment)!;

    return (
        <img
            {...props}
            src={url}
            alt={attachment.filename}
            loading="lazy"
            className={classNames(styles.image, {
                [styles.loading]: loading !== ImageLoadingState.Loaded,
            })}
            onClick={() => openScreen({ id: "image_viewer", attachment })}
            onMouseDown={(ev) => ev.button === 1 && window.open(url, "_blank")}
            onLoad={() => setLoading(ImageLoadingState.Loaded)}
            onError={() => setLoading(ImageLoadingState.Error)}
        />
    );
}
