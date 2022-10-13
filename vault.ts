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
import type { APIResponse, BucketValues, VaultPing } from "trafficops-types";

import type { Client } from "./index";

/**
 * "Pings" Traffic Vault for status information.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @returns The server's response.
 */
export async function pingVault(this: Client): Promise<APIResponse<VaultPing>> {
	return (await this.apiGet<APIResponse<VaultPing>>("vault/ping")).data;
}

/**
 * Retrieves the "object" stored under a given "key" from a given "bucket" in
 * Traffic Vault (Riak backend only).
 *
 * @deprecated Support for Riak as a Traffic Vault backend has been dropped in
 * the latest release of ATC, so this endpoint - although it may still exist in
 * legacy API versions - serves no purpose.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param bucket The bucket that the key is stored under.
 * @param key The key that the object is stored under.
 * @returns The server's response.
 */
export async function getVaultKeyBucketValue(this: Client, bucket: string, key: string): Promise<APIResponse<BucketValues>> {
	return (await this.apiGet<APIResponse<BucketValues>>(`vault/bucket/${bucket}/key/${key}/values`)).data;
}
