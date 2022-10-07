import type {
	APIResponse,
	RequestServer,
	RequestServerCapability,
	RequestServerServerCapability,
	RequestServerServerCapabilityResponse,
	RequestStatus,
	ResponseServer,
	ResponseServerCapability,
	ResponseServerServerCapability,
	ResponseStatus,
	ServerCapability,
	Servercheck,
	ServercheckUploadRequest,
	ServerServerCapability
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
	return (await this.apiDelete<APIResponse<ResponseServer>>(`servers/${id}`, undefined, {dateString: SERVER_DATE_KEYS})).data;
}

/**
 * Retrieves Server Capabilities.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @returns The server's response.
 */
export async function getServerCapabilities(this: Client): Promise<APIResponse<Array<ResponseServerCapability>>>;
/**
 * Retrieves a Server Capability.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param name The name of a single Server Capability to retrieve.
 * @returns The server's response.
 */
export async function getServerCapabilities(this: Client, name: string): Promise<APIResponse<ResponseServerCapability>>;
/**
 * Retrieves Server Capabilities.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param name The name of a single Server Capability to retrieve, which
 * may be omitted to fetch *all* Server Capabilities.
 * @returns The server's response.
 */
export async function getServerCapabilities(
	this: Client,
	name?: string,
): Promise<APIResponse<Array<ResponseServerCapability> | ResponseServerCapability>> {
	let p;
	let single = false;
	if (typeof(name) === "string") {
		single = true;
		p = {name};
	}
	const resp = await this.apiGet<APIResponse<Array<ResponseServerCapability>>>("server_capabilities", p);
	if (single) {
		const len = resp.data.response.length;
		const server = resp.data.response[0];
		if (!server || len !== 1) {
			throw new APIError(`requesting the Server Capability with name ${name} yielded ${len} results`, resp.status, resp.headers);
		}
		return {...resp.data, response: server};
	}
	return resp.data;
}

/**
 * Creates a Server Capability.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param cap The Server Capability being created, or just its name.
 * @returns The server's response.
 */
export async function createServerCapability(this: Client, cap: RequestServerCapability | string): Promise<APIResponse<ResponseServer>> {
	const capability = typeof(cap) === "string" ? {name: cap} : cap;
	return (await this.apiPost<APIResponse<ResponseServer>>("server_capabilities", capability)).data;
}

/**
 * Deletes a Server Capability.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param cap The Server Capability being deleted, or just its name.
 * @returns The server's response.
 */
export async function deleteServerCapability(
	this: Client,
	cap: string | ServerCapability
): Promise<APIResponse<ResponseServerCapability>> {
	const name = typeof(cap) === "string" ? cap : cap.name;
	return (await this.apiDelete<APIResponse<ResponseServerCapability>>("server_capabilities", {name})).data;
}

/**
 * Checks if an argument to {@link addCapabilityToServer} is a full request to
 * associate a Server Capability with a server, or just a server or its ID.
 *
 * @param x The object to check.
 * @returns `true` if `x` is a `ServerServerCapability`, `false` otherwise.
 */
function isSSC(x: ServerServerCapability | ResponseServer | number): x is ServerServerCapability {
	return Object.prototype.hasOwnProperty.call(x, "serverId");
}

/**
 * Adds a Server Capability to a server.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param ssc The entire desired relationship between a server and a Server
 * Capability it has.
 * @returns The server's response.
 */
export async function addCapabilityToServer(
	this: Client,
	ssc: RequestServerServerCapability
): Promise<APIResponse<RequestServerServerCapabilityResponse>>;
/**
 * Adds a Server Capability to a server.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param server The server to which the Server Capability will be added - or
 * just its ID.
 * @param capability The Server Capability being added to the server - or just
 * its name.
 * @returns The server's response.
 */
export async function addCapabilityToServer(
	this: Client,
	server: ResponseServer | number,
	capability: ServerCapability | string
): Promise<APIResponse<RequestServerServerCapabilityResponse>>;
/**
 * Adds a Server Capability to a server.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param serverOrSSC The entire desired relationship between a server and a
 * Server Capability it has, or the server to which a Server Capability is being
 * added (or just its ID).
 * @param capability The Server Capability being added to a server. This is
 * required if `serverOrSSC` is a server or its ID, and is ignored otherwise.
 * @returns The server's response.
 */
export async function addCapabilityToServer(
	this: Client,
	serverOrSSC: ServerServerCapability | ResponseServer | number,
	capability?: ServerCapability | string
): Promise<APIResponse<RequestServerServerCapabilityResponse>> {
	let ssc;
	if (isSSC(serverOrSSC)) {
		ssc = serverOrSSC;
	} else if (!capability) {
		throw new ClientError("addCapabilityToServer", "capability");
	} else {
		ssc = {
			serverCapability: typeof(capability) === "string" ? capability : capability.name,
			serverId: typeof(serverOrSSC) === "number" ? serverOrSSC : serverOrSSC.id
		};
	}
	return (await this.apiPost<APIResponse<RequestServerServerCapabilityResponse>>("server_server_capabilities", ssc)).data;
}

/**
 * Optional request settings that affect the output of
 * {@link getServerCapabilityRelationships}.
 */
type GetSSCParams = PaginationParams & {
	serverCapability?: string;
	serverHostName?: string;
	serverId?: number;
	orderby?: "serverId" | "serverHostName" | "serverCapability";
};

/**
 * Retrieves relationships between Server Capabilities and the servers that have
 * them. By default this fetches *all* such relationships, but this can be
 * customized with `params`.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param params Any and all optional parameters for the request.
 * @returns The server's response.
 */
export async function getServerCapabilityRelationships(
	this: Client,
	params?: GetSSCParams
): Promise<APIResponse<Array<ResponseServerServerCapability>>> {
	return (await this.apiGet<APIResponse<Array<ResponseServerServerCapability>>>("server_server_capabilities", params)).data;
}

/**
 * Removes a Server Capability from a server.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param ssc The relationship between a server and a Server Capability that it
 * has which is being destroyed.
 * @returns The server's response.
 */
export async function removeCapabilityFromServer(this: Client, ssc: ServerServerCapability): Promise<APIResponse<undefined>>;
/**
 * Removes a Server Capability from a server.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param server The server having a Server Capability removed from it, or just
 * its ID.
 * @param capability The Server Capability being removed from `server`, or just
 * its name.
 * @returns The server's response.
 */
export async function removeCapabilityFromServer(
	this: Client,
	server: ResponseServer | number,
	capability: ServerCapability | string
): Promise<APIResponse<undefined>>;
/**
 * Removes a Server Capability from a server.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param serverOrSSC The relationship between a server and a Server Capability
 * that it has which is being destroyed, or just a server from which a Server
 * Capability will be removed (or its ID).
 * @param capability The Server Capability being removed from a server, or just
 * its name. This is required when `serverOrSSC` identifies a server, and
 * ignored otherwise.
 * @returns The server's response.
 */
export async function removeCapabilityFromServer(
	this: Client,
	serverOrSSC: ServerServerCapability | ResponseServer | number,
	capability?: ServerCapability | string
): Promise<APIResponse<undefined>> {
	let serverId;
	let serverCapability;
	if (isSSC(serverOrSSC)) {
		serverId = serverOrSSC.serverId;
		serverCapability = serverOrSSC.serverCapability;
	} else if (!capability) {
		throw new ClientError("removeCapabilityFromServer", "capability");
	} else {
		serverId = typeof(serverOrSSC) === "number" ? serverOrSSC : serverOrSSC.id;
		serverCapability = typeof(capability) === "string" ? capability : capability.name;
	}

	return (await this.apiDelete("server_server_capabilities", {serverCapability, serverId})).data;
}

/**
 * Optional settings that affect the output/behavior of {@link getServerchecks}.
 */
type ServercheckParams = {
	hostName?: string;
	id?: number;
};

/**
 * Fetches identifying and meta information as well as “check” values regarding
 * all servers that have a Type with a name beginning with “EDGE” or “MID”
 * (ostensibly this is equivalent to all cache servers).
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 */
export async function getServerchecks(this: Client, params?: ServercheckParams): Promise<APIResponse<Array<Servercheck>>> {
	return (await this.apiGet<APIResponse<Array<Servercheck>>>("servercheck", params)).data;
}

/**
 * Adds a server "check" result to the checks table.
 *
 * **Caution**: for unknown reasons only users with the username "extension" are
 * actually allowed to use this method, regardless of any role privilege level
 * or Permissions. In future API versions, this will be fixed.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param check The "check" result to be added.
 * @returns The server's response.
 */
export async function uploadServercheckResult(this: Client, check: ServercheckUploadRequest): Promise<APIResponse<undefined>> {
	return (await this.apiPost("servercheck", check)).data;
}
