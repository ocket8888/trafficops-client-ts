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
	ACMEDNSRecord,
	APIResponse,
	CDN,
	CDNDeliveryServiceSSLKeys,
	DeliveryService,
	DeliveryServiceSSLKeyGenerationRequest,
	DeliveryServiceSSLKeyUpload,
	LetsEncryptDeliveryServiceSSLKeyGenerationRequest,
	ResponseDeliveryServiceSSLKey
} from "trafficops-types";

import type { Client } from "./index";

/**
 * Returns SSL certificates for all Delivery Services that are a part of the
 * specified CDN.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param cdn Either the CDN for which SSL keys will be fetched, or just its
 * name.
 * @returns The server's response.
 */
export async function getCDNSSLKeys(this: Client, cdn: string | CDN): Promise<APIResponse<Array<CDNDeliveryServiceSSLKeys>>> {
	const name = typeof(cdn) === "string" ? cdn : cdn.name;
	return (await this.apiGet<APIResponse<Array<CDNDeliveryServiceSSLKeys>>>(`cdns/name/${name}/sslkeys`)).data;
}

/**
 * Uploads a new SSL certificate/key/CSR set for a Delivery Service.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param request The full request including Delivery Service identification and
 * the actual certificate data.
 * @returns The server's response.
 */
export async function addSSLKeysToDeliveryService(this: Client, request: DeliveryServiceSSLKeyUpload): Promise<APIResponse<string>> {
	return (await this.apiPost<APIResponse<string>>("deliveryservices/sslkeys/add", request)).data;
}

/**
 * Generates new SSL keys for a Delivery Service (signed by Traffic Ops).
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param request The full request including Delivery Service identification and
 * the actual data used to construct the certificate.
 * @param useLetsEncrypt Instructs Traffic Ops to not use LetsEncrypt for
 * certificate generation and signing, and to instead generate and sign the
 * certificate itself.
 * @returns The server's response.
 */
export async function generateSSLKeysForDeliveryService(
	this: Client,
	request: DeliveryServiceSSLKeyGenerationRequest,
	useLetsEncrypt?: false | undefined
): Promise<APIResponse<string>>;
/**
 * Generates new SSL keys for a Delivery Service (signed by LetsEncrypt).
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param request The full request including Delivery Service identification and
 * the actual data used to construct the certificate.
 * @param useLetsEncrypt Instructs Traffic Ops to use LetsEncrypt for
 * certificate generation and signing instead of Traffic Ops's host server.
 * @returns The server's response.
 */
export async function generateSSLKeysForDeliveryService(
	this: Client,
	request: LetsEncryptDeliveryServiceSSLKeyGenerationRequest,
	useLetsEncrypt: true
): Promise<APIResponse<undefined>>;
/**
 * Generates new SSL keys for a Delivery Service (signed by Traffic Ops).
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param request The full request including Delivery Service identification and
 * the actual data used to construct the certificate.
 * @param useLetsEncrypt If given and `true`, instructs Traffic Ops to use
 * LetsEncrypt for certificate generation and signing instead of Traffic Ops's
 * host server.
 * @returns The server's response.
 */
export async function generateSSLKeysForDeliveryService(
	this: Client,
	request: DeliveryServiceSSLKeyGenerationRequest | LetsEncryptDeliveryServiceSSLKeyGenerationRequest,
	useLetsEncrypt?: boolean | undefined
): Promise<APIResponse<string | undefined>> {
	let endpoint = "deliveryservices/sslkeys/generate";
	if (useLetsEncrypt) {
		endpoint += "/letsencrypt";
	}
	return (await this.apiPost<APIResponse<string | undefined>>(endpoint, request)).data;
}

/**
 * Parameters that can optionally be used to influence the behavior/results of
 * {@link getDeliveryServiceSSLKey}.
 */
type DSSSLKeyParams = {
	/** @default false */
	decode?: boolean;
	version?: number;
};

/**
 * Fetches the latest SSL key/certificate pair used by a given Delivery Service.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param ds The Delivery Service for which the current SSL key/certificate pair
 * will be fetched, or just its XMLID.
 * @param params Any and all optional parameters for the request.
 * @returns The server's response.
 */
export async function getDeliveryServiceSSLKey(
	this: Client,
	ds: DeliveryService | string,
	params?: DSSSLKeyParams
): Promise<APIResponse<ResponseDeliveryServiceSSLKey>> {
	const xmlID = typeof(ds) === "string" ? ds : ds.xmlId;
	return (await this.apiGet<APIResponse<ResponseDeliveryServiceSSLKey>>(`deliveryservices/xmlId/${xmlID}/sslkeys`, params)).data;
}

/**
 * Removes all SSL Keys associated with the given Delivery Service.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param ds The Delivery Service for all current SSL key/certificate pair will
 * be removed, or just its XMLID.
 * @returns The server's response.
 */
export async function removeDeliveryServiceSSLKeys(
	this: Client,
	ds: DeliveryService | string
): Promise<APIResponse<string>> {
	const xmlID = typeof(ds) === "string" ? ds : ds.xmlId;
	return (await this.apiDelete<APIResponse<string>>(`deliveryservices/xmlId/${xmlID}/sslkeys`)).data;
}

/**
 * Refreshes the SSL keys used by a Delivery Service by re-generating them. Note
 * that this **only** works for key/certificate pairs generated through
 * LetsEncrypt.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param ds The Delivery Service for all current SSL key/certificate pair will
 * be refreshed, or just its XMLID.
 * @returns The server's response.
 */
export async function refreshDeliveryServiceSSLKeys(this: Client, ds: DeliveryService | string): Promise<APIResponse<undefined>> {
	const xmlID = typeof(ds) === "string" ? ds : ds.xmlId;
	return (await this.apiPost(`deliveryservices/xmlId/${xmlID}/sslkeys/refresh`)).data;
}

/**
 * Automatically re-generates LetsEncrypt-based SSL key/certificate pairs for
 * all applicable Delivery Services.
 *
 * @deprecated LetsEncrypt-specific endpoints have been removed in the latest
 * version of the Traffic Ops API, in favor of a more generic ACME interface.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @returns The server's response.
 */
export async function autoRenewLetsEncryptCertificates(this: Client): Promise<APIResponse<undefined>> {
	return (await this.apiPost("letsencrypt/autorenew")).data;
}

/**
 * Gets DNS records used for LetsEncrypt-based certificate generation.
 *
 * @deprecated LetsEncrypt-specific endpoints have been removed in the latest
 * version of the Traffic Ops API, in favor of a more generic ACME interface.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param fqdn If given, only DNS records for zones matching this FQDN will be
 * returned.
 * @returns The server's response.
 */
export async function getLetsEncryptDNSRecords(this: Client, fqdn?: string): Promise<APIResponse<Array<ACMEDNSRecord>>> {
	const p = fqdn ? {fqdn} : undefined;
	return (await this.apiGet<APIResponse<Array<ACMEDNSRecord>>>("letsencrypt/dnsrecords", p)).data;
}
