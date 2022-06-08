/**
 * Query-string parameters that control pagination, which are supported by a
 * great many endpoints.
 */
export type PaginationParams = ({
	/**
	 * Limit the number of results returned. When `page` is defined, this
	 * instead sets the length of the "pages".
	 */
	limit: number;
	/**
	 * filters the  response to those found within the `page`th "page" of the
	 * result set, where a page is `limit` entries long.
	 */
	page?: number;
} | {
	/**
	 * Limit the number of results returned.
	 */
	limit: number;
	/**
	 * Omit the first `offset` entries from the result set.
	 */
	offset?: number;
} | {
	/**
	 * Limit the number of results returned.
	 */
	limit?: number;
}) & {
	/**
	 * Sets the order of sorting - ASCending or DESCending.
	 *
	 * @default "asc"
	 */
	 sortOrder?: "asc" | "desc";
};

/**
 * Creates a parser for transforming incoming API responses from raw JSON into
 * actual objects.
 *
 * @param dateKeys A list of all keys that should be treated like Dates. If any
 * of the keys in this list are found but aren't strings in the response, they
 * will be silently ignored. Any dates that cannot be parsed are set to an
 * "Invalid Date" value (one with a NaN numeric value) - errors are **not**
 * thrown in that case and parsing does **not** fail.
 * @returns A function suitable for use as an Axios `transformResponse`
 * function.
 */
export function createParser(dateKeys: readonly string[]): (raw: string) => object {
	const revivable = new Set(dateKeys);
	return raw => JSON.parse(raw,
		(key, value) => {
			if (revivable.has(key) && typeof(value) === "string") {
				return new Date(value.replace(" ", "T").replace("+00", "Z"));
			}
			return value;
		}
	);
}
