#!/usr/bin/env node
import { type Alert, errors } from "trafficops-types";

import { Client } from "./index.js";

/**
 * Small convenience function that checks if a response object has any error
 * Alerts, and returns a value that can be added to the return code to
 * effectively count errors encountered.
 *
 * @param chkMe The object containing the Alerts to check.
 * @returns `1` if there were errors in the `chkMe` Alerts, `0` otherwise.
 */
function checkAlerts(chkMe?: {alerts?: Array<Alert>} | null | undefined): 1 | 0 {
	return chkMe && chkMe.alerts && chkMe.alerts.length > 0 && errors(chkMe.alerts).length > 0 ? 1 : 0;
}
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
	const client = new Client("https://localhost:6443", {logAlerts: true, logger: console, raiseErrorAlerts: false});
	await client.login("admin", "twelve12");
	const about = await client.about();
	console.log("about:", about);
	const sysInf = await client.systemInfo();
	code += checkAlerts(sysInf);
	console.log("system/info:", sysInf);
	return code;
}

/**
 * Handles any errors thrown by `main`.
 *
 * @param e The thrown error.
 */
function handleErr(e: unknown): void {
	const msg = e instanceof Error ? e.message : String(e);
	console.error("client crashed:", msg);
	process.exit(255);
}

main().then(ec=>process.exit(ec)).catch(handleErr);
