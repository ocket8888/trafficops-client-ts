import type { ACMEAccount, APIResponse } from "trafficops-types";

import { ClientError } from "./api.error.js";

import type { Client } from "./index";

/**
 * Gets the ACME accounts stored in Traffic Ops.
 *
 * @param this Tells TypeScript this is a Client method.
 * @returns The server's response.
 */
export async function getACMEAccounts(this: Client): Promise<APIResponse<Array<ACMEAccount>>> {
	const resp = await this.apiGet<APIResponse<Array<ACMEAccount>>>("acme_accounts");
	return resp.data;
}

/**
 * Creates a new ACME account.
 *
 * @param this Tells TypeScript this is a Client method.
 * @param account The ACME account to be created.
 * @returns The server's response.
 */
export async function createACMEAccount(this: Client, account: ACMEAccount): Promise<APIResponse<ACMEAccount>> {
	const resp = await this.apiPost<APIResponse<ACMEAccount>>("acme_accounts", account);
	return resp.data;
}

/**
 * Updates an existing ACME account.
 *
 * @param this Tells TypeScript this is a Client method.
 * @param account The account to be updated _and_ the updates to that account.
 * An ACME account is identified by a combination of its provider and its email,
 * so the ACME account that will be updated is the one with the same provider
 * and email as this argument (effectively this renders those properties of an
 * ACME account immutable).
 * @returns The server's response.
 */
export async function updateACMEAccount(this: Client, account: ACMEAccount): Promise<APIResponse<ACMEAccount>> {
	const resp = await this.apiPut<APIResponse<ACMEAccount>>("acme_accounts", account);
	return resp.data;
}

/**
 * Deletes an ACME account.
 *
 * @param this Tells TypeScript this is a Client method.
 * @param account The ACME account to be deleted.
 * @returns The server's response.
 */
export async function deleteACMEAccount(this: Client, account: ACMEAccount): Promise<APIResponse<undefined>>;
/**
 * Deletes an ACME account.
 *
 * @param this Tells TypeScript this is a Client method.
 * @param email The email address associated with the ACME account to be
 * deleted.
 * @param provider The provider for the ACME account to be deleted.
 * @returns The server's response.
 */
export async function deleteACMEAccount(this: Client, email: string, provider: string): Promise<APIResponse<undefined>>;
/**
 * Deletes an ACME account.
 *
 * @param this Tells TypeScript this is a Client method.
 * @param accountOrEmail Either the account to be deleted, or the email
 * associated with said ACME account. If this is an email address, then
 * `provider` **must** be given.
 * @param provider The provider for the ACME account to be deleted. This only
 * has any meaning/purpose when `accountOrEmail` was given as an email address.
 * @returns The server's response.
 */
export async function deleteACMEAccount(
	this: Client,
	accountOrEmail: ACMEAccount | string,
	provider?: string
): Promise<APIResponse<undefined>> {
	let email: string;
	let prvdr: string;
	if (typeof(accountOrEmail) === "string") {
		email = accountOrEmail;
		if (provider === undefined) {
			throw new ClientError("deleteACMEAccount", "provider");
		}
		prvdr = provider;
	} else {
		email = accountOrEmail.email;
		prvdr = accountOrEmail.provider;
	}

	const path = `acme_accounts/${encodeURIComponent(prvdr)}/${encodeURIComponent(email)}`;
	return (await this.apiDelete(path)).data;
}
