import type { APIResponse, CDN, CDNQueueRequest, CDNQueueResponse, RequestCDN, ResponseCDN } from "trafficops-types";

import { APIError, ClientError } from "./api.error.js";
import type { PaginationParams } from "./util";

import type { Client } from "./index";

/**
 * A set of options that can be used to affect the response returned by
 * {@link getCDNs}.
 */
type Params = PaginationParams & {
	/** Filter by ID. */
	id?: number;
	/** Filter by Name. */
	name?: string;
	/** Choose the property used for ordering the result set. */
	orderby?: Exclude<keyof ResponseCDN, "lastUpdated">;
};

/**
 * Retrieves CDNs.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 */
export async function getCDNs(this: Client, params?: Params): Promise<APIResponse<Array<ResponseCDN>>>;
/**
 * Retrieves CDNs.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param cdn Either the name of a single CDN to fetch, or its ID.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 */
export async function getCDNs(this: Client, cdn: string | number, params?: Params): Promise<APIResponse<ResponseCDN>>;
/**
 * Retrieves CDNs.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param cdnOrParams Either the name of a single CDN to fetch, the ID of a
 * single CDN to fetch, or any and all optional settings for the request.
 * @param params Any and all optional settings for the request. This is ignored
 * unless `cdnOrParams` specified a single CDN via its name or ID.
 * @returns The server's response.
 */
export async function getCDNs(
	this: Client,
	cdnOrParams?: string | number | Params,
	params?: Params
): Promise<APIResponse<Array<ResponseCDN> | ResponseCDN>> {
	let p;
	let single = false;
	switch (typeof(cdnOrParams)) {
		case "string":
			p = {...params, name: cdnOrParams};
			single = true;
			break;
		case "number":
			p = {...params, id: cdnOrParams};
			single = true;
			break;
		default:
			p = cdnOrParams;
	}
	const resp = await this.apiGet<APIResponse<Array<ResponseCDN>>>("cdns", p);
	if (single) {
		const len = resp.data.response.length;
		if (len !== 1) {
			throw new APIError(`requesting CDN by identifier '${cdnOrParams}' yielded ${len} results`, resp.status, resp.headers);
		}
		return {...resp.data, response: resp.data.response[0]};
	}
	return resp.data;
}

/**
 * Updates a CDN to match the representation given.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param cdn The entire desired representation of the CDN being modified.
 * @returns The server's response.
 */
export async function updateCDN(this: Client, cdn: ResponseCDN): Promise<APIResponse<ResponseCDN>>;
/**
 * Updates a CDN to match the representation given.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param id The ID of the CDN being modified.
 * @param cdn The desired representation of the CDN identified by `id`.
 * @returns The server's response.
 */
export async function updateCDN(this: Client, id: number, cdn: RequestCDN): Promise<APIResponse<ResponseCDN>>;
/**
 * Updates a CDN to match the representation given.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param cdnOrID Either the entire representation of the CDN as desired, or
 * just its ID.
 * @param cdn The desired representation of the CDN identified by `cdnOrID`.
 * This is required if `cdnOrID` is an ID, and ignored otherwise.
 * @returns The server's response.
 */
export async function updateCDN(this: Client, cdnOrID: number | ResponseCDN, cdn?: RequestCDN): Promise<APIResponse<ResponseCDN>> {
	let id, payload;
	if (typeof(cdnOrID) === "number") {
		id = cdnOrID;
		if (!cdn) {
			throw new ClientError("updateCDN", "cdn");
		}
		payload = cdn;
	} else {
		({id} = cdnOrID);
		payload = cdnOrID;
	}
	return (await this.apiPut<APIResponse<ResponseCDN>>(`cdns/${id}`, payload)).data;
}

/**
 * Creates a new CDN.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param cdn The CDN being created.
 * @returns The server's response.
 */
export async function createCDN(this: Client, cdn: RequestCDN): Promise<APIResponse<ResponseCDN>> {
	return (await this.apiPost<APIResponse<ResponseCDN>>("cdns", cdn)).data;
}

/**
 * Destroys a CDN. Note that this will fail if the CDN contains any resources.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param cdn Then CDN being deleted, or just its ID.
 * @returns The server's response.
 */
export async function deleteCDN(this: Client, cdn: ResponseCDN | number): Promise<APIResponse<undefined>> {
	const id = typeof(cdn) === "number" ? cdn : cdn.id;
	return (await this.apiDelete(`cdns/${id}`)).data;
}

/**
 * Options that can be used to affect the behavior of {@link queueCDNUpdates}.
 */
type QueueParams = {
	/**
	 * Limit the queue/dequeue changes to servers with the specified Profile.
	 */
	profile?: string;
	/** Limit the queue/dequeue changes to servers with the specified Type. */
	type?: string;
};

/**
 * Queues or clears updates on servers within a CDN.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param cdn Either the CDN within which updates will be queued/dequeued or its
 * ID.
 * @param action The action to perform - `"queue"` to queue updates, `"dequeue"`
 * to clear them.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 */
export async function queueCDNUpdates(
	this: Client,
	cdn: ResponseCDN | number,
	action: "queue" | "dequeue" = "queue",
	params?: QueueParams
): Promise<APIResponse<CDNQueueResponse>> {
	const req: CDNQueueRequest = { action };
	const id = typeof(cdn) === "number" ? cdn : cdn.id;
	return (await this.apiPost<APIResponse<CDNQueueResponse>>(`cdns/${id}/queue_update`, req, params)).data;
}

/**
 * Clears updates on servers within a CDN. This is equivalent to calling
 * {@link queueCDNUpdates} with its `action` argument as `"dequeue"`.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param cdn Either the CDN within which updates will be queued/dequeued or its
 * ID.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 */
export async function dequeueCDNUpdates(
	this: Client,
	cdn: ResponseCDN | number,
	params?: QueueParams
): Promise<APIResponse<CDNQueueResponse>> {
	return this.queueCDNUpdates(cdn, "dequeue", params);
}

/**
 * The type of responses from endpoints that return formless JSON "blobs"
 * representing CDN configuration.
 */
type CDNBlobConfig = APIResponse<Record<string, unknown>>;

/**
 * Gets the Monitoring configuration of the requested CDN.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param cdn Either the CDN for which to get Monitoring configuration, or its
 * name.
 * @returns An arbitrary mapping of monitoring configuration data. This endpoint
 * is largely unversioned and has a highly unstable structure, so it must be
 * manually inspected rather than explained here or in the typing. It is highly
 * suggested that `noUncheckedIndexedAccess` be used for this reason.
 */
export async function getMonitoringConfiguration(this: Client, cdn: CDN | string): Promise<CDNBlobConfig> {
	const name = typeof(cdn) === "string" ? cdn : cdn.name;
	return (await this.apiGet<CDNBlobConfig>(`cdns/${name}/configs/monitoring`)).data;
}

/**
 * Gets the *currently stored* Snapshot of the requested CDN. To get the current
 * *Snapshot state* of the CDN, use {@link getSnapshotState}.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param cdn Either the CDN for which to get a Snapshot, or its name.
 * @returns An arbitrary mapping of monitoring configuration data. This endpoint
 * is largely unversioned and has a highly unstable structure, so it must be
 * manually inspected rather than explained here or in the typing. It is highly
 * suggested that `noUncheckedIndexedAccess` be used for this reason.
 */
export async function getSnapshot(this: Client, cdn: CDN | string): Promise<CDNBlobConfig> {
	const name = typeof(cdn) === "string" ? cdn : cdn.name;
	return (await this.apiGet<CDNBlobConfig>(`cdns/${name}/snapshot`)).data;
}

/**
 * Gets the *current state* of the requested CDN as a Snapshot, i.e. what the
 * stored Snapshot would become if {@link_takeSnapshot} were called on it at the
 * moment this function is called. To get the *currently stored* Snapshot in use
 * by the CDN, use {@link getSnapshot}.
 *
 * Note that this does **not** show the current state of the monitoring
 * configuration - which cannot be inspected - but taking Snapshots **does
 * change the monitoring configuration!**
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param cdn Either the CDN for which to get a Snapshot, or its name.
 * @returns An arbitrary mapping of "snapshot" data. This endpoint is largely
 * unversioned and has a highly unstable structure, so it must be manually
 * inspected rather than explained here or in the typing. It is highly suggested
 * that `noUncheckedIndexedAccess` be used for this reason.
 */
export async function getSnapshotState(this: Client, cdn: CDN | string): Promise<CDNBlobConfig> {
	const name = typeof(cdn) === "string" ? cdn : cdn.name;
	return (await this.apiGet<CDNBlobConfig>(`cdns/${name}/snapshot/new`)).data;
}

/**
 * Performs a CDN Snapshot *which also updates the Monitoring configuration!*
 * This effectively replaces the output of {@link getSnapshot} with the output
 * of {@link getSnapshotState}.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param cdn Either the CDN for which a Snapshot will be taken, or its name or
 * ID.
 * @returns Only a success message - in violation of the API rules, the
 * `response` property contains the success message rather than any
 * success-level alert.
 */
export async function takeSnapshot(this: Client, cdn: CDN | string | number): Promise<APIResponse<"SUCCESS">> {
	let params;
	switch (typeof(cdn)) {
		case "number":
			params = {cdnID: cdn};
			break;
		case "string":
			params = {cdn};
			break;
		default:
			params = {cdn: cdn.name};
	}
	return (await this.apiPut<APIResponse<"SUCCESS">>("snapshot", {}, params)).data;
}
