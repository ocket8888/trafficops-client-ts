/**
 * Query-string parameters that control pagination, which are supported by a
 * great many endpoints.
 */
export type PaginationParams = {
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
};
