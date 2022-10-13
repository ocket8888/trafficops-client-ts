/**
 * @license Apache-2.0
 *
 * Copyright 2022 ocket8888
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { existsSync, readFileSync } from "fs";
import { env } from "process";

import { ArgumentParser, ArgumentDefaultsHelpFormatter } from "argparse";
import type { AxiosResponse } from "axios";

import { Client } from "../index.js";
import {default as pkg} from "../package.json" assert {type: "json"};

/**
 * Configuration for output formatting.
 */
interface OutputConfig {
	/** Whether to pretty-print the output. */
	pretty: boolean;
	/** Whether to print request headers. */
	requestHeaders: boolean;
	/** Whether to print the request body. */
	requestPayload: boolean;
	/** Whether to print the response headers. */
	responseHeaders: boolean;
}

/**
 * Configuration for the program run.
 */
interface Config {
	/** The version of the API being requested. */
	apiVersion: APIVersion;
	/** A TO client handle. */
	client: Client;
	/** Data to pass in the request body. */
	data: string | undefined;
	/** Settings for the program's output. */
	output: OutputConfig;
	/** The requested path. */
	path: string;
	/** Name of the program being run. */
	progName: string;
	/**
	 * If `true`, `path` is absolute. If `false`, it is relative to
	 * `/api/${apiVersion}`
	 */
	rawPath: boolean;
	/** The URL of the Traffic Ops server against which to make requests. */
	toURL: URL;
}

/**
 * This class is used to typecheck the `-a`/`--api-version` command line
 * option-argument, ensuring it's a valid API version.
 */
class APIVersion {
	public major: number;
	public minor: number;

	constructor(value: string) {
		const err = (): never => {
			throw new Error(`invalid API version '${value}'`);
		};
		const parts = value.split(".");
		if (parts.length !== 2) {
			err();
		}
		const [majorStr, minorStr] = parts;
		this.major = Number(majorStr);
		if (Number.isNaN(this.major) || !Number.isInteger(this.major)) {
			err();
		}
		this.minor = Number(minorStr);
		if (Number.isNaN(this.minor) || !Number.isInteger(this.minor)) {
			err();
		}
	}

	/**
	 * Provides string coercion for APIVersions.
	 * @returns A string representation of the API version.
	 */
	public toString(): string {
		return `${this.major}.${this.minor}`;
	}
}

/**
 * Prints the passed response object in a format consistent with the other
 * parameters.
 *
 * @param r The {@link AxiosResponse} response object being printed.
 * @param conf Configuration for output formatting.
 * @param data The data sent in the request, if any.
 * @param indent An optional number of spaces for pretty-printing indentation
 * (default is the tab character).
 */
function output(r: AxiosResponse, conf: OutputConfig, data: string | undefined, indent: number | "\t" = "\t"): void {
	const {pretty, requestHeaders, responseHeaders, requestPayload} = conf;
	const req = r.request;
	if (requestHeaders) {
		if (requestPayload && data) {
			let result: string = data;
			if (pretty) {
				try {
					result = JSON.stringify(JSON.parse(result), undefined, indent);
				} catch {
					result = data;
				}
			}
			console.log(`${req._header}${result}`);
			console.log();
		} else {
			console.log(req._header);
		}
	} else if (requestPayload && data) {
		let result: string = data;
		if (pretty) {
			try {
				result = JSON.stringify(JSON.parse(result), undefined, indent);
			} catch {
				result = data;
			}
		}
		console.log(result);
		console.log();
	}

	if (responseHeaders) {
		// TODO: get the actual HTTP version somehow.
		console.log("HTTP/1.1", r.status, r.statusText);
		for (const [h, v] of Object.entries(r.headers)) {
			console.log(`${h}: ${v}`);
		}
		console.log();
	}

	let resp = r.data;
	if (pretty) {
		try {
			resp = JSON.stringify(JSON.parse(r.data), undefined, indent);
		} catch {
			resp = r.data;
		}
	}
	console.log(resp);
}

/**
 * Parses command line arguments.
 *
 * @param program The name of the program being run.
 * @returns A configuration for the program run based on command-line arguments
 * and variables from the execution environment.
 */
async function parseArgs(program: string): Promise<Config> {
	const parser = new ArgumentParser({
		description: "A helper program for interfacing with the Traffic Ops API",
		epilog: "Typically, one will want to connect and authenticate by defining "+
		"the 'TO_URL', 'TO_USER' and 'TO_PASSWORD' environment variables "+
		"rather than (respectively) the '--to-url', '--to-user' and "+
		"'--to-password' command-line flags. Those flags are only "+
		"required when said environment variables are not defined.\n"+
		"%(prog)s will exit with a success provided a response was "+
		"received and the status code of said response was less than 400. "+
		"The exit code will be 1 if command line arguments cannot be "+
		"parsed or authentication with the Traffic Ops server fails. "+
		"In the event of some unknown error occurring when waiting for a "+
		"response, the exit code will be 2. If the server responds with "+
		"a status code indicating a client or server error, that status "+
		"code will be used as the exit code.",
		// beyond my control
		// eslint-disable-next-line @typescript-eslint/naming-convention
		formatter_class: ArgumentDefaultsHelpFormatter,
		prog: program,
	});
	parser.add_argument(
		"--to-url",
		{
			help: "The fully qualified domain name of the Traffic Ops server. "+
			"Overrides '$TO_URL'. The format for both the environment "+
			"variable and the flag is '[scheme]hostname[:port]'. That is, "+
			"ports should be specified here, and they need not start with"+
			"'http://' or 'https://'. HTTPS is the assumed protocol "+
			"unless the scheme _is_ provided and is 'http://'.",
			type: "string",
		}
	);
	parser.add_argument(
		"--to-user",
		{
			help: "The username to use when connecting to Traffic Ops. Overrides '$TO_USER'",
			type: "string",
		}
	);
	parser.add_argument(
		"--to-password",
		{
			help: "The password to use when authenticating to Traffic Ops. Overrides '$TO_PASSWORD'",
			type: "string",
		}
	);
	parser.add_argument(
		"-k",
		"--insecure",
		{
			action: "store_true",
			help: "Do not verify SSL certificates"
		}
	);
	parser.add_argument(
		"-f",
		"--full",
		{
			action: "store_true",
			help: "Also output HTTP request/response lines and headers, and request payload. This is equivalent to using "+
			"'--request-headers', '--response-headers' and '--request-payload' at the same time.",
		}
	);
	parser.add_argument(
		"--request-headers",
		{
			action: "store_true",
			help: "Output request method line and headers",
		}
	);
	parser.add_argument(
		"--response-headers",
		{
			action: "store_true",
			help: "Output response status line and headers",
		}
	);
	parser.add_argument(
		"--request-payload",
		{
			action: "store_true",
			help: "Output request payload (will try to pretty-print if '--pretty' is given)",
		}
	);
	parser.add_argument(
		"-r",
		"--raw-path",
		{
			action: "store_true",
			help: "Request exactly PATH; it won't be prefaced with '/api/{{api-version}}'",
		}
	);
	parser.add_argument(
		"-a",
		"--api-version",
		{
			default: new APIVersion("3.1"),
			help: "Specify the API version to request against",
			type: APIVersion
		}
	);
	parser.add_argument(
		"-p",
		"--pretty",
		{
			action: "store_true",
			help: "Pretty-print payloads as JSON. Note that this may make Content-Type headers 'wrong', in general.",
		}
	);
	parser.add_argument(
		"-v",
		"--version",
		{
			action: "version",
			help: "Print version information and exit",
			version: `%(prog)s v${pkg.version}-ts`
		}
	);
	parser.add_argument("PATH", {help: "The path to the resource being request - omit '/api/2.x'"});
	parser.add_argument(
		"DATA",
		{
			help: "An optional data string to pass with the request. If this is a filename, the contents of the file will be sent instead.",
			nargs: "?"
		}
	);

	const args = parser.parse_args();
	let toHost: string = args.to_url ?? env.TO_URL;
	if (!toHost) {
		throw new Error("Traffic Ops hostname not set! Set the TO_URL environment variable or use '--to-url'");
	}
	toHost = toHost.toLowerCase();
	if (!toHost.startsWith("https://") && !toHost.startsWith("http://")) {
		toHost = `https://${toHost}`;
	}
	let parsedHost;
	try {
		parsedHost = new URL(toHost);
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		throw new Error(`invalid Traffic Ops URL '${toHost}': ${msg}`);
	}

	const client = new Client(parsedHost);
	let data: string | undefined = args.DATA;
	if (data && existsSync(data)) {
		try {
			data = readFileSync(data, "utf-8");
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e);
			throw new Error(`failed to read input file '${data}': ${msg}`);
		}
	}

	const toUser: string = args.to_user ?? env.TO_USER;
	if (!toUser) {
		throw new Error("Traffic Ops user not set! Set the TO_USER environment variable or use '--to-user'.");
	}
	const toPasswd: string = args.to_password ?? env.TO_PASSWORD;
	if (!toPasswd) {
		throw new Error("Traffic Ops password not set! Set the TO_PASSWORD environment variable or use '--to-password'.");
	}

	if (args.insecure) {
		env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
	}

	await client.login(toUser, toPasswd);

	return {
		apiVersion: args.api_version,
		client,
		data,
		output: {
			pretty: args.pretty,
			requestHeaders: args.request_headers || args.full,
			requestPayload: args.request_payload || args.full,
			responseHeaders: args.response_headers || args.full,
		},
		path: args.PATH,
		progName: program,
		rawPath: args.raw_path,
		toURL: parsedHost
	};
}

/**
 * All of the scripts wind up calling this function to handle their common
 * functionality.
 *
 * @param method The name of the request method to use (case-sensitive).
 * @returns The program's exit code.
 */
export async function request(method: "get" | "put" | "post" | "delete" | "patch" | "options" | "head"): Promise<number> {
	let conf;
	try {
		conf = await parseArgs(`to${method}`);
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		console.error(msg);
		return 1;
	}

	let path = `/${conf.path.trim().replace(/^\/|\/$/g, "")}`;
	if (!conf.rawPath) {
		path = `/api/${conf.apiVersion}${path}`;
	}
	const url = conf.toURL;
	url.pathname = path;
	const headers = conf.client.headers;
	if (conf.data) {
		try {
			JSON.parse(conf.data);
			headers["Content-Type"] = "application/json";
		} catch {
			headers["Content-Type"] = "text/plain; charset=utf-8";
		}
	}
	const resp = await conf.client.request({data: conf.data, headers, method, url: url.toString()});
	output(resp, conf.output, conf.data);
	if (resp.status > 399) {
		return Math.floor(resp.status / 100);
	}
	return 0;
}

/**
 * Handles errors thrown by entrypoint functions.
 *
 * @param e The thrown error.
 */
export function handleErr(e: unknown): void {
	const msg = e instanceof Error ? e.message : String(e);
	console.error("client crashed:", msg);
	console.trace();
	process.exit(255);
}
