const { readdirSync } = require("fs");

console.log(
    "var locale_keys = " +
        JSON.stringify([
            ...readdirSync("node_modules/dayjs/locale")
                .filter((x) => x.endsWith(".js"))
                .map((x) => {
                    v = x.split(".");
                    v.pop();
                    return v.join(".");
                }),
            ...readdirSync("external/lang")
                .filter((x) => x.endsWith(".json"))
                .map((x) => {
                    v = x.split(".");
                    v.pop();
                    return v.join(".");
                }),
        ]) +
        ";",
);
