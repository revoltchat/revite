import { Children } from "../../types/Preact";
import Tippy, { TippyProps } from '@tippyjs/react';

type Props = Omit<TippyProps, 'children'> & {
    children: Children;
    content: Children;
}

export default function Tooltip(props: Props) {
    const { children, content, ...tippyProps } = props;

    return (
        <Tippy content={content} {...tippyProps}>
            {/*
            // @ts-expect-error */}
            <div>{ children }</div>
        </Tippy>
    );
}
