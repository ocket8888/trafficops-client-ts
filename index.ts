import axios, { type AxiosResponseHeaders, type AxiosResponse } from "axios";
import { type Alert, AlertLevel, VERSION, type OAuthLoginRequest, type APIResponse, errors } from "trafficops-types";

import { about, systemInfo } from "./about.js";
import { APIError } from "./api.error.js";
/**
 * Loggers can be used by {@link Client} instances to log alerts. `error` will
 * be used for error-level alerts, `info` for info-level alerts, `log` for
 * success-level alerts (named "log" not "success" for compatibility with the
 * standard Console API), and `warn` for warning-level alerts.
 */
export interface Logger {
	error(...args: unknown[]): void | PromiseLike<void>;
	info(...args: unknown[]): void | PromiseLike<void>;
	log(...args: unknown[]): void | PromiseLike<void>;
	warn(...args: unknown[]): void | PromiseLike<void>;
}

/**
 * The client accepts several options to customize its behavior.
 */
type ClientOptions = {
	/**
	 * If `true`, the Client will log all incoming Alerts to its logger.
	 *
	 * @default false
	 */
	logAlerts: true;
	/**
	 * Specifies a logger for the client. It will use this to log Alerts from
	 * the Traffic Ops API if `logAlerts` was passed as `true`. In the event
	 * that the Client is configured to log Alerts but no logger was given (or
	 * it was `null`), the Client will attempt to use the global `console`
	 * object for logging.
	 *
	 * @default console
	 */
	logger?: Logger | null;
	/**
	 * If `true`, error-level Alerts received from Traffic Ops will be raised as
	 * {@link APIError}s.
	 */
	raiseErrorAlerts?: boolean;
} | {
	/**
	 * If `true`, the Client will log all incoming Alerts to its logger.
	 *
	 * @default false
	 */
	logAlerts?: false;
	/**
	 * Specifies a logger for the client. It will use this to log Alerts from
	 * the Traffic Ops API if `logAlerts` was passed as `true`. In the event
	 * that the Client is configured to log Alerts but no logger was given (or
	 * it was `null`), the Client will attempt to use the global `console`
	 * object for logging.
	 *
	 * @default null
	 */
	logger?: null;
	/**
	 * If `true`, error-level Alerts received from Traffic Ops will be raised as
	 * {@link APIError}s.
	 *
	 * @default true
	 */
	raiseErrorAlerts?: boolean;
};

/**
 * A Traffic Ops API client. Instances of this class have a method for every
 * operation one could want to perform using the Traffic Ops API. For details,
 * refer to the [official TO API documentation](https://traffic-control-cdn.readthedocs.io/en/latest/api/index.html).
 */
export class Client extends axios.Axios {
	public readonly version = VERSION;

	public readonly baseURL: URL;
	private readonly logAlerts: boolean;
	private readonly raiseErrorAlerts: boolean;

	private cookie: string | null = null;
	private readonly logger: Logger | null = null;

	/**
	 * Tells whether or not the client is authenticated with Traffic Ops.
	 * This just tells you that the client has authenticated; the credentials
	 * could have expired since then.
	 */
	public get loggedIn(): boolean {
		return this.cookie !== null;
	}

	/**
	 * The mojolicious cookie that can be used to authenticate with Traffic Ops.
	 * Accessing this throws an error if `loggedIn` is `false`.
	 */
	protected get authCookie(): string {
		if (this.cookie === null) {
			throw new APIError("not authenticated");
		}
		return this.cookie;
	}

	constructor(trafficOpsURL: URL | string, options: ClientOptions = {logAlerts: false, raiseErrorAlerts: true}) {
		super({transformRequest: [(data: object): string => JSON.stringify(data)], transformResponse: [(x: string): object =>JSON.parse(x)]});
		this.logAlerts = options.logAlerts ?? false;
		this.raiseErrorAlerts = options.raiseErrorAlerts ?? true;
		this.logger = options.logger ?? null;
		if (this.logAlerts && !this.logger) {
			this.logger = console;
		}
		if (trafficOpsURL instanceof URL) {
			this.baseURL = trafficOpsURL;
		} else {
			try {
				this.baseURL = new URL(trafficOpsURL);
			} catch (e) {
				const msg = e instanceof Error ? e.message : String(e);
				throw new Error(`invalid Traffic Ops URL: ${msg}`);
			}
		}
		if (this.baseURL.pathname !== "/") {
			throw new Error(`the Traffic Ops URL must be only the server's root URL; path specified: '${this.baseURL.pathname}'`);
		}
	}

	/**
	 * Logs an error.
	 *
	 * @param args Arguments to pass to the Client's Logger.
	 */
	private logError(...args: unknown[]): void {
		if (!this.logAlerts || !this.logger) {
			return;
		}
		this.logger.error(...args);
	}

	/**
	 * Logs an informational message.
	 *
	 * @param args Arguments to pass to the Client's Logger.
	 */
	private logInfo(...args: unknown[]): void {
		if (!this.logAlerts || !this.logger) {
			return;
		}
		this.logger.info(...args);
	}

	/**
	 * Logs a success message.
	 *
	 * @param args Arguments to pass to the Client's Logger.
	 */
	private logSuccess(...args: unknown[]): void {
		if (!this.logAlerts || !this.logger) {
			return;
		}
		this.logger.log(...args);
	}

	/**
	 * Logs a warning.
	 *
	 * @param args Arguments to pass to the Client's Logger.
	 */
	private logWarning(...args: unknown[]): void {
		if (!this.logAlerts || !this.logger) {
			return;
		}
		this.logger.warn(...args);
	}

	/**
	 * Makes a GET request to the Traffic Ops API.
	 *
	 * @param path The path to request - do **not** include `/api` or the API
	 * version, this method will handle that for you.
	 * @returns The server's response. Note that error responses are returned,
	 * not thrown, but connection and transport layer errors (e.g. TCP dial
	 * failure) are thrown.
	 */
	public async apiGet<T>(path: string): Promise<AxiosResponse<T>> {
		const url = this.makeURL(path);
		// eslint-disable-next-line @typescript-eslint/naming-convention
		return this.request<T>({headers: {"Cookie": this.authCookie}, method: "GET", url});
	}

	/**
	 * Makes a POST request to the Traffic Ops API.
	 *
	 * @param path The path to request - do **not** include `/api` or the API
	 * version, this method will handle that for you.
	 * @param data The request body to be sent.
	 * @returns The server's response. Note that error responses are returned,
	 * not thrown, but connection and transport layer errors (e.g. TCP dial
	 * failure) are thrown.
	 */
	 public async apiPost<T>(path: string, data: object): Promise<AxiosResponse<T>> {
		const url = this.makeURL(path);
		// eslint-disable-next-line @typescript-eslint/naming-convention
		return this.request<T>({data, headers: {"Cookie": this.authCookie}, method: "POST", url});
	}

	/**
	 * Makes a DELETE request to the Traffic Ops API.
	 *
	 * @param path The path to request - do **not** include `/api` or the API
	 * version, this method will handle that for you.
	 * @returns The server's response. Note that error responses are returned,
	 * not thrown, but connection and transport layer errors (e.g. TCP dial
	 * failure) are thrown.
	 */
	 public async apiDelete<T>(path: string): Promise<AxiosResponse<T>> {
		const url = this.makeURL(path);
		// eslint-disable-next-line @typescript-eslint/naming-convention
		return this.request<T>({headers: {"Cookie": this.authCookie}, method: "DELETE", url});
	}

	/**
	 * Makes a PUT request to the Traffic Ops API.
	 *
	 * @param path The path to request - do **not** include `/api` or the API
	 * version, this method will handle that for you.
	 * @param data The request body to be sent.
	 * @returns The server's response. Note that error responses are returned,
	 * not thrown, but connection and transport layer errors (e.g. TCP dial
	 * failure) are thrown.
	 */
	 public async apiPut<T>(path: string, data: object): Promise<AxiosResponse<T>> {
		const url = this.makeURL(path);
		// eslint-disable-next-line @typescript-eslint/naming-convention
		return this.request<T>({data, headers: {"Cookie": this.authCookie}, method: "PUT", url});
	}

	/**
	 * Creates a full request URL from the given request path and the client's
	 * `baseURL` and `version`.
	 *
	 * @example
	 * const url = (new Client("https://trafficops.infra.ciab.test/")).makeURL("/servers");
	 * console.log(url);
	 * // Output: https://trafficops.infra.ciab.test/api/3.1/servers
	 * // (assuming this client uses API version 3.1)
	 *
	 * @param path The API version-independent path to the requested API
	 * endpoint e.g. `/servers` as opposed to `/api/0.0/servers`.
	 * @returns A full request URL.
	 */
	private makeURL(path: string): string {
		path = path.replace(/^\/+/, "");
		return `${this.baseURL}api/${this.version}/${path}`;
	}

	/**
	 * Handles Alerts returned by Traffic Ops. This will log them if the client
	 * is set to log Alerts, and will throw an {@link APIError} if the client is
	 * is configured to throw error-level Alerts as errors and any error-level
	 * alerts are found.
	 *
	 * @param resp The raw Axios response.
	 * @throws {APIError} if the client is configured to throw error-level
	 * Alerts as errors and `as` contains at least one error-level alert.
	 */
	protected handleAlerts(resp: AxiosResponse<{alerts?: Array<Alert>}>): void;
	/**
	 * Handles Alerts returned by Traffic Ops. This will log them if the client
	 * is set to log Alerts, and will throw an {@link APIError} if the client is
	 * is configured to throw error-level Alerts as errors and any error-level
	 * alerts are found.
	 *
	 * @param as The returned Alerts.
	 * @param code Optionally, the HTTP response status code.
	 * @param headers Optionally, the response HTTP headers.
	 * @throws {APIError} if the client is configured to throw error-level
	 * Alerts as errors and `as` contains at least one error-level alert.
	 */
	protected handleAlerts(as: Array<Alert> | undefined, code?: number, headers?: AxiosResponseHeaders): void;
	/**
	 * Handles Alerts returned by Traffic Ops. This will log them if the client
	 * is set to log Alerts, and will throw an {@link APIError} if the client is
	 * is configured to throw error-level Alerts as errors and any error-level
	 * alerts are found.
	 *
	 * @param as The returned Alerts.
	 * @param code Optionally, the HTTP response status code.
	 * @param headers Optionally, the response HTTP headers.
	 * @throws {APIError} if the client is configured to throw error-level
	 * Alerts as errors and `as` contains at least one error-level alert.
	 */
	protected handleAlerts(as: Array<Alert> | AxiosResponse<{alerts?: Array<Alert>}> | undefined, code?: number, headers?: AxiosResponseHeaders): void {
		let alerts;
		let respCode;
		let hdrs;
		if (!as) {
			return;
		}
		if (Array.isArray(as)) {
			if (as.length < 1) {
				return;
			}
			alerts = as;
			respCode = code;
			hdrs = headers;
		} else if (as.data.alerts && as.data.alerts.length > 0) {
			alerts = as.data.alerts;
			respCode = as.status;
			hdrs = as.headers;
		} else {
			return;
		}

		if (this.logAlerts) {
			for (const a of alerts) {
				switch (a.level) {
					case AlertLevel.ERROR:
						this.logError(a.text);
						break;
					case AlertLevel.WARNING:
						this.logWarning(a.text);
						break;
					case AlertLevel.INFO:
						this.logInfo(a.text);
						break;
					default:
						this.logSuccess(a.text);
				}
			}
		}
		if (this.raiseErrorAlerts && errors(alerts).length > 0) {
			throw new APIError(alerts, respCode, hdrs);
		}
	}

	/**
	 * Log in using an authentication token generated by Traffic Ops (typically
	 * for first-time account setup).
	 *
	 * @param token The authentication token.
	 */
	public async login(token: string): Promise<void>;
	/**
	 * Log in using oauth.
	 *
	 * @param oauth The information used to authenticate with Traffic Ops
	 * through OAuth.
	 */
	public async login(oauth: OAuthLoginRequest): Promise<void>;
	/**
	 * Log in using a traditional username/password pair.
	 *
	 * @param username The username of the user as whom to authenticate.
	 * @param password The password of the user identified by `username`.
	 */
	public async login(username: string, password: string): Promise<void>;
	/**
	 * Log in to the Traffic Ops API. Supports all three authentication methods
	 * provided by Traffic Ops.
	 *
	 * @param tou Either the token for token logins, OAuth connection and
	 * authentication information, or a username for username/password log ins.
	 * If this is a string, it's treated as a token unless `password` is given.
	 * @param password The password to use when authenticating using a
	 * username/password pair. This is ignored if `tou` is determined to be
	 * OAuth information.
	 */
	public async login(tou: string | OAuthLoginRequest, password?: string): Promise<void> {
		let resp;
		const opts = {transformRequest: [(data: object): string =>JSON.stringify(data)]};
		if (typeof tou === "string") {
			if (password !== undefined) {
				resp = await this.post<APIResponse<undefined>>(this.makeURL("user/login"), {p: password, u: tou}, opts);
			} else {
				resp = await this.post<APIResponse<undefined>>(this.makeURL("user/login/token"), {t: tou});
			}
		} else {
			resp = await this.post<APIResponse<undefined>>(this.makeURL("user/login/oauth"), tou);
		}
		this.handleAlerts(resp.data.alerts, resp.status, resp.headers);
		const cookie = (resp.headers["set-cookie"] ?? []).find(c=>c.startsWith("mojolicious="));
		if (!cookie) {
			throw new APIError("Traffic Ops did not set the mojolicious authentication cookie in login response", resp.status, resp.headers);
		}
		this.cookie = cookie;
	}

	public about = about;
	public systemInfo = systemInfo;
}