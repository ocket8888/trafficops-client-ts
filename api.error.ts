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
import type { AxiosResponse, AxiosResponseHeaders } from "axios";
import { type Alert, type AlertLevel, type APIResponse, errors } from "trafficops-types";

/**
 * A ClientError is an error that results from improper use of the Client,
 * rather than any issue actually communicating with the API.
 */
export class ClientError extends Error {

	/**
	 * Works just like the base `Error` class, just give it a message.
	 *
	 * @example
	 * console.log((new ClientError("my message")).message);
	 * // Output: my message
	 *
	 * @param message The error message.
	 */
	constructor(message: string);
	/**
	 * Formats a message about missing required parameters in a method call.
	 *
	 * @example
	 * console.log((new ClientError("getFoos", "barID", "testquest")).message)
	 * // Output:
	 * // invalid call signature to getFoos - 'barID', and 'testquest' must be
	 * // given
	 *
	 * @param methodName
	 * @param missingParams
	 */
	constructor(methodName: string, ...missingParams: [string, ...string[]]);
	constructor(methodNameOrMsg: string, ...missingParams: Array<string>) {
		let msg;
		if (missingParams.length > 1) {
			msg = `invalid call signature to ${methodNameOrMsg} - `;
			msg += missingParams.slice(0, -2).map(p=>`'${p}'`).join(", ");
			msg += `, and '${missingParams[missingParams.length-1]} must be given`;
		} else if (missingParams.length > 0) {
			msg = `invalid call signature to ${methodNameOrMsg} - '${missingParams[0]}' must be given`;
		} else {
			msg = methodNameOrMsg;
		}
		super(msg);
	}
}

/**
 * A custom Error class that stores some information about the HTTP response
 * that produced it.
 */
export class APIError extends Error {

	/**
	 * The HTTP response status code - this will be `0` if it wasn't given in
	 * the constructor.
	 */
	public readonly responseCode: number;

	/**
	 * The HTTP headers returned in the Traffic Ops response.
	 */
	public readonly headers: AxiosResponseHeaders;

	/**
	 * Any and all Alerts returned by the Traffic Ops API.
	 */
	public readonly alerts: Array<Alert>;

	constructor(message: string, responseCode?: number, headers?: AxiosResponseHeaders);
	constructor(alerts: Array<Alert> | (Alert & {level: AlertLevel.ERROR}), responseCode?: number, headers?: AxiosResponseHeaders);
	constructor(response: AxiosResponse<APIResponse<unknown>>);
	constructor(
		mar: string | Array<Alert> | (Alert & {level: AlertLevel.ERROR}) | AxiosResponse<APIResponse<unknown>>,
		responseCode?: number,
		headers?: AxiosResponseHeaders
	) {
		let msg;
		let code;
		let hdrs;
		let alerts;
		if (typeof mar === "string") {
			msg = mar;
			code = responseCode ?? 0;
			hdrs = headers ?? {};
			alerts = new Array<Alert>();
		} else if (mar instanceof Array) {
			const errs = errors(mar);
			if (errs.length > 0) {
				msg = errs.join("; ");
			} else {
				msg = "error not reported in alerts";
			}
			alerts = mar;
			code = responseCode ?? 0;
			hdrs = headers ?? {};
		} else if (((x): x is Alert & {level: AlertLevel.ERROR} => Object.prototype.hasOwnProperty.call(x, "level"))(mar)) {
			msg = mar.text;
			alerts = [mar];
			code = responseCode ?? 0;
			hdrs = headers ?? {};
		} else if (mar.data && mar.data.alerts) {
			const errs = errors(mar.data.alerts);
			if (errs.length > 0) {
				msg = errs.join("; ");
			} else {
				msg = mar.status > 299 ? mar.statusText : "error not reported in alerts";
			}
			code = mar.status;
			alerts = mar.data?.alerts ?? [];
			hdrs = mar.headers;
		} else {
			msg = mar.status > 299 ? mar.statusText : "error not reported in alerts";
			code = mar.status;
			hdrs = mar.headers;
			alerts = new Array<Alert>();
		}
		super(msg);
		this.responseCode = code;
		this.headers = hdrs;
		this.alerts = alerts;
	}
}
