import { OverrideField } from "revolt-api/types/_common";
import { Permission } from "revolt.js";

import { PermissionSelect } from "./PermissionSelect";

interface Props {
    value: OverrideField | number;
    onChange: (v: OverrideField | number) => void;

    filter?: (keyof typeof Permission)[];
}

export function PermissionList({ value, onChange, filter }: Props) {
    return (
        <>
            {(Object.keys(Permission) as (keyof typeof Permission)[])
                .filter(
                    (key) =>
                        key !== "GrantAllSafe" &&
                        (!filter || filter.includes(key)),
                )
                .map((x) => (
                    <PermissionSelect
                        id={x}
                        key={x}
                        permission={Permission[x]}
                        value={value}
                        onChange={onChange}
                    />
                ))}
        </>
    );
}
