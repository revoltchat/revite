import { API, Channel, Permission, Server } from "revolt.js";

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
                            "ReadMessageHistory",
                            "Speak",
                            "Video",
                            "MuteMembers",
                            "DeafenMembers",
                            "MoveMembers",
                            "ManageWebhooks",
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
