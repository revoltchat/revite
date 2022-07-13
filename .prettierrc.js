module.exports = {
    tabWidth: 4,
    trailingComma: "all",
    jsxBracketSameLine: true,
    importOrder: [
        "preact|classnames|.scss$",
        "^@revoltchat",
        "/(lib)",
        "/(redux|mobx)",
        "/(context)",
        "/(ui|common)$",
        ".svg|.webp|.png|.jpg$",
        "^[./]",
    ],
    importOrderSeparation: true,
};
