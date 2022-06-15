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

/** A specification of the keys that should be parsed as dates. */
export interface DateKeySpec {
	/** Keys that should be parsed as RFC3339 or the custom Trafic Ops format */
	dateString?: readonly string[];
	/**
	 * Keys that should be parsed as Unix epoch timestamps e.g. 2147483647
	 * They are assumed to be in seconds, unless they are a tuple in which case
	 * the second value specifies a multiplier to be applied to values which
	 * will convert them to milliseconds e.g. 0.001 for nanosecond stamps.
	 */
	unix?: readonly (string | [string, number])[];
}

/**
 * Parses a (possible) Unix epoch timestamp and returns the corresponding Date
 * if successful.
 *
 * @param value some arbitrary value produced by the JSON parser that may or may
 * not be a unix timestamp.
 * @param multiplier A multiplier which, when applied to the numeric value of
 * `value` will yield a number of milliseconds since the Unix epoch. If this is
 * `undefined`, `value` is returned unchanged.
 * @returns A parsed Date, if possible, or the value unchanged if not.
 */
function parseUnix<T>(value: T, multiplier: number | undefined): T | Date {
	if (multiplier === undefined) {
		return value;
	}

	switch(typeof(value)) {
		case "string":
			const num = Number(value);
			if (Number.isNaN(num)) {
				return value;
			}
			return new Date(num*multiplier);
		case "number":
			return new Date(value*multiplier);
	}

	return value;
}

/**
 * Creates a parser for transforming incoming API responses from raw JSON into
 * actual objects.
 *
 * @param dateKeys An object that specifies lists of keys that should be treated
 * like Dates. If any of the keys in these lists are found but aren't strings in
 * the response (or numbers, in the case of Unix epoch timestamps), they will be
 * silently ignored. Any dates that cannot be parsed are set to an "Invalid
 * Date" value (one with a NaN numeric value) - errors are **not** thrown in
 * that case and parsing does **not** fail. If a key appears in both then the
 * dateString entry will take precedence, and an attempt will be made to parse
 * it as a unix timestamp if that fails.
 * @returns A function suitable for use as an Axios `transformResponse`
 * function.
 */
export function createParser(dateKeys?: DateKeySpec): (raw: string) => object {
	if (!dateKeys || ((!dateKeys.dateString||dateKeys.dateString.length < 1)&&(!dateKeys.unix||dateKeys.unix.length < 1))) {
		return JSON.parse;
	}
	if (dateKeys.unix && dateKeys.unix.length < 1) {
		if (!dateKeys.dateString || dateKeys.dateString.length < 1) {
			const revivable = new Map(dateKeys.unix.map(dk=>Array.isArray(dk) ? dk : [dk, 1000]));
			return raw => JSON.parse(raw,
				(key, value) => parseUnix(value, revivable.get(key))
			);
		}
		const dateStrs = new Set(dateKeys.dateString);
		const unixKeys = new Map(dateKeys.unix.map(dk=>Array.isArray(dk) ? dk : [dk, 1000]));
		return raw => JSON.parse(raw,
			(key, value) => {
				if (dateStrs.has(key)) {
					const dateVal = new Date(value.replace(" ", "T").replace("+00", "Z"));
					if (!Number.isNaN(dateVal.getTime())) {
						return dateVal;
					}
				}
				return parseUnix(value, unixKeys.get(key));
			}
		);
	}

	const revivable = new Set(dateKeys.dateString);
	return raw => JSON.parse(raw,
		(key, value) => {
			if (revivable.has(key) && typeof(value) === "string") {
				return new Date(value.replace(" ", "T").replace("+00", "Z"));
			}
			return value;
		}
	);
}
