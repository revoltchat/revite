/* eslint-disable */
const { copy, remove, access, readFile, writeFile } = require("fs-extra");
const klaw = require("klaw");

let target = /__API_URL__/g;
let replacement = process.env.REVOLT_PUBLIC_URL;
let BUILD_DIRECTORY = "dist";
let OUT_DIRECTORY = "dist_injected";

if (typeof replacement === "undefined") {
    console.error("No REVOLT_PUBLIC_URL specified in environment variables.");
    process.exit(1);
}

(async () => {
    console.log("Ensuring project has been built at least once.");
    try {
        await access(BUILD_DIRECTORY);
    } catch (err) {
        console.error("Build project at least once!");
        return process.exit(1);
    }

    console.log("Determining if injected build already exists...");
    try {
        await access(OUT_DIRECTORY);

        console.log("Deleting existing build...");
        await remove(OUT_DIRECTORY);
    } catch (err) {}

    await copy(BUILD_DIRECTORY, OUT_DIRECTORY);

    console.log("Processing bundles...");
    for await (const file of klaw(OUT_DIRECTORY)) {
        let path = file.path;
        if (path.endsWith(".js")) {
            let data = await readFile(path);
            if (target.test(data)) {
                console.log("Matched file", path);

                let processed = data.toString().replace(target, replacement);
                await writeFile(path, processed);
            }
        }
    }

    console.log("Complete.");
})();
