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
import type { APIResponse, CDN, CDNDNSSECKeyGenerationRequest, CDNDNSSECKeys, CDNKSKGenerationRequest } from "trafficops-types";

import type { Client } from "./index";

/** This is just a very long type so I gave it its own line. */
type KSKGenerationResponse = APIResponse<`Successfully generated ksk dnssec keys for ${string}`>;

/**
 * Requests that Traffic Ops generate a Key-Signing-Key for use in DNSSEC for
 * the specified CDN.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param cdn Either the CDN for which to generate KSKs, or its name.
 * @param spec Specifies the details of the KSK being generated.
 * @returns Only a success message - in violation of the API rules, the
 * `response` property contains the success message rather than any
 * success-level alert.
 */
export async function generateCDNKSK(this: Client, cdn: string | CDN, spec: CDNKSKGenerationRequest): Promise<KSKGenerationResponse> {
	const name = typeof(cdn) === "string" ? cdn : cdn.name;
	return (await this.apiPost<KSKGenerationResponse>(`cdns/${name}/dnsseckeys/ksk/generate`, spec)).data;
}

/**
 * The type of a response to a `POST` request made to the
 * `/cdns/dnssseckeys/generate` API endpoint.
 */
type CreateResponse = APIResponse<`Successfully created dnssec keys for ${string}`>;

/**
 * Requests that Traffic Ops generate DNSSEC key pairs for a CDN.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param request The details about the keys to be generated.
 * @returns Only a success message - in violation of the API rules, the
 * `response` property contains the success message rather than any
 * success-level alert.
 */
export async function generateCDNDNSSECKeys(this: Client, request: CDNDNSSECKeyGenerationRequest): Promise<CreateResponse> {
	return (await this.apiPost<CreateResponse>("cdns/dnsseckeys/generate", request)).data;
}

/**
 * Requests a "refresh" of all existing DNSSEC Keys for all CDNs (and all
 * Delivery Services) by recreating those that have expired.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @returns The server's response. Note that the Alerts contain information on
 * how to check on the progress of that request.
 */
export async function refreshAllDNSSECKeys(this: Client): Promise<APIResponse<undefined>> {
	return (await this.apiGet("cdns/dnsseckeys/refresh")).data;
}

/**
 * Retrieves the DNSSEC Keys belonging to the specified CDN.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param cdn The CDN for which to retrieve DNSSEC Keys, or its name.
 * @returns The server's response.
 */
export async function getCDNDNSSECKeys(this: Client, cdn: string | CDN): Promise<APIResponse<{[cdnOrDS: string]: CDNDNSSECKeys}>> {
	const name = typeof(cdn) === "string" ? cdn : cdn.name;
	const timestampKeys = ["expirationDate", "inceptionDate"];
	return (await this.apiGet<APIResponse<{[cdnOrDS: string]: CDNDNSSECKeys}>>(`cdns/name/${name}/dnsseckeys`, undefined, {unix: timestampKeys})).data;
}

/**
 * The return type of the `DELETE` method of the
 * `/cdns/name/{{name}}/dnsseckeys` API endpoint.
 */
type DeleteResponse = APIResponse<`Successfully deleted dnssec keys for ${string}`>;

/**
 * Deletes all DNSSEC keys within the specified CDN - including those belonging
 * to Delivery Services within that CDN.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param cdn Either the CDN for which DNSSEC keys will be deleted, or its name.
 * @returns Only a success message - in violation of the API rules, the
 * `response` property contains the success message rather than any
 * success-level alert.
 */
export async function deleteCDNDNSSECKeys(this: Client, cdn: string | CDN): Promise<DeleteResponse> {
	const name = typeof(cdn) === "string" ? cdn : cdn.name;
	return (await this.apiDelete<DeleteResponse>(`cdns/name/${name}/dnsseckeys`)).data;
}
