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
import type { APIResponse, DeliveryService, DSURISignatureKeys, DSURLKeys } from "trafficops-types";

import type { Client } from "./index";

/**
 * Sets the URI Signing keys of a Delivery Service to those provided.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param ds The Delivery Service having its keys set, or just its XMLID.
 * @param keys The keys being set on the Delivery Service.
 * @returns The servers response.
 */
export async function setURISigningKeys(
	this: Client,
	ds: string | DeliveryService,
	keys: DSURISignatureKeys
): Promise<DSURISignatureKeys> {
	const xmlID = typeof(ds) === "string" ? ds : ds.xmlId;
	return (await this.apiPost<DSURISignatureKeys>(`deliveryservices/${xmlID}/urisignkeys`, keys)).data;
}

/**
 * Gets the URI Signing keys of a Delivery Service.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param ds The Delivery Service having its keys retrieved, or just its XMLID.
 * @returns The servers response.
 */
export async function getURISigningKeys(this: Client, ds: string | DeliveryService): Promise<DSURISignatureKeys> {
	const xmlID = typeof(ds) === "string" ? ds : ds.xmlId;
	return (await this.apiGet<DSURISignatureKeys>(`deliveryservices/${xmlID}/urisignkeys`)).data;
}

/**
 * Removes **all** URI Signing Keys from the given Delivery Service.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param ds The Delivery Service having its keys removed, or just its XML ID.
 * @returns The servers response.
 */
export async function removeURISigningKeys(this: Client, ds: string | DeliveryService): Promise<APIResponse<undefined>> {
	const xmlID = typeof(ds) === "string" ? ds : ds.xmlId;
	return (await this.apiDelete(`deliveryservices/${xmlID}/urisignkeys`)).data;
}

/**
 * Generates URL keys for the given Delivery Service.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param ds The Delivery Service for which URL keys will be generated, or just
 * its XML ID.
 * @returns The servers response.
 */
export async function generateURLKeys(this: Client, ds: string | DeliveryService): Promise<APIResponse<string>> {
	const xmlID = typeof(ds) === "string" ? ds : ds.xmlId;
	return (await this.apiPost<APIResponse<string>>(`deliveryservices/xmlId/${xmlID}/urlkeys/generate`)).data;
}

/**
 * Gets the URL keys of the given Delivery Service.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param ds The Delivery Service for which URL keys will be retrieved, or just
 * its XML ID.
 * @returns The servers response.
 */
export async function getURLKeys(this: Client, ds: string | DeliveryService): Promise<APIResponse<DSURLKeys>> {
	const xmlID = typeof(ds) === "string" ? ds : ds.xmlId;
	return (await this.apiGet<APIResponse<DSURLKeys>>(`deliveryservices/xmlId/${xmlID}/urlkeys`)).data;
}

/**
 * Copies the URL keys of one Delivery Service to another.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param from The Delivery Service from which URL keys will be copied, or just
 * its XML ID.
 * @param to The Delivery Service to which URL keys will be copied, or just its
 * XML ID.
 * @returns The servers response.
 */
export async function copyURLKeys(
	this: Client,
	from: string | DeliveryService,
	to: string | DeliveryService
): Promise<APIResponse<string>> {
	const fromID = typeof(from) === "string" ? from : from.xmlId;
	const toID = typeof(to) === "string" ? to : to.xmlId;
	return (await this.apiPost<APIResponse<string>>(`deliveryservices/xmlId/${toID}/urlkeys/copyFromXmlId/${fromID}`)).data;
}
