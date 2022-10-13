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
	DSSafeUpdateRequest,
	RequestDeliveryService,
	RequestDeliveryServiceRegexp,
	RequestDeliveryServiceRequiredCapability,
	RequestDeliveryServiceRequiredCapabilityResponse,
	RequestDeliveryServiceServer,
	RequestServiceCategory,
	RequestStaticDNSEntry,
	RequestStaticDNSEntryResponse,
	ResponseDeliveryService,
	ResponseDeliveryServiceRegexp,
	ResponseDeliveryServiceRequiredCapability,
	ResponseDeliveryServiceServer,
	ResponseServer,
	ResponseServerCapability,
	ResponseServiceCategory,
	ResponseStaticDNSEntry,
	ServerCapability,
	ServiceCategory
} from "trafficops-types";

import { APIError, ClientError } from "./api.error.js";
import { getSingleResponse, isIDArray, type PaginationParams } from "./util.js";

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
 * Gets the URL Signing Keys used by a Delivery Service.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param ds The Delivery Service for which URL Signing Keys will be fetched.
 * @returns The server's response.
 */
export async function getDeliveryServiceURLSigningKeys(
	this: Client,
	ds: number | ResponseDeliveryService
): Promise<DSURLSigningKeysResponse> {
	const id = typeof(ds) === "number" ? ds : ds.id;
	return (await this.apiGet<DSURLSigningKeysResponse>(`deliveryservices/${id}/urlkeys`)).data;
}

/**
 * Optional settings that can be used to change the behavior and/or result set
 * of {@link getDeliveryServicesRequiredCapabilities}.
 */
type DSRCParams = PaginationParams & {
	deliveryServiceID?: number;
	orderBy?: "deliveryServiceID" | "requiredCapability" | "xmlID";
	requiredCapability?: string;
	xmlID?: string;
};

/**
 * Checks if an argument to `getDeliveryServiceRequiredCapabilities` is a
 * ResponseDeliveryService or just request parameters, or if an argument to
 * `addCapabilityRequirementToDeliveryService` is a full Delivery Service
 * Required Capability Request or a `ResponseDeliveryService`.
 *
 * @param x The object being tested.
 * @returns `true` if `x` is a `ResponseDeliveryService`, `false` otherwise.
 */
function isDS(
	x: DSRCParams | ResponseDeliveryService | RequestDeliveryServiceRequiredCapability | RequestDeliveryServiceServer
): x is ResponseDeliveryService {
	return Object.prototype.hasOwnProperty.call(x, "id");
}

/**
 * Gets a list of the Capabilities required by a given Delivery Service.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param ds The Delivery Service (or ID of a Delivery Service) for which
 * required Capabilities will be fetched.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 */
export async function getDeliveryServicesRequiredCapabilities(
	this: Client,
	ds: number | string | ResponseDeliveryService,
	params?: DSRCParams
): Promise<APIResponse<Array<ResponseDeliveryServiceRequiredCapability>>>;
/**
 * Gets a list of the Capabilities required by all existing Delivery Services.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 */
export async function getDeliveryServicesRequiredCapabilities(
	this: Client,
	params?: DSRCParams
): Promise<APIResponse<Array<ResponseDeliveryServiceRequiredCapability>>>;
/**
 * Gets a list of the Capabilities required by Delivery Services.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param dsOrParams The single Delivery Service for which required Capabilities
 * will be fetched - or its ID or XMLID.
 * @param params Any and all optional settings for the request. This is ignored
 * if `dsOrParams` is a list of parameters.
 * @returns The server's response.
 */
export async function getDeliveryServicesRequiredCapabilities(
	this: Client,
	dsOrParams?: number | string | DSRCParams | ResponseDeliveryService,
	params?: DSRCParams
): Promise<APIResponse<Array<ResponseDeliveryServiceRequiredCapability>>> {
	let p;
	switch (typeof(dsOrParams)) {
		case "string":
			p = {...params, xmlID: dsOrParams};
			break;
		case "number":
			p = {...params, deliveryServiceID: dsOrParams};
			break;
		case "undefined":
			p = params;
			break;
		default:
			if (isDS(dsOrParams)) {
				p = {...params, deliveryServiceID: dsOrParams.id};
			} else {
				p = dsOrParams;
			}
	}

	const resp = await this.apiGet<APIResponse<Array<ResponseDeliveryServiceRequiredCapability>>>(
		"deliveryservices_required_capabilities",
		p
	);
	return resp.data;
}

/**
 * Adds a Capability as a requirement of a Delivery Service.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param dsrc The full Capability-Requirement-to-Delivery-Service request
 * definition.
 * @returns The server's response.
 */
export async function addCapabilityRequirementToDeliveryService(
	this: Client,
	dsrc: RequestDeliveryServiceRequiredCapability
): Promise<APIResponse<RequestDeliveryServiceRequiredCapabilityResponse>>;
/**
 * Adds a Capability as a requirement of a Delivery Service.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param ds The single Delivery Service to which a required Capability
 * will be added - or its ID.
 * @param cap The Capability being assigned as a requirement of a Delivery
 * Service, or just its name.
 * @returns The server's response.
 */
export async function addCapabilityRequirementToDeliveryService(
	this: Client,
	ds: number | ResponseDeliveryService,
	cap: string | ResponseServerCapability
): Promise<APIResponse<RequestDeliveryServiceRequiredCapabilityResponse>>;
/**
 * Adds a Capability as a requirement of a Delivery Service.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param dsOrDSRC The single Delivery Service to which a required Capability
 * will be added - or its ID - or the full
 * Capability-Requirement-to-Delivery-Service request definition.
 * @param cap The Capability being assigned as a requirement of a Delivery
 * Service, or just its name. This is ignored if `dsOrDSRC` was a full request
 * definition, and required otherwise.
 * @returns The server's response.
 */
export async function addCapabilityRequirementToDeliveryService(
	this: Client,
	dsOrDSRC: number | ResponseDeliveryService | RequestDeliveryServiceRequiredCapability,
	cap?: string | ServerCapability
): Promise<APIResponse<RequestDeliveryServiceRequiredCapabilityResponse>> {
	let dsID;
	let capName;
	if (typeof(dsOrDSRC) === "number") {
		dsID = dsOrDSRC;
		if (!cap) {
			throw new ClientError("addCapabilityRequirementToDeliveryService", "cap");
		}
		capName = typeof(cap) === "string" ? cap : cap.name;
	} else if (isDS(dsOrDSRC)) {
		dsID = dsOrDSRC.id;
		if (!cap) {
			throw new ClientError("addCapabilityRequirementToDeliveryService", "cap");
		}
		capName = typeof(cap) === "string" ? cap : cap.name;
	} else {
		dsID = dsOrDSRC.deliveryServiceID;
		capName = dsOrDSRC.requiredCapability;
	}

	const payload = {
		deliveryServiceID: dsID,
		requiredCapability: capName
	};
	const resp = await this.apiPost<APIResponse<RequestDeliveryServiceRequiredCapabilityResponse>>(
		"deliveryservices_required_capabilities",
		payload
	);
	return resp.data;
}

/**
 * Removes the requirement of a Capability from a Delivery Service.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param dsrc The full Capability-Requirement-to-Delivery-Service removal
 * request definition.
 * @returns The server's response.
 */
export async function removeCapabilityRequirementFromDeliveryService(
	this: Client,
	dsrc: RequestDeliveryServiceRequiredCapability
): Promise<APIResponse<undefined>>;
/**
 * Removes the requirement of a Capability from a Delivery Service.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param ds The single Delivery Service from which a required Capability
 * will be removed - or its ID.
 * @param cap The Capability being removed as a requirement from a Delivery
 * Service, or just its name.
 * @returns The server's response.
 */
export async function removeCapabilityRequirementFromDeliveryService(
	this: Client,
	ds: number | ResponseDeliveryService,
	cap: string | ResponseServerCapability
): Promise<APIResponse<undefined>>;
/**
 * Removes the requirement of a Capability from a Delivery Service.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param dsOrDSRC The single Delivery Service from which a required Capability
 * will be removed - or its ID - or the full
 * Capability-Requirement-to-Delivery-Service removal request definition.
 * @param cap The Capability being removed as a requirement from a Delivery
 * Service, or just its name. This is ignored if `dsOrDSRC` was a full request
 * definition, and required otherwise.
 * @returns The server's response.
 */
export async function removeCapabilityRequirementFromDeliveryService(
	this: Client,
	dsOrDSRC: number | ResponseDeliveryService | RequestDeliveryServiceRequiredCapability,
	cap?: string | ServerCapability
): Promise<APIResponse<undefined>> {
	let dsID;
	let capName;
	if (typeof(dsOrDSRC) === "number") {
		dsID = dsOrDSRC;
		if (!cap) {
			throw new ClientError("addCapabilityRequirementToDeliveryService", "cap");
		}
		capName = typeof(cap) === "string" ? cap : cap.name;
	} else if (isDS(dsOrDSRC)) {
		dsID = dsOrDSRC.id;
		if (!cap) {
			throw new ClientError("addCapabilityRequirementToDeliveryService", "cap");
		}
		capName = typeof(cap) === "string" ? cap : cap.name;
	} else {
		dsID = dsOrDSRC.deliveryServiceID;
		capName = dsOrDSRC.requiredCapability;
	}

	const payload = {
		deliveryServiceID: dsID,
		requiredCapability: capName
	};
	return (await this.apiDelete("deliveryservices_required_capabilities", payload)).data;
}

/**
 * Assigns servers to a Delivery Service, optionally overriding all existing
 * such assignments.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param req An entire `deliveryserviceserver` request.
 * @returns The server's response.
 */
export async function assignServersToDeliveryService(
	this: Client,
	req: RequestDeliveryServiceServer
): Promise<APIResponse<RequestDeliveryServiceServer>>;
/**
 * Assigns servers to a Delivery Service, optionally overriding all existing
 * such assignments.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param ds Either a Delivery Service or identifier thereof to which the
 * servers given in `servers` will be assigned.
 * @param servers An array of servers or server IDs to assign to the Delivery
 * Service given by `ds`. Note that when this is an empty array and `replace` is
 * set to `true`, this method can also be used to remove all server assignments
 * from the passed Delivery Service.
 * @param replace If given and `true`, all existing assignments of servers to
 * the given Delivery Service will be overwritten with those provided.
 * @returns The server's response.
 */
export async function assignServersToDeliveryService(
	this: Client,
	ds: number | ResponseDeliveryService,
	servers: Array<number> | Array<ResponseServer>,
	replace?: boolean
): Promise<APIResponse<RequestDeliveryServiceServer>>;
/**
 * Assigns servers to a Delivery Service, optionally overriding all existing
 * such assignments.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param dsOrReq Either an entire `deliveryserviceserver` request, or a
 * Delivery Service or identifier thereof to which the servers given in
 * `servers` will be assigned.
 * @param servers An array of servers or server IDs to assign to the Delivery
 * Service given by `dsOrReq`. This is required if `dsOrReq` is a Delivery
 * Service or an identifier thereof, and ignored otherwise. Note that when this
 * is an empty array and `replace` is set to `true`, this method can also be
 * used to remove all server assignments from the passed Delivery Service.
 * @param replace If given and `true`, all existing assignments of servers to
 * the given Delivery Service will be overwritten with those provided. This is
 * ignored unless `dsOrReq` is a Delivery Service or an identifier thereof.
 * @returns The server's response.
 */
export async function assignServersToDeliveryService(
	this: Client,
	dsOrReq: number | ResponseDeliveryService | RequestDeliveryServiceServer,
	servers?: Array<number> | Array<ResponseServer>,
	replace: boolean = false
): Promise<APIResponse<RequestDeliveryServiceServer>> {
	let req;
	let dsId;

	if (typeof(dsOrReq) === "number") {
		dsId = dsOrReq;
	} else if (isDS(dsOrReq)) {
		dsId = dsOrReq.id;
	} else {
		req = dsOrReq;
	}

	if (dsId !== undefined) {
		if (!servers) {
			throw new ClientError("assignServersToDeliveryService", "servers");
		}
		if (isIDArray(servers)) {
			req = {
				dsId,
				replace,
				servers
			};
		} else {
			req = {
				dsId,
				replace,
				servers: servers.map(s => s.id)
			};
		}

	}

	return (await this.apiPost<APIResponse<RequestDeliveryServiceServer>>("deliveryserviceserver", req)).data;
}

/**
 * A set of optional settings that effect the output/behavior of
 * {@link getAllDeliveryServiceServerAssignments}.
 */
type DSServerParams = PaginationParams & {
	cdn?: string;
	orderby?: "lastUpdated" | "deliveryService" | "server";
};

/**
 * The type of responses from the API to GET requests made to
 * `deliveryserviceserver`, which are non-standard for unknown reasons.
 */
interface DSServerResponse extends APIResponse<ResponseDeliveryServiceServer> {
	limit: number;
	orderby: "lastUpdated" | "deliveryService" | "server";
	size: number;
}

/**
 * Retrieves information about server-to-Delivery Service relationships across
 * **all** Delivery Services (optionally limited by CDN).
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 */
export async function getAllDeliveryServiceServerAssignments(this: Client, params?: DSServerParams): Promise<DSServerResponse> {
	return (await this.apiGet<DSServerResponse>("deliveryserviceserver", params)).data;
}

/**
 * Removes an assigned server from a given Delivery Service.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param ds The Delivery Service from which an assigned server will be removed,
 * or just its ID.
 * @param server The server being removed from a Delivery Service, or just its
 * ID.
 * @returns The server's response.
 */
export async function removeServerFromDeliveryService(
	this: Client,
	ds: number | ResponseDeliveryService,
	server: number | ResponseServer
): Promise<APIResponse<undefined>> {
	const dsID = typeof(ds) === "number" ? ds : ds.id;
	const serverID = typeof(server) === "number" ? server : server.id;
	return (await this.apiDelete(`deliveryserviceserver/${dsID}/${serverID}`)).data;
}

/**
 * Creates a new Delivery Service Category.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param category The Category to create, or just its name since that's all
 * that comprises a Service Category.
 * @returns The server's response.
 */
export async function createServiceCategory(
	this: Client,
	category: RequestServiceCategory | string
): Promise<APIResponse<ResponseServiceCategory>> {
	if (typeof(category) === "string") {
		category = {name: category};
	}
	return (await this.apiPost<APIResponse<ResponseServiceCategory>>("service_categories", category)).data;
}

/**
 * Optional settings that affect the behavior/output of
 * {@link getServiceCategories}.
 */
type CategoryParams = PaginationParams & {
	name?: string;
	orderby?: "name" | "lastUpdated";
};

/**
 * Retrieves Delivery Service Categories from Traffic Ops.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 */
export async function getServiceCategories(this: Client, params?: CategoryParams): Promise<APIResponse<Array<ResponseServiceCategory>>> {
	return (await this.apiGet<APIResponse<Array<ResponseServiceCategory>>>("service_categories", params)).data;
}

/**
 * Deletes a given Delivery Service Category.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param category The Category to delete, or just its name.
 * @returns The server's response.
 */
export async function deleteServiceCategory(this: Client, category: ServiceCategory | string): Promise<APIResponse<undefined>> {
	const name = typeof(category) === "string" ? category : category.name;
	return (await this.apiDelete(`service_categories/${name}`)).data;
}

/**
 * Creates a new Static DNS Entry.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param dnsEntry The Static DNS Entry to create.
 * @returns The server's response.
 */
export async function createStaticDNSEntry(
	this: Client,
	dnsEntry: RequestStaticDNSEntry
): Promise<APIResponse<RequestStaticDNSEntryResponse>> {
	return (await this.apiPost<APIResponse<RequestStaticDNSEntryResponse>>("staticdnsentries", dnsEntry)).data;
}

/**
 * Replaces an existing Static DNS Entry with the new definition provided.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param id The ID of the Static DNS Entry to be updated.
 * @param dnsEntry The new, desired definition of the Static DNS Entry
 * identified by `id`.
 * @returns The server's response.
 */
export async function updateStaticDNSEntry(
	this: Client,
	id: number,
	dnsEntry: RequestStaticDNSEntry
): Promise<APIResponse<RequestStaticDNSEntryResponse>>;
/**
 * Replaces an existing Static DNS Entry with the new definition provided.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param dnsEntry The full, new, desired definition of the Static DNS Entry.
 * @returns The server's response.
 */
export async function updateStaticDNSEntry(
	this: Client,
	dnsEntry: ResponseStaticDNSEntry | RequestStaticDNSEntryResponse
): Promise<APIResponse<RequestStaticDNSEntryResponse>>;
/**
 * Replaces an existing Static DNS Entry with the new definition provided.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param dnsEntryOrID Either the full, new, desired definition of the Static
 * DNS Entry, or just its ID.
 * @param dnsEntry The new, desired definition of the Static DNS Entry
 * identified by `dnsEntryOrID`. This is required if `dnsEntryOrID` is an ID,
 * and ignored otherwise.
 * @returns The server's response.
 */
export async function updateStaticDNSEntry(
	this: Client,
	dnsEntryOrID: number | ResponseStaticDNSEntry | RequestStaticDNSEntryResponse,
	dnsEntry?: RequestStaticDNSEntry
): Promise<APIResponse<RequestStaticDNSEntryResponse>> {
	let body;
	let id;
	if (typeof(dnsEntryOrID) === "number") {
		if (!dnsEntry) {
			throw new ClientError("updateStaticDNSEntry", "dnsEntry");
		}
		id = dnsEntryOrID;
		body = dnsEntry;
	} else {
		body = dnsEntryOrID;
		({id} = dnsEntryOrID);
	}
	return (await this.apiPut<APIResponse<RequestStaticDNSEntryResponse>>("staticdnsentries", body, {id})).data;
}

/**
 * Optional settings that affect the behavior/output of
 * {@link getStaticDNSEntries}.
 */
type StaticDNSParams = PaginationParams & {
	address?: string;
	cachegroup?: string;
	cachegroupId?: number;
	/** XMLID */
	deliveryservice?: string;
	deliveryserviceId?: number;
	host?: string;
	id?: number;
	orderby?: Exclude<keyof(ResponseStaticDNSEntry), "lastUpdated">;
	type?: string;
	typeId?: number;
};

/**
 * Retrieves a single Static DNS Entry from Traffic Ops.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param id The ID of a single Static DNS Entry to be retrieved.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 * @throws {APIError} when Traffic Ops responds with any number of Static DNS
 * Entries other than exactly one.
 */
export async function getStaticDNSEntries(
	this: Client,
	id: number,
	params?: StaticDNSParams
): Promise<APIResponse<ResponseStaticDNSEntry>>;
/**
 * Retrieves Static DNS Entries from Traffic Ops.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 */
export async function getStaticDNSEntries(
	this: Client,
	params?: StaticDNSParams
): Promise<APIResponse<Array<ResponseStaticDNSEntry>>>;
/**
 * Retrieves one or more Static DNS Entries from Traffic Ops.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param paramsOrID Either the ID of a single Static DNS Entry to be retrieved,
 * or any and all optional settings for the request when fetching multiple.
 * @param params Any and all optional settings for the request. This is ignored
 * unless `paramsOrID` is an ID.
 * @returns The server's response.
 */
export async function getStaticDNSEntries(
	this: Client,
	paramsOrID?: number | StaticDNSParams,
	params?: StaticDNSParams
): Promise<APIResponse<ResponseStaticDNSEntry | Array<ResponseStaticDNSEntry>>> {
	if (typeof(paramsOrID) === "number") {
		const p = {...params, id: paramsOrID};
		const resp = await this.apiGet<APIResponse<[ResponseStaticDNSEntry]>>("staticdnsentries", p);
		return getSingleResponse(resp, "Static DNS Entry", paramsOrID);
	}
	return (await this.apiGet<APIResponse<Array<ResponseStaticDNSEntry>>>("staticdnsentries", params)).data;
}

/**
 * Deletes a given Static DNS Entry.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param dnsEntry The Static DNS Entry to be deleted, or just its ID.
 * @returns The server's response.
 */
export async function deleteStaticDNSEntry(
	this: Client,
	dnsEntry: number | ResponseStaticDNSEntry | RequestStaticDNSEntryResponse
): Promise<APIResponse<undefined>> {
	const id = typeof(dnsEntry) === "number" ? dnsEntry : dnsEntry.id;
	return (await this.apiDelete("staticdnsentries", {id})).data;
}
