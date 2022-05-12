#!/usr/bin/env node
import { errors } from "trafficops-types";

import { Client } from "./index.js";

/**
 * The main function.
 *
 * @todo Finish this. Right now, it just runs through all the methods and prints
 * everything.
 *
 * @returns An exit code for the script.
 */
async function main(): Promise<number> {
	let code = 0;
	try {
		const client = new Client("https://localhost:6443", {logAlerts: true, raiseErrorAlerts: false});
		await client.login("admin", "twelve12");
		const about = await client.about();
		console.log("about:", about);
		const sysInf = await client.systemInfo();
		if (errors(sysInf.alerts ?? []).length > 0) {
			code = 1;
		}
		console.log("system/info:", sysInf);
	} catch (err) {
		console.error("API usage failure:", err);
		code = 2;
	}
	return code;
}

main().then(process.exit);
