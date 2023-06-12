import { Link } from "react-router-dom";

import { determineLink } from "../../../lib/links";

import { modalController } from "../../../controllers/modals/ModalController";

export function RenderAnchor({
    href,
    ...props
}: JSX.HTMLAttributes<HTMLAnchorElement>) {
    // Pass-through no href or if anchor
    if (!href || href.startsWith("#")) return <a href={href} {...props} />;

    // Determine type of link
    const link = determineLink(href);
    if (link.type === "none") return <a {...props} />;

    // Render direct link if internal
    if (link.type === "navigate") {
        return <Link to={link.path} children={props.children} />;
    }

    return (
        <a
            {...props}
            href={href}
            target="_blank"
            rel="noreferrer"
            onClick={(ev) =>
                modalController.openLink(
                    href,
                    undefined,
                    ev.currentTarget.innerText !== href,
                ) && ev.preventDefault()
            }
        />
    );
}
