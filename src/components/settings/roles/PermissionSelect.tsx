import Long from "long";
import { OverrideField } from "revolt-api/types/_common";
import { Permission } from "revolt.js";
import styled from "styled-components";

import { Text } from "preact-i18n";
import { useMemo } from "preact/hooks";

import Checkbox from "../../ui/Checkbox";

import { OverrideSwitch } from "./OverrideSwitch";

interface PermissionSelectProps {
    id: keyof typeof Permission;
    permission: number;
    value: OverrideField | number;
    onChange: (value: OverrideField | number) => void;
}

type State = "Allow" | "Neutral" | "Deny";

const PermissionEntry = styled.label`
    width: 100%;
    margin: 8px 0;
    display: flex;
    font-size: 1.1em;
    align-items: center;

    .title {
        flex-grow: 1;

        display: flex;
        flex-direction: column;
    }

    .description {
        font-size: 0.8em;
        color: var(--secondary-foreground);
    }
`;

export function PermissionSelect({
    id,
    permission,
    value,
    onChange,
}: PermissionSelectProps) {
    const state: State = useMemo(() => {
        if (typeof value === "object") {
            if (Long.fromNumber(value.d).and(permission).eq(permission)) {
                return "Deny";
            }

            if (Long.fromNumber(value.a).and(permission).eq(permission)) {
                return "Allow";
            }

            return "Neutral";
        } else {
            if (Long.fromNumber(value).and(permission).eq(permission)) {
                return "Allow";
            }

            return "Neutral";
        }
    }, [value]);

    function onSwitch(state: State) {
        if (typeof value !== "object") throw "!";

        // Convert to Long so we can do bitwise ops.
        let allow = Long.fromNumber(value.a);
        let deny = Long.fromNumber(value.d);

        // Clear the current permission value.
        if (allow.and(permission).eq(permission)) {
            allow = allow.xor(permission);
        }

        if (deny.and(permission).eq(permission)) {
            deny = deny.xor(permission);
        }

        // Apply the current permission state.
        if (state === "Allow") {
            allow = allow.or(permission);
        }

        if (state === "Deny") {
            deny = deny.or(permission);
        }

        // Invoke state change.
        onChange({
            a: allow.toNumber(),
            d: deny.toNumber(),
        });
    }

    return (
        <PermissionEntry>
            <span class="title">
                <Text id={`permissions.server.${id}.t`}>{id}</Text>
                <span class="description">
                    <Text id={`permissions.server.${id}.d`} />
                </span>
            </span>
            {typeof value === "object" ? (
                <OverrideSwitch state={state} onChange={onSwitch} />
            ) : (
                <Checkbox
                    checked={state === "Allow"}
                    onChange={() =>
                        onChange(
                            Long.fromNumber(value, false)
                                .xor(permission)
                                .toNumber(),
                        )
                    }
                />
            )}
        </PermissionEntry>
    );
}
