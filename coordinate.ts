import type { APIResponse, RequestCoordinate, ResponseCoordinate } from "trafficops-types";

import { APIError, ClientError } from "./api.error.js";
import type { PaginationParams } from "./util";

import type { Client } from "./index";

/**
 * Optional settings that affect the behavior of {@link getCoordinates}.
 */
type Params = PaginationParams & {
	id?: number;
	name?: string;
	orderby?: "id" | "name";
};

/**
 * Retrieves Coordinates.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param identifier Either the name or the ID of a single Coordinate to fetch.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 */
export async function getCoordinates(this: Client, identifier: string | number, params?: Params): Promise<APIResponse<ResponseCoordinate>>;
/**
 * Retrieves Coordinates.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 */
export async function getCoordinates(this: Client, params?: Params): Promise<APIResponse<Array<ResponseCoordinate>>>;
/**
 * Retrieves Coordinates.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param paramsOrIdentifier Either the name or ID of a single Coordinate to
 * fetch, or any and all optional settings for the request.
 * @param params Any and all optional settings for the request. This is ignored
 * unless `paramsOrIdentifier` specified a single Coordinate via its name or ID.
 * @returns The server's response.
 */
export async function getCoordinates(
	this: Client,
	paramsOrIdentifier?: string | number | Params,
	params?: Params
): Promise<APIResponse<ResponseCoordinate | Array<ResponseCoordinate>>> {
	let single = false;
	let p;
	switch(typeof(paramsOrIdentifier)) {
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
	const resp = await this.apiGet<APIResponse<Array<ResponseCoordinate>>>("coordinates", p);
	if (single) {
		const coordinate = resp.data?.response[0];
		const len = resp.data.response.length;
		if (!coordinate || len !== 1) {
			throw new APIError(`getting Coordinate by identifier '${paramsOrIdentifier}' yielded ${len} results`, resp.status, resp.headers);
		}
		return {...resp.data, response: coordinate};
	}
	return resp.data;
}

/**
 * Creates a new Coordinate.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param coordinate The Coordinate to create.
 * @returns The server's response.
 */
export async function createCoordinate(this: Client, coordinate: RequestCoordinate): Promise<APIResponse<ResponseCoordinate>> {
	return (await this.apiPost<APIResponse<ResponseCoordinate>>("coordinates", coordinate)).data;
}

/**
 * Replaces an existing Coordinate with the provided new definition.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param id The ID of the Coordinate being modified.
 * @param coordinate The desired new Coordinate definition.
 * @returns The server's response.
 */
export async function updateCoordinate(this: Client, id: number, coordinate: RequestCoordinate): Promise<APIResponse<ResponseCoordinate>>;
/**
 * Replaces an existing Coordinate with the provided new definition.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param coordinate The full new Coordinate definition.
 * @returns The server's response.
 */
export async function updateCoordinate(this: Client, coordinate: ResponseCoordinate): Promise<APIResponse<ResponseCoordinate>>;
/**
 * Replaces an existing Coordinate with the provided new definition.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param cOrID Either the full new Coordinate definition, or just the ID of the
 * Coordinate being modified.
 * @param coordinate The desired new Coordinate definition. This is required if
 * `cOrID` is given as an ID, and ignored otherwise.
 * @returns The server's response.
 */
export async function updateCoordinate(
	this: Client,
	cOrID: ResponseCoordinate | number,
	coordinate?: RequestCoordinate
): Promise<APIResponse<ResponseCoordinate>> {
	let id, p;
	if (typeof(cOrID) === "number") {
		id = cOrID;
		if (!coordinate) {
			throw new ClientError("updateCoordinate", "coordinate");
		}
		p = coordinate;
	} else {
		p = cOrID;
		({id} = cOrID);
	}

	return (await this.apiPut<APIResponse<ResponseCoordinate>>("coordinates", p, {id})).data;
}

/**
 * Deletes a Coordinate.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param coordinate The Coordinate being deleted, or just its ID.
 * @returns The server's response.
 */
export async function deleteCoordinate(this: Client, coordinate: number | ResponseCoordinate): Promise<APIResponse<undefined>> {
	const id = typeof coordinate === "number" ? coordinate : coordinate.id;
	return (await this.apiDelete("coordinates", {id})).data;
}
