import type {
	APIResponse,
	RequestDivision,
	RequestPhysicalLocation,
	RequestRegion,
	ResponseDivision,
	ResponsePhysicalLocation,
	ResponseRegion
} from "trafficops-types";

import { APIError, ClientError } from "./api.error.js";
import type { PaginationParams } from "./util";

import type { Client } from "./index";

/**
 * Optional settings that can affect the behavior and result set of
 * {@link getDivisions}.
 */
type DivisionParams = PaginationParams & {
	/** Filter by ID. */
	id?: number;
	/** Filter by name. */
	name?: string;
	/** Choose the property by which the result set will be ordered. */
	orderby?: "id" | "name";
};

/**
 * Retrieves Divisions.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 */
export async function getDivisions(this: Client, params?: DivisionParams): Promise<APIResponse<Array<ResponseDivision>>>;
/**
 * Retrieves a single Division.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param nameOrID Either the name or ID of a single Division to retrieve.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 * @throws {APIError} if Traffic Ops responds with any number of Divisions other
 * than 1.
 */
export async function getDivisions(
	this: Client,
	nameOrID: string | number,
	params?: DivisionParams
): Promise<APIResponse<ResponseDivision>>;
/**
 * Retrieves Divisions.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param identifierOrParams Either the name or ID of a single Division to
 * retrieve, or optional settings for retrieving multiple Divisions.
 * @param params Any and all optional settings for the request. This is ignored
 * if options were passed in `identifierOrParams`.
 * @returns The server's response.
 * @throws {APIError} if a single Division is requested but Traffic Ops
 * responded with any number of Divisions other than 1.
 */
export async function getDivisions(
	this: Client,
	identifierOrParams?: string | number | DivisionParams,
	params?: DivisionParams
): Promise<APIResponse<Array<ResponseDivision> | ResponseDivision>> {
	let single = false;
	let p;
	switch (typeof(identifierOrParams)) {
		case "string":
			single = true;
			p = {...params, name: identifierOrParams};
			break;
		case "number":
			single = true;
			p = {...params, id: identifierOrParams};
			break;
		default:
			p = identifierOrParams;
	}
	const resp = await this.apiGet<APIResponse<Array<ResponseDivision>>>("divisions", p);
	if (single) {
		const len = resp.data.response.length;
		const division = resp.data.response[0];
		if (!division || len !== 1) {
			throw new APIError(`requesting Division by identifier '${identifierOrParams}' yielded ${len} results`, resp.status, resp.headers);
		}
		return {...resp.data, response: division};
	}
	return resp.data;
}

/**
 * Creates a Division.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param division Either the Division to be created or its name (since the name
 * is the only mutable property of a Division).
 * @returns The server's response.
 */
export async function createDivision(this: Client, division: string | RequestDivision): Promise<APIResponse<ResponseDivision>> {
	const payload = typeof(division) === "string" ? {name: division} : division;
	return (await this.apiPost<APIResponse<ResponseDivision>>("divisions", payload)).data;
}

/**
 * Replaces an existing Division with the provided definition.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param division The definition of the Division as desired.
 * @returns The server's response.
 */
export async function updateDivision(this: Client, division: ResponseDivision): Promise<APIResponse<ResponseDivision>>;
/**
 * Replaces an existing Division with the provided definition.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param id The ID of the Division being updated.
 * @param division Either the desired definition of the Division identified by
 * `id`, or just the desired new name (since the name is the only mutable
 * property of a Division).
 * @returns The server's response.
 */
export async function updateDivision(this: Client, id: number, division: RequestDivision | string): Promise<APIResponse<ResponseDivision>>;
/**
 * Replaces an existing Division with the provided definition.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param idOrDivision Either the ID of the Division being updated, or the
 * entire desired definition of it.
 * @param division Either the desired definition of the Division identified by
 * `id`, or just the desired new name (since the name is the only mutable
 * property of a Division). This is required if `idOrDivision` was an ID, and
 * ignored otherwise.
 * @returns The server's response.
 */
export async function updateDivision(
	this: Client,
	idOrDivision: number | ResponseDivision,
	division?: RequestDivision | string
): Promise<APIResponse<ResponseDivision>> {
	let id, payload;
	if (typeof(idOrDivision) === "number") {
		id = idOrDivision;
		if (division === undefined) {
			throw new ClientError("updateDivision", "division");
		}
		payload = typeof(division) === "string" ? {name: division} : division;
	} else {
		({id} = idOrDivision);
		payload = idOrDivision;
	}
	return (await this.apiPut<APIResponse<ResponseDivision>>(`divisions/${id}`, payload)).data;
}

/**
 * Deletes a Division.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param division Either the Division being deleted or its ID.
 * @returns The server's response.
 */
export async function deleteDivision(this: Client, division: number | ResponseDivision): Promise<APIResponse<ResponseDivision>> {
	const id = typeof(division) === "number" ? division : division.id;
	return (await this.apiDelete<APIResponse<ResponseDivision>>(`divisions/${id}`)).data;
}

/**
 * Optional settings that can affect the behavior and result set of
 * {@link getRegions}.
 */
type RegionParams = PaginationParams & {
	/** Filter by ID. */
	id?: number;
	/** Filter by name. */
	name?: string;
	/** Choose the property by which the result set will be ordered. */
	orderby?: "id" | "name";
};

/**
 * Retrieves Regions.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 */
export async function getRegions(this: Client, params?: RegionParams): Promise<APIResponse<Array<ResponseRegion>>>;
/**
 * Retrieves a single Region.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param nameOrID Either the name or ID of a single Region to retrieve.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 * @throws {APIError} if Traffic Ops responds with any number of Regions other
 * than 1.
 */
export async function getRegions(
	this: Client,
	nameOrID: string | number,
	params?: RegionParams
): Promise<APIResponse<ResponseRegion>>;
/**
 * Retrieves Regions.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param identifierOrParams Either the name or ID of a single Region to
 * retrieve, or optional settings for retrieving multiple Regions.
 * @param params Any and all optional settings for the request. This is ignored
 * if options were passed in `identifierOrParams`.
 * @returns The server's response.
 * @throws {APIError} if a single Region is requested but Traffic Ops
 * responded with any number of Regions other than 1.
 */
export async function getRegions(
	this: Client,
	identifierOrParams?: string | number | RegionParams,
	params?: RegionParams
): Promise<APIResponse<Array<ResponseRegion> | ResponseRegion>> {
	let single = false;
	let p;
	switch (typeof(identifierOrParams)) {
		case "string":
			single = true;
			p = {...params, name: identifierOrParams};
			break;
		case "number":
			single = true;
			p = {...params, id: identifierOrParams};
			break;
		default:
			p = identifierOrParams;
	}
	const resp = await this.apiGet<APIResponse<Array<ResponseRegion>>>("regions", p);
	if (single) {
		const len = resp.data.response.length;
		const region = resp.data.response[0];
		if (!region || len !== 1) {
			throw new APIError(`requesting Region by identifier '${identifierOrParams}' yielded ${len} results`, resp.status, resp.headers);
		}
		return {...resp.data, response: region};
	}
	return resp.data;
}

/**
 * Creates a Region.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param region The Region to be created.
 * @returns The server's response.
 */
export async function createRegion(this: Client, region: RequestRegion): Promise<APIResponse<ResponseRegion>> {
	return (await this.apiPost<APIResponse<ResponseRegion>>("regions", region)).data;
}

/**
 * Replaces an existing Region with the provided definition.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param region The definition of the Region as desired.
 * @returns The server's response.
 */
export async function updateRegion(this: Client, region: ResponseRegion): Promise<APIResponse<ResponseRegion>>;
/**
 * Replaces an existing Region with the provided definition.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param id The ID of the Region being updated.
 * @param region Either the desired definition of the Region identified by
 * `id`, or just the desired new name (since the name is the only mutable
 * property of a Region).
 * @returns The server's response.
 */
export async function updateRegion(this: Client, id: number, region: RequestRegion | string): Promise<APIResponse<ResponseRegion>>;
/**
 * Replaces an existing Region with the provided definition.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param idOrRegion Either the ID of the Region being updated, or the
 * entire desired definition of it.
 * @param region The desired definition of the Region identified by `id`, or
 * just the desired new name (since the name is the only mutable property of a
 * Region). This is required if `idOrRegion` was an ID, and ignored otherwise.
 * @returns The server's response.
 */
export async function updateRegion(
	this: Client,
	idOrRegion: number | ResponseRegion,
	region?: RequestRegion | string
): Promise<APIResponse<ResponseRegion>> {
	let id, payload;
	if (typeof(idOrRegion) === "number") {
		id = idOrRegion;
		if (region === undefined) {
			throw new ClientError("updateRegion", "region");
		}
		payload = typeof(region) === "string" ? {name: region} : region;
	} else {
		({id} = idOrRegion);
		payload = idOrRegion;
	}
	return (await this.apiPut<APIResponse<ResponseRegion>>(`regions/${id}`, payload)).data;
}

/**
 * Deletes a Region.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param region Either the Region being deleted or its ID.
 * @returns The server's response.
 */
export async function deleteRegion(this: Client, region: number | ResponseRegion): Promise<APIResponse<ResponseRegion>> {
	const id = typeof(region) === "number" ? region : region.id;
	return (await this.apiDelete<APIResponse<ResponseRegion>>("regions", {id})).data;
}

/**
 * Optional settings that can affect the behavior and result set of
 * {@link getPhysicalLocations}.
 */
type Params = PaginationParams & {
	id?: number;
	name?: string;
	orderby?: "name" | "region" | "id";
	region?: number;
};

/**
 * Retrieves a single Physical Location.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param paramsOrIdentifier Either the name or ID of a single Physical Location
 * to retrieve.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 * @throws {APIError} if Traffic Ops responded with any number of Physical
 * Locations other than 1.
 */
export async function getPhysicalLocations(
	this: Client,
	idOrName: number | string,
	params?: Params
): Promise<APIResponse<ResponsePhysicalLocation>>;
/**
 * Retrieves Physical Locations.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 */
export async function getPhysicalLocations(this: Client, params?: Params): Promise<APIResponse<Array<ResponsePhysicalLocation>>>;
/**
 * Retrieves Physical Locations.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param paramsOrIdentifier Either the name or ID of a single Physical Location
 * to retrieve, or optional settings for retrieving multiple Physical Locations.
 * @param params Any and all optional settings for the request. This is ignored
 * if options were passed in `paramsOrIdentifier`.
 * @returns The server's response.
 * @throws {APIError} if a single Physical Location is requested but Traffic Ops
 * responded with any number of Physical Locations other than 1.
 */
export async function getPhysicalLocations(
	this: Client,
	paramsOrIdentifier?: Params | number | string,
	params?: Params
): Promise<APIResponse<Array<ResponsePhysicalLocation> | ResponsePhysicalLocation>> {
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
	const resp = await this.apiGet<APIResponse<Array<ResponsePhysicalLocation>>>("phys_locations", p);
	if (single) {
		const physLoc = resp.data.response[0];
		const len = resp.data.response.length;
		if (!physLoc || len !== 1) {
			throw new APIError(`requesting Physical Location by identifier '${paramsOrIdentifier}' yielded ${len} results`, resp.status, resp.headers);
		}
		return {...resp.data, response: physLoc};
	}
	return resp.data;
}

/**
 * Creates a new Physical Location.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param physLoc The Physical Location to be created.
 * @returns The server's response.
 */
export async function createPhysicalLocation(
	this: Client,
	physLoc: RequestPhysicalLocation
): Promise<APIResponse<ResponsePhysicalLocation>> {
	return (await this.apiPost<APIResponse<ResponsePhysicalLocation>>("phys_locations", physLoc)).data;
}

/**
 * Replaces a Physical Location with the provided definition.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param id The ID of the Physical Location being updated.
 * @param physLoc The desired Physical Location definition.
 * @returns The server's response.
 */
export async function updatePhysicalLocation(id: number, physLoc: RequestPhysicalLocation): Promise<APIResponse<ResponsePhysicalLocation>>;
/**
 * Replaces a Physical Location with the provided definition.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param physLoc The full desired Physical Location definition.
 * @returns The server's response.
 */
export async function updatePhysicalLocation(physLoc: ResponsePhysicalLocation): Promise<APIResponse<ResponsePhysicalLocation>>;
/**
 * Replaces a Physical Location with the provided definition.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param physLocOrID The full desired Physical Location definition, or its ID.
 * @param physLoc The desired Physical Location definition. This is required if
 * `physLocOrID` was an ID, and ignored otherwise.
 * @returns The server's response.
 */
export async function updatePhysicalLocation(
	this: Client,
	physLocOrID: ResponsePhysicalLocation | number,
	physLoc?: RequestPhysicalLocation
): Promise<APIResponse<ResponsePhysicalLocation>> {
	let id, payload;
	if (typeof(physLocOrID) === "number") {
		id = physLocOrID;
		if (!physLoc) {
			throw new ClientError("updatePhysicalLocation", "physLoc");
		}
		payload = physLoc;
	} else {
		({id} = physLocOrID);
		payload = physLocOrID;
	}
	return (await this.apiPut<APIResponse<ResponsePhysicalLocation>>(`phys_locations/${id}`, payload)).data;
}

/**
 * Deletes a Physical Location.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param physLoc Either the Physical Location being deleted, or just its ID.
 * @returns The server's response.
 */
export async function deletePhysicalLocation(this: Client, physLoc: number | ResponsePhysicalLocation): Promise<APIResponse<undefined>> {
	const id = typeof(physLoc) === "number" ? physLoc : physLoc.id;
	return (await this.apiDelete(`phys_locations/${id}`)).data;
}
