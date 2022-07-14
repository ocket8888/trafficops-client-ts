import type {
	APIResponse,
	RequestServer,
	RequestStatus,
	ResponseServer,
	ResponseStatus
} from "trafficops-types";

import { APIError, ClientError } from "./api.error.js";
import type { PaginationParams } from "./util";

import type { Client } from "./index";

/**
 * Optional settings that affect the results returned by {@link_getStatuses}.
 */
type StatusParams = PaginationParams & {
	/** Return only Statuses with this **exact** description. */
	description?: string;
	/** Filter results by id. */
	id?: number;
	/** Filter results by name. */
	name?: string;
	/**
	 * Choose the property by which results are ordered.
	 *
	 * @default "name"
	 */
	orderby?: "description" | "id" | "name";
};

/**
 * Retrieves Statuses.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 */
export async function getStatuses(params?: StatusParams): Promise<APIResponse<Array<ResponseStatus>>>;
/**
 * Retrieves a Status.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param identifier Either the ID or the name of a single Status to retrieve.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 */
export async function getStatuses(identifier: number | string, params?: StatusParams): Promise<APIResponse<ResponseStatus>>;
/**
 * Retrieves Statuses.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param paramsOrIdentifier Either the ID or name of a single Status to
 * retrieve, or any and all optional settings for retrieving multiple.
 * @param params Any and all optional settings for the request. This is ignored
 * if settings were provided in `paramsOrIdentifier`.
 * @returns The server's response.
 */
export async function getStatuses(
	this: Client,
	paramsOrIdentifier?: StatusParams | number | string,
	params?: StatusParams
): Promise<APIResponse<Array<ResponseStatus> | ResponseStatus>> {
	let p;
	let single = false;
	switch (typeof(paramsOrIdentifier)) {
		case "number":
			p = {...params, id: paramsOrIdentifier};
			single = true;
			break;
		case "string":
			p = {...params, name: paramsOrIdentifier};
			single = true;
			break;
		default:
			p = paramsOrIdentifier;
	}
	const resp = await this.apiGet<APIResponse<Array<ResponseStatus>>>("statuses", p);
	if (single) {
		const len = resp.data.response.length;
		const status = resp.data.response[0];
		if (!status || len !== 1) {
			throw new APIError(`requesting status by identifier '${paramsOrIdentifier}' yielded ${len} results`, resp.status, resp.headers);
		}
		return {...resp.data, response: status};
	}
	return resp.data;
}

/**
 * Creates a new Status.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param status The status to create.
 * @returns The server's response.
 */
export async function createStatus(this: Client, status: RequestStatus): Promise<APIResponse<ResponseStatus>> {
	return (await this.apiPost<APIResponse<ResponseStatus>>("statuses", status)).data;
}

/**
 * Replaces the existing definition of a Status with the one provided.
 *
 * @param this Tells TypeScript that this is a TypeScript method.
 * @param status The full desired definition of the Status.
 * @returns The server's response.
 */
export async function updateStatus(this: Client, status: ResponseStatus): Promise<APIResponse<ResponseStatus>>;
/**
 * Replaces the existing definition of a Status with the one provided.
 *
 * @param this Tells TypeScript that this is a TypeScript method.
 * @param id The ID of the Status being updated.
 * @param status The desired definition of the Status.
 * @returns The server's response.
 */
export async function updateStatus(this: Client, id: number, status: RequestStatus): Promise<APIResponse<ResponseStatus>>;
/**
 * Replaces the existing definition of a Status with the one provided.
 *
 * @param this Tells TypeScript that this is a TypeScript method.
 * @param statusOrID Either the full desired definition of the Status or just
 * its ID.
 * @param status The desired definition of the Status. This is required if
 * `statusOrID` is an ID, and ignored otherwise.
 * @returns The server's response.
 */
export async function updateStatus(
	this: Client,
	statusOrID: ResponseStatus | number,
	status?: RequestStatus
): Promise<APIResponse<ResponseStatus>> {
	let id, payload;
	if (typeof(statusOrID) === "number") {
		id = statusOrID;
		if (!status) {
			throw new ClientError("updateStatus", "status");
		}
		payload = status;
	} else {
		({id} = statusOrID);
		payload = statusOrID;
	}
	return (await this.apiPut<APIResponse<ResponseStatus>>(`statuses/${id}`, payload)).data;
}

/**
 * Deletes a Status.
 *
 * @param this Tells TypeScript that this is a TypeScript method.
 * @param status Either the Status being deleted, or just its ID.
 * @returns The server's response.
 */
export async function deleteStatus(this: Client, status: ResponseStatus | number): Promise<APIResponse<undefined>> {
	const id = typeof(status) === "number" ? status : status.id;
	return (await this.apiDelete(`statuses/${id}`)).data;
}

/**
 * Optional settings that affect the results returned by {@link getServers}.
 */
type Params = PaginationParams & {
	/** Return only those servers within the Cache Group that has this ID. */
	cachegroup?: number;
	/** Return only those servers within the Cache Group that has this Name. */
	cachegroupName?: string;
	/**
	 * Return only those servers assigned to the Delivery Service that has this
	 * ID. If the Delivery Service has a Topology assigned to it, the returned
	 * servers will be those whose Cache Group is associated with a Topology
	 * Node of that Topology and has the Server Capabilities that are required
	 * by the Delivery Service but excluding Origin Servers that are not
	 * assigned to the Delivery Service.
	 */
	dsId?: number;
	/**
	 * Return only those servers that have this (short) hostname.
	 *
	 * Please note that while parts of the API and even some entire ATC
	 * components treat these as unique, that is _**NOT**_  the case and
	 * therefore it cannot be assumed that using this parameter will enforce
	 * that a maximum of one result will be returned by {@link getServers}.
	 */
	hostName?: string;
	/** Return only the server with this ID. */
	id?: number;
	/** Choose a property by which the result set will be ordered. */
	orderby?: "cachegroup" | "cachegroupName" | "hostName" | "id" | "profileId" | "status" | "topology" | "type";
	/**
	 * Return only those servers that are using the Profile that has this ID.
	 *
	 * @deprecated In future API versions, this query string parameter will be
	 * unavailable. Instead, there will be the `profileName` parameter, which
	 * can be used for (roughly) the same purpose.
	 */
	profileId?: number;
	/** Return only those servers with this status. */
	status?: string;
	/**
	 * Return only servers who belong to Cache Groups assigned to this Topology.
	 */
	topology?: string;
	/** Return only servers of this Type. */
	type?: string;
};

/**
 * The properties of servers in responses that are strings representing dates.
 */
const SERVER_DATE_KEYS: readonly string[] = [
	"lastUpdated",
	"statusLastUpdated"
];

/**
 * Retrieves servers.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 */
export async function getServers(this: Client, params?: Params): Promise<APIResponse<Array<ResponseServer>>>;
/**
 * Retrieves a server.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param id The ID of a single server to retrieve.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 */
export async function getServers(this: Client, id: number, params?: Params): Promise<APIResponse<ResponseServer>>;
/**
 * Retrieves servers.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param paramsOrID Either the ID of a single server to retrieve, or any and
 * all optional settings for retrieving multiple.
 * @param params Any and all optional settings for the request. This is ignored
 * if settings were provided in `paramsOrID`.
 * @returns The server's response.
 */
export async function getServers(
	this: Client,
	paramsOrID?: number | Params,
	params?: Params
): Promise<APIResponse<Array<ResponseServer> | ResponseServer>> {
	let p;
	let single = false;
	if (typeof(paramsOrID) === "number") {
		single = true;
		p = {...params, id: paramsOrID};
	} else {
		p = paramsOrID;
	}
	const resp = await this.apiGet<APIResponse<Array<ResponseServer>>>("servers", p, {dateString: SERVER_DATE_KEYS});
	if (single) {
		const len = resp.data.response.length;
		const server = resp.data.response[0];
		if (!server || len !== 1) {
			throw new APIError(`requesting the server with ID ${paramsOrID} yielded ${len} results`, resp.status, resp.headers);
		}
		return {...resp.data, response: server};
	}
	return resp.data;
}

/**
 * Creates a server.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param server The server being created.
 * @returns The server's response.
 */
export async function createServer(this: Client, server: RequestServer): Promise<APIResponse<ResponseServer>> {
	return (await this.apiPost<APIResponse<ResponseServer>>("servers", server, undefined, {dateString: SERVER_DATE_KEYS})).data;
}

/**
 * Replaces the existing definition of a server with the one provided.
 *
 * @param this Tells TypeScript that this is a TypeScript method.
 * @param server The full desired definition of the server.
 * @returns The server's response.
 */
export async function updateServer(this: Client, server: ResponseServer): Promise<APIResponse<ResponseServer>>;
/**
 * Replaces the existing definition of a server with the one provided.
 *
 * @param this Tells TypeScript that this is a TypeScript method.
 * @param id The ID of the server being updated.
 * @param server The desired definition of the server.
 * @returns The server's response.
 */
export async function updateServer(this: Client, id: number, server: RequestServer): Promise<APIResponse<ResponseServer>>;
/**
 * Replaces the existing definition of a server with the one provided.
 *
 * @param this Tells TypeScript that this is a TypeScript method.
 * @param serverOrID Either the full desired definition of the server or just
 * its ID.
 * @param server The desired definition of the server. This is required if
 * `serverOrID` is an ID, and ignored otherwise.
 * @returns The server's response.
 */
export async function updateServer(
	this: Client,
	serverOrID: ResponseServer | number,
	server?: RequestServer
): Promise<APIResponse<ResponseServer>> {
	let id, payload;
	if (typeof(serverOrID) === "number") {
		id = serverOrID;
		if (!server) {
			throw new ClientError("updateServer", "server");
		}
		payload = server;
	} else {
		({id} = serverOrID);
		payload = serverOrID;
	}
	return (await this.apiPut<APIResponse<ResponseServer>>(`servers/${id}`, payload, undefined, {dateString: SERVER_DATE_KEYS})).data;
}

/**
 * Deletes a server.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param server The server being deleted, or just its ID.
 * @returns The server's response.
 */
export async function deleteServer(this: Client, server: number | ResponseServer): Promise<APIResponse<ResponseServer>> {
	const id = typeof(server) === "number" ? server : server.id;
	return (await this.apiDelete<APIResponse<ResponseServer>>(`servers/${id}`, undefined, SERVER_DATE_KEYS)).data;
}