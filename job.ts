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
import type { APIResponse, JobType, RequestInvalidationJob, ResponseInvalidationJob } from "trafficops-types";

import { ClientError } from "./api.error.js";
import { getSingleResponse, PaginationParams } from "./util.js";

import type { Client } from "./index";

const JOBS_DATE_SPEC = {dateString: ["startTime"]};

/**
 * Optional settings that affect the output/behavior of
 * {@link getContentInvalidationJobs}.
 */
type JobsParams = PaginationParams & {
	assetUrl?: string;
	cdn?: string;
	createdBy?: string;
	deliveryService?: string;
	dsId?: number;
	id?: number;
	keyword?: JobType;
	/** @default false */
	maxRevalDurationDays?: boolean;
	userId?: number;
};

/**
 * Retrieves exactly one Content Invalidation Job from Traffic Ops.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param id The ID of the single Content Invalidation Job to be fetched.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 * @throws {APIError} when Traffic Ops responds with any number of Content
 * Invalidation Jobs besides one.
 */
export async function getContentInvalidationJobs(
	this: Client,
	id: number,
	params?: JobsParams
): Promise<APIResponse<ResponseInvalidationJob>>;
/**
 * Retrieves Content Invalidation Jobs from Traffic Ops.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 */
export async function getContentInvalidationJobs(this: Client, params?: JobsParams): Promise<APIResponse<Array<ResponseInvalidationJob>>>;
/**
 * Retrieves one or more Content Invalidation Jobs from Traffic Ops.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param paramsOrID Either the ID of a single Content Invalidation Job to fetch
 * or a set of optional settings for the request when fetching multiple.
 * @param params Any and all optional settings for the request. This is ignored
 * unless `paramsOrID` is an ID.
 * @returns The server's response.
 */
export async function getContentInvalidationJobs(
	this: Client,
	paramsOrID?: number | JobsParams,
	params?: JobsParams
): Promise<APIResponse<ResponseInvalidationJob | Array<ResponseInvalidationJob>>> {
	if (typeof(paramsOrID) === "number") {
		return getSingleResponse(
			await this.apiGet<APIResponse<[ResponseInvalidationJob]>>("jobs", {id: paramsOrID, ...params}, JOBS_DATE_SPEC),
			"Content Invalidation Job",
			paramsOrID
		);
	}
	return (await this.apiGet<APIResponse<Array<ResponseInvalidationJob>>>("jobs", paramsOrID, JOBS_DATE_SPEC)).data;
}

/**
 * Creates a new Content Invalidation Job.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param job The Content Invalidation Job to be created.
 * @returns The server's response.
 */
export async function createContentInvalidationJob(
	this: Client,
	job: RequestInvalidationJob
): Promise<APIResponse<ResponseInvalidationJob>> {
	return (await this.apiPost<APIResponse<ResponseInvalidationJob>>("jobs", job, undefined, JOBS_DATE_SPEC)).data;
}

/**
 * Updates a Content Invalidation Job to match the provided definition.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param id The ID of the Content Invalidation Job being edited.
 * @param job The new definition of the Content Invalidation Job identified by
 * `id`.
 * @returns The server's response.
 */
export async function updateContentInvalidationJob(
	this: Client,
	id: number,
	job: RequestInvalidationJob
): Promise<APIResponse<ResponseInvalidationJob>>;
/**
 * Updates a Content Invalidation Job to match the provided definition.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param job The full definition of the Content Invalidation Job as desired.
 * @returns The server's response.
 */
export async function updateContentInvalidationJob(
	this: Client,
	job: ResponseInvalidationJob,
): Promise<APIResponse<ResponseInvalidationJob>>;
/**
 * Updates a Content Invalidation Job to match the provided definition.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param jobOrID Either the full definition of the Content Invalidation Job as
 * desired, or just the ID of the Content Invalidation Job being edited.
 * @param job The new definition of the Content Invalidation Job identified by
 * `jobOrID`. This is required if `jobOrID` is an ID, and ignored otherwise.
 * @returns The server's response.
 */
export async function updateContentInvalidationJob(
	this: Client,
	jobOrID: number | ResponseInvalidationJob,
	job?: RequestInvalidationJob
): Promise<APIResponse<ResponseInvalidationJob>> {
	let j;
	let id;
	if (typeof(jobOrID) === "number") {
		if (!job) {
			throw new ClientError("updateContentInvalidationJob", "job");
		}
		id = jobOrID;
		j = job;
	} else {
		j = jobOrID;
		id = j.id;
	}
	return (await this.apiPut<APIResponse<ResponseInvalidationJob>>("jobs", j, {id}, JOBS_DATE_SPEC)).data;
}

/**
 * Deletes a Content Invalidation Job.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param job The Content Invalidation Job to be deleted, or just its ID.
 * @returns The server's response.
 */
export async function deleteContentInvalidationJob(
	this: Client,
	job: number | ResponseInvalidationJob
): Promise<APIResponse<ResponseInvalidationJob>> {
	const id = typeof(job) === "number" ? job : job.id;
	return (await this.apiDelete<APIResponse<ResponseInvalidationJob>>("jobs", {id}, JOBS_DATE_SPEC)).data;
}
