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
	CacheStats,
	CacheStatsSeries,
	CacheStatsSummary,
	Capacity,
	CurrentStats,
	DSStats,
	DSStatsMetricType,
	Health,
	RequestStatsSummary,
	ResponseDeliveryService,
	ResponseStatsSummary,
	Routing,
} from "trafficops-types";

import type { PaginationParams } from "./util";

import type { Client } from "./index";

/**
 * A valid string for the `interval` query string parameter of the `cache_stats`
 * API endpoint.
 */
type IntervalString = `${number}${"m" | "d" | "h" | "w"}`;

/**
 * Checks if a string may be used as an `interval` for the query string of a
 * request made to `cache_stats` (via {@link cacheStats}).
 *
 * @param s The string to check.
 * @returns `true` if `s` may be used as an `interval`, `false` otherwise.
 */
export function isValidIntervalString(s: string): s is IntervalString {
	return /^\d+[mdhw]$/.test(s);
}

/**
 * Additional, optional query string parameters for a request to `cache_stats`
 * (via {@link cacheStats}).
 */
interface Params {
	/** Optionally exclude part of the response. */
	exclude?: "series" | "summary";
	/** Limit the number of returned results. */
	limit?: number;
	/** Set the interval used for "bucketing" response data. */
	interval?: IntervalString;
	/**
	 * A number of data points to exclude starting from the beginning of the
	 * data set date range.
	 */
	offset?: number;
}

/** A string that can be passed as a date to {@link cacheStats}. */
type DateString = `${number}-${number}-${number}T${number}:${number}:${number}Z` |
	`${number}-${number}-${number}T${number}:${number}:${number}.${number}Z` |
	`${number}-${number}-${number} ${number}:${number}:${number}+${number}` |
	`${number}-${number}-${number} ${number}:${number}:${number}-${number}`;

/**
 * Checks if a string can be used as a starting or ending date as an argument to
 * {@link cacheStats}.
 *
 * @param s The string to check.
 * @returns `true` if `s` is a valid {@link DateString}, `false` otherwise.
 */
export function isValidDateString(s: string): s is DateString {
	return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(s) ||
		/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}[+-]\d{2}$/.test(s);
}

/**
 * The different representations of "dates" allowed by {@link cacheStats} as its
 * `startDate` and/or `endDate` argument(s). This can be a date string in
 * RFC3339 format or the custom "Traffic Ops format", the number of seconds
 * since "Unix Epoch", or an actual Date.
 */
type DateLike = DateString | number | Date;

/**
 * Gets cache statistics for a specific CDN, excluding the actual series of data
 * points.
 *
 * @param this Tells TypeScript this is a Client method.
 * @param cdn The name of the CDN for which cache statistics should be fetched.
 * @param metricType The type of data requested.
 * @param startDate The lower limit on the date range of data to return.
 * @param endDate The upper limit on the date range of data to return.
 * @param params Additional query string parameters to send in the request.
 * @returns The server's response.
 */
export async function cacheStats(
	this: Client,
	cdn: string,
	metricType: "connections" | "bandwidth" | "maxkbps",
	startDate: DateLike,
	endDate: DateLike,
	params: Params & {exclude: "series"}
): Promise<APIResponse<{summary: CacheStatsSummary}>>;
/**
 * Gets cache statistics for a specific CDN, excluding a summary of the data
 * returned.
 *
 * @param this Tells TypeScript this is a Client method.
 * @param cdn The name of the CDN for which cache statistics should be fetched.
 * @param metricType The type of data requested.
 * @param startDate The lower limit on the date range of data to return.
 * @param endDate The upper limit on the date range of data to return.
 * @param params Additional query string parameters to send in the request.
 * @returns The server's response.
 */
export async function cacheStats(
	this: Client,
	cdn: string,
	metricType: "connections" | "bandwidth" | "maxkbps",
	startDate: DateLike,
	endDate: DateLike,
	params: Params & {exclude: "summary"}
): Promise<APIResponse<{series: CacheStatsSeries}>>;
/**
 * Gets cache statistics for a specific CDN.
 *
 * @param this Tells TypeScript this is a Client method.
 * @param cdn The name of the CDN for which cache statistics should be fetched.
 * @param metricType The type of data requested.
 * @param startDate The lower limit on the date range of data to return.
 * @param endDate The upper limit on the date range of data to return.
 * @param params Additional query string parameters to send in the request.
 * @returns The server's response.
 */
export async function cacheStats(
	this: Client,
	cdn: string,
	metricType: "connections" | "bandwidth" | "maxkbps",
	startDate: DateLike,
	endDate: DateLike,
	params?: Params & {exclude?: undefined}
): Promise<APIResponse<{series: CacheStatsSeries; summary: CacheStatsSummary}>>;
/**
 * Gets cache statistics for a specific CDN.
 *
 * @param this Tells TypeScript this is a Client method.
 * @param cdn The name of the CDN for which cache statistics should be fetched.
 * @param metricType The type of data requested.
 * @param startDate The lower limit on the date range of data to return.
 * @param endDate The upper limit on the date range of data to return.
 * @param params Additional query string parameters to send in the request.
 * @returns The server's response.
 */
export async function cacheStats(
	this: Client,
	cdn: string,
	metricType: "connections" | "bandwidth" | "maxkbps",
	startDate: DateLike,
	endDate: DateLike,
	params?: Params
): Promise<APIResponse<CacheStats>> {
	let start;
	if (startDate instanceof Date) {
		start = startDate.toISOString();
	} else {
		start = String(startDate);
	}
	let end;
	if (endDate instanceof Date) {
		end = endDate.toISOString();
	} else {
		end = String(endDate);
	}
	return (await this.apiGet<APIResponse<CacheStats>>("cache_stats", {
		cdnName: cdn,
		endDate: end,
		metricType,
		startDate: start,
		...params
	})).data;
}

/**
 * Extract health information from all Cache Groups across all CDNs.
 *
 * @param this Tells TypeScript this is a Client method.
 * @returns The server's response.
 */
export async function getCDNsHealth(this: Client): Promise<APIResponse<Health>> {
	return (await this.apiGet<APIResponse<Health>>("cdns/health")).data;
}

/**
 * Retrieves the aggregated routing percentages across all CDNs.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @returns The server's response.
 */
export async function getCDNsRoutingInfo(this: Client): Promise<APIResponse<Routing>> {
	return (await this.apiGet<APIResponse<Routing>>("cdns/routing")).data;
}

/**
 * Extract caching capacity information for all existing CDNs.
 *
 * @param this Tells TypeScript this is a Client method.
 * @returns The server's response.
 */
export async function getCDNsCapacity(this: Client): Promise<APIResponse<Capacity>> {
	return (await this.apiGet<APIResponse<Capacity>>("cdns/capacity")).data;
}

/**
 * Retrieves the routing result percentages for a Delivery Service.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param ds The Delivery Service for which Routing information will be fetched,
 * or just its ID.
 * @returns The server's response.
 */
export async function getDeliveryServiceRoutingInfo(this: Client, ds: ResponseDeliveryService | number): Promise<APIResponse<Routing>> {
	const id = typeof(ds) === "number" ? ds : ds.id;
	return (await this.apiGet<APIResponse<Routing>>(`deliveryservices/${id}/routing`)).data;
}

/**
 * Retrieves current statistics for each CDN and an aggregate across them all.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @returns The server's response.
 */
export async function getCurrentStats(this: Client): Promise<APIResponse<CurrentStats>> {
	return (await this.apiGet<APIResponse<CurrentStats>>("current_stats")).data;
}

/**
 * Optional settings that affect the behavior of
 * {@link getDeliveryServiceStats}.
 */
type DSStatsParams = {
	/**
	 * If set to `"series"`, the `series` property of the returned data is
	 * guaranteed to be omitted (note that it's also omitted if there is no data
	 * in the specified time frame), and if set to `"summary"` the `summary`
	 * property of the returned data will be omitted.
	 *
	 * @default undefined
	 */
	exclude?: "series" | "summary";
	/**
	 * Set the interval size of data points in minutes, hours, days, or weeks.
	 *
	 * @default "1m"
	 */
	interval?: `${number}${"m" | "h" | "d" | "w"}`;
	/**
	 * Limit the number of results returned.
	 *
	 * @default undefined
	 */
	limit?: number;
	offset?: number;
	/** @default "time" */
	orderby?: "time";
};

/** Matches RFC3339 date strings. */
const dsStatDatePattern = /^\d{4}-(?:0[1-9]|1[012])-(?:0[1-9]|[12]\d|3[01])T(?:[01]\d|2[0123]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-]\d\d:\d\d)$/;

/**
 * A `JSON.parse` reviver function that parses Delivery Service Stats data such
 * that the "time" data points are converted into proper `Date` instances.
 *
 * @param this The context is the object being parsed - which is unknowable
 * during parsing.
 * @param key The key of the value being parsed (numeric strings used for array
 * indices).
 * @param value The raw JSON value being parsed (can be number, string, object,
 * array or null).
 * @returns A date for data points that
 */
function dsStatsReviver(this: unknown, key: string, value: unknown): unknown {
	if (key === "0" && typeof(value) === "string" && Array.isArray(this) && this.length === 2 && dsStatDatePattern.test(value)) {
		return new Date(value);
	}
	return value;
}

/**
 * Gets Delivery Service statistics from Traffic Stats (through the Traffic Ops
 * API).
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param ds The Delivery Service for which statistics will be gathered, or its
 * ID, or its XMLID.
 * @param startDate The Date from which to start the collected data range, as a
 * proper `Date` or a number of milliseconds since Unix epoch.
 * @param endDate The Date at which to end the collected data range, as a proper
 * `Date` or a number of milliseconds since Unix epoch.
 * @param metricType The data series requested.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 */
export async function getDeliveryServiceStats(
	this: Client,
	ds: number | string | ResponseDeliveryService,
	startDate: number | Date,
	endDate: number | Date,
	metricType: DSStatsMetricType,
	params?: DSStatsParams
): Promise<APIResponse<DSStats>> {
	const p: Record<string, number | string> = params ?? {};
	switch (typeof(ds)) {
		case "number":
			p.deliveryService = ds;
			break;
		case "string":
			p.deliveryServiceName = ds;
			break;
		default:
			p.deliveryServiceName = ds.xmlId;
	}
	p.startDate = typeof(startDate) === "number" ? startDate * 1000 : startDate.toISOString();
	p.endDate = typeof(endDate) === "number" ? endDate * 1000 : endDate.toISOString();
	p.metricType = metricType;
	return (await this.apiGet<APIResponse<DSStats>>("deliveryservice_stats", p, dsStatsReviver)).data;
}

/**
 * Extract health information from all Cache Groups that serve content for a
 * given Delivery Service.
 *
 * @param this Tells TypeScript this is a Client method.
 * @param ds The Delivery Service for which health will be determined, or just
 * its ID.
 * @returns The server's response.
 */
export async function getDeliveryServiceHealth(this: Client, ds: number | ResponseDeliveryService): Promise<APIResponse<Health>> {
	const id = typeof(ds) === "number" ? ds : ds.id;
	return (await this.apiGet<APIResponse<Health>>(`deliveryservices/${id}/health`)).data;
}

/**
 * Extract caching capacity information for a given Delivery Service.
 *
 * @param this Tells TypeScript this is a Client method.
 * @param ds The Delivery Service for which capacity will be determined, or just
 * its ID.
 * @returns The server's response.
 */
export async function getDeliveryServiceCapacity(this: Client, ds: number | ResponseDeliveryService): Promise<APIResponse<Capacity>> {
	const id = typeof(ds) === "number" ? ds : ds.id;
	return (await this.apiGet<APIResponse<Capacity>>(`deliveryservices/${id}/capacity`)).data;
}

/**
 * Optional settings that affect the behavior/output of {@link getStatsSummary}.
 */
type StatsSummaryParams = PaginationParams & {
	cdnName?: string;
	/** XMLID */
	deliveryServiceName?: string;
	orderby?: "deliveryServiceName" | "cdnName" | "statName";
	statName?: string;
};

/**
 * The type of the response returned by {@link getStatsSummaryLastUpdatedTime}.
 */
interface SummaryTimeResponse {
	summaryTime: Date;
}

/**
 * Retrieves a summary of some stat or stats from Traffic Ops.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param params Any and all optional settings for the request.
 * @returns The server's response.
 */
export async function getStatsSummary(this: Client, params?: StatsSummaryParams): Promise<APIResponse<Array<ResponseStatsSummary>>> {
	return (await this.apiGet<APIResponse<Array<ResponseStatsSummary>>>("stats_summary", params, {dateString: ["summaryTime"]})).data;
}

/**
 * Gets the time at which a stats summary was last added.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param statName Optionally, the name of a stat for which to fetch the last
 * updated time. Otherwise, the response will be the time at which any stat
 * summary was last updated.
 * @returns The server's response.
 */
export async function getStatsSummaryLastUpdatedTime(this: Client, statName?: string): Promise<APIResponse<SummaryTimeResponse>> {
	let p;
	if (statName) {
		p = {
			lastSummaryDate: true,
			statName,
		};
	} else {
		p = {
			lastSummaryDate: true
		};
	}
	return (await this.apiGet<APIResponse<SummaryTimeResponse>>("stats_summary", p, {dateString: ["summaryTime"]})).data;
}

/**
 * Uploads a summary of some statistic to Traffic Ops.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param summary The summary to be uploaded.
 * @returns The server's response.
 */
export async function uploadStatsSummary(this: Client, summary: RequestStatsSummary): Promise<APIResponse<undefined>> {
	return (await this.apiPost("stats_summary", summary)).data;
}
