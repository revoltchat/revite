import Lottie, { LottieRefCurrentProps } from "lottie-react";

import { JSX } from "preact";

import usernameAnim from "../controllers/modals/components/legacy/usernameUpdateLottie.json";

type Element =
    | string
    | {
          type: "image";
          src: string;
          shadow?: boolean;
      }
    | { type: "element"; element: JSX.Element };

export interface ChangelogPost {
    date: Date;
    title: string;
    content: Element[];
}

export const changelogEntries: Record<number, ChangelogPost> = {
    1: {
        date: new Date("2022-06-12T20:39:16.674Z"),
        title: "Secure your account with 2FA",
        content: [
            "Two-factor authentication is now available to all users, you can now head over to settings to enable recovery codes and an authenticator app.",
            {
                type: "image",
                src: "https://autumn.revolt.chat/attachments/E21kwmuJGcASgkVLiSIW0wV3ggcaOWjW0TQF7cdFNY/image.png",
            },
            "Once enabled, you will be prompted on login.",
            {
                type: "image",
                src: "https://autumn.revolt.chat/attachments/LWRYoKR2tE1ggW_Lzm547P1pnrkNgmBaoCAfWvHE74/image.png",
            },
            "Other authentication methods coming later, stay tuned!",
        ],
    },
    2: {
        date: new Date("2023-02-23T20:00:00.000Z"),
        title: "In-App Reporting Is Here",
        content: [
            "You can now report any user, server, or message directly from the app.",
            {
                type: "image",
                src: "https://autumn.revolt.chat/attachments/ZuDVIjGiCl61Pk9XGk5qfc8-idN9EnFAk55DUQp713/the.png",
                shadow: true,
            },
            "If you want to learn more about how we're making Revolt safer for you, check out our new blog post :point_right: [https://revolt.chat/posts/improving-user-safety](https://revolt.chat/posts/improving-user-safety)",
        ],
    },
    3: {
        date: new Date("2023-06-11T15:00:00.000Z"),
        title: "Usernames are Changing",
        content: [
            {
                type: "element",
                element: (
                    <Lottie
                        animationData={usernameAnim}
                        style={{
                            background: "var(--secondary-background)",
                            borderRadius: "6px",
                        }}
                    />
                ),
            },
            "Revolt has undergone a significant change to its username system, transitioning from unique username handles to a new system of display names and usernames with four-digit number tags called discriminators. The four-digit number tags serve as identifiers to differentiate users with the same username, allowing individuals to select desired usernames that reflect their identity.",
            {
                type: "element",
                element: (
                    <a href="https://revolt.chat/posts/evolving-usernames">
                        Read more on our blog!
                    </a>
                ),
            },
        ],
    },
};

export const changelogEntryArray = Object.keys(changelogEntries).map(
    (index) => changelogEntries[index as unknown as number],
);

export const latestChangelog = changelogEntryArray.length;
