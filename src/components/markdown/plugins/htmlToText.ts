import { Plugin } from "unified";
import { visit } from "unist-util-visit";

export const remarkHtmlToText: Plugin = () => {
    return (tree) => {
        visit(tree, "html", (node: { type: string; value: string }) => {
            node.type = "text";
        });
    };
};
