import type {
	APIResponse,
	RequestRole,
	ResponseRole,
} from "trafficops-types";

import { ClientError } from "./api.error.js";
import { getSingleResponse, type PaginationParams } from "./util.js";

import type { Client } from "./index";
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
