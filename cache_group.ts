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
import type {
	APIResponse,
	CacheGroupDeliveryServiceAssignmentRequest,
	CacheGroupDeliveryServiceAssignmentResponse,
	CacheGroupQueueRequest,
	CacheGroupQueueResponse,
	RequestCacheGroup,
	RequestCacheGroupParameter,
	RequestTopology,
	RequestTopologyNode,
	RequestTopologyResponse,
	ResponseCacheGroup,
	ResponseCacheGroupParameters,
	ResponseCDN,
	ResponseParameter,
	ResponseTopology,
	Topology,
	TopologyQueueRequest,
	TopologyQueueResponse
} from "trafficops-types";

import { APIError, ClientError } from "./api.error.js";
import { getSingleResponse, type PaginationParams } from "./util.js";

import { Client } from "./index";

/**
 * Options that affect the result set returned by
 * {@link getCacheGroupParameters} when not requesting the Parameters of a
 * single Cache Group.
 */
type CGPParams = PaginationParams & {
	/**
	 * Sets which property of the response objects is used for sorting.
	 *
	 * @default "cachegroup"
	 */
	orderby?: "parameter" | "cachegroup";
};

/**
 * Options that affect the result set returned by
 * {@link getCacheGroupParameters} when requesting the Parameters of a single
 * Cache Group.
 */
type SingleCGPParams = PaginationParams & {
	/**
	 * Choose a property by which results are ordered.
	 *
	 * @default "id"
	 */
	orderby?: "id";
	/**
	 * Filter results to only include Parameters with this ID.
	 */
	parameterId?: number;
};

/**
 * Checks if an argument to {@link getCacheGroupParameters} is actually a Cache
 * Group or just some optional parameters.
 *
 * @param o The object to check.
 * @returns `true` if `o` is a {@link ResponseCacheGroup}, `false` otherwise.
 */
function isCG<T extends ResponseCacheGroup | ResponseTopology | RequestTopologyResponse>(o: T | CGPParams | undefined): o is T {
	return o !== undefined && Object.prototype.hasOwnProperty.call(o, "lastUpdated");
}

/**
 * Retrieves associations between Cache Groups and Parameters.
 *
 * @deprecated This functionality has been removed from the latest version of
 * the Traffic Ops API; an association between a Cache Group and any number of
 * Parameters has no meaning in any supported version of Apache Traffic Control.
 *
 * @param this Tells TypeScript this is a Client method.
 * @param params Any and all optional settings to use in the request.
 * @returns The server's response.
 */
export async function getCacheGroupParameters(this: Client, params?: CGPParams): Promise<APIResponse<ResponseCacheGroupParameters>>;
/**
 * Retrieves the Parameters associated with a single Cache Group.
 *
 * @deprecated This functionality has been removed from the latest version of
 * the Traffic Ops API; an association between a Cache Group and any number of
 * Parameters has no meaning in any supported version of Apache Traffic Control.
 *
 * @param this Tells TypeScript this is a Client method.
 * @param cacheGroup The Cache Group for which Parameters will be retrieved, or
 * just its ID.
 * @param params Any and all optional settings to use in the request.
 * @returns The server's response.
 */
export async function getCacheGroupParameters(
	this: Client,
	cacheGroup: number | ResponseCacheGroup,
	params?: SingleCGPParams
): Promise<APIResponse<Array<ResponseParameter>>>;
/**
 * Retrieves associations between Cache Groups and Parameters.
 *
 * @deprecated This functionality has been removed from the latest version of
 * the Traffic Ops API; an association between a Cache Group and any number of
 * Parameters has no meaning in any supported version of Apache Traffic Control.
 *
 * @param this Tells TypeScript this is a Client method.
 * @param paramsOrCG To fetch the Parameters associated with a single Cache
 * Group, this may specify that Cache Group or its ID. Otherwise, it should be
 * any and all optional settings to use in the request.
 * @param params Any and all optional settings to use in the request. This is
 * ignored unless `paramsOrCG` was a Cache Group or its ID.
 * @returns The server's response.
 */
export async function getCacheGroupParameters(
	this: Client,
	paramsOrCG?: number | ResponseCacheGroup | CGPParams,
	params?: SingleCGPParams
): Promise<APIResponse<ResponseCacheGroupParameters | Array<ResponseParameter>>> {
	if (typeof(paramsOrCG) === "number") {
		return (await this.apiGet<APIResponse<Array<ResponseParameter>>>(`cachegroups/${paramsOrCG}/parameters`, params)).data;
	}
	if (isCG(paramsOrCG)) {
		return (await this.apiGet<APIResponse<Array<ResponseParameter>>>(`cachegroups/${paramsOrCG.id}/parameters`, params)).data;
	}
	return (await this.apiGet<APIResponse<ResponseCacheGroupParameters>>("cachegroupparameters", paramsOrCG)).data;
}

/**
 * Creates an arbitrary number of associations between Cache Groups and
 * Parameters.
 *
 * @deprecated This functionality has been removed from the latest version of
 * the Traffic Ops API; an association between a Cache Group and any number of
 * Parameters has no meaning in any supported version of Apache Traffic Control.
 *
 * @param this Tells TypeScript this is a Client method.
 * @param pairs Any number of associations between a Cache Group and a Parameter
 * to create. Each entry can either be a tuple of a Cache Group ID and a
 * Parameter ID (in that order) or a formal {@link RequestCacheGroupParameter}
 * object.
 * @returns The server's response.
 */
export async function assignParameterToCacheGroup(
	this: Client,
	...pairs: ([number, number]|RequestCacheGroupParameter)[]
): Promise<APIResponse<Array<RequestCacheGroupParameter>>>;
/**
 * Creates an association between a Cache Group and a Parameter.
 *
 * @deprecated This functionality has been removed from the latest version of
 * the Traffic Ops API; an association between a Cache Group and any number of
 * Parameters has no meaning in any supported version of Apache Traffic Control.
 *
 * @param this Tells TypeScript this is a Client method.
 * @param cacheGroup The ID of a Cache Group with which the Parameter identified
 * by `parameter` will be associated.
 * @param parameter The ID of a Parameter which will be associated with the
 * Cache Group identified by `cacheGroup`.
 * @returns The server's response.
 */
export async function assignParameterToCacheGroup(
	this: Client,
	cacheGroup: number,
	parameter: number
): Promise<APIResponse<Array<RequestCacheGroupParameter>>>;
/**
 * Creates one or more associations between Cache Groups and Parameters.
 *
 * @deprecated This functionality has been removed from the latest version of
 * the Traffic Ops API; an association between a Cache Group and any number of
 * Parameters has no meaning in any supported version of Apache Traffic Control.
 *
 * @param this Tells TypeScript this is a Client method.
 * @param cacheGroupOrPair Either the ID of a Cache Group when creating a single
 * association, or an entire association unto itself. If this is an ID,
 * `parameter` must be the ID of the Parameter to be associated, and `pairs` is
 * ignored.
 * @param parameter Either the ID of a Parameter when creating a single
 * association, or an entire association unto itself. This can only be an entire
 * association if `cacheGroupOrPair was an association, and must be passed as a
 * Parameter ID if `cacheGroupOrPair was passed as a Cache Group ID.
 * @param pairs Any number of additional associations to create. This is ignored
 * when `cacheGoupOrPair` and `parameters` were both given as IDs.
 * @returns The server's response.
 */
export async function assignParameterToCacheGroup(
	this: Client,
	cacheGroupOrPair: [number, number] | RequestCacheGroupParameter | number,
	parameter?: [number, number] | RequestCacheGroupParameter | number,
	...pairs: ([number, number]|RequestCacheGroupParameter)[]
): Promise<APIResponse<Array<RequestCacheGroupParameter>>> {
	let requests: Array<RequestCacheGroupParameter>;
	if (typeof(cacheGroupOrPair) === "number") {
		if (typeof(parameter) !== "number") {
			throw new ClientError("'parameter' argument must be a number when 'cacheGroup' argument is a number");
		}
		requests = [{cacheGroupId: cacheGroupOrPair, parameterId: parameter}];
	} else {
		if (Array.isArray(cacheGroupOrPair)) {
			requests = [{cacheGroupId: cacheGroupOrPair[0], parameterId: cacheGroupOrPair[1]}];
		} else {
			requests = [cacheGroupOrPair];
		}
		if (typeof(parameter) === "number") {
			throw new ClientError("'parameter' argument must be a Cache Group/Parameter association if 'cacheGroupOrPair' is");
		}
		if (Array.isArray(parameter)) {
			requests.push({cacheGroupId: parameter[0], parameterId: parameter[1]});
		} else if (parameter) {
			requests.push(parameter);
		}
		requests = requests.concat(pairs.map(p=>Array.isArray(p) ? {cacheGroupId: p[0], parameterId: p[1]} : p));
	}
	return (await this.apiPost<APIResponse<Array<RequestCacheGroupParameter>>>("cachegroupparameters", requests)).data;
}

/**
 * Removes a Parameter from the set of Parameters associated with a Cache Group.
 *
 * @deprecated This functionality has been removed from the latest version of
 * the Traffic Ops API; an association between a Cache Group and any number of
 * Parameters has no meaning in any supported version of Apache Traffic Control.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param cacheGroup The ID of a Cache Group from which to remove a Parameter.
 * @param parameter The ID of the Parameter to be removed from the Cache Group
 * identified by `cacheGroup`.
 * @returns The server's response.
 */
export async function removeParameterFromCacheGroup(cacheGroup: number, parameter: number): Promise<APIResponse<undefined>>;
/**
 * Removes a Parameter from the set of Parameters associated with a Cache Group.
 *
 * @deprecated This functionality has been removed from the latest version of
 * the Traffic Ops API; an association between a Cache Group and any number of
 * Parameters has no meaning in any supported version of Apache Traffic Control.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param cacheGroupParameter The Cache Group/Parameter relationship to be
 * destroyed.
 * @returns The server's response.
 */
export async function removeParameterFromCacheGroup(cacheGroupParameter: RequestCacheGroupParameter): Promise<APIResponse<undefined>>;
/**
 * Removes a Parameter from the set of Parameters associated with a Cache Group.
 *
 * @deprecated This functionality has been removed from the latest version of
 * the Traffic Ops API; an association between a Cache Group and any number of
 * Parameters has no meaning in any supported version of Apache Traffic Control.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param cacheGroupOrCGP Either the ID of a Cache Group from which to remove a
 * Parameter, or the entire Cache Group/Parameter relationship to be destroyed.
 * If this is a Cache Group ID, `parameter` is required.
 * @param parameter The ID of the Parameter to be removed from the Cache Group
 * identified by `cacheGroupOrCGP`. This is required if `cacheGroupOrCGP` is the
 * ID of a Cache Group, and is ignored if an entire association was passed as
 * the first argument instead.
 * @returns The server's response.
 */
export async function removeParameterFromCacheGroup(
	this: Client,
	cacheGroupOrCGP: number | RequestCacheGroupParameter,
	parameter?: number
): Promise<APIResponse<undefined>> {
	let cacheGroupId, parameterId;
	if (typeof(cacheGroupOrCGP) === "number") {
		cacheGroupId = cacheGroupOrCGP;
		if (parameter === undefined) {
			throw new ClientError("removeParameterFromCacheGroup", "parameter");
		}
		parameterId = parameter;
	} else {
		({cacheGroupId, parameterId} = cacheGroupOrCGP);
	}
	return (await this.apiDelete(`cachegroupparameters/${cacheGroupId}/${parameterId}`)).data;
}

/**
 * Options that affect the result set returned by {@link getCacheGroups}.
 */
type Params = PaginationParams & {
	/** Filter results to those having this ID. */
	id?: number;
	/** Filter results to those Cache Groups having this name. */
	name?: string;
	/**
	 * Order results by the specified property (not all properties eligible).
	 */
	orderby?: "id" | "name" | "topology" | "type" | "lastUpdated";
	/** Filter results to Cache Groups used in the named Topology. */
	topology?: string;
	/**
	 * Filter results to those Cache Groups having the Type identified by this
	 * Type ID.
	 */
	type?: number;
};

/**
 * Retrieves a single Cache Group.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param identifier The name or ID of a Cache Group. The only result returned
 * will be the single Cache Group that has the given identifier.
 * @param params Any and all optional settings to use in the request.
 * @returns The server's response.
 * @throws {APIError} If Traffic Ops returns no Cache Groups matching the given
 * identifier, or somehow returns more than one.
 */
export async function getCacheGroups(this: Client, identifier: number | string, params?: Params): Promise<APIResponse<ResponseCacheGroup>>;
/**
 * Retrieves Cache Groups.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param params Any and all optional settings to use in the request.
 * @returns The server's response.
 */
export async function getCacheGroups(this: Client, params?: Params): Promise<APIResponse<Array<ResponseCacheGroup>>>;
/**
 * Retrieves Cache Groups.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param paramsOrIdentifier If requesting a single Cache Group, this must be
 * the identifier thereof. If not, this may be any and all optional settings to
 * use in the request.
 * @param params Any and all optional settings to use in the request.
 * @returns The server's response.
 */
export async function getCacheGroups(
	this: Client,
	paramsOrIdentifier?: string | number | Params,
	params?: Params
): Promise<APIResponse<Array<ResponseCacheGroup>|ResponseCacheGroup>> {
	let p;
	let single = false;
	switch (typeof(paramsOrIdentifier)) {
		case "string":
			p = {...params, name: paramsOrIdentifier};
			single = true;
			break;
		case "number":
			p = {...params, id: paramsOrIdentifier};
			single = true;
			break;
		default:
			p = paramsOrIdentifier;
	}
	const resp = await this.apiGet<APIResponse<Array<ResponseCacheGroup>>>("cachegroups", p);
	if (single) {
		const len = resp.data.response.length;
		if (len !== 1) {
			throw new APIError(`requesting a single Cache Group by identifier '${paramsOrIdentifier}' yielded ${len} results`, resp.status, resp.headers);
		}
		return {...resp.data, response: resp.data.response[0]};
	}
	return resp.data;
}

/**
 * Creates a new Cache Group.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param cg The Cache Group to be created.
 * @returns The server's response.
 */
export async function createCacheGroup(this: Client, cg: RequestCacheGroup): Promise<APIResponse<ResponseCacheGroup>> {
	return (await this.apiPost<APIResponse<ResponseCacheGroup>>("cachegroups", cg)).data;
}

/**
 * Deletes a Cache Group.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param cg The Cache Group to be deleted, or its ID.
 * @returns The server's response.
 */
export async function deleteCacheGroup(this: Client, cg: ResponseCacheGroup | number): Promise<APIResponse<undefined>> {
	const id = typeof(cg) === "number" ? cg : cg.id;
	return (await this.apiDelete(`cachegroups/${id}`)).data;
}

/**
 * Replaces an existing Cache Group with the provided new definition.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param cg The Cache Group as desired to exist.
 * @returns The server's response.
 */
export async function updateCacheGroup(this: Client, cg: ResponseCacheGroup): Promise<APIResponse<ResponseCacheGroup>>;
/**
 * Replaces an existing Cache Group with the provided new definition.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param id The ID of the Cache Group being updated.
 * @param cg The new definition of the Cache Group identified by `id`.
 * @returns The server's response.
 */
export async function updateCacheGroup(this: Client, id: number, cg: RequestCacheGroup): Promise<APIResponse<ResponseCacheGroup>>;
/**
 * Replaces an existing Cache Group with the provided new definition.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param cgOrID The ID of the Cache Group being updated, or the entire
 * definition. If this is an ID, `cg` is required.
 * @param cg The new definition of the Cache Group identified by `cgOrID`. If
 * `cgOrID` wasn't passed as an ID, this is ignored.
 * @returns The server's response.
 */
export async function updateCacheGroup(
	this: Client,
	cgOrID: number | ResponseCacheGroup,
	cg?: RequestCacheGroup
): Promise<APIResponse<ResponseCacheGroup>> {
	let payload;
	let id;
	if (typeof(cgOrID) === "number") {
		if (!cg) {
			throw new ClientError("updateCacheGroup", "cg");
		}
		id = cgOrID;
		payload = cg;
	} else {
		({id} = cgOrID);
		payload = cgOrID;
	}
	return (await this.apiPut<APIResponse<ResponseCacheGroup>>(`cachegroups/${id}`, payload)).data;
}

/**
 * Queue or dequeue updates on the servers in a Cache Group. Note that there is
 * no restriction on the Type of the Cache Group that may be specified, nor is
 * the operation restricted to only the servers within it that are cache
 * servers.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param cgOrID Either the specified Cache Group within which updates will be
 * queued or dequeued, or its ID.
 * @param cdn The CDN to which the operation will be limited - this is **not**
 * optional. It can be an actual CDN as returned by Traffic Ops, or a CDN's ID
 * or Name.
 * @param action The action to perform. `"queue"` to queue updates, `"dequeue"`
 * to clear them.
 * @returns The server's response.
 */
export async function queueCacheGroupUpdates(
	this: Client,
	cgOrID: number | ResponseCacheGroup,
	cdn: number | string | ResponseCDN,
	action: "queue" | "dequeue" = "queue"
): Promise<APIResponse<CacheGroupQueueResponse>> {
	const id = typeof(cgOrID) === "number" ? cgOrID : cgOrID.id;
	let payload: CacheGroupQueueRequest;
	switch (typeof(cdn)) {
		case  "number":
			payload = {
				action,
				cdnId: cdn
			};
			break;
		case "string":
			payload = {
				action,
				cdn
			};
			break;
		default:
			payload = {
				action,
				cdnId: cdn.id
			};
	}
	return (await this.apiPost<APIResponse<CacheGroupQueueResponse>>(`cachegroups/${id}/queue_update`, payload)).data;
}

/**
 * Dequeue updates on the servers in a Cache Group. Note that there is
 * no restriction on the Type of the Cache Group that may be specified, nor is
 * the operation restricted to only the servers within it that are cache
 * servers.
 *
 * This is equivalent to calling {@link queueCacheGroupUpdates} with its
 * `action` argument as `"dequeue"`.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param cgOrID Either the specified Cache Group within which updates will be
 * queued or dequeued, or its ID.
 * @param cdn The CDN to which the operation will be limited - this is **not**
 * optional. It can be an actual CDN as returned by Traffic Ops, or a CDN's ID
 * or Name.
 * @returns The server's response.
 */
export async function dequeueCacheGroupUpdates(
	this: Client,
	cgOrID: number | ResponseCacheGroup,
	cdn: number | string | ResponseCDN
): Promise<APIResponse<CacheGroupQueueResponse>> {
	return this.queueCacheGroupUpdates(cgOrID, cdn, "dequeue");
}

/**
 * Assigns all of the “assignable” servers within a Cache Group to one or more
 * Delivery Services.
 *
 * @deprecated Directly assigning servers to Delivery Services is deprecated,
 * and Topologies should be used instead.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param cgOrID Either the Cache Group to be assigned, or its ID.
 * @param dss The Delivery Service(s) to which the servers in the identified
 * Cache Group will be assigned. This can be in the format required by API
 * requests to the `cachegroups/{{ID}}/deliveryservices` API endpoint, or just a
 * list of IDs.
 * @returns The server's response.
 */
export async function assignCacheGroupToDS(
	this: Client,
	cgOrID: number | ResponseCacheGroup,
	dss: CacheGroupDeliveryServiceAssignmentRequest | Array<number>
): Promise<APIResponse<CacheGroupDeliveryServiceAssignmentResponse>> {
	const payload = Array.isArray(dss) ? {deliveryServices: dss} : dss;
	const id = typeof(cgOrID) === "number" ? cgOrID : cgOrID.id;
	return (await this.apiPost<APIResponse<CacheGroupDeliveryServiceAssignmentResponse>>(`cachegroups/${id}/deliveryservices`, payload)).data;
}

/**
 * Creates a new Topology.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param topologyOrName The full definition of the Topology to be created.
 * @returns The server's response.
 */
export async function createTopology(
	this: Client,
	topology: RequestTopology
): Promise<APIResponse<RequestTopologyResponse>>;
/**
 * Creates a new Topology.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param name The Name of the Topology to be created.
 * @param description A description of the Topology being created. This cannot
 * be blank.
 * @param nodes The Nodes that comprise the new Topology.
 * @returns The server's response.
 */
export async function createTopology(
	this: Client,
	name: string,
	description: string,
	...nodes: [RequestTopologyNode, ...RequestTopologyNode[]]
): Promise<APIResponse<RequestTopologyResponse>>;
/**
 * Creates a new Topology.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param topologyOrName Either the full definition of the Topology to be
 * created, or just its Name.
 * @param description A description of the Topology being created. This is
 * required if `topologyOrName` is the new Topology's Name, and ignored
 * otherwise. This cannot be blank.
 * @param nodes The Nodes that comprise the new Topology. This is required if
 * `topologyOrName` is the new Topology's Name, and ignored otherwise.
 * @returns The server's response.
 */
export async function createTopology(
	this: Client,
	topologyOrName: string | RequestTopology,
	description?: string,
	...nodes: RequestTopologyNode[]
): Promise<APIResponse<RequestTopologyResponse>> {
	let req: RequestTopology;
	if (typeof(topologyOrName) === "string") {
		if (!description) {
			throw new ClientError("createTopology", "description");
		}
		if (nodes.length < 1) {
			throw new ClientError("Topologies cannot be created without any Nodes");
		}
		req = {
			description,
			name: topologyOrName,
			nodes
		};
	} else {
		req = topologyOrName;
	}
	return (await this.apiPost<APIResponse<RequestTopologyResponse>>("topologies", req)).data;
}

/**
 * Optional settings that affect the behavior/output of {@link getTopologies}.
 */
type TopologyParams = PaginationParams & {
	name?: string;
	/** @default "name" */
	orderby?: "name" | "lastUpdated";
};

/**
 * Retrieves Topologies from Traffic Ops.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 */
export async function getTopologies(
	this: Client,
	params?: TopologyParams
): Promise<APIResponse<Array<ResponseTopology>>>;
/**
 * Retrieves a single Topology from Traffic Ops.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param name The name of a single Topology to retrieve.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 */
export async function getTopologies(
	this: Client,
	name: string,
	params?: TopologyParams
): Promise<APIResponse<ResponseTopology>>;
/**
 * Retrieves one or more Topologies from Traffic Ops.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param paramsOrName Either the name of a single Topology to retrieve, or any
 * and all optional settings for the request when fetching multiple.
 * @param params Any and all optional settings for the request. This is ignored
 * if options were specified in `paramsOrName`.
 * @returns The server's response.
 */
export async function getTopologies(
	this: Client,
	paramsOrName?: string | TopologyParams,
	params?: TopologyParams
): Promise<APIResponse<ResponseTopology | Array<ResponseTopology>>> {
	if (typeof(paramsOrName) === "string") {
		const resp = await this.apiGet<APIResponse<[ResponseTopology]>>("topologies", {...params, name: paramsOrName});
		return getSingleResponse(resp, "Topology", paramsOrName);
	}
	return (await this.apiGet<APIResponse<Array<ResponseTopology>>>("topologies", params)).data;
}

/**
 * Replaces an existing Topology with the provided new definition.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param topology The Topology being modified, or just its (current) Name.
 * @param request The full, new, desired definition of the Topology.
 * @returns The server's response.
 */
export async function updateTopology(this: Client, topology: string | Topology, request: Topology): Promise<APIResponse<ResponseTopology>>;
/**
 * Replaces an existing Topology with the provided new definition.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param topology The Topology being modified, or just its (current) Name.
 * @param newName The new, desired Name of the Topology,
 * or just its new desired Name.
 * @param description The new description of the Topology. This cannot be blank.
 * @param nodes The Topology's new Node structure.
 * @returns The server's response.
 */
export async function updateTopology(
	this: Client,
	topology: string | Topology,
	newName: string,
	description: string,
	...nodes: [RequestTopologyNode, ...RequestTopologyNode[]]
): Promise<APIResponse<ResponseTopology>>;
/**
 * Replaces an existing Topology with the provided new definition.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param topology The Topology being modified, or just its (current) Name.
 * @param reqOrNewName Either the full, new, desired definition of the Topology,
 * or just its new desired Name.
 * @param description The new description of the Topology. This cannot be blank.
 * This is required if `reqOrNewName` is the new Name of the Topology, and
 * ignored otherwise.
 * @param nodes The Topology's new Node structure. This is required if
 * `reqOrNewName` is the new Name of the Topology, and ignored otherwise.
 * @returns The server's response.
 */
export async function updateTopology(
	this: Client,
	topology: string | Topology,
	reqOrNewName: string | Topology,
	description?: string,
	...nodes: RequestTopologyNode[]
): Promise<APIResponse<ResponseTopology>> {
	const name = typeof(topology) === "string" ? topology : topology.name;
	let req;
	if (typeof(reqOrNewName) === "string") {
		if (!description) {
			throw new ClientError("updateTopology", "description");
		}
		if (nodes.length < 1) {
			throw new ClientError("Topologies must have at least one Node");
		}
		req = {
			description,
			name: reqOrNewName,
			nodes
		};
	} else {
		req = reqOrNewName;
	}
	return (await this.apiPut<APIResponse<ResponseTopology>>("topologies", req, {name})).data;
}

/**
 * Deletes a given Topology.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param topology The Topology to delete, or just its name.
 * @returns The server's response.
 */
export async function deleteTopology(this: Client, topology: string | Topology): Promise<APIResponse<undefined>> {
	const name = typeof(topology) === "string" ? topology : topology.name;
	return (await this.apiDelete("topologies", {name})).data;
}

/**
 * Queues server updates on all of the servers within a given Topology,
 * constrained to a CDN.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param topology The Topology on which to act, or just its Name.
 * @param request The full queue request body.
 * @returns The server's response.
 */
export async function queueTopologyUpdates(
	this: Client,
	topology: string | Topology,
	request: TopologyQueueRequest,
): Promise<APIResponse<TopologyQueueResponse>>;
/**
 * Queues server updates on all of the servers within a given Topology,
 * constrained to a CDN.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param topology The Topology on which to act, or just its Name.
 * @param action The queue action to be performed.
 * @param cdn The CDN to which the queue action will be restricted, or just its
 * ID.
 * @returns The server's response.
 */
export async function queueTopologyUpdates(
	this: Client,
	topology: string | Topology,
	action: "queue" | "dequeue",
	cdn: number | ResponseCDN
): Promise<APIResponse<TopologyQueueResponse>>;
/**
 * Queues server updates on all of the servers within a given Topology,
 * constrained to a CDN.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param topology The Topology on which to act, or just its Name.
 * @param requestOrAction Either the full queue request, or just the queue
 * action to be performed.
 * @param cdn The CDN to which the queue action will be restricted, or just its
 * ID. This is required if `requestOrAction` is a queue action, and ignored
 * otherwise.
 * @returns The server's response.
 */
export async function queueTopologyUpdates(
	this: Client,
	topology: string | Topology,
	requestOrAction: "queue" | "dequeue" | TopologyQueueRequest,
	cdn?: number | ResponseCDN
): Promise<APIResponse<TopologyQueueResponse>> {
	const name = typeof(topology) === "string" ? topology : topology.name;
	const path = `topologies/${name}/queue_update`;
	if (typeof(requestOrAction) === "object") {
		return (await this.apiPost<APIResponse<TopologyQueueResponse>>(path, requestOrAction)).data;
	}
	if (!cdn) {
		throw new ClientError("queueTopologyUpdates", "cdn");
	}
	const cdnId = typeof(cdn) === "number" ? cdn : cdn.id;
	return (await this.apiPost<APIResponse<TopologyQueueResponse>>(path, { action: requestOrAction, cdnId})).data;
}
