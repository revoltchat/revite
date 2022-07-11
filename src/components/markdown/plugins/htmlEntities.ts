import { Plugin } from "unified";
import { visit } from "unist-util-visit";

export const remarkHtmlEntities: Plugin = () => {
    return (tree) => {
        visit(tree, "text", (node: { value: string }) => {
            node.value = node.value.replace(/</g, "&lt;");
        });
    };
};
