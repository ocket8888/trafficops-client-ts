import type {
	APIResponse,
	DSSafeUpdateRequest,
	RequestDeliveryService,
	RequestDeliveryServiceRegexp,
	ResponseDeliveryService,
	ResponseDeliveryServiceRegexp,
	ResponseServer
} from "trafficops-types";

import { APIError, ClientError } from "./api.error.js";
import { getSingleResponse, type PaginationParams } from "./util.js";

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

/**
 * Updates the "safe" fields of a Delivery Service.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param dsOrID The full Delivery Service definition as it will be after
 * updating ("unsafe" changes are stripped).
 * @returns The server's response.
 */
export async function safeUpdateDeliveryService(this: Client, ds: ResponseDeliveryService): Promise<APIResponse<[ResponseDeliveryService]>>;
/**
 * Updates the "safe" fields of a Delivery Service.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param id The ID of the Delivery Service being updated.
 * @param ds The "safe" details of the Delivery Service as they will be after
 * updating.
 * @returns The server's response.
 */
export async function safeUpdateDeliveryService(
	this: Client,
	id: number,
	ds: DSSafeUpdateRequest
): Promise<APIResponse<[ResponseDeliveryService]>>;
/**
 * Updates the "safe" fields of a Delivery Service.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param dsOrID The full Delivery Service definition as it will be after
 * updating ("unsafe" changes are stripped), or just its ID.
 * @param ds The "safe" details of the Delivery Service as they will be after
 * updating. This is required if `dsOrID` is an ID, and ignored otherwise.
 * @returns The server's response.
 */
export async function safeUpdateDeliveryService(
	this: Client,
	dsOrID: ResponseDeliveryService | number,
	ds?: DSSafeUpdateRequest
): Promise<APIResponse<[ResponseDeliveryService]>> {
	let id: number;
	let p: DSSafeUpdateRequest;
	if (typeof(dsOrID) === "number") {
		id = dsOrID;
		if (!ds) {
			throw new ClientError("safeUpdateDeliveryService", "ds");
		}
		p = ds;
	} else {
		id = dsOrID.id;
		p = {
			displayName: dsOrID.displayName,
			infoUrl: dsOrID.infoUrl,
			longDesc: dsOrID.longDesc,
			longDesc1: dsOrID.longDesc1
		};
	}

	return (await this.apiPut<APIResponse<[ResponseDeliveryService]>>(`deliveryservices/${id}/safe`, p)).data;
}

/**
 * Retrieves servers assigned to a given Delivery Service.
 *
 * @param this Tells TypeScript that this is a Client.
 * @param ds The Delivery Service for which server assignments will be fetched,
 * or its ID.
 * @returns The server's response.
 */
export async function getDeliveryServiceServers(
	this: Client,
	ds: number | ResponseDeliveryService
): Promise<APIResponse<Array<ResponseServer>>> {
	let id;
	switch (typeof(ds)) {
		case "number":
			id = ds;
			break;
		default:
			id = ds.id;
	}
	return (await this.apiGet<APIResponse<Array<ResponseServer>>>(`deliveryservices/${id}/servers`)).data;
}

/**
 * Retrieves servers which are not currently but may be assigned to a given
 * Delivery Service.
 *
 * @param this Tells TypeScript that this is a Client.
 * @param ds The Delivery Service for which eligible server assignments will be
 * fetched, or its ID.
 * @returns The server's response.
 */
export async function getDeliveryServiceEligibleServers(
	this: Client,
	ds: number | ResponseDeliveryService
): Promise<APIResponse<Array<ResponseServer>>> {
	let id;
	switch (typeof(ds)) {
		case "number":
			id = ds;
			break;
		default:
			id = ds.id;
	}
	return (await this.apiGet<APIResponse<Array<ResponseServer>>>(`deliveryservices/${id}/servers/eligible`)).data;
}

/**
 * Retrieves the Routing Regular Expressions for a given Delivery Service.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param ds The Delivery Service for which Routing Expressions will be fetched,
 * or its ID.
 * @param params Any and all optional settings for the request
 * @returns The server's response.
 */
export async function getDeliveryServiceRoutingExpressions(
	this: Client,
	ds: number | ResponseDeliveryService,
	params?: PaginationParams
): Promise<APIResponse<Array<ResponseDeliveryServiceRegexp>>>;
/**
 * Retrieves a single Routing Regular Expressions for a given Delivery Service.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param ds The Delivery Service for which Routing Expressions will be fetched,
 * or its ID.
 * @param id The ID of a single Routing Expression to fetch.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 */
export async function getDeliveryServiceRoutingExpressions(
	this: Client,
	ds: number | ResponseDeliveryService,
	id: number,
	params?: PaginationParams
): Promise<APIResponse<ResponseDeliveryServiceRegexp>>;
/**
 * Retrieves the Routing Regular Expressions for a given Delivery Service.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param ds The Delivery Service for which Routing Expressions will be fetched,
 * or its ID.
 * @param idOrParams Either the ID of a single Routing Expression to fetch, or
 * any and all optional settings for the request when requesting multiple
 * Routing Expressions.
 * @param params Any and all optional settings for the request. This is ignored
 * unless `idOrParams` is an ID.
 * @returns The server's response.
 */
export async function getDeliveryServiceRoutingExpressions(
	this: Client,
	ds: number | ResponseDeliveryService,
	idOrParams?: number | PaginationParams,
	params?: PaginationParams
): Promise<APIResponse<Array<ResponseDeliveryServiceRegexp> | ResponseDeliveryServiceRegexp>> {
	let p;
	let single = false;
	if (typeof(idOrParams) === "number") {
		p = {...params, id: idOrParams};
		single = true;
	} else {
		p = idOrParams;
	}

	const id = typeof(ds) === "number" ? ds : ds.id;
	const resp = await this.apiGet<APIResponse<Array<ResponseDeliveryServiceRegexp>>>(`deliveryservices/${id}/regexes`);

	if (single) {
		return getSingleResponse(resp, "DS routing expression", (p as {id: number}).id);
	}
	return resp.data;
}

/**
 * Replaces one of a Delivery Service's Routing Regular Expressions with the new
 * definition of a Routing Regular Expression provided.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param ds The Delivery Service to which the Routing Expression being modified
 * belongs, or just its ID.
 * @param exp The full new Routing Expression definition.
 * @returns The server's response.
 */
export async function updateDeliveryServiceRoutingExpression(
	this: Client,
	ds: number | ResponseDeliveryService,
	exp: ResponseDeliveryServiceRegexp,
): Promise<APIResponse<ResponseDeliveryServiceRegexp>>;
/**
 * Replaces one of a Delivery Service's Routing Regular Expressions with the new
 * definition of a Routing Regular Expression provided.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param ds The Delivery Service to which the Routing Expression being modified
 * belongs, or just its ID.
 * @param id The ID of the Routing Expression being replaced.
 * @param exp The new Routing Expression definition.
 * @returns The server's response.
 */
export async function updateDeliveryServiceRoutingExpression(
	this: Client,
	ds: number | ResponseDeliveryService,
	id: number,
	exp: RequestDeliveryServiceRegexp
): Promise<APIResponse<ResponseDeliveryServiceRegexp>>;
/**
 * Replaces one of a Delivery Service's Routing Regular Expressions with the new
 * definition of a Routing Regular Expression provided.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param ds The Delivery Service to which the Routing Expression being modified
 * belongs, or just its ID.
 * @param idOrExp Either the full new definition of the Routing Expression, or
 * just its ID.
 * @param exp The new Routing Expression definition. This is required if
 * `expOrID` is an ID, and ignored otherwise.
 * @returns The server's response.
 */
export async function updateDeliveryServiceRoutingExpression(
	this: Client,
	ds: number | ResponseDeliveryService,
	idOrExp: number | ResponseDeliveryServiceRegexp,
	exp?: RequestDeliveryServiceRegexp
): Promise<APIResponse<ResponseDeliveryServiceRegexp>> {
	const id = typeof(ds) === "number" ? ds : ds.id;
	let rid, p;
	if (typeof(idOrExp) === "number") {
		if (!exp) {
			throw new ClientError("updateDeliveryServiceRoutingExpression", "exp");
		}
		rid = idOrExp;
		p = exp;
	} else {
		rid = idOrExp.id;
		p = idOrExp;
	}
	return (await this.apiPut<APIResponse<ResponseDeliveryServiceRegexp>>(`deliveryservices/${id}/regexes/${rid}`, p)).data;
}

/**
 * Removes a Routing Regular Expressions from a Delivery Service.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param ds The Delivery Service to which a Routing Expression will be added,
 * or its ID.
 * @param exp The Routing Expression being removed, or just its ID.
 * @returns The server's response.
 */
export async function removeDeliveryServiceRoutingExpression(
	this: Client,
	ds: number | ResponseDeliveryService,
	exp: number | ResponseDeliveryServiceRegexp
): Promise<APIResponse<undefined>> {
	const id = typeof(ds) === "number" ? ds : ds.id;
	const rid = typeof(exp) === "number" ? exp : exp.id;
	return (await this.apiDelete(`deliveryservices/${id}/regexes/${rid}`)).data;
}

/**
 * Adds a new Routing Regular Expressions to the given Delivery Service.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param ds The Delivery Service to which a Routing Expression will be added.
 * @param exp The new Routing Expression being added.
 * @returns The server's response.
 */
export async function addDeliveryServiceRoutingExpression(
	this: Client,
	ds: number | ResponseDeliveryService,
	exp: RequestDeliveryServiceRegexp
): Promise<APIResponse<ResponseDeliveryServiceRegexp>> {
	const id = typeof(ds) === "number" ? ds : ds.id;
	return (await this.apiPost<APIResponse<ResponseDeliveryServiceRegexp>>(`deliveryservices/${id}/regexes`, exp)).data;
}

/**
 * A convenient alias for the type of a response from
 * `/deliveryservices/{{ID}}/urlkeys`.
 */
type DSURLSigningKeysResponse = APIResponse<Record<`key${number}`, string>>;

/**
 * Adds a new Routing Regular Expressions to the given Delivery Service.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param ds The Delivery Service to which a Routing Expression will be added.
 * @returns The server's response.
 */
export async function getDeliveryServiceURLSigningKeys(
	this: Client,
	ds: number | ResponseDeliveryService
): Promise<DSURLSigningKeysResponse> {
	const id = typeof(ds) === "number" ? ds : ds.id;
	return (await this.apiGet<DSURLSigningKeysResponse>(`deliveryservices/${id}/urlkeys`)).data;
}
