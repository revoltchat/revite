import { Plugin } from "unified";
import { visit } from "unist-util-visit";

export const ESCAPE_CHARACTER = `${Math.random()}`;

export const remarkRemoveEscapeCharacter: Plugin = () => {
    return (tree) => {
        visit(tree, "", (node: { value: string; type: string }) => {
            if (node.value === ESCAPE_CHARACTER && node.type === 'text') {
                node.value = '';
              } else if (node.value.includes(ESCAPE_CHARACTER) && node.type === 'code') {
                node.value = node.value.replaceAll(ESCAPE_CHARACTER, '');
              }
        });
    };
};
