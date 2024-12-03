import { visit } from "unist-util-visit";

/**
 * Remark plugin to replace \n with <br> in table cells
 */
export function remarkTableLineBreaks() {
    return (tree: any) => {
        visit(tree, "tableCell", (node) => {
            node.children.forEach((child: any) => {
                if (child.type === "text") {
                    // Replace \n with <br> for text within table cells
                    child.value = child.value.replace(/\n/g, "<br>");
                }
            });
        });
    };
}
