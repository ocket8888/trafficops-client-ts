import type { AxiosResponse, AxiosResponseHeaders } from "axios";
import { type Alert, type AlertLevel, type APIResponse, errors } from "trafficops-types";

/**
 * A custom Error class that stores some information about the HTTP response
 * that produced it.
 */
export class APIError extends Error {

	/**
	 * The HTTP response status code - this will be `0` if it wasn't given in the constructor.
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
	constructor(mar: string | Array<Alert> | (Alert & {level: AlertLevel.ERROR}) | AxiosResponse<APIResponse<unknown>>, responseCode?: number, headers?: AxiosResponseHeaders) {
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
