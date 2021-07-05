import { Link, LinkProps } from "react-router-dom";

type Props = LinkProps &
	JSX.HTMLAttributes<HTMLAnchorElement> & {
		active: boolean;
	};

export default function ConditionalLink(props: Props) {
	const { active, ...linkProps } = props;

	if (active) {
		return <a>{props.children}</a>;
	} else {
		return <Link {...linkProps} />;
	}
}
