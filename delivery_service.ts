import { APIResponse, RequestDeliveryService, ResponseDeliveryService } from "trafficops-types";

import { APIError, ClientError } from "./api.error.js";
import type { PaginationParams } from "./util";

import type { Client } from "./index";

/**
 * Creates a new Delivery Service.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param ds The Delivery Service to be created.
 * @returns The server's response. This is an array of exactly one Delivery
 * Service.
 * See [#6904]{@link https://github.com/apache/trafficcontrol/issues/6904}
 */
export async function createDeliveryService(this: Client, ds: RequestDeliveryService): Promise<APIResponse<[ResponseDeliveryService]>> {
	return (await this.apiPost<APIResponse<[ResponseDeliveryService]>>("deliveryservices", ds)).data;
}

/**
 * Replaces an existing Delivery Service with the provided definition.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param dsOrID The Delivery Service's new definition, or the ID of the
 * Delivery Service being modified.
 * @param ds The Delivery Service's new definition. This is required if `dsOrID`
 * is an ID, and ignored otherwise.
 * @returns The server's response. This is an array of exactly one Delivery
 * Service.
 * See [#6904]{@link https://github.com/apache/trafficcontrol/issues/6904}
 */
export async function updateDeliveryService(this: Client, ds: ResponseDeliveryService): Promise<APIResponse<[ResponseDeliveryService]>>;
/**
 * Replaces an existing Delivery Service with the provided definition.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param dsOrID The Delivery Service's new definition, or the ID of the
 * Delivery Service being modified.
 * @param ds The Delivery Service's new definition. This is required if `dsOrID`
 * is an ID, and ignored otherwise.
 * @returns The server's response. This is an array of exactly one Delivery
 * Service.
 * See [#6904]{@link https://github.com/apache/trafficcontrol/issues/6904}
 */
export async function updateDeliveryService(
	this: Client,
	id: number,
	ds: RequestDeliveryService
): Promise<APIResponse<[ResponseDeliveryService]>>;
/**
 * Replaces an existing Delivery Service with the provided definition.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param dsOrID The Delivery Service's new definition, or the ID of the
 * Delivery Service being modified.
 * @param ds The Delivery Service's new definition. This is required if `dsOrID`
 * is an ID, and ignored otherwise.
 * @returns The server's response. This is an array of exactly one Delivery
 * Service.
 * See [#6904]{@link https://github.com/apache/trafficcontrol/issues/6904}
 */
export async function updateDeliveryService(
	this: Client,
	dsOrID: number | ResponseDeliveryService,
	ds?: RequestDeliveryService
): Promise<APIResponse<[ResponseDeliveryService]>> {
	let id, payload;
	if (typeof(dsOrID) === "number") {
		if (!ds) {
			throw new ClientError("updateDeliveryService", "ds");
		}
		id = dsOrID;
		payload = ds;
	} else {
		({id} = dsOrID);
		payload = dsOrID;
	}
	return (await this.apiPut<APIResponse<[ResponseDeliveryService]>>(`deliveryservices/${id}`, payload)).data;
}

/**
 * Optional settings that can be used to change the behavior and/or result set
 * of {@link getDeliveryServices}.
 */
type Params = PaginationParams & {
	/**
	 * Return only the Delivery Services belonging to the CDN identified by this
	 * integral, unique identifier.
	 */
	cdn?: number;
	/**
	 * Return only the Delivery Service that has this integral, unique
	 * identifier.
	 */
	id?: number;
	/**
	 * Return only the Delivery Services that have Logs Enabled set or not based
	 * on this boolean.
	 */
	logsEnabled?: boolean;
	/** Return only Delivery Services using the Profile that has this ID. */
	profile?: number;
	/**
	 * Return only the Delivery Services belonging to the Tenant identified by
	 * this integral, unique identifier.
	 */
	tenant?: number;
	/**
	 * Return only the Delivery Services assigned to the Topology identified by
	 * this unique name.
	 */
	topology?: string;
	/**
	 * Return only Delivery Services of the Delivery Service Type identified by
	 * this integral, unique identifier.
	 */
	type?: number;
	/**
	 * Return the Delivery Services accessible from a Tenant or it’s children
	 * identified by this integral, unique identifier.
	 */
	accessibleTo?: number;
	/**
	 * Return only the Delivery Services belonging to the Service Category that
	 * has this name.
	 */
	serviceCategory?: string;
	/**
	 * Return only the Delivery Service that has this text-based, unique
	 * identifier.
	 */
	xmlId?: string;
	/**
	 * Choose the ordering of the results - must be the name of one of the
	 * fields of the objects in the response.
	 */
	orderby?: "cdn" | "id" | "logsEnabled" | "profile" | "tenant" | "xmlId" | "serviceCategory" | "active" | "topology" | "type";
	/**
	 * Return only the Delivery Services that have Active set or not based on
	 * this boolean (whether or not they are active).
	 */
	active?: boolean;
};

/**
 * Retrieves Delivery Services.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 * @throws {APIError} If a single Delivery Service is requested and Traffic Ops
 * responds with any amount of Delivery Services besides 1.
 */
export async function getDeliveryServices(this: Client, params?: Params): Promise<APIResponse<Array<ResponseDeliveryService>>>;
/**
 * Retrieves a single Delivery Service.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param identifier Either the XMLID or the ID of the desired Delivery Service.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 * @throws {APIError} If a single Delivery Service is requested and Traffic Ops
 * responds with any amount of Delivery Services besides 1.
 */
export async function getDeliveryServices(
	this: Client,
	identifier: string | number,
	params?: Params
): Promise<APIResponse<ResponseDeliveryService>>;
/**
 * Retrieves Delivery Services.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param paramsOrIdentifier Either an identifier of a single Delivery Service
 * to fetch (XMLID or ID) or any and all optional settings for the request.
 * @param params Any and all optional settings for the request. This is ignored
 * if options are set by `paramsOrIdentifier`.
 * @returns The server's response.
 * @throws {APIError} If a single Delivery Service is requested and Traffic Ops
 * responds with any amount of Delivery Services besides 1.
 */
export async function getDeliveryServices(
	this: Client,
	paramsOrIdentifier?: string | number | Params,
	params?: Params
): Promise<APIResponse<Array<ResponseDeliveryService> | ResponseDeliveryService>> {
	let p;
	let single = false;
	switch(typeof(paramsOrIdentifier)) {
		case "number":
			p = {...params, id: paramsOrIdentifier};
			single = true;
			break;
		case "string":
			p = {...params, xmlId: paramsOrIdentifier};
			single = true;
			break;
		default:
			p = params;
	}
	const resp = await this.apiGet<APIResponse<Array<ResponseDeliveryService>>>("deliveryservices", p);
	if (single) {
		const len = resp.data.response.length;
		const ds = resp.data.response[0];
		if (!ds || len !== 1) {
			throw new APIError(`requesting Delivery Service by identifier '${paramsOrIdentifier}' yielded ${len} results`, resp.status, resp.headers);
		}
		return {...resp.data, response: ds};
	}
	return resp.data;
}

/**
 * Deletes a Delivery Service.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param ds Either the Delivery Service to be deleted, or its ID.
 * @returns The server's response.
 */
export async function deleteDeliveryService(this: Client, ds: ResponseDeliveryService | number): Promise<APIResponse<undefined>> {
	const id = typeof(ds) === "number" ? ds : ds.id;
	return (await this.apiDelete(`deliveryservices/${id}`)).data;
}