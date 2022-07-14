import { Plugin } from "unified";
import { visit } from "unist-util-visit";

/**
 * Randomly generated string to escape HTML tags
 */
export const ESCAPE_CHARACTER = `${Math.random()}`;

export const remarkRemoveEscapeCharacter: Plugin = () => {
    return (tree) => {
        visit(tree, "", (node: { value: string; type: string }) => {
            if (node.type === "text" && node.value === ESCAPE_CHARACTER) {
                node.value = "";
            } else if (
                node.type === "code" &&
                node.value.includes(ESCAPE_CHARACTER)
            ) {
                node.value = node.value.replaceAll(ESCAPE_CHARACTER, "");
            }
        });
    };
};
