import { UseFormMethods } from "react-hook-form";

import { Text, Localizer } from "preact-i18n";

import { InputBox } from "@revoltchat/ui/lib/components/atoms/inputs/InputBox";

import Overline from "../../components/ui/Overline";

type FieldType =
    | "email"
    | "username"
    | "password"
    | "invite"
    | "current_password";

type Props = Omit<JSX.HTMLAttributes<HTMLInputElement>, "children" | "as"> & {
    type: FieldType;
    showOverline?: boolean;
    register: UseFormMethods["register"];
    error?: string;
    name?: string;
};

export default function FormField({
    type,
    register,
    showOverline,
    error,
    name,
    ...props
}: Props) {
    return (
        <>
            {showOverline && (
                <Overline error={error}>
                    <Text id={`login.${type}`} />
                </Overline>
            )}
            <Localizer>
                <InputBox
                    placeholder={
                        (
                            <Text id={`login.enter.${type}`} />
                        ) as unknown as string
                    }
                    name={
                        type === "current_password" ? "password" : name ?? type
                    }
                    type={
                        type === "invite" || type === "username"
                            ? "text"
                            : type === "current_password"
                            ? "password"
                            : type
                    }
                    // See https://github.com/mozilla/contain-facebook/issues/783
                    className="fbc-has-badge"
                    ref={register(
                        type === "password" || type === "current_password"
                            ? {
                                  validate: (value: string) =>
                                      value.length === 0
                                          ? "RequiredField"
                                          : value.length < 8
                                          ? "TooShort"
                                          : value.length > 1024
                                          ? "TooLong"
                                          : undefined,
                              }
                            : type === "email"
                            ? {
                                  required: "RequiredField",
                                  pattern: {
                                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                      message: "InvalidEmail",
                                  },
                              }
                            : type === "username"
                            ? {
                                  validate: (value: string) =>
                                      value.length === 0
                                          ? "RequiredField"
                                          : value.length < 2
                                          ? "TooShort"
                                          : value.length > 32
                                          ? "TooLong"
                                          : undefined,
                              }
                            : { required: "RequiredField" },
                    )}
                    {...props}
                />
            </Localizer>
        </>
    );
}
