/**
 * Railway wrapper settings for Node-RED.
 *
 * The stock nodered/node-red image serves the admin API (flow deploy, palette
 * install) with NO authentication — anyone who has the public URL can rewrite
 * flows and install arbitrary npm packages, which on a tool that executes
 * JavaScript in function nodes is remote code execution. Node-RED itself does
 * not read NODE_RED_PASSWORD / NODE_RED_USERNAME / NODE_RED_CREDENTIAL_SECRET;
 * those names only mean something if a settings.js wires them, which the
 * marketplace listings do not ship. This file wires them, so the editor is
 * closed on the first request the public URL ever serves.
 */
const bcrypt = require("bcryptjs");

const username = process.env.NODE_RED_USERNAME || "admin";
const password = process.env.NODE_RED_PASSWORD;
const credentialSecret = process.env.NODE_RED_CREDENTIAL_SECRET;

if (!password) {
    console.error(
        "[railway] NODE_RED_PASSWORD is empty. Refusing to start an editor " +
        "that anyone with the URL could rewrite. Set NODE_RED_PASSWORD."
    );
    process.exit(1);
}
if (!credentialSecret) {
    console.error(
        "[railway] NODE_RED_CREDENTIAL_SECRET is empty. Set it so encrypted " +
        "node credentials survive a redeploy."
    );
    process.exit(1);
}

module.exports = {
    uiPort: process.env.PORT || 1880,
    flowFile: "flows.json",
    // Credentials are encrypted with this key; a fixed value across boots is
    // what lets credential nodes decrypt after a redeploy.
    credentialSecret: credentialSecret,
    // Closes both the editor and the admin HTTP API.
    adminAuth: {
        type: "credentials",
        users: [{
            username: username,
            password: bcrypt.hashSync(password, 8),
            permissions: "*",
        }],
    },
    // HTTP-node routes stay open (that is the point of deployed endpoints); the
    // editor and admin API are what adminAuth protects.
    functionGlobalContext: {},
    logging: {
        console: { level: "info", metrics: false, audit: false },
    },
    editorTheme: {
        projects: { enabled: false },
    },
};
