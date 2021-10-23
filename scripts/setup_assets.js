/* eslint-disable */
const { copy, remove, access } = require("fs-extra");
const { exec: cexec } = require("child_process");
const { resolve } = require("path");

let target = process.env.REVOLT_SASS;
let DEFAULT_DIRECTORY = "public/assets_default";
let OUT_DIRECTORY = "public/assets";

function exec(command) {
    return new Promise((fulfil, reject) => {
        cexec(command, (err, stdout, stderr) => {
            if (err) {
                reject(err);
                return;
            }

            fulfil({ stdout, stderr });
        });
    });
}

(async () => {
    try {
        await access(OUT_DIRECTORY);
        if (process.argv[2] === "--check") return;

        await remove(OUT_DIRECTORY);
    } catch (err) {}

    if (target) {
        await exec(`git clone ${target} ${OUT_DIRECTORY}`);
        await exec(`rm -rf ${resolve(OUT_DIRECTORY, ".git")}`);
    } else {
        await copy(DEFAULT_DIRECTORY, OUT_DIRECTORY);
    }
})();
