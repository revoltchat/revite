import { Plugin } from "unified";
import { visit } from "unist-util-visit";

export const ESCAPE_CHARACTER = `${Math.random()}`;

export const remarkRemoveEscapeCharacter: Plugin = () => {
    return (tree) => {
        visit(tree, "", (node: { value: string }) => {
            if (node.value) {
                node.value = node.value.replace(ESCAPE_CHARACTER, "");
            }
        });
    };
};
