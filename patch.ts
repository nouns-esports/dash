import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

console.log("Patching @privy-io/server-auth");

const filePath = join(
    process.cwd(),
    "node_modules",
    "@privy-io",
    "server-auth",
    "dist",
    "cjs",
    "http.js",
);

const fileContent = readFileSync(filePath, "utf8");
const updatedContent = fileContent.replace("redaxios", "axios");
writeFileSync(filePath, updatedContent, "utf8");
