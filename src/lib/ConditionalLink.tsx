import { Link, LinkProps } from "react-router-dom";

type Props = LinkProps &
    JSX.HTMLAttributes<HTMLAnchorElement> & {
        active: boolean;
    };

export default function ConditionalLink(props: Props) {
    const { active, ...linkProps } = props;

    if (active) {
        const ariaProps = Object.fromEntries(
            Object.entries(linkProps).filter(
                ([k]) => k === "role" || k.startsWith("aria-"),
            ),
        );

        return (
            <a onClick={linkProps.onClick} {...ariaProps}>
                {props.children}
            </a>
        );
    }
    return <Link {...linkProps} />;
}
