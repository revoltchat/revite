import { API, Channel, Member, Server } from "revolt.js";
import { Permission } from "revolt.js";

import { PermissionSelect } from "./PermissionSelect";

interface Props {
    value: API.OverrideField | number;
    onChange: (v: API.OverrideField | number) => void;

    target?: Channel | Server;
    filter?: (keyof typeof Permission)[];
}

export function PermissionList({ value, onChange, filter, target }: Props) {
    return (
        <>
            {(Object.keys(Permission) as (keyof typeof Permission)[])
                .filter(
                    (key) =>
                        ![
                            "GrantAllSafe",
                            "TimeoutMembers",
                            "ReadMessageHistory",
                            "Speak",
                            "Video",
                            "MuteMembers",
                            "DeafenMembers",
                            "MoveMembers",
                        ].includes(key) &&
                        (!filter || filter.includes(key)),
                )
                .map((x) => (
                    <PermissionSelect
                        id={x}
                        key={x}
                        permission={Permission[x]}
                        value={value}
                        onChange={onChange}
                        target={target}
                    />
                ))}
        </>
    );
}
