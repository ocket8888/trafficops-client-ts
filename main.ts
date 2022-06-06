#!/usr/bin/env node
import { type Alert, errors } from "trafficops-types";

import { Client } from "./index.js";

/**
 * Small convenience function that checks if a response object has any error
 * Alerts, and returns a value that can be added to the return code to
 * effectively count errors encountered.
 *
 * @param method The request method used.
 * @param endpoint The requested endpoint.
 * @param chkMe The object containing the Alerts to check.
 * @returns `1` if there were errors in the `chkMe` Alerts, `0` otherwise.
 */
function checkAlerts(method: string, endpoint: string, chkMe?: {alerts?: Array<Alert>} | null | undefined): 1 | 0 {
	console.log(method, `/${endpoint.replace(/^\/+/, "")}`);
	console.log(chkMe);
	console.log();
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
	console.log("GET /ping");
	console.log((await client.ping()).data);
	console.log();
	await client.login("admin", "twelve12");
	code += checkAlerts("GET", "about", await client.about() as {});
	code += checkAlerts("GET", "system/info", await client.systemInfo());

	let acmeAccount = {
		email: "something@mail.com",
		privateKey: "privkey",
		provider: "provider",
		uri: "https://uri.com/"
	};
	const newAcct = await client.createACMEAccount(acmeAccount);
	code += checkAlerts("POST", "acme_accounts", newAcct);
	code += checkAlerts("GET", "acme_accounts", await client.getACMEAccounts());
	acmeAccount.privateKey = "new privkey";
	code += checkAlerts("PUT", "acme_accounts", await client.updateACMEAccount(acmeAccount));
	code += checkAlerts("DELETE", "acme_accounts/{{provider}}/{{email}}", await client.deleteACMEAccount(newAcct.response));

	code += checkAlerts("GET", "api_capabilities", await client.getAPICapabilities());

	const newASN = await client.createASN({asn: 1, cachegroupId: 1});
	code += checkAlerts("POST", "asns", newASN);
	code += checkAlerts("GET", "asns", await client.getASNs());
	newASN.response.asn = 2;
	code += checkAlerts("PUT", `asns/${newASN.response.id}`, await client.updateASN(newASN.response));
	code += checkAlerts("DELETE", `asns/${newASN.response.id}`, await client.deleteASN(newASN.response.id));

	const newType = await client.createType({description: "foo", name: "foo", useInTable: "server"});
	code += checkAlerts("POST", "types", newType);
	code += checkAlerts("GET", "types", await client.getTypes());
	code += checkAlerts("DELETE", "types/{{ID}}", await client.deleteType(newType.response));

	code += checkAlerts("POST", "cachegroupparameters", await client.assignParameterToCacheGroup(1, 1));
	code += checkAlerts("GET", "cachegroupparameters", await client.getCacheGroupParameters());
	code += checkAlerts("DELETE", "cachegroupparameters/{{Cache Group ID}}/{{Parameter ID}}", await client.removeParameterFromCacheGroup(1, 1));

	code += checkAlerts("GET", "cache_stats", await client.cacheStats("ALL", "bandwidth", new Date((new Date()).setDate(-1)), new Date()));
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
