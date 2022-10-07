import type {
	APIResponse,
	AssignCDNFederationToUsersRequest,
	AssignCDNFederationToUsersRequestResponse,
	CDN,
	FederationFederationResolver,
	PostResponseCDNFederation,
	RequestCDNFederation,
	RequestFederationResolver,
	RequestFederationResolverResponse,
	ResponseCDNFederation,
	ResponseFederationResolver,
	ResponseUser,
	UserCDNFederationAssociation
} from "trafficops-types";

import { ClientError } from "./api.error.js";
import { isIDArray, type PaginationParams } from "./util.js";

import type { Client } from "./index";

/**
 * Optional settings that affect the behavior and/or result set of
 * {@link getCDNFederations}.
 */
type CDNFedParams = PaginationParams & {
	/**
	 * Return only CDN Federations that correspond to Federations with this ID.
	 */
	id?: number;
	/**
	 * Choose a property by which results will be ordered.
	 *
	 * ("id" is the ID of the *Federation*, not the CDN, CDNFederation,
	 * FederationResolver(s), FederationResolverResolver(s), or an Delivery
	 * Service. It's not visible in the response.)
	 *
	 * ("name" is the name of the CDN. Technically allowed, but utterly
	 * useless.)
	 *
	 * @default "id"
	 */
	orderby?: "id" | "name" | "cname";
};

/**
 * Retrieves a list of CDNFederations in use by a particular CDN.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param cdn The CDN for which to retrieve Federations.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 */
export async function getCDNFederations(
	this: Client,
	cdn: string | CDN,
	params?: CDNFedParams
): Promise<APIResponse<Array<ResponseCDNFederation>>> {
	const name = typeof(cdn) === "string" ? cdn : cdn.name;
	return (await this.apiGet<APIResponse<Array<ResponseCDNFederation>>>(`cdns/${name}/federations`, params)).data;
}

/* eslint-disable max-len */
/**
 * Adds a new CDNFederation to a particular CDN.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param cdn The CDN within which a new CDNFederation will be created. Note
 * that this doesn't actually work or mean anything, because a CDNFederation is
 * not actually associated with a CDN until it is assigned to one or more
 * Delivery Services. This must be a real CDN (or its name), but that in no way
 * has any impact on the created CDNFederation. See
 * [apache/trafficcontrol#4052]{@link https://github.com/apache/trafficcontrol/issues/4052}.
 * @param fed The CDNFederation to create.
 * @returns The server's response.
 */
export async function createCDNFederation(
/* eslint-enable max-len */
	this: Client,
	cdn: string | CDN,
	fed: RequestCDNFederation
): Promise<APIResponse<PostResponseCDNFederation>> {
	const name = typeof(cdn) === "string" ? cdn : cdn.name;
	return (await this.apiPost<APIResponse<PostResponseCDNFederation>>(`cdns/${name}/federations`, fed)).data;
}

/**
 * Replaces an existing CDNFederation with the provided new definition.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param cdn Any valid CDN or its name, doesn't matter or affect anything
 * unless the Federation being modified is assigned to at least one Delivery
 * Service, in which case this must be the CDN to which those Delivery Services
 * belong or its name.
 * @param federation The full new desired definition of the CDNFederation.
 * @returns The server's response.
 */
export async function updateCDNFederation(
	this: Client,
	cdn: string | CDN,
	federation: PostResponseCDNFederation
): Promise<APIResponse<PostResponseCDNFederation>>;
/**
 * Replaces an existing CDNFederation with the provided new definition.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param cdn Any valid CDN or its name, doesn't matter or affect anything
 * unless the Federation being modified is assigned to at least one Delivery
 * Service, in which case this must be the CDN to which those Delivery Services
 * belong or its name.
 * @param id The ID of the CDNFederation being updated.
 * @param federation The new desired definition of the CDN Federation.
 * @returns The server's response.
 */
export async function updateCDNFederation(
	this: Client,
	cdn: string | CDN,
	id: number,
	federation: RequestCDNFederation
): Promise<APIResponse<PostResponseCDNFederation>>;
/**
 * Replaces an existing CDNFederation with the provided new definition.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param cdn Any valid CDN or its name, doesn't matter or affect anything
 * unless the Federation being modified is assigned to at least one Delivery
 * Service, in which case this must be the CDN to which those Delivery Services
 * belong or its name.
 * @param fedOrID Either the full new desired definition of the CDNFederation,
 * or just its ID.
 * @param fed The new desired definition of the CDN Federation. This is required
 * if `fedOrID` was an ID, and ignored otherwise.
 * @returns The server's response.
 */
export async function updateCDNFederation(
	this: Client,
	cdn: string | CDN,
	fedOrID: number | PostResponseCDNFederation,
	fed?: RequestCDNFederation
): Promise<APIResponse<PostResponseCDNFederation>> {
	const name = typeof(cdn) === "string" ? cdn : cdn.name;
	let id, payload;
	if (typeof(fedOrID) === "number") {
		id = fedOrID;
		if (!fed) {
			throw new ClientError("updateCDNFederation", "fed");
		}
		payload = fed;
	} else {
		({id} = fedOrID);
		payload = fedOrID;
	}
	return (await this.apiPut<APIResponse<PostResponseCDNFederation>>(`cdns/${name}/federations/${id}`, payload)).data;
}

/**
 * Deletes a CDNFederation with the provided new definition.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param cdn Any valid CDN or its name, doesn't matter or affect anything
 * unless the Federation being modified is assigned to at least one Delivery
 * Service, in which case this must be the CDN to which those Delivery Services
 * belong or its name. Of course, in that case deletion will fail.
 * @param federation Either the Federation being deleted or its ID.
 * @returns The server's response.
 */
export async function deleteCDNFederation(
	this: Client,
	cdn: string | CDN,
	federation: number | PostResponseCDNFederation
): Promise<APIResponse<undefined>> {
	const name = typeof(cdn) === "string" ? cdn : cdn.name;
	const id = typeof(federation) === "number" ? federation : federation.id;
	return (await this.apiDelete(`cdns/${name}/federations/${id}`)).data;
}

/**
 * Optional settings that affect the behavior/output of
 * {@link getFederationResolvers}.
 */
type FedResolverParams = PaginationParams & {
	id?: number;
	orderby?: "id" | "ipAddress" | "type";
	type?: string;
};

/**
 * Retrieves Federation Resolvers from Traffic Ops.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 */
export async function getFederationResolvers(
	this: Client,
	params?: FedResolverParams
): Promise<APIResponse<Array<ResponseFederationResolver>>> {
	return (await this.apiGet<APIResponse<Array<ResponseFederationResolver>>>("federation_resolvers", params)).data;
}

/**
 * Creates a new Federation Resolver.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param fed The definition of the Federation Resolver to be created.
 * @returns The server's response.
 */
export async function createFederationResolver(
	this: Client,
	fed: RequestFederationResolver
): Promise<APIResponse<RequestFederationResolverResponse>> {
	return (await this.apiPost<APIResponse<RequestFederationResolverResponse>>("federation_resolvers", fed)).data;
}

/**
 * Deletes a Federation Resolver.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param fed The Federation Resolver to delete, or just its ID.
 * @returns The server's response.
 */
export async function deleteFederationResolver(
	this: Client,
	fed: number | ResponseFederationResolver | RequestFederationResolverResponse
): Promise<APIResponse<FederationFederationResolver>> {
	const id = typeof(fed) === "number" ? fed : fed.id;
	return (await this.apiDelete<APIResponse<FederationFederationResolver>>("federation_resolvers", {id})).data;
}

/**
 * Checks if an argument to {@link assignCDNFederationToUsers} is an
 * {@link AssignCDNFederationToUsersRequest}.
/**
 * Checks if an argument to {@link assignCDNFederationToUsers} or
 * {@link assignDeliveryServicesToCDNFederation} is an
 * {@link AssignCDNFederationToUsersRequest} or
 * {@link AssignDeliveryServicesToCDNFederationRequest}.
 *
 * @param x The object to check.
 * @returns `true` if `x` is an {@link AssignCDNFederationToUsersRequest} or
 * {@link AssignDeliveryServicesToCDNFederationRequest}, `false` otherwise.
 */
function isAssignmentRequest<T extends AssignDeliveryServicesToCDNFederationRequest | AssignCDNFederationToUsersRequest>(
	x: ResponseUser | ResponseDeliveryService | number | T): x is T {
	return Object.prototype.hasOwnProperty.call(x, "userIds") || Object.prototype.hasOwnProperty.call(x, "dsIds");
}

/**
 * Assigns an existing CDN Federation to one or more users.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param req A full user-to-CDN Federation assignment request body.
 * @param federation The CDN Federation to which the user(s) in the request body
 * given by `req` will be assigned, or just its ID. This is required if `req`
 * is one or more user(s) or user ID(s), and ignored otherwise.
 * @returns The server's response.
 */
export async function assignCDNFederationToUsers(
	this: Client,
	req: AssignCDNFederationToUsersRequest,
	federation: PostResponseCDNFederation | number,
): Promise<APIResponse<AssignCDNFederationToUsersRequestResponse>>;
/**
 * Assigns an existing CDN Federation to one or more users.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param user The user (or just its ID) or users (or just their IDs) to
 * which the CDN Federation given by `federation` will be assigned.
 * @param federation The CDN Federation to which the user(s) given by
 * `user` will be assigned, or just its ID.
 * @param replace If given and `true`, the assignments of users to the CDN
 * Federation given by `federation` will be fully replaced by those defined by
 * this request. Otherwise, new assignments will be added only.
 * @returns The server's response.
 */
export async function assignCDNFederationToUsers(
	this: Client,
	userOrReq: ResponseUser | number | Array<ResponseUser> | Array<number> | AssignCDNFederationToUsersRequest,
	federation: PostResponseCDNFederation | number,
	replace?: boolean
): Promise<APIResponse<AssignCDNFederationToUsersRequestResponse>>;
/**
 * Assigns an existing CDN Federation to one or more users.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param userOrReq The user (or just its ID) or users (or just their IDs) to
 * which the CDN Federation given by `federation` will be assigned, or a full
 * {@link AssignCDNFederationToUsersRequest} request body.
 * @param federation The CDN Federation to which the user(s) given by
 * `userOrReq` will be assigned, or just its ID.
 * @param replace If given and `true`, the assignments of users to the CDN
 * Federation given by `federation` will be fully replaced by those defined by
 * this request. Otherwise, new assignments will be added only. This is ignored
 * if `userOrReq` is a full user-to-CDN Federation request.
 * @returns The server's response.
 */
export async function assignCDNFederationToUsers(
	this: Client,
	userOrReq: ResponseUser | number | Array<ResponseUser> | Array<number> | AssignCDNFederationToUsersRequest,
	federation: PostResponseCDNFederation | number,
	replace: boolean = false
): Promise<APIResponse<AssignCDNFederationToUsersRequestResponse>> {
	let req: AssignCDNFederationToUsersRequest;
	if (Array.isArray(userOrReq)) {
		req = {
			replace,
			userIds: isIDArray(userOrReq) ? userOrReq : userOrReq.map(u=>u.id)
		};
	} else if (isAssignmentRequest(userOrReq)) {
		req = userOrReq;
	} else if (typeof(userOrReq) === "number") {
		req = {
			replace,
			userIds: [userOrReq]
		};
	} else {
		req = {
			replace,
			userIds: [userOrReq.id]
		};
	}

	const fedID = typeof(federation) === "number" ? federation : federation.id;
	return (await this.apiPost<APIResponse<AssignCDNFederationToUsersRequestResponse>>(`federations/${fedID}/users`, req)).data;
}

/**
 * Optional request settings that affect the behavior/output of
 * {@link getUsersAssignedToCDNFederation}.
 */
type UserCDNFederationParams = PaginationParams & {
	orderby?: "role";
	role?: string;
	userID?: number;
};

/**
 * Retrieves the users assigned to a given CDN Federation and some limited
 * information about them.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param federation The CDN Federation for which user assignments will be
 * retrieved, or just its ID.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 */
export async function getUsersAssignedToCDNFederation(
	this: Client,
	federation: PostResponseCDNFederation | number,
	params?: UserCDNFederationParams
): Promise<APIResponse<Array<UserCDNFederationAssociation>>> {
	const id = typeof(federation) === "number" ? federation : federation.id;
	return (await this.apiGet<APIResponse<Array<UserCDNFederationAssociation>>>(`federations/${id}/users`, params)).data;
}

/**
 * Removes a user from a CDN Federation's assigned users.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param user The user being removed from the CDN Federation given by
 * `federation`, or just its ID.
 * @param federation The CDN Federation from which the user given by `user` will
 * be removed, or just its ID.
 * @returns The server's response.
 */
export async function removeUserFromCDNFederation(
	this: Client,
	user: ResponseUser | number,
	federation: PostResponseCDNFederation | number
): Promise<APIResponse<undefined>> {
	const userID = typeof(user) === "number" ? user : user.id;
	const fedID = typeof(federation) === "number" ? federation : federation.id;
	return (await this.apiDelete(`federations/${fedID}/users/${userID}`)).data;
}

/**
 * Assigns one or more Delivery Services to a CDN Federation. Those Delivery
 * Services **must** be in the same CDN as the CDN Federation to which they will
 * be assigned.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param ds The Delivery Service (or just its ID) or group of Delivery Services
 * (or just their IDs) to be assigned to the CDN Federation given by
 * `federation`.
 * @param federation The CDN Federation to which the Delivery Service(s) given
 * by `ds` will be assigned.
 * @param replace If given and `true`, any existing assignments of Delivery
 * Services to the CDN Federation given by `federation` will be completely
 * replaced by those in the request.
 * @returns The server's response.
 */
export async function assignDeliveryServicesToCDNFederation(
	this: Client,
	ds: number | ResponseDeliveryService | Array<number> | Array<ResponseDeliveryService>,
	federation: PostResponseCDNFederation | number,
	replace?: boolean
): Promise<APIResponse<AssignDeliveryServicesToCDNFederationRequestResponse>>;
/**
 * Assigns one or more Delivery Services to a CDN Federation. Those Delivery
 * Services **must** be in the same CDN as the CDN Federation to which they will
 * be assigned.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param req A full Delivery Service-to-CDN Federation assignment request body.
 * @param federation The CDN Federation to which the Delivery Service(s) given
 * in `req` will be assigned.
 * @param replace If given and `true`, any existing assignments of Delivery
 * Services to the CDN Federation given by `federation` will be completely
 * replaced by those in the request. This is ignored if `dsOrReq` is a full
 * request body.
 * @returns The server's response.
 */
export async function assignDeliveryServicesToCDNFederation(
	this: Client,
	dsOrReq: AssignDeliveryServicesToCDNFederationRequest,
	federation: PostResponseCDNFederation | number,
): Promise<APIResponse<AssignDeliveryServicesToCDNFederationRequestResponse>>;
/**
 * Assigns one or more Delivery Services to a CDN Federation. Those Delivery
 * Services **must** be in the same CDN as the CDN Federation to which they will
 * be assigned.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param dsOrReq The Delivery Service (or just its ID) or group of Delivery
 * Services (or just their IDs) to be assigned to the CDN Federation given by
 * `federation`, or a full {@link AssignDeliveryServicesToCDNFederationRequest}
 * request body.
 * @param federation The CDN Federation to which the Delivery Service(s) given
 * by `dsOrReq` will be assigned.
 * @param replace If given and `true`, any existing assignments of Delivery
 * Services to the CDN Federation given by `federation` will be completely
 * replaced by those in the request. This is ignored if `dsOrReq` is a full
 * request body.
 * @returns The server's response.
 */
export async function assignDeliveryServicesToCDNFederation(
	this: Client,
	dsOrReq: number |
	ResponseDeliveryService |
	Array<number> |
	Array<ResponseDeliveryService> |
	AssignDeliveryServicesToCDNFederationRequest,
	federation: PostResponseCDNFederation | number,
	replace: boolean = false
): Promise<APIResponse<AssignDeliveryServicesToCDNFederationRequestResponse>> {
	let req: AssignDeliveryServicesToCDNFederationRequest;
	if (Array.isArray(dsOrReq)) {
		req = {
			dsIds: isIDArray(dsOrReq) ? dsOrReq : dsOrReq.map(d=>d.id),
			replace
		};
	} else if (isAssignmentRequest(dsOrReq)) {
		req = dsOrReq;
	} else if (typeof(dsOrReq) === "number") {
		req = {
			dsIds: [dsOrReq],
			replace
		};
	} else {
		req = {
			dsIds: [dsOrReq.id],
			replace,
		};
	}

	const id = typeof(federation) === "number" ? federation : federation.id;
	const path = `federations/${id}/deliveryservices`;
	return (await this.apiPost<APIResponse<AssignDeliveryServicesToCDNFederationRequestResponse>>(path, req)).data;
}

/**
 * Optional settings that affect the behavior/output of
 * {@link getDeliveryServicesAssignedToCDNFederation},
 */
type DSFedAssignmentParams = PaginationParams & {
	dsID?: number;
};

/**
 * Gets all Delivery Services assigned to a given CDN Federation.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param federation The CDN Federation for which assigned Delivery Services
 * will be fetched, or just its ID.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 */
export async function getDeliveryServicesAssignedToCDNFederation(
	this: Client,
	federation: PostResponseCDNFederation | number,
	params?: DSFedAssignmentParams
): Promise<APIResponse<Array<DeliveryServiceCDNFederationAssociation>>> {
	const id = typeof(federation) === "number" ? federation : federation.id;
	return (await this.apiGet<APIResponse<Array<DeliveryServiceCDNFederationAssociation>>>(`federations/${id}/deliveryservices`, params)).data;
}

/**
 * Removes a Delivery Service from the given CDN Federation's assigned Delivery
 * Services.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param ds The Delivery Service being removed from the CDN Federation given by
 * `federation`, or just its ID.
 * @param federation The CDN Federation from which the Delivery Service
 * identified by `ds` will be removed, or just its ID.
 * @returns The server's response.
 */
export async function removeDeliveryServiceFromCDNFederation(
	this: Client,
	ds: ResponseDeliveryService | number,
	federation: PostResponseCDNFederation | number
): Promise<APIResponse<undefined>> {
	const dsID = typeof(ds) === "number" ? ds : ds.id;
	const fedID = typeof(federation) === "number" ? federation : federation.id;
	return (await this.apiDelete(`federations/${fedID}/deliveryservices/${dsID}`)).data;
}
