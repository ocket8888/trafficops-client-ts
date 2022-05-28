import type { APIResponse, CacheStats, CacheStatsSeries, CacheStatsSummary } from "trafficops-types";

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
export async function cacheStats(this: Client, cdn: string, metricType: "connections" | "bandwidth" | "maxkbps", startDate: DateLike, endDate: DateLike, params: Params & {exclude: "series"}): Promise<APIResponse<{summary: CacheStatsSummary}>>;
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
export async function cacheStats(this: Client, cdn: string, metricType: "connections" | "bandwidth" | "maxkbps", startDate: DateLike, endDate: DateLike, params: Params & {exclude: "summary"}): Promise<APIResponse<{series: CacheStatsSeries}>>;
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
export async function cacheStats(this: Client, cdn: string, metricType: "connections" | "bandwidth" | "maxkbps", startDate: DateLike, endDate: DateLike, params?: Params & {exclude?: undefined}): Promise<APIResponse<{series: CacheStatsSeries; summary: CacheStatsSummary}>>;
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
