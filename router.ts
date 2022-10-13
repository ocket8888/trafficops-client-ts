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
import type { APIResponse, ConsistentHashRegexTest, ConsistentHashRegexTestResult, ResponseCDN } from "trafficops-types";

import { ClientError } from "./api.error.js";

import type { Client } from "./index";

/**
 * Checks if an argument to {@link testConsistentHashingRegexp} is a
 * {@link ResponseCDN}.
 *
 * @param x The object to test.
 * @returns `true` if `x` is a {@link ResponseCDN}, `false` otherwise.
 */
function isResponseCDN(x: ResponseCDN | ConsistentHashRegexTest): x is ResponseCDN {
	return Object.prototype.hasOwnProperty.call(x, "id");
}

/**
 * Test Pattern-Based Consistent Hashing for a Delivery Service using a regular
 * expression and a request path.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param cdn The CDN for which a regular expression will be tested (or just its
 * ID).
 * @param regex The regular expression being tested.
 * @param requestPath The request path against which `regex` will be tested for
 * a match.
 * @returns The server's response.
 */
export async function testConsistentHashingRegexp(
	this: Client,
	cdn: ResponseCDN | number,
	regex: string | RegExp,
	requestPath: string
): Promise<APIResponse<ConsistentHashRegexTestResult>>;
/**
 * Test Pattern-Based Consistent Hashing for a Delivery Service using a regular
 * expression and a request path.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param request A whole request for testing a consistent hashing regular
 * expression.
 * @returns The server's response.
 */
export async function testConsistentHashingRegexp(
	this: Client,
	request: ConsistentHashRegexTest
): Promise<APIResponse<ConsistentHashRegexTestResult>>;
/**
 * Test Pattern-Based Consistent Hashing for a Delivery Service using a regular
 * expression and a request path.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param cdnOrRequest Either a whole testing request, or the CDN for which a
 * regular expression will be tested (or just its ID).
 * @param regex The regular expression being tested. This is required if
 * `cdnOrRequest` specifies a CDN, and ignored otherwise.
 * @param requestPath The request path against which `regex` will be tested for
 * a match. This is required if `cdnOrRequest` specifies a CDN, and ignored
 * otherwise.
 * @returns The server's response.
 */
export async function testConsistentHashingRegexp(
	this: Client,
	cdnOrRequest: number | ResponseCDN | ConsistentHashRegexTest,
	regex?: string | RegExp,
	requestPath?: string
): Promise<APIResponse<ConsistentHashRegexTestResult>> {
	let p;
	if (typeof(cdnOrRequest) === "number" || isResponseCDN(cdnOrRequest)) {
		if (regex === undefined) {
			if (requestPath === undefined) {
				throw new ClientError("testConsistentHashingRegexp", "regex", "requestPath");
			}
			throw new ClientError("testConsistentHashingRegexp", "regex");
		}
		if (requestPath === undefined) {
			throw new ClientError("testConsistentHashingRegexp", "requestPath");
		}
		regex = typeof(regex) === "string" ? regex : regex.toString();
		p = {
			cdnId: typeof(cdnOrRequest) === "number" ? cdnOrRequest : cdnOrRequest.id,
			regex,
			requestPath
		};
	} else {
		p = cdnOrRequest;
	}
	return (await this.apiPost<APIResponse<ConsistentHashRegexTestResult>>("consistenthash", p)).data;
}
