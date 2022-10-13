import type {
	APIResponse,
	GetResponseUser,
	PostRequestUser,
	PutOrPostResponseUser,
	PutRequestUser,
	RegistrationRequest,
	RequestCurrentUser,
	RequestRole,
	RequestTenant,
	ResponseCurrentUser,
	ResponseRole,
	ResponseTenant,
	ResponseUser
} from "trafficops-types";

import { ClientError } from "./api.error.js";
import { getSingleResponse, type PaginationParams } from "./util.js";

import type { Client } from "./index";

const USER_DATE_KEYS = {dateString: ["lastUpdated", "registrationSent"]};

/**
 * Creates a new user.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param user The user to create.
 * @returns The server's response.
 */
export async function createUser(this: Client, user: PostRequestUser): Promise<APIResponse<PutOrPostResponseUser>> {
	return (await this.apiPost<APIResponse<PutOrPostResponseUser>>("users", user, undefined, USER_DATE_KEYS)).data;
}

/**
 * Optional settings that can affect the behavior of {@link getUsers}.
 */
type Params = PaginationParams & {
	id?: number;
	role?: string;
	tenant?: string;
	username?: string;
	orderby?: "id" | "role" | "tenant" | "username";
};

/**
 * Retrieves Users.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 */
export async function getUsers(this: Client, params?: Params): Promise<APIResponse<Array<GetResponseUser>>>;
/**
 * Retrieves a single User.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param identifier Either the ID or username of a single User to retrieve.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 * @throws {APIError} if the server responds with any number of Users other than
 * one.
 */
export async function getUsers(this: Client, identifier: number | string, params?: Params): Promise<APIResponse<GetResponseUser>>;
/**
 * Retrieves Users.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param paramsOrIdentifier Either the ID or username of a single User to
 * retrieve, or any and all optional settings for retrieving multiple.
 * @param params Any and all optional settings for the request. This is ignored
 * if settings were provided in `paramsOrIdentifier`.
 * @returns The server's response.
 */
export async function getUsers(
	this: Client,
	paramsOrIdentifier?: Params | number | string,
	params?: Params
): Promise<APIResponse<Array<GetResponseUser> | GetResponseUser>> {
	let p;
	switch (typeof(paramsOrIdentifier)) {
		case "number":
			p = {...params, id: paramsOrIdentifier};
			break;
		case "string":
			p = {...params, username: paramsOrIdentifier};
			break;
		default:
			p = paramsOrIdentifier;
	}
	const resp = await this.apiGet<APIResponse<Array<GetResponseUser>>>("users", p, USER_DATE_KEYS);
	if (typeof(paramsOrIdentifier) === "number" || typeof(paramsOrIdentifier) === "string") {
		return getSingleResponse(resp, "user", paramsOrIdentifier);
	}
	return resp.data;
}

/**
 * Replaces an existing user with the provided definition.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param user The full, desired, new definition of the user.
 * @returns The server's response.
 */
export async function updateUser(this: Client, user: ResponseUser): Promise<APIResponse<PutOrPostResponseUser>>;
/**
 * Replaces an existing user with the provided definition.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param userOrID The ID of the user being updated.
 * @param user The desired new definition of the user.
 * @returns The server's response.
 */
export async function updateUser(this: Client, id: number, user: PutRequestUser): Promise<APIResponse<PutOrPostResponseUser>>;
/**
 * Replaces an existing user with the provided definition.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param userOrID Either the full desired new definition of the User, or just
 * its ID.
 * @param user The desired new definition of the user. This is required if
 * `userOrID` is an ID, and ignored otherwise.
 * @returns The server's response.
 */
export async function updateUser(
	this: Client,
	userOrID: ResponseUser | number,
	user?: PutRequestUser
): Promise<APIResponse<PutOrPostResponseUser>> {
	let id, p;
	if (typeof(userOrID) === "number") {
		id = userOrID;
		if (!user) {
			throw new ClientError("updateUser", "user");
		}
		p = user;
	} else {
		({id} = userOrID);
		p = userOrID;
	}
	return (await this.apiPut<APIResponse<PutOrPostResponseUser>>(`users/${id}`, p, undefined, USER_DATE_KEYS)).data;
}

/**
 * Gets details about the user as whom the client is authenticated.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @returns The server's response.
 */
export async function getCurrentUser(this: Client): Promise<APIResponse<ResponseCurrentUser>> {
	return (await this.apiGet<APIResponse<ResponseCurrentUser>>("user/current", undefined, USER_DATE_KEYS)).data;
}

/**
 * Updates the currently authenticated user.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param request The new user details as desired.
 * @returns The server's response.
 */
export async function updateCurrentUser(this: Client, request: RequestCurrentUser): Promise<APIResponse<ResponseCurrentUser>> {
	return (await this.apiPut<APIResponse<ResponseCurrentUser>>("user/current", {user: request}, undefined, USER_DATE_KEYS)).data;
}

/**
 * Registers a new user via email.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param request The full user registration request
 * @returns The server's response.
 */
export async function registerUser(
	this: Client,
	request: RegistrationRequest,
): Promise<APIResponse<undefined>>;
/**
 * Registers a new user via email.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param email The new user's email address.
 * @param role The Role which will be given to the newly registered user, or
 * just the ID of that Role.
 * @param tenant The Tenant within which the newly registered user will be, or
 * just the ID of that Tenant.
 * @returns The server's response.
 */
export async function registerUser(
	this: Client,
	email: `${string}@${string}.${string}`,
	role: number | ResponseRole,
	tenant: number | ResponseTenant
): Promise<APIResponse<undefined>>;
/**
 * Registers a new user via email.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param requestOrEmail Either the full registration request, or just the new
 * user's email address.
 * @param role The Role which will be given to the newly registered user, or
 * just the ID of that Role. This is required if `requestOrEmail` is passed as
 * an email address, and ignored otherwise.
 * @param tenant The Tenant within which the newly registered user will be, or
 * just the ID of that Tenant. This is required if `requestOrEmail` is passed as
 * an email address, and ignored otherwise.
 * @returns The server's response.
 */
export async function registerUser(
	this: Client,
	requestOrEmail: `${string}@${string}.${string}` | RegistrationRequest,
	role?: number | ResponseRole,
	tenant?: number | ResponseTenant
): Promise<APIResponse<undefined>> {
	let req: RegistrationRequest;
	if (typeof(requestOrEmail) === "string") {
		if (!role) {
			if (!tenant) {
				throw new ClientError("registerUser", "role", "tenant");
			}
			throw new ClientError("registerUser", "role");
		}
		if (!tenant) {
			throw new ClientError("registerUser", "tenant");
		}
		const tenantId = typeof(tenant) === "number" ? tenant : tenant.id;
		const roleID = typeof(role) === "number" ? role : role.id;
		req = {
			email: requestOrEmail,
			role: roleID,
			tenantId
		};
	} else {
		req = requestOrEmail;
	}
	return (await this.apiPost("users/register", req)).data;
}

/**
 * Creates a new Role.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param role The Role to create.
 * @returns The server's response.
 */
export async function createRole(this: Client, role: RequestRole): Promise<APIResponse<ResponseRole>> {
	return (await this.apiPost<APIResponse<ResponseRole>>("roles", role)).data;
}

/**
 * Optional settings that affect the behavior of {@link getRoles}.
 */
type RoleParams = PaginationParams & {
	id?: number;
	name?: string;
	privLevel?: number;
	orderby?: "id" | "name" | "privLevel";
};

/**
 * Retrieves Roles.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 */
export async function getRoles(this: Client, params?: RoleParams): Promise<APIResponse<Array<ResponseRole>>>;
/**
 * Retrieves a single Role.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param identifier Either the ID or name of a single Role to retrieve.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 * @throws {APIError} if the server responds with any number of Roles other than
 * one.
 */
export async function getRoles(this: Client, identifier: number | string, params?: RoleParams): Promise<APIResponse<ResponseRole>>;
/**
 * Retrieves Roles.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param paramsOrIdentifier Either the ID or name of a single Role to
 * retrieve, or any and all optional settings for retrieving multiple.
 * @param params Any and all optional settings for the request. This is ignored
 * if settings were provided in `paramsOrIdentifier`.
 * @returns The server's response.
 */
export async function getRoles(
	this: Client,
	paramsOrIdentifier?: string | number | RoleParams,
	params?: RoleParams
): Promise<APIResponse<ResponseRole | Array<ResponseRole>>> {
	let p;
	switch (typeof(paramsOrIdentifier)) {
		case "number":
			p = {...params, id: paramsOrIdentifier};
			break;
		case "string":
			p = {...params, name: paramsOrIdentifier};
			break;
		default:
			p = paramsOrIdentifier;
	}
	const resp = await this.apiGet<APIResponse<Array<ResponseRole>>>("roles", p);
	if (typeof(paramsOrIdentifier) === "number" || typeof(paramsOrIdentifier) === "string") {
		return getSingleResponse(resp, "role", paramsOrIdentifier);
	}
	return resp.data;
}

/**
 * Replaces an existing Role with the provided definition.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param role The full, desired, new definition of the Role.
 * @returns The server's response.
 */
export async function updateRole(this: Client, role: ResponseRole): Promise<APIResponse<ResponseRole>>;
/**
 * Replaces an existing Role with the provided definition.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param id The ID of the Role being updated.
 * @param role The desired new definition of the Role.
 * @returns The server's response.
 */
export async function updateRole(this: Client, id: number, role: RequestRole): Promise<APIResponse<ResponseRole>>;
/**
 * Replaces an existing Role with the provided definition.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param roleOrID Either the full desired new definition of the Role, or just
 * its ID.
 * @param role The desired new definition of the user. This is required if
 * `roleOrID` is an ID, and ignored otherwise.
 * @returns The server's response.
 */
export async function updateRole(
	this: Client,
	roleOrID: ResponseRole | number,
	role?: RequestRole
): Promise<APIResponse<ResponseRole>> {
	let id, p;
	if (typeof(roleOrID) === "number") {
		id = roleOrID;
		if (!role) {
			throw new ClientError("updateRole", "role");
		}
		p = role;
	} else {
		({id} = roleOrID);
		p = roleOrID;
	}
	return (await this.apiPut<APIResponse<ResponseRole>>("roles", p, {id})).data;
}

/**
 * Deletes a Role.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param role Either the Role to delete or just its ID.
 * @returns The server's response.
 */
export async function deleteRole(this: Client, role: number | ResponseRole): Promise<APIResponse<undefined>> {
	const id = typeof(role) === "number" ? role : role.id;
	return (await this.apiDelete("roles", {id})).data;
}

/**
 * Creates a new Tenant.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param tenant The Tenant to create.
 * @returns The server's response.
 */
export async function createTenant(this: Client, tenant: RequestTenant): Promise<APIResponse<ResponseTenant>> {
	return (await this.apiPost<APIResponse<ResponseTenant>>("tenants", tenant)).data;
}

/**
 * Optional settings that affect the behavior of {@link getTenants}.
 */
type TenantParams = PaginationParams & {
	active?: boolean;
	id?: number;
	name?: string;
	orderby?: "id" | "name";
};

/**
 * Retrieves Tenants.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 */
export async function getTenants(this: Client, params?: TenantParams): Promise<APIResponse<Array<ResponseTenant>>>;
/**
 * Retrieves a single Tenant.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param identifier Either the ID or name of a single Tenant to retrieve.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 * @throws {APIError} if the server responds with any number of Tenants other
 * than one.
 */
export async function getTenants(this: Client, identifier: number | string, params?: TenantParams): Promise<APIResponse<ResponseTenant>>;
/**
 * Retrieves Tenants.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param paramsOrIdentifier Either the ID or name of a single Tenant to
 * retrieve, or any and all optional settings for retrieving multiple.
 * @param params Any and all optional settings for the request. This is ignored
 * if settings were provided in `paramsOrIdentifier`.
 * @returns The server's response.
 */
export async function getTenants(
	this: Client,
	paramsOrIdentifier?: string | number | TenantParams,
	params?: TenantParams
): Promise<APIResponse<ResponseTenant | Array<ResponseTenant>>> {
	let p;
	switch (typeof(paramsOrIdentifier)) {
		case "number":
			p = {...params, id: paramsOrIdentifier};
			break;
		case "string":
			p = {...params, name: paramsOrIdentifier};
			break;
		default:
			p = paramsOrIdentifier;
	}
	const resp = await this.apiGet<APIResponse<Array<ResponseTenant>>>("tenants", p);
	if (typeof(paramsOrIdentifier) === "number" || typeof(paramsOrIdentifier) === "string") {
		return getSingleResponse(resp, "tenant", paramsOrIdentifier);
	}
	return resp.data;
}

/**
 * Replaces an existing Tenant with the provided definition.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param tenant The full, desired, new definition of the Tenant.
 * @returns The server's response.
 */
export async function updateTenant(this: Client, tenant: ResponseTenant): Promise<APIResponse<ResponseTenant>>;
/**
 * Replaces an existing Tenant with the provided definition.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param id The ID of the Tenant being updated.
 * @param tenant The desired new definition of the Tenant.
 * @returns The server's response.
 */
export async function updateTenant(this: Client, id: number, tenant: RequestTenant): Promise<APIResponse<ResponseTenant>>;
/**
 * Replaces an existing Tenant with the provided definition.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param tenantOrID Either the full desired new definition of the Tenant, or
 * just its ID.
 * @param tenant The desired new definition of the Tenant. This is required if
 * `tenantOrID` is an ID, and ignored otherwise.
 * @returns The server's response.
 */
export async function updateTenant(
	this: Client,
	tenantOrID: ResponseTenant | number,
	tenant?: RequestTenant
): Promise<APIResponse<ResponseTenant>> {
	let id, p;
	if (typeof(tenantOrID) === "number") {
		id = tenantOrID;
		if (!tenant) {
			throw new ClientError("updateTenant", "tenant");
		}
		p = tenant;
	} else {
		({id} = tenantOrID);
		p = tenantOrID;
	}
	return (await this.apiPut<APIResponse<ResponseTenant>>(`tenants/${id}`, p)).data;
}

/**
 * Deletes a Tenant.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param tenant The Tenant to delete, or just its ID.
 * @returns The server's response.
 */
export async function deleteTenant(this: Client, tenant: number | ResponseTenant): Promise<APIResponse<undefined>> {
	const id = typeof(tenant) === "number" ? tenant : tenant.id;
	return (await this.apiDelete(`tenants/${id}`)).data;
}
