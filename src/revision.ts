/* eslint-disable */
// Strings needs to be explictly stated here as they can cause type issues elsewhere.

export const REPO_URL: string = "https://github.com/revoltchat/revite/commit";
export const GIT_REVISION: string = "__GIT_REVISION__";
export const GIT_BRANCH: string = "__GIT_BRANCH__";

export function isDebug() {
    return import.meta.env.FORCE_DEBUG === "1" || import.meta.env.DEV;
}
