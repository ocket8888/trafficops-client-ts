import axios, { type AxiosResponseHeaders, type AxiosResponse } from "axios";
import {
	type Alert,
	AlertLevel,
	VERSION,
	type OAuthLoginRequest,
	type APIResponse,
	errors,
	type PingResponse,
	type ResponseDeliveryServiceRequest
} from "trafficops-types";

import { about, systemInfo } from "./about.js";
import { createACMEAccount, deleteACMEAccount, getACMEAccounts, updateACMEAccount } from "./acme_accounts.js";
import { APIError, ClientError } from "./api.error.js";
import { getAPICapabilities, getCapabilities } from "./api_capabilities.js";
import { createASN, deleteASN, getASNs, updateASN } from "./asn.js";
import {
	assignCacheGroupToDS,
	assignParameterToCacheGroup,
	createCacheGroup,
	deleteCacheGroup,
	dequeueCacheGroupUpdates,
	getCacheGroupParameters,
	getCacheGroups,
	queueCacheGroupUpdates,
	removeParameterFromCacheGroup,
	updateCacheGroup
} from "./cache_group.js";
import {
	createCDN,
	deleteCDN,
	dequeueCDNUpdates,
	getCDNDomains,
	getCDNs,
	getMonitoringConfiguration,
	getSnapshot,
	getSnapshotState,
	queueCDNUpdates,
	takeSnapshot,
	updateCDN
} from "./cdn.js";
import { createCoordinate, deleteCoordinate, getCoordinates, updateCoordinate } from "./coordinate.js";
import { dbdump } from "./dbdump.js";
import {
	addCapabilityRequirementToDeliveryService,
	addDeliveryServiceRoutingExpression,
	assignServersToDeliveryService,
	createDeliveryService,
	deleteDeliveryService,
	getAllDeliveryServiceServerAssignments,
	getDeliveryServiceEligibleServers,
	getDeliveryServiceRoutingExpressions,
	getDeliveryServices,
	getDeliveryServiceServers,
	getDeliveryServicesRequiredCapabilities,
	removeCapabilityRequirementFromDeliveryService,
	removeDeliveryServiceRoutingExpression,
	removeServerFromDeliveryService,
	safeUpdateDeliveryService,
	updateDeliveryService,
	updateDeliveryServiceRoutingExpression
} from "./delivery_service.js";
import {
	assignDeliveryServiceRequest,
	changeDeliveryServiceRequestStatus,
	createDeliveryServiceRequest,
	createDeliveryServiceRequestComment,
	deleteDeliveryServiceRequest,
	deleteDeliveryServiceRequestComment,
	editDeliveryServiceRequestComment,
	getDeliveryServiceRequestComments,
	getDeliveryServiceRequests,
	sendDeliveryServicesRequest,
	updateDeliveryServiceRequest
} from "./delivery_service_request.js";
import { deleteCDNDNSSECKeys, generateCDNDNSSECKeys, generateCDNKSK, refreshAllDNSSECKeys } from "./dnssec.js";
import {
	assignCDNFederationToUsers,
	assignDeliveryServicesToCDNFederation,
	createCDNFederation,
	createFederationResolver,
	createUserDeliveryServiceFederationResolverMappings,
	deleteAllUserDeliveryServiceFederationResolverMappings,
	deleteCDNFederation,
	deleteFederationResolver,
	getAllDeliveryServiceFederationResolverMappings,
	getCDNFederations,
	getDeliveryServicesAssignedToCDNFederation,
	getFederationResolvers,
	getUserDeliveryServiceFederationResolverMappings,
	getUsersAssignedToCDNFederation,
	removeDeliveryServiceFromCDNFederation,
	removeUserFromCDNFederation,
	replaceAllUserDeliveryServiceFederationResolverMappings,
	updateCDNFederation
} from "./federations.js";
import {
	createDivision,
	createPhysicalLocation,
	createRegion,
	deleteDivision,
	deletePhysicalLocation,
	deleteRegion,
	getDivisions,
	getPhysicalLocations,
	getRegions,
	updateDivision,
	updatePhysicalLocation,
	updateRegion
} from "./physical_location.js";
import {
	assignParametersToProfile,
	assignParametersToProfiles,
	assignParameterToProfile,
	assignProfilesToParameter,
	createParameter,
	createProfile,
	deleteParameter,
	deleteProfile,
	getParameters,
	getProfiles,
	removeParameterFromProfile,
	updateParameter,
	updateProfile
} from "./profile.js";
import { testConsistentHashingRegexp } from "./router.js";
import {
	addCapabilityToServer,
	createServer,
	createServerCapability,
	createStatus,
	deleteServer,
	deleteServerCapability,
	deleteStatus,
	getServerCapabilities,
	getServerCapabilityRelationships,
	getServers,
	getStatuses,
	removeCapabilityFromServer,
	updateServer,
	updateStatus
} from "./server.js";
import {
	addSSLKeysToDeliveryService,
	generateSSLKeysForDeliveryService,
	getCDNSSLKeys,
	getDeliveryServiceSSLKey,
	removeDeliveryServiceSSLKeys
} from "./ssl.js";
import {
	cacheStats,
	getCDNsCapacity,
	getCDNsHealth,
	getCDNsRoutingInfo,
	getCurrentStats,
	getDeliveryServiceCapacity,
	getDeliveryServiceHealth,
	getDeliveryServiceRoutingInfo,
	getDeliveryServiceStats
} from "./stats.js";
import { createType, deleteType, getTypes } from "./types.js";
import { copyURLKeys, generateURLKeys, getURISigningKeys, getURLKeys, removeURISigningKeys, setURISigningKeys } from "./url.sig.js";
import {
	createUser,
	createRole,
	createTenant,
	deleteRole,
	deleteTenant,
	getRoles,
	getTenants,
	getUsers,
	updateRole,
	updateTenant,
	updateUser,
	getCurrentUser
} from "./user.js";
import { getParser, type Parser, type Reviver, type DateKeySpec } from "./util.js";

const pkgInfo = await import("./package.json", {assert: {type: "json"}});

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
	/**
	 * Specify a user-agent string.
	 *
	 * @default `${pkgInfo.name}/${pkgInfo.version}`
	 */
	userAgent?: string;
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
	/**
	 * Specify a user-agent string.
	 *
	 * @default `${pkgInfo.name}/${pkgInfo.version}`
	 */
	userAgent?: string;
};

const DEFAULT_DATE_KEYS: readonly string[] = ["lastUpdated"];

/**
 * Query-string parameters.
 */
interface QueryParams {
	[param: string | symbol]: string | number | boolean | Date;
};

/* eslint-disable max-len */
/**
 * A Traffic Ops API client. Instances of this class have a method for every
 * operation one could want to perform using the Traffic Ops API. For details,
 * refer to the
 * [official TO API documentation](https://traffic-control-cdn.readthedocs.io/en/latest/api/index.html).
 */
export class Client extends axios.Axios {
/* eslint-enable max-len */
	private static readonly DEFAULT_UA = `${pkgInfo.name}/${pkgInfo.version}`;
	public readonly version = VERSION;

	public readonly baseURL: URL;
	private readonly logAlerts: boolean;
	protected readonly raiseErrorAlerts: boolean;
	private readonly uaString: string;

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
			throw new ClientError("not authenticated");
		}
		return this.cookie;
	}

	/**
	 * The headers that are passed in API requests.
	 */
	protected get headers(): Record<PropertyKey, string> {
		return {
			// This naming convention is standard practice for HTTP headers.
			/* eslint-disable @typescript-eslint/naming-convention*/
			Cookie: this.authCookie,
			"User-Agent": this.uaString
			/* eslint-enable @typescript-eslint/naming-convention*/
		};
	}

	constructor(trafficOpsURL: URL | string, options: ClientOptions = {logAlerts: false, raiseErrorAlerts: true}) {
		super({transformRequest: [(data: object): string => JSON.stringify(data)]});
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
				throw new ClientError(`invalid Traffic Ops URL: ${msg}`);
			}
		}
		if (this.baseURL.pathname !== "/") {
			throw new ClientError(`the Traffic Ops URL must be only the server's root URL; path specified: '${this.baseURL.pathname}'`);
		}
		this.uaString = options.userAgent || Client.DEFAULT_UA;
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
	 * Performs a request to the Traffic Ops API. This should only be called by
	 * the publicly accessible methods, not used directly.
	 *
	 * This updates the client's "mojolicious" cookie with the one Traffic Ops
	 * sends in responses automatically.
	 *
	 * @param path The path to request - should be passed directly as the full
	 * URL construction will be done here.
	 * @param method The request method to use - practically one of GET,
	 * OPTIONS, DELETE, PUT, or POST.
	 * @param params Any and all query string parameters that should be passed.
	 * @param data The request body, if any.
	 * @param dateKeys Keys in the response (no matter how deeply nested) that
	 * should be converted from their string native format to a Date.
	 * @returns  The server's response.
	 */
	private async apiRequest<T extends object = APIResponse<undefined>>(
		path: string,
		method: string,
		params?: QueryParams,
		data?: object,
		dateKeys?: DateKeySpec | Parser | Reviver
	): Promise<AxiosResponse<T>> {
		const url = this.makeURL(path);
		const transformResponse = [getParser(dateKeys ?? {dateString: DEFAULT_DATE_KEYS})];
		const response = await this.request<T>({data, headers: this.headers, method, params, transformResponse, url});
		const cookie = (response.headers["set-cookie"] ?? []).find(c=>c.startsWith("mojolicious="));
		if (cookie) {
			this.cookie = cookie;
		}
		this.handleAlerts(response);
		return response;
	}

	/**
	 * Makes a GET request to the Traffic Ops API.
	 *
	 * @param path The path to request - do **not** include `/api` or the API
	 * version, this method will handle that for you.
	 * @param params Any and all query string parameters to pass in the request.
	 * @param dateKeys Keys in the response (no matter how deeply nested) that
	 * should be converted from their string native format to a Date.
	 * @returns The server's response. Note that error responses are returned,
	 * not thrown, but connection and transport layer errors (e.g. TCP dial
	 * failure) are thrown.
	 */
	public async apiGet<T extends object = APIResponse<undefined>>(
		path: string,
		params?: QueryParams,
		dateKeys?: DateKeySpec | Parser | Reviver
	): Promise<AxiosResponse<T>> {
		return this.apiRequest(path, "GET", params, undefined, dateKeys);
	}

	/**
	 * Makes a POST request to the Traffic Ops API.
	 *
	 * @param path The path to request - do **not** include `/api` or the API
	 * version, this method will handle that for you.
	 * @param data The request body to be sent.
	 * @param params Any and all query string parameters to pass in the request.
	 * @param dateKeys Keys in the response (no matter how deeply nested) that
	 * should be converted from their string native format to a Date.
	 * @returns The server's response. Note that error responses are returned,
	 * not thrown, but connection and transport layer errors (e.g. TCP dial
	 * failure) are thrown.
	 */
	public async apiPost<T extends object = APIResponse<undefined>>(
		path: string,
		data?: object,
		params?: QueryParams,
		dateKeys?: DateKeySpec | Parser | Reviver
	): Promise<AxiosResponse<T>> {
		return this.apiRequest(path, "POST", params, data, dateKeys);
	}

	/**
	 * Makes a DELETE request to the Traffic Ops API.
	 *
	 * @param path The path to request - do **not** include `/api` or the API
	 * version, this method will handle that for you.
	 * @param params Any and all query string parameters to pass in the request.
	 * @param dateKeys Keys in the response (no matter how deeply nested) that
	 * should be converted from their string native format to a Date.
	 * @returns The server's response. Note that error responses are returned,
	 * not thrown, but connection and transport layer errors (e.g. TCP dial
	 * failure) are thrown.
	 */
	public async apiDelete<T extends object = APIResponse<undefined>>(
		path: string,
		params?: QueryParams,
		dateKeys?: DateKeySpec | Parser | Reviver
	): Promise<AxiosResponse<T>> {
		return this.apiRequest(path, "DELETE", params, dateKeys);
	}

	/**
	 * Makes a PUT request to the Traffic Ops API.
	 *
	 * @param path The path to request - do **not** include `/api` or the API
	 * version, this method will handle that for you.
	 * @param data The request body to be sent.
	 * @param params Any and all query string parameters to pass in the request.
	 * @param dateKeys Keys in the response (no matter how deeply nested) that
	 * should be converted from their string native format to a Date.
	 * @returns The server's response. Note that error responses are returned,
	 * not thrown, but connection and transport layer errors (e.g. TCP dial
	 * failure) are thrown.
	 */
	public async apiPut<T extends object = APIResponse<undefined>>(
		path: string,
		data?: object,
		params?: QueryParams,
		dateKeys?: DateKeySpec | Parser | Reviver
	): Promise<AxiosResponse<T>> {
		return this.apiRequest(path, "PUT", params, data, dateKeys);
	}

	/* eslint-disable max-len */
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
	protected makeURL(path: string): string {
	/* eslint-enable max-len */
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
	protected handleAlerts(
		as: Array<Alert> | AxiosResponse<{alerts?: Array<Alert>}> | undefined,
		code?: number,
		headers?: AxiosResponseHeaders
	): void {
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
			throw new APIError(
				"Traffic Ops did not set the mojolicious authentication cookie in login response",
				resp.status,
				resp.headers
			);
		}
		this.cookie = cookie;
	}

	/**
	 * "Pings" the Traffic Ops server. This can be used to check if the server
	 * is up and serving the API as intended before authenticating.
	 *
	 * Note that it is possible for Traffic Ops to return Alerts if the request
	 * was unsuccessful, but because this endpoint doesn't respect the standard
	 * format for API responses, {@link APIResponse} is powerless to represent
	 * it. Therefore, it's possible for `ping` to return something that isn't a
	 * valid response to the `/ping` endpoint of the Traffic Ops API. The client
	 * will **not** raise any Alerts as errors, nor log any returned Alerts
	 * regardless of its configuration because of this.
	 *
	 * @returns The server's response, and any Alerts it may have raised.
	 */
	public async ping(): Promise<AxiosResponse<PingResponse | APIResponse<undefined>>> {
		const url = this.makeURL("ping");
		const config = {
			// This is HTTP standard, should not be modified to fit this
			// project's naming conventions.
			// eslint-disable-next-line @typescript-eslint/naming-convention
			headers: {"User-Agent": this.uaString},
			method: "GET",
			transformResponse: [(x: string): object => JSON.parse(x)],
			url
		};
		return this.request<PingResponse | APIResponse<undefined>>(config);
	}

	// About/info routes
	public about = about;
	public systemInfo = systemInfo;

	// ACME Accounts
	public createACMEAccount = createACMEAccount;
	public deleteACMEAccount = deleteACMEAccount;
	public getACMEAccounts = getACMEAccounts;
	public updateACMEAccount = updateACMEAccount;

	// "API Capabilities"
	public getAPICapabilities = getAPICapabilities;
	public getCapabilities = getCapabilities;

	// ASNs
	public createASN = createASN;
	public deleteASN = deleteASN;
	public getASNs = getASNs;
	public updateASN = updateASN;

	// Cache Groups
	public getCacheGroups = getCacheGroups;
	public createCacheGroup = createCacheGroup;
	public updateCacheGroup = updateCacheGroup;
	public deleteCacheGroup = deleteCacheGroup;
	public getCacheGroupParameters = getCacheGroupParameters;
	public assignParameterToCacheGroup = assignParameterToCacheGroup;
	public removeParameterFromCacheGroup = removeParameterFromCacheGroup;
	public queueCacheGroupUpdates = queueCacheGroupUpdates;
	public dequeueCacheGroupUpdates = dequeueCacheGroupUpdates;

	// CDNs
	public getCDNs = getCDNs;
	public createCDN = createCDN;
	public deleteCDN = deleteCDN;
	public updateCDN = updateCDN;
	public queueCDNUpdates = queueCDNUpdates;
	public dequeueCDNUpdates = dequeueCDNUpdates;
	public getSnapshot = getSnapshot;
	public getSnapshotState = getSnapshotState;
	public getMonitoringConfiguration = getMonitoringConfiguration;
	public takeSnapshot = takeSnapshot;
	public getCDNDomains = getCDNDomains;

	// Coordinates
	public getCoordinates = getCoordinates;
	public createCoordinate = createCoordinate;
	public updateCoordinate = updateCoordinate;
	public deleteCoordinate = deleteCoordinate;

	// DB Dump
	public dbdump = dbdump;

	// Delivery Services
	public getDeliveryServices = getDeliveryServices;
	public createDeliveryService = createDeliveryService;
	public updateDeliveryService = updateDeliveryService;
	public deleteDeliveryService = deleteDeliveryService;
	public safeUpdateDeliveryService = safeUpdateDeliveryService;
	public getDeliveryServiceRoutingExpressions = getDeliveryServiceRoutingExpressions;
	public addDeliveryServiceRoutingExpression = addDeliveryServiceRoutingExpression;
	public updateDeliveryServiceRoutingExpression = updateDeliveryServiceRoutingExpression;
	public removeDeliveryServiceRoutingExpression = removeDeliveryServiceRoutingExpression;
	public getDeliveryServicesRequiredCapabilities = getDeliveryServicesRequiredCapabilities;
	public addCapabilityRequirementToDeliveryService = addCapabilityRequirementToDeliveryService;
	public removeCapabilityRequirementFromDeliveryService = removeCapabilityRequirementFromDeliveryService;

	// Delivery Service assignments
	public assignCacheGroupToDS = assignCacheGroupToDS;
	public getDeliveryServiceServers = getDeliveryServiceServers;
	public getDSServers = getDeliveryServiceServers;
	public getDeliveryServiceEligibleServers = getDeliveryServiceEligibleServers;
	public getDSEligibleServers = getDeliveryServiceEligibleServers;
	public getAllDeliveryServiceServerAssignments = getAllDeliveryServiceServerAssignments;
	public getAllDSServerAssignments = getAllDeliveryServiceServerAssignments;
	public assignServersToDeliveryService = assignServersToDeliveryService;
	public assignServersToDS = assignServersToDeliveryService;
	public removeServerFromDeliveryService = removeServerFromDeliveryService;
	public removeServerFromDS = removeServerFromDeliveryService;

	// Delivery Service Requests
	public getDeliveryServiceRequests = getDeliveryServiceRequests;
	public getDSRs = getDeliveryServiceRequests;
	public createDeliveryServiceRequest = createDeliveryServiceRequest;
	public createDSR = createDeliveryServiceRequest;
	public updateDeliveryServiceRequest = updateDeliveryServiceRequest;
	public updateDSR = updateDeliveryServiceRequest;
	public deleteDeliveryServiceRequest = deleteDeliveryServiceRequest;
	public deleteDSR = deleteDeliveryServiceRequest;
	public assignDeliveryServiceRequest = assignDeliveryServiceRequest;
	public assignDSR = assignDeliveryServiceRequest;
	/**
	 * Unassigns a Delivery Service Request (DSR) from any user to which it may
	 * be assigned.
	 *
	 * This is equivalent to calling {@link Client.assignDeliveryServiceRequest}
	 * with `null` or `undefined` as the assignee.
	 *
	 * @param dsr The DSR to be unassigned.
	 * @returns The server's response.
	 */
	public async unAssignDeliveryServiceRequest(
		dsr: number | ResponseDeliveryServiceRequest
	): Promise<APIResponse<ResponseDeliveryServiceRequest>> {
		return this.assignDeliveryServiceRequest(dsr, null);
	}
	/**
	 * Alias of {@link Client.unAssignDeliveryServiceRequest}.
	 *
	 * This is equivalent to calling {@link Client.assignDSR} with `null` or
	 * `undefined` as the assignee.
	 *
	 * @param dsr The DSR to be unassigned.
	 * @returns The server's response.
	 */
	public async unAssignDSR(dsr: number | ResponseDeliveryServiceRequest): Promise<APIResponse<ResponseDeliveryServiceRequest>> {
		return this.unAssignDeliveryServiceRequest(dsr);
	}
	public changeDeliveryServiceRequestStatus = changeDeliveryServiceRequestStatus;
	public changeDSRStatus = changeDeliveryServiceRequestStatus;
	public getDeliveryServiceRequestComments = getDeliveryServiceRequestComments;
	public getDSRComments = getDeliveryServiceRequestComments;
	public createDeliveryServiceRequestComment = createDeliveryServiceRequestComment;
	public createDSRComment = createDeliveryServiceRequestComment;
	public editDeliveryServiceRequestComment = editDeliveryServiceRequestComment;
	public editDSRComment = editDeliveryServiceRequestComment;
	public deleteDeliveryServiceRequestComment = deleteDeliveryServiceRequestComment;
	public deleteDSRComment = deleteDeliveryServiceRequestComment;
	public sendDeliveryServicesRequest = sendDeliveryServicesRequest;

	// DNSSEC
	public generateCDNKSK = generateCDNKSK;
	public generateCDNDNSSECKeys = generateCDNDNSSECKeys;
	public refreshAllDNSSECKeys = refreshAllDNSSECKeys;
	public deleteCDNDNSSECKeys = deleteCDNDNSSECKeys;

	// Federations
	public getCDNFederations = getCDNFederations;
	public createCDNFederation = createCDNFederation;
	public updateCDNFederation = updateCDNFederation;
	public deleteCDNFederation = deleteCDNFederation;
	public getFederationResolvers = getFederationResolvers;
	public createFederationResolver = createFederationResolver;
	public deleteFederationResolver = deleteFederationResolver;
	public getUserDeliveryServiceFederationResolverMappings = getUserDeliveryServiceFederationResolverMappings;
	public getUserDSFederationResolverMappings = getUserDeliveryServiceFederationResolverMappings;
	public createUserDeliveryServiceFederationResolverMappings = createUserDeliveryServiceFederationResolverMappings;
	public createUserDSFederationResolverMappings = createUserDeliveryServiceFederationResolverMappings;
	public deleteAllUserDeliveryServiceFederationResolverMappings = deleteAllUserDeliveryServiceFederationResolverMappings;
	public deleteAllUserDSFederationResolverMappings = deleteAllUserDeliveryServiceFederationResolverMappings;
	public replaceAllUserDeliveryServiceFederationResolverMappings = replaceAllUserDeliveryServiceFederationResolverMappings;
	public replaceAllUserDSFederationResolverMappings = replaceAllUserDeliveryServiceFederationResolverMappings;
	public assignUserToCDNFederation = assignCDNFederationToUsers;
	public getUsersAssignedToCDNFederation = getUsersAssignedToCDNFederation;
	public removeUserFromCDNFederation = removeUserFromCDNFederation;
	public assignDeliveryServiceToCDNFederation = assignDeliveryServicesToCDNFederation;
	public assignDSToCDNFederation = assignDeliveryServicesToCDNFederation;
	public getDeliveryServicesAssignedToCDNFederation = getDeliveryServicesAssignedToCDNFederation;
	public getDSesAssignedToCDNFederation = getDeliveryServicesAssignedToCDNFederation;
	public removeDeliveryServiceFromCDNFederation = removeDeliveryServiceFromCDNFederation;
	public removeDSFromCDNFederation = removeDeliveryServiceFromCDNFederation;
	public getAllDeliveryServiceFederationResolverMappings = getAllDeliveryServiceFederationResolverMappings;
	public getAllDSFederationResolverMappings = getAllDeliveryServiceFederationResolverMappings;

	// Physical Locations/Regions/Divisions
	public getDivisions = getDivisions;
	public createDivision = createDivision;
	public updateDivision = updateDivision;
	public deleteDivision = deleteDivision;
	public getRegions = getRegions;
	public createRegion = createRegion;
	public updateRegion = updateRegion;
	public deleteRegion = deleteRegion;
	public getPhysicalLocations = getPhysicalLocations;
	public createPhysicalLocation = createPhysicalLocation;
	public updatePhysicalLocation = updatePhysicalLocation;
	public deletePhysicalLocation = deletePhysicalLocation;

	// Profiles and Parameters
	public getParameters = getParameters;
	public createParameter = createParameter;
	public updateParameter = updateParameter;
	public deleteParameter = deleteParameter;
	public getProfiles = getProfiles;
	public createProfile = createProfile;
	public updateProfile = updateProfile;
	public deleteProfile = deleteProfile;
	public assignParametersToProfiles = assignParametersToProfiles;
	public assignParametersToProfile = assignParametersToProfile;
	public assignProfilesToParameter = assignProfilesToParameter;
	public assignParameterToProfile = assignParameterToProfile;
	public removeParameterFromProfile = removeParameterFromProfile;

	// Types
	public getTypes = getTypes;
	public createType = createType;
	public deleteType = deleteType;

	// Router
	public testConsistentHashingRegexp = testConsistentHashingRegexp;

	// Servers
	public getStatuses = getStatuses;
	public createStatus = createStatus;
	public updateStatus = updateStatus;
	public deleteStatus = deleteStatus;
	public getServers = getServers;
	public createServer = createServer;
	public updateServer = updateServer;
	public deleteServer = deleteServer;
	public createServerCapability = createServerCapability;
	public deleteServerCapability = deleteServerCapability;
	public getServerCapabilities = getServerCapabilities;
	public getServerCapabilityRelationships = getServerCapabilityRelationships;
	public addCapabilityToServer = addCapabilityToServer;
	public removeCapabilityFromServer = removeCapabilityFromServer;

	// SSL
	public getCDNSSLKeys = getCDNSSLKeys;
	public getDeliveryServiceSSLKey = getDeliveryServiceSSLKey;
	public addSSLKeysToDeliveryService = addSSLKeysToDeliveryService;
	public generateSSLKeysForDeliveryService = generateSSLKeysForDeliveryService;
	public removeDeliveryServiceSSLKeys = removeDeliveryServiceSSLKeys;

	// Stats
	public cacheStats = cacheStats;
	public getCDNsCapacity = getCDNsCapacity;
	public getCDNsHealth = getCDNsHealth;
	public getCDNsRoutingInfo = getCDNsRoutingInfo;
	public getCurrentStats = getCurrentStats;
	public getDeliveryServiceStats = getDeliveryServiceStats;
	public getDSStats = getDeliveryServiceStats;
	public getDeliveryServiceRoutingInfo = getDeliveryServiceRoutingInfo;
	public getDSRoutingInfo = getDeliveryServiceRoutingInfo;
	public getDeliveryServiceCapacity = getDeliveryServiceCapacity;
	public getDSCapacity = getDeliveryServiceCapacity;
	public getDeliveryServiceHealth = getDeliveryServiceHealth;
	public getDSHealth = getDeliveryServiceHealth;

	// Users
	public getUsers = getUsers;
	public createUser = createUser;
	public updateUser = updateUser;
	public getRoles = getRoles;
	public createRole = createRole;
	public updateRole = updateRole;
	public deleteRole = deleteRole;
	public getTenants = getTenants;
	public createTenant = createTenant;
	public updateTenant = updateTenant;
	public deleteTenant = deleteTenant;
	public getCurrentUser = getCurrentUser;

	// URI Signing / URL Signature
	public getURISigningKeys = getURISigningKeys;
	public setURISigningKeys = setURISigningKeys;
	public removeURISigningKeys = removeURISigningKeys;
	public getURLKeys = getURLKeys;
	public generateURLKeys = generateURLKeys;
	public copyURLKeys = copyURLKeys;
}
