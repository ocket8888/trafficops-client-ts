import type { APIResponse, RequestParameter, ResponseParameter } from "trafficops-types";

import { APIError, ClientError } from "./api.error.js";
import type { PaginationParams } from "./util";

import type { Client } from "./index";

/**
 * Optional settings that can affect the results returned by
 * {@link getParameters}.
 */
type ParameterParams = PaginationParams & {
	/** Filter results by ConfigFile. */
	configFile?: string;
	/** Filter results by ID. */
	id?: number;
	/** Filter results by Name. */
	name?: string;
	/** Order the result set by the specified property's value. */
	orderby?: Exclude<keyof ResponseParameter, "lastUpdated">;
	/** Filter results by Value. */
	value?: string;
};

/**
 * Retrieves Parameters.
 *
 * @param this Tells TypeScript this is a Client method.
 * @param params Any and all optional settings to use in the request.
 * @returns The server's response.
 */
export async function getParameters(this: Client, params?: ParameterParams): Promise<APIResponse<Array<ResponseParameter>>>;
/**
 * Retrieves a Parameter
 *
 * @param this Tells TypeScript this is a Client method.
 * @param id The ID of a single Parameter to be retrieved.
 * @param params Any and all optional settings to use in the request.
 * @returns The server's response.
 * @throws {APIError} when Traffic Ops responds with zero or more than one
 * result(s).
 */
export async function getParameters(this: Client, id: number, params?: ParameterParams): Promise<APIResponse<ResponseParameter>>;
/**
 * Retrieves the "Types" registered for Traffic Ops objects.
 *
 * @param this Tells TypeScript this is a Client method.
 * @param idOrParams Either the ID of a single Parameter to be retrieved, or any
 * and all optional settings to use in the request.
 * @param params Any and all optional settings to use in the request. This is
 * ignored if optional settings were provided as `idOrParams`.
 * @returns The server's response.
 * @throws {APIError} when a single Parameter is requested, but Traffic Ops
 * responds with zero or more than one result(s).
 */
export async function getParameters(
	this: Client,
	idOrParams?: number | ParameterParams,
	params?: ParameterParams
): Promise<APIResponse<Array<ResponseParameter>|ResponseParameter>> {
	let p;
	let single = false;
	if (typeof(idOrParams) === "number") {
		p = {...params, id: idOrParams};
		single = true;
	} else {
		p = idOrParams;
	}
	const resp = await this.apiGet<APIResponse<Array<ResponseParameter>>>("parameters", p);
	if (single) {
		const len = resp.data?.response?.length;
		if (len !== 1) {
			throw new APIError(`requesting a Parameter by ID ${idOrParams} yielded ${len} results`, resp.status, resp.headers);
		}
		return {...resp.data, response: resp.data.response[0]};
	}
	return resp.data;
}

/**
 * Creates a new Parameter.
 *
 * @param this Tells TypeScript this is a Client method.
 * @param parameter The Parameter to be created.
 * @returns The server's response.
 */
export async function createParameter(this: Client, parameter: RequestParameter): Promise<APIResponse<ResponseParameter>> {
	return (await this.apiPost<APIResponse<ResponseParameter>>("parameters", parameter)).data;
}

/**
 * Replaces an existing Parameter with the provided definition of a Parameter.
 *
 * @param this Tells TypeScript this is a Client method.
 * @param parameter The desired new definition of the Parameter with the same
 * `id` property.
 * @returns The server's response.
 */
export async function updateParameter(this: Client, parameter: ResponseParameter): Promise<APIResponse<ResponseParameter>>;
/**
 * Replaces an existing Parameter with the provided definition of a Parameter.
 *
 * @param this Tells TypeScript this is a Client method.
 * @param id The ID of the Parameter being replaced.
 * @param parameter The desired new definition of the Parameter identified by
 * `id`.
 * @returns The server's response.
 */
export async function updateParameter(this: Client, id: number, parameter: RequestParameter): Promise<APIResponse<ResponseParameter>>;
/**
 * Replaces an existing Parameter with the provided definition of a Parameter.
 *
 * @param this Tells TypeScript this is a Client method.
 * @param parameterOrID Either the ID of the Parameter being replaced, or the
 * entire new definition of said Parameter. If this is an ID, the definition of
 * the Parameter's editable fields must be given in `parameter`.
 * @param parameter The desired new definition of the Parameter identified by
 * `parameterOrID`. This is required when `parameterOrID` is an ID, and is
 * ignored otherwise.
 * @returns The server's response.
 */
export async function updateParameter(
	this: Client,
	parameterOrID: number | ResponseParameter,
	parameter?: RequestParameter
): Promise<APIResponse<ResponseParameter>> {
	let id, payload;
	if (typeof(parameterOrID) === "number") {
		if (!parameter) {
			throw new ClientError("updateParameter", "parameter");
		}
		id = parameterOrID;
		payload = parameter;
	} else {
		({id} = parameterOrID);
		payload = parameterOrID;
	}
	return (await this.apiPut<APIResponse<ResponseParameter>>(`parameters/${id}`, payload)).data;
}

/**
 * Deletes a Parameter. Note that deletion will fail if the Parameter is used by
 * at least one Profile and/or Cache Group.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param parameter Either the Parameter to be deleted, or simply its ID.
 * @returns The server's response.
 */
export async function deleteParameter(this: Client, parameter: ResponseParameter | number): Promise<APIResponse<undefined>> {
	const id = typeof(parameter) === "number" ? parameter : parameter.id;
	return (await this.apiDelete(`parameters/${id}`)).data;
}
