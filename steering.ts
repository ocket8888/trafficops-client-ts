import type {
	APIResponse,
	RequestSteeringTarget,
	ResponseDeliveryService,
	ResponseSteeringTarget,
	SteeringConfiguration,
	SteeringTargetCreationRequest,
	SteeringTargetModificationRequest,
	TypeFromResponse
} from "trafficops-types";

import { ClientError } from "./api.error.js";
import type { PaginationParams } from "./util";

import type { Client } from "./index";

/**
 * Gets a list of all Steering Targets in the Traffic Ops database.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @returns The server's response.
 */
export async function getAllSteeringMappings(this: Client): Promise<APIResponse<Array<SteeringConfiguration>>> {
	return (await this.apiGet<APIResponse<Array<SteeringConfiguration>>>("steering")).data;
}

/**
 * Optional settings that affect the output/behavior of {@link getTargets}.
 */
type Params = PaginationParams & {
	orderby?: "target";
	target?: string;
};

/**
 * Gets the targets of a given Delivery Service.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param ds The Steering Delivery Service for which to fetch Targets, or just
 * its ID.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 */
export async function getTargets(
	this: Client,
	ds: number | ResponseDeliveryService,
	params?: Params
): Promise<APIResponse<Array<ResponseSteeringTarget>>> {
	const id = typeof(ds) === "number" ? ds : ds.id;
	return (await this.apiGet<APIResponse<Array<ResponseSteeringTarget>>>(`steering/${id}/targets`, params)).data;
}

/**
 * Checks if an argument to {@link addTarget} is a
 * {@link SteeringTargetCreationRequest} or a {@link ResponseDeliveryService}.
 *
 * @param x The object to check.
 * @returns `true` if `x` is a {@link SteeringTargetCreationRequest}, `false`
 * otherwise.
 */
function isRequest<T extends RequestSteeringTarget>(x: number | ResponseDeliveryService | TypeFromResponse | T): x is T {
	return Object.prototype.hasOwnProperty.call(x, "value");
}

/**
 * Adds a Target to a given Steering Delivery Service.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param ds The Delivery Service to which a Target is being added, or just its
 * ID.
 * @param target The desired Target Delivery Service, or just its ID.
 * @param type The Type of Target being created, or just its ID.
 * @param value The Target Value, which has a different meaning depending on its
 * Type.
 * @returns The server's response.
 */
export async function addTarget(
	this: Client,
	ds: number | ResponseDeliveryService,
	target: number | ResponseDeliveryService,
	type: number | TypeFromResponse,
	value: number
): Promise<APIResponse<ResponseSteeringTarget>>;
/**
 * Adds a Target to a given Steering Delivery Service.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param ds The Delivery Service to which a Target is being added, or just its
 * ID.
 * @param request The full Steering Target creation request.
 * @returns The server's response.
 */
export async function addTarget(
	this: Client,
	ds: number | ResponseDeliveryService,
	request: SteeringTargetCreationRequest,
): Promise<APIResponse<ResponseSteeringTarget>>;
/**
 * Adds a Target to a given Steering Delivery Service.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param ds The Delivery Service to which a Target is being added, or just its
 * ID.
 * @param targetOrReq Either the full Steering Target creation request, or just
 * the desired Target Delivery Service (or just its ID).
 * @param type The Type of Target being created, or just its ID. This is
 * required if `targetOrReq` is a Delivery Service or Delivery Service ID, and
 * ignored otherwise.
 * @param value The Target Value, which has a different meaning depending on its
 * Type. This is required if `targetOrReq` is a Delivery Service or Delivery
 * Service ID, and ignored otherwise.
 * @returns The server's response.
 */
export async function addTarget(
	this: Client,
	ds: number | ResponseDeliveryService,
	targetOrReq: number | ResponseDeliveryService | SteeringTargetCreationRequest,
	type?: number | TypeFromResponse,
	value?: number
): Promise<APIResponse<ResponseSteeringTarget>> {
	const id = typeof(ds) === "number" ? ds : ds.id;
	let req;
	if (typeof(targetOrReq) === "number") {
		if (type === undefined) {
			throw new ClientError("addTarget", "type");
		}
		if (value === undefined) {
			throw new ClientError("addTarget", "value");
		}
		const typeId = typeof(type) === "number" ? type : type.id;
		req = {
			targetId: targetOrReq,
			typeId,
			value
		};
	} else if (isRequest(targetOrReq)) {
		req = targetOrReq;
	} else if (type === undefined) {
		throw new ClientError("addTarget", "type");
	} else if (value === undefined) {
		throw new ClientError("addTarget", "value");
	} else {
		const typeId = typeof(type) === "number" ? type : type.id;
		req = {
			targetId: targetOrReq.id,
			typeId,
			value
		};
	}
	return (await this.apiPost<APIResponse<ResponseSteeringTarget>>(`steering/${id}/targets`, req)).data;
}

/**
 * Modifies an existing Target to have the given new definition.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param ds The Steering Delivery Service of which a Target is being modified,
 * or just its ID.
 * @param target The Target Delivery Service to which the Target relationship
 * being modified refers, or just its ID.
 * @param type The new desired Type of the Target, or just its ID.
 * @param value The new desired Value of the Target.
 * @returns The server's response.
 */
export async function updateTarget(
	this: Client,
	ds: number | ResponseDeliveryService,
	target: number | ResponseDeliveryService,
	type: number | TypeFromResponse,
	value: number
): Promise<APIResponse<ResponseSteeringTarget>>;
/**
 * Modifies an existing Target to have the given new definition.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param ds The Steering Delivery Service of which a Target is being modified,
 * or just its ID.
 * @param target The Target Delivery Service to which the Target relationship
 * being modified refers, or just its ID.
 * @param request The full modification request body.
 * @returns The server's response.
 */
export async function updateTarget(
	this: Client,
	ds: number | ResponseDeliveryService,
	target: number | ResponseDeliveryService,
	request: SteeringTargetModificationRequest,
): Promise<APIResponse<ResponseSteeringTarget>>;
/**
 * Modifies an existing Target to have the given new definition.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param ds The Steering Delivery Service of which a Target is being modified,
 * or just its ID.
 * @param target The Target Delivery Service to which the Target relationship
 * being modified refers, or just its ID.
 * @param reqOrType Either the full modification request body, or the new
 * desired Type of the Target, or just the ID of that Type.
 * @param value The new desired Value of the Target. This is required if
 * `reqOrType` refers to a Type, and ignored otherwise.
 * @returns The server's response.
 */
export async function updateTarget(
	this: Client,
	ds: number | ResponseDeliveryService,
	target: number | ResponseDeliveryService,
	reqOrType: number | TypeFromResponse | SteeringTargetModificationRequest,
	value?: number
): Promise<APIResponse<ResponseSteeringTarget>> {
	const id = typeof(ds) === "number" ? ds : ds.id;
	const targetID = typeof(target) === "number" ? target : target.id;
	const endpoint = `steering/${id}/targets/${targetID}`;
	if (isRequest(reqOrType)) {
		return (await this.apiPut<APIResponse<ResponseSteeringTarget>>(endpoint, reqOrType)).data;
	}
	if (value === undefined) {
		throw new ClientError("updateTarget", "value");
	}
	const typeId = typeof(reqOrType) === "number" ? reqOrType : reqOrType.id;
	return (await this.apiPut<APIResponse<ResponseSteeringTarget>>(endpoint, {typeId, value})).data;
}

/**
 * Removes a Target from a Steering Delivery Service.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param ds The Steering Delivery Service from which a Target is being removed,
 * or just its ID.
 * @param target The Target Delivery Service being removed, or just its ID.
 * @returns The server's response.
 */
export async function removeTarget(
	this: Client,
	ds: number | ResponseDeliveryService,
	target: number | ResponseDeliveryService
): Promise<APIResponse<undefined>> {
	const id = typeof(ds) === "number" ? ds : ds.id;
	const targetID = typeof(target) === "number" ? target : target.id;
	return (await this.apiDelete(`steering/${id}/targets/${targetID}`)).data;
}
