import type { APIResponse, RequestCacheGroupParameter, ResponseCacheGroupParameters } from "trafficops-types";

import { ClientError } from "./api.error.js";
import type { PaginationParams } from "./util";

import type { Client } from "./index";

/**
 * Options that affect the result set returned by
 * {@link getCacheGroupParameters}.
 */
type Params = PaginationParams & {
	/**
	 * Sets the order of sorting - ASCending or DESCending.
	 *
	 * @default "asc"
	 */
	sortOrder?: "asc" | "desc";
	/**
	 * Sets which property of the response objects is used for sorting.
	 *
	 * @default "cachegroup"
	 */
	orderby?: "parameter" | "cachegroup";
};

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
export async function getCacheGroupParameters(this: Client, params?: Params): Promise<APIResponse<ResponseCacheGroupParameters>> {
	return (await this.apiGet<APIResponse<ResponseCacheGroupParameters>>("cachegroupparameters", params)).data;
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
export async function assignParameterToCacheGroup(this: Client, ...pairs: ([number, number]|RequestCacheGroupParameter)[]): Promise<APIResponse<Array<RequestCacheGroupParameter>>>;
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
export async function assignParameterToCacheGroup(this: Client, cacheGroup: number, parameter: number): Promise<APIResponse<Array<RequestCacheGroupParameter>>>;
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
export async function assignParameterToCacheGroup(this: Client, cacheGroupOrPair: [number, number] | RequestCacheGroupParameter | number, parameter?: [number, number] | RequestCacheGroupParameter | number, ...pairs: ([number, number]|RequestCacheGroupParameter)[]): Promise<APIResponse<Array<RequestCacheGroupParameter>>> {
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
export async function removeParameterFromCacheGroup(this: Client, cacheGroupOrCGP: number | RequestCacheGroupParameter, parameter?: number): Promise<APIResponse<undefined>> {
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
	return (await this.apiDelete<APIResponse<undefined>>(`cachegroupparameters/${cacheGroupId}/${parameterId}`)).data;
}
