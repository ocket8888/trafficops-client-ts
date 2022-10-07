import type {
	APIResponse,
	Profile,
	ProfileCopyResponse,
	ProfileExport,
	ProfileImport,
	ProfileImportResponse,
	RequestParameter,
	RequestProfile,
	RequestProfileParameters,
	RequestProfileParametersResponse,
	ResponseParameter,
	ResponseProfile } from "trafficops-types";

import { APIError, ClientError } from "./api.error.js";
import type { PaginationParams } from "./util";

import type { Client } from "./index";

/**
 * Optional settings that can affect the results returned by
 * {@link getParameters}.
 */
type ParameterParams = PaginationParams & {
	/** Filter results by ConfigFile. */
	configFile?: string;
	/** Filter results by ID. */
	id?: number;
	/** Filter results by Name. */
	name?: string;
	/** Order the result set by the specified property's value. */
	orderby?: Exclude<keyof ResponseParameter, "lastUpdated">;
	/** Filter results by Value. */
	value?: string;
};

/**
 * Retrieves Parameters.
 *
 * @param this Tells TypeScript this is a Client method.
 * @param params Any and all optional settings to use in the request.
 * @returns The server's response.
 */
export async function getParameters(this: Client, params?: ParameterParams): Promise<APIResponse<Array<ResponseParameter>>>;
/**
 * Retrieves a Parameter
 *
 * @param this Tells TypeScript this is a Client method.
 * @param id The ID of a single Parameter to be retrieved.
 * @param params Any and all optional settings to use in the request.
 * @returns The server's response.
 * @throws {APIError} when Traffic Ops responds with zero or more than one
 * result(s).
 */
export async function getParameters(this: Client, id: number, params?: ParameterParams): Promise<APIResponse<ResponseParameter>>;
/**
 * Retrieves Parameters.
 *
 * @param this Tells TypeScript this is a Client method.
 * @param idOrParams Either the ID of a single Parameter to be retrieved, or any
 * and all optional settings to use in the request.
 * @param params Any and all optional settings to use in the request. This is
 * ignored if optional settings were provided as `idOrParams`.
 * @returns The server's response.
 * @throws {APIError} when a single Parameter is requested, but Traffic Ops
 * responds with zero or more than one result(s).
 */
export async function getParameters(
	this: Client,
	idOrParams?: number | ParameterParams,
	params?: ParameterParams
): Promise<APIResponse<Array<ResponseParameter>|ResponseParameter>> {
	let p;
	let single = false;
	if (typeof(idOrParams) === "number") {
		p = {...params, id: idOrParams};
		single = true;
	} else {
		p = idOrParams;
	}
	const resp = await this.apiGet<APIResponse<Array<ResponseParameter>>>("parameters", p);
	if (single) {
		const len = resp.data?.response?.length;
		if (len !== 1) {
			throw new APIError(`requesting a Parameter by ID ${idOrParams} yielded ${len} results`, resp.status, resp.headers);
		}
		return {...resp.data, response: resp.data.response[0]};
	}
	return resp.data;
}

/**
 * Creates a new Parameter.
 *
 * @param this Tells TypeScript this is a Client method.
 * @param parameter The Parameter to be created.
 * @returns The server's response.
 */
export async function createParameter(this: Client, parameter: RequestParameter): Promise<APIResponse<ResponseParameter>> {
	return (await this.apiPost<APIResponse<ResponseParameter>>("parameters", parameter)).data;
}

/**
 * Replaces an existing Parameter with the provided definition of a Parameter.
 *
 * @param this Tells TypeScript this is a Client method.
 * @param parameter The desired new definition of the Parameter with the same
 * `id` property.
 * @returns The server's response.
 */
export async function updateParameter(this: Client, parameter: ResponseParameter): Promise<APIResponse<ResponseParameter>>;
/**
 * Replaces an existing Parameter with the provided definition of a Parameter.
 *
 * @param this Tells TypeScript this is a Client method.
 * @param id The ID of the Parameter being replaced.
 * @param parameter The desired new definition of the Parameter identified by
 * `id`.
 * @returns The server's response.
 */
export async function updateParameter(this: Client, id: number, parameter: RequestParameter): Promise<APIResponse<ResponseParameter>>;
/**
 * Replaces an existing Parameter with the provided definition of a Parameter.
 *
 * @param this Tells TypeScript this is a Client method.
 * @param parameterOrID Either the ID of the Parameter being replaced, or the
 * entire new definition of said Parameter. If this is an ID, the definition of
 * the Parameter's editable fields must be given in `parameter`.
 * @param parameter The desired new definition of the Parameter identified by
 * `parameterOrID`. This is required when `parameterOrID` is an ID, and is
 * ignored otherwise.
 * @returns The server's response.
 */
export async function updateParameter(
	this: Client,
	parameterOrID: number | ResponseParameter,
	parameter?: RequestParameter
): Promise<APIResponse<ResponseParameter>> {
	let id, payload;
	if (typeof(parameterOrID) === "number") {
		if (!parameter) {
			throw new ClientError("updateParameter", "parameter");
		}
		id = parameterOrID;
		payload = parameter;
	} else {
		({id} = parameterOrID);
		payload = parameterOrID;
	}
	return (await this.apiPut<APIResponse<ResponseParameter>>(`parameters/${id}`, payload)).data;
}

/**
 * Deletes a Parameter. Note that deletion will fail if the Parameter is used by
 * at least one Profile and/or Cache Group.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param parameter Either the Parameter to be deleted, or simply its ID.
 * @returns The server's response.
 */
export async function deleteParameter(this: Client, parameter: ResponseParameter | number): Promise<APIResponse<undefined>> {
	const id = typeof(parameter) === "number" ? parameter : parameter.id;
	return (await this.apiDelete(`parameters/${id}`)).data;
}

/**
 * Optional settings that can affect the results returned by
 * {@link getProfiles}.
 */
type Params = PaginationParams & {
	/** Filter results by CDN ID. */
	cdn?: number;
	/** Filter results by ID. */
	id?: number;
	/** Filter results by Name. */
	name?: string;
	/** Order the result set by the specified property's value. */
	orderby?: "cdn" | "id" | "name";
	/** Filter results by assigned Parameter ID. */
	param?: number;
};

/**
 * Retrieves Profiles.
 *
 * @param this Tells TypeScript this is a Client method.
 * @param params Any and all optional settings to use in the request.
 * @returns The server's response.
 */
export async function getProfiles(this: Client, params?: Params): Promise<APIResponse<Array<ResponseProfile>>>;
/**
 * Retrieves a Profile
 *
 * @param this Tells TypeScript this is a Client method.
 * @param id The ID of a single Profile to be retrieved.
 * @param params Any and all optional settings to use in the request.
 * @returns The server's response.
 * @throws {APIError} when Traffic Ops responds with zero or more than one
 * result(s).
 */
export async function getProfiles(this: Client, id: number, params?: Params): Promise<APIResponse<ResponseProfile>>;
/**
 * Retrieves the "Types" registered for Traffic Ops objects.
 *
 * @param this Tells TypeScript this is a Client method.
 * @param idOrParams Either the ID of a single Profile to be retrieved, or any
 * and all optional settings to use in the request.
 * @param params Any and all optional settings to use in the request. This is
 * ignored if optional settings were provided as `idOrParams`.
 * @returns The server's response.
 * @throws {APIError} when a single Profile is requested, but Traffic Ops
 * responds with zero or more than one result(s).
 */
export async function getProfiles(
	this: Client,
	idOrParams?: number | Params,
	params?: Params
): Promise<APIResponse<Array<ResponseProfile>|ResponseProfile>> {
	let p;
	let single = false;
	if (typeof(idOrParams) === "number") {
		p = {...params, id: idOrParams};
		single = true;
	} else {
		p = idOrParams;
	}
	const resp = await this.apiGet<APIResponse<Array<ResponseProfile>>>("profiles", p);
	if (single) {
		const len = resp.data?.response?.length;
		if (len !== 1) {
			throw new APIError(`requesting a Profile by ID ${idOrParams} yielded ${len} results`, resp.status, resp.headers);
		}
		return {...resp.data, response: resp.data.response[0]};
	}
	return resp.data;
}

/**
 * Creates a new Profile.
 *
 * @param this Tells TypeScript this is a Client method.
 * @param profile The Profile to be created.
 * @returns The server's response.
 */
export async function createProfile(this: Client, profile: RequestProfile): Promise<APIResponse<ResponseProfile>> {
	return (await this.apiPost<APIResponse<ResponseProfile>>("profiles", profile)).data;
}

/**
 * Replaces an existing Profile with the provided definition of a Profile.
 *
 * @param this Tells TypeScript this is a Client method.
 * @param profile The desired new definition of the Profile with the same `id`
 * property.
 * @returns The server's response.
 */
export async function updateProfile(this: Client, profile: ResponseProfile): Promise<APIResponse<ResponseProfile>>;
/**
 * Replaces an existing Profile with the provided definition of a Profile.
 *
 * @param this Tells TypeScript this is a Client method.
 * @param id The ID of the Profile being replaced.
 * @param profile The desired new definition of the Profile identified by `id`.
 * @returns The server's response.
 */
export async function updateProfile(this: Client, id: number, profile: RequestProfile): Promise<APIResponse<ResponseProfile>>;
/**
 * Replaces an existing Profile with the provided definition of a Profile.
 *
 * @param this Tells TypeScript this is a Client method.
 * @param profileOrID Either the ID of the Profile being replaced, or the
 * entire new definition of said Profile. If this is an ID, the definition of
 * the Profile's editable fields must be given in `parameter`.
 * @param profile The desired new definition of the Profile identified by
 * `parameterOrID`. This is required when `profileOrID` is an ID, and is ignored
 * otherwise.
 * @returns The server's response.
 */
export async function updateProfile(
	this: Client,
	profileOrID: number | ResponseProfile,
	profile?: RequestProfile
): Promise<APIResponse<ResponseProfile>> {
	let id, payload;
	if (typeof(profileOrID) === "number") {
		if (!profile) {
			throw new ClientError("updateProfile", "profile");
		}
		id = profileOrID;
		payload = profile;
	} else {
		({id} = profileOrID);
		payload = profileOrID;
	}
	return (await this.apiPut<APIResponse<ResponseProfile>>(`profiles/${id}`, payload)).data;
}

/**
 * Deletes a Profile. Note that deletion will fail if the Profile is used by
 * at least one Server and/or Delivery Service.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param profile Either the Profile to be deleted, or simply its ID.
 * @returns The server's response.
 */
export async function deleteProfile(this: Client, profile: ResponseProfile | number): Promise<APIResponse<undefined>> {
	const id = typeof(profile) === "number" ? profile : profile.id;
	return (await this.apiDelete(`profiles/${id}`)).data;
}

/**
 * Helper type to express potentially very lengthy typing of an array of at
 * least one of something.
 */
type AtLeastOne<T> = [T, ...T[]];

/**
 * Helper type to express potentially very lengthy typing of one or an array of
 * at least one of something.
 */
type OneOrMore<T> = T | AtLeastOne<T>;

/**
 * The actual workhorse of assigning Parameters to Profiles. All `Client`
 * methods that do that, ultimately call into this.
 *
 * @param client A client with which to make requests.
 * @param request An association between a Profile and Parameter to be made.
 * @returns The server's response. See
 * [#6943](https://github.com/apache/trafficcontrol/issues/6943).
 */
async function createProfileParameters(
	client: Client,
	request: RequestProfileParameters
): Promise<APIResponse<RequestProfileParametersResponse>>;
/**
 * The actual workhorse of assigning Parameters to Profiles. All `Client`
 * methods that do that, ultimately call into this.
 *
 * @param client A client with which to make requests.
 * @param request An array of associations between a Profile and Parameter to be
 * made.
 * @returns The server's response. See
 * [#6943](https://github.com/apache/trafficcontrol/issues/6943).
 */
async function createProfileParameters(
	client: Client,
	request: AtLeastOne<RequestProfileParameters>
): Promise<APIResponse<null>>;
/**
 * The actual workhorse of assigning Parameters to Profiles. All `Client`
 * methods that do that, ultimately call into this.
 *
 * @param client A client with which to make requests.
 * @param request An association between a Profile and Parameter to be made, or
 * an array thereof.
 * @returns The server's response. See
 * [#6943](https://github.com/apache/trafficcontrol/issues/6943).
 */
async function createProfileParameters(
	client: Client,
	request: OneOrMore<RequestProfileParameters>
): Promise<APIResponse<null | RequestProfileParametersResponse>> {
	return (await client.apiPost<APIResponse<null | RequestProfileParametersResponse>>("profileparameters", request)).data;
}

/**
 * Checks if the input is a full {@link RequestProfileParameters} rather than
 * just a Profile or its ID.
 *
 * @param o The object to check.
 * @returns `true` if `o` is a {@link RequestProfileParameters}, `false`
 * otherwise.
 */
function isFullRequest(o: number | RequestProfile | RequestProfileParameters): o is RequestProfileParameters {
	return typeof(o) !== "number" && Object.prototype.hasOwnProperty.call(o, "profileId");
}

/**
 * Checks if an array of possibly numbers is a homogeneous array of numbers.
 *
 * @param o The object to check.
 * @returns `true` if `o` is an array of numbers, `false` otherwise.
 */
function isArrayOfNumbers<T>(o: AtLeastOne<T | number>): o is AtLeastOne<number> {
	return o.every(i=>typeof(i) === "number");
}

/**
 * For some reason in TypeScript the type of
 * `[T, ...T[]].map((T, number, T[]) => U)` is `U[]` and not `[U, ...U[]]`, even
 * though it's perfectly safe to assume that if the callback always returns a
 * function, the latter type will be the output. So I use this function to
 * reduce the number of times I have to use `as`.
 *
 * @param a The array being operated on. We promise not to mutate it.
 * @param f A function to apply to each element of `a` (which must not modify
 * them in order to keep our promise to `a` being `readonly`).
 * @returns An array of whatever type the callback `f` produces, but narrowed to
 * match the length constraint of `a` (>=1).
 */
function mapAtLeastOne<T, U>(
	a: readonly [T, ...readonly T[]],
	f: (value: Readonly<T>, index: number, array: readonly T[]) => U
): AtLeastOne<U> {
	return a.map(f) as AtLeastOne<U>;
}

/**
 * For some reason in TypeScript the type of
 * `[[T, ...T[]], ...[T, ...T[]][]].flat(...)` is `T[]` and not `[T, ...T[]]`,
 * even though it's perfectly safe to assume that. So I use this function to
 * reduce the number of times I have to use `as`.
 *
 * @param a The array being flattened. We promise not to mutate it.
 * @returns An array of a flattened type narrowed such that it matches the
 * length constraint of `a` (>=1).
 */
function flatAtLeastOne<T>(a: readonly [readonly [T, ...readonly T[]], ...readonly [T, ...readonly T[]][]]): AtLeastOne<T> {
	return a.flat() as AtLeastOne<T>;
}

/**
 * Associates a single Parameter with a single Profile. In general, it
 * is recommended to instead use {@link assignParameterToProfile} instead when
 * the number of associations to be created is known to be one.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param association A single assignment of a Parameter to a Profile as a
 * {@link RequestProfileParameters}, or a tuple of a Profile or its ID and a
 * Parameter or its ID to be associated.
 * @returns The server's response. See
 * [#6943](https://github.com/apache/trafficcontrol/issues/6943).
 */
export async function assignParametersToProfiles(
	this: Client,
	association: [number | ResponseProfile, number | ResponseParameter] | RequestProfileParameters
): Promise<APIResponse<RequestProfileParametersResponse>>;
/**
 * Associates one or more Parameters with one or more Parameters.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param associations All desired relationships to be created  as one or more
 * {@link RequestProfileParameters}s, or one or more tuples of Profiles or their
 * IDs and Parameters or their IDs to be associated.
 * @returns The server's response. See
 * [#6943](https://github.com/apache/trafficcontrol/issues/6943).
 */
export async function assignParametersToProfiles(
	this: Client,
	associations:
	AtLeastOne<[number, number]> |
	AtLeastOne<[ResponseProfile, ResponseParameter]> |
	AtLeastOne<[number, ResponseParameter]> |
	AtLeastOne<[ResponseProfile, number]> |
	AtLeastOne<RequestProfileParameters>
): Promise<APIResponse<null>>;
/**
 * Assigns a single Parameter to a single Profile. In general, it
 * is recommended to instead use {@link assignParameterToProfile} instead when
 * the number of associations to be created is known to be one.
 *
 * @example
 * // Assuming `client` is a Client instance, each of the below calls has the
 * // same effect of assigning some Profile stored as `profile` to some
 * // Parameter stored as `parameter`.
 * client.assignParametersToProfiles(profile, parameter);
 * client.assignParametersToProfiles(profile.id, parameter);
 * client.assignParametersToProfiles(profile, parameter.id);
 * client.assignParametersToProfiles(profile.id, parameter.id);
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param profile Either the Profile to be associated with the Parameter
 * specified by `parameter`, or its ID.
 * @param parameter The Parameter being associated with the Profile given by
 * `profile`, or its ID.
 * @returns The server's response. See
 * [#6943](https://github.com/apache/trafficcontrol/issues/6943).
 */
export async function assignParametersToProfiles(
	this: Client,
	profile: number | ResponseProfile,
	parameter: number | ResponseParameter
): Promise<APIResponse<RequestProfileParametersResponse>>;
/**
 * Associates one or more Parameters with one or more Parameters.
 *
 * @example
 * // Assuming that `parameters` is an array of `ResponseParameter`s, `profiles`
 * // holds an array of `ResponseProfile`s, and `client` is a reference to a
 * // `Client` instance, all of the following calls have the same effect of
 * // all of Parameters in `parameters` to all of the Profiles in `profiles`.
 * client.assignParametersToProfiles(profiles, parameters);
 * client.assignParametersToProfiles(profiles.map(p=>p.id), parameters);
 * client.assignParametersToProfiles(profiles, parameters.map(p=>p.id));
 * client.assignParametersToProfiles(
 * 	profiles.map(p=>p.id),
 * 	parameters.map(p=>p.id)
 * );
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param this Tells TypeScript that this is a Client method.
 * @param profiles An array of Profiles or their IDs to **all** of which **all**
 * of the Parameters given by `parameters` will be assigned.
 * @param parameters Either a Parameter or its ID which will be assigned to the
 * Profiles given by `profiles`, or an array of Parameters or their IDs **all**
 * of which will be assigned to **all** Profiles specified by `profiles`.
 * @returns The server's response. See
 * [#6943](https://github.com/apache/trafficcontrol/issues/6943).
 */
export async function assignParametersToProfiles(
	this: Client,
	profiles: AtLeastOne<number> | AtLeastOne<ResponseProfile>,
	parameters: OneOrMore<number> | OneOrMore<ResponseParameter>
): Promise<APIResponse<null>>;
/**
 * Associates one or more Parameters with one or more Parameters.
 *
 * @example
 * // Assuming that `parameters` is an array of `ResponseParameter`s, `profiles`
 * // holds an array of `ResponseProfile`s, and `client` is a reference to a
 * // `Client` instance, all of the following calls have the same effect of
 * // all of Parameters in `parameters` to all of the Profiles in `profiles`.
 * client.assignParametersToProfiles(profiles, parameters);
 * client.assignParametersToProfiles(profiles.map(p=>p.id), parameters);
 * client.assignParametersToProfiles(profiles, parameters.map(p=>p.id));
 * client.assignParametersToProfiles(
 * 	profiles.map(p=>p.id),
 * 	parameters.map(p=>p.id)
 * );
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param profiles Either a Profile or its ID to which the Parameters given by
 * `parameters` will be assigned, or an array of Profiles or their IDs to
 * **all** of which **all** of the Parameters given by `parameters` will be
 * assigned.
 * @param parameters An array of Parameters or their IDs **all** of which will
 * be assigned to **all** Profiles specified by `profiles`.
 * @returns The server's response. See
 * [#6943](https://github.com/apache/trafficcontrol/issues/6943).
 */
export async function assignParametersToProfiles(
	this: Client,
	profiles: OneOrMore<number> | OneOrMore<ResponseProfile>,
	parameters: AtLeastOne<number> | AtLeastOne<ResponseParameter>
): Promise<APIResponse<null>>;
/**
 * Associates one or more Parameters with one or more Parameters.
 *
 * @example
 * // Assuming that `parameters` is an array of `ResponseParameter`s, `profiles`
 * // holds an array of `ResponseProfile`s, and `client` is a reference to a
 * // `Client` instance, all of the following calls have the same effect of
 * // all of Parameters in `parameters` to all of the Profiles in `profiles`.
 * client.assignParametersToProfiles(profiles, parameters);
 * client.assignParametersToProfiles(profiles.map(p=>p.id), parameters);
 * client.assignParametersToProfiles(profiles, parameters.map(p=>p.id));
 * client.assignParametersToProfiles(
 * 	profiles.map(p=>p.id),
 * 	parameters.map(p=>p.id)
 * );
 * client.assignParametersToProfiles(
 * 	profiles.map(
 * 		prof=>parameters.map(
 * 			param=>[prof, param]
 * 		)
 * 	).flat()
 * );
 * client.assignParametersToProfiles(
 * 	profiles.map(
 * 		prof=>parameters.map(
 * 			param=>[prof.id, param]
 * 		)
 * 	).flat()
 * );
 * client.assignParametersToProfiles(
 * 	profiles.map(
 * 		prof=>parameters.map(
 * 			param=>[prof, param.id]
 * 		)
 * 	).flat()
 * );
 * client.assignParametersToProfiles(
 * 	profiles.map(
 * 		prof=>parameters.map(
 * 			param=>[prof.id, param.id]
 * 		)
 * 	).flat()
 * );
 * client.assignParametersToProfiles(
 * 	profiles.map(p=>p.id).map(
 * 		profileId=>parameters.map(p=>p.id).map(
 * 			parameterId=>({profileId, parameterId})
 * 		)
 * 	).flat()
 * );
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param assocOrProfile When creating a single association or an association
 * between a single Profile and multiple Parameters, this may be the single
 * Profile having Parameters added to it, or just its ID. In that case, the
 * Parameter(s) being associated to it must be given in `parameter`.
 * When creating associations between one or more Parameters and multiple
 * Profiles, this can be an array of those Profiles or their IDs. In that case,
 * the Parameter(s) being associated to them must be given in `parameter`.
 * Alternatively, all desired relationships to be created can be given in this
 * parameter (in which case `parameter` is ignored) as one or more
 * {@link RequestProfileParameters}s, or one or more tuples of Profiles and
 * Parameters to be associated, or one or more tuples of IDs of Profiles and IDs
 * of Parameters to be associated.
 * @param parameter Specifies all of the Parameters to be associated to the
 * Profile(s) identified in `assocOrProfile`, as either Parameters or just their
 * IDs. This is required if `assocOrProfile` only specifies Profiles (or their
 * IDs) and is ignored otherwise.
 * When multiple Profiles and multiple Parameters are given in this way, so that
 * there is no information about which goes with which, **all** of the given
 * Parameters are assigned to **all** of the given profiles.
 * @returns The server's response. See
 * [#6943](https://github.com/apache/trafficcontrol/issues/6943).
 */
export async function assignParametersToProfiles(
	this: Client,
	assocOrProfile:
	OneOrMore<number> |
	[number | ResponseProfile, number | ResponseParameter] |
	OneOrMore<[number, number]> |
	OneOrMore<ResponseProfile> |
	OneOrMore<[ResponseProfile, ResponseParameter]> |
	OneOrMore<[number, ResponseParameter]> |
	OneOrMore<[ResponseProfile, number]> |
	OneOrMore<RequestProfileParameters>,
	parameter?: OneOrMore<number> | OneOrMore<ResponseParameter>
): Promise<APIResponse<null | RequestProfileParametersResponse>> {
	if (Array.isArray(assocOrProfile)) {
		const firstElem = assocOrProfile[0];
		if (Array.isArray(firstElem)) {
			if (isArrayOfNumbers<ResponseParameter | ResponseProfile>(firstElem)) {
				return createProfileParameters(
					this,
					// This `as` assumption is safe based on above type checking
					// it's just that TypeScript refuses to narrow as such.
					mapAtLeastOne(assocOrProfile as AtLeastOne<[number, number]>, p=>({parameterId: p[1], profileId: p[0]}))
				);
			}
			if (typeof(firstElem[0]) === "number" && typeof(firstElem[1]) !== "number") {
				return createProfileParameters(
					this,
					mapAtLeastOne(
						assocOrProfile as AtLeastOne<[number, ResponseParameter]>,
						p => ({parameterId: p[1].id, profileId: p[0]})
					)
				);
			}
			if (typeof(firstElem[1]) === "number") {
				return createProfileParameters(
					this,
					mapAtLeastOne(
						assocOrProfile as AtLeastOne<[ResponseProfile, number]>,
						p => ({parameterId: p[1], profileId: p[0].id})
					)
				);
			}
			return createProfileParameters(
				this,
				mapAtLeastOne(
					// This `as` assumption is safe based on above type checking
					// it's just that TypeScript refuses to narrow as such.
					assocOrProfile as AtLeastOne<[ResponseProfile, ResponseParameter]>,
					p=>({parameterId: p[1].id, profileId: p[0].id})
				)
			);
		}
		if (isFullRequest(firstElem)) {
			// This `as` assumption is safe based on above type checking
			// it's just that TypeScript refuses to narrow as such.
			return createProfileParameters(this, assocOrProfile as AtLeastOne<RequestProfileParametersResponse>);
		}
		if (parameter === undefined) {
			throw new ClientError("assignParametersToProfiles", "parameter");
		}
		let profIds;
		if (typeof(firstElem) === "number") {
			profIds = assocOrProfile as AtLeastOne<number>;
		} else {
			profIds = mapAtLeastOne(assocOrProfile as AtLeastOne<ResponseProfile>, p=>p.id);
		}
		let paramIds: AtLeastOne<number>;
		if (Array.isArray(parameter)) {
			paramIds = isArrayOfNumbers(parameter) ? parameter : mapAtLeastOne(parameter, p=>p.id);
		} else {
			paramIds = [typeof(parameter) === "number" ? parameter : parameter.id];
		}
		const requests = mapAtLeastOne(profIds, profileId => mapAtLeastOne(paramIds, parameterId => ({parameterId, profileId})));
		return createProfileParameters(this, flatAtLeastOne(requests));
	}
	if (isFullRequest(assocOrProfile)) {
		return createProfileParameters(this, assocOrProfile);
	}
	if (parameter === undefined) {
		throw new ClientError("assignParametersToProfiles", "parameter");
	}
	const profileId = typeof(assocOrProfile) === "number" ? assocOrProfile : assocOrProfile.id;
	if (Array.isArray(parameter)) {
		let paramIds = isArrayOfNumbers(parameter) ? parameter : mapAtLeastOne(parameter, p=>p.id);
		return createProfileParameters(this, mapAtLeastOne(paramIds, parameterId=>({parameterId, profileId})));
	}
	const parameterId = typeof(parameter) === "number" ? parameter : parameter.id;
	return createProfileParameters(this, {parameterId, profileId});
}

/**
 * Convenience function for assigning a single Parameter to a single Profile.
 * This is exactly equivalent to calling
 * `client.assignParametersToProfiles(profile, parameter)`, but with a somewhat
 * simpler call signature that may make it easy to use.
 * This is also equivalent to calling
 * `client.assignParameterToProfile(profile, parameter)`, which is even simpler
 * than this convenience method, and should be used instead in general whenever
 * it is known that exactly one such association should be created.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param parameter The Parameter or its ID which will be assigned to the
 * Profile given by `profile`.
 * @param profile The Profile or its ID to which the Parameter given by
 * `parameter` will be assigned.
 */
export async function assignProfilesToParameter(
	this: Client,
	parameter: number | ResponseParameter,
	profile: number | ResponseProfile
): Promise<APIResponse<RequestProfileParametersResponse>>;
/**
 * Convenience function for assigning a single Parameter to multiple Profiles.
 * This is exactly equivalent to calling
 * `client.assignParametersToProfiles(profiles, parameter)`, but has a somewhat
 * simpler call signature that may make it easier to use.
 *
 * @example
 * // Assuming that `parameter` is a `ResponseParameter`, `profiles` holds an
 * // array of `ResponseProfile`s, and `client` is a reference to a `Client`
 * // instance, all of the following calls have the same effect of assigning the
 * // Parameter `parameter` to all of the Profiles in `profiles`.
 * client.assignProfilesToParameter(parameter, profiles);
 * client.assignProfilesToParameter(parameter.id, profiles);
 * client.assignProfilesToParameter(parameter, profiles.map(p=>p.id));
 * client.assignProfilesToParameter(parameter.id, profiles.map(p=p.id));
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param parameter The Parameter or its ID to be assigned to the Profiles given
 * by `profiles`.
 * @param profiles The Profiles to which the Parameter given by `parameter` will
 * be assigned, or their IDs.
 * @returns The server's response. See
 * [#6943](https://github.com/apache/trafficcontrol/issues/6943).
 */
export async function assignProfilesToParameter(
	this: Client,
	parameter: number | ResponseParameter,
	profiles: AtLeastOne<number> | AtLeastOne<ResponseProfile>
): Promise<APIResponse<null>>;
/**
 * Convenience function for assigning a single Parameter to multiple Profiles.
 * This is exactly equivalent to calling
 * `client.assignParametersToProfiles([profile0, ...profiles], parameter)`, but
 * has a somewhat simpler call signature that may make it easier to use.
 *
 * @example
 * // Assuming that `parameter` is a `ResponseParameter`, `profiles` holds an
 * // array of `ResponseProfile`s, and `client` is a reference to a `Client`
 * // instance, all of the following calls have the same effect of assigning the
 * // Parameter `parameter` to all of the Profiles in `profiles`.
 * client.assignProfilesToParameter(parameter, ...(profiles.map(p=>p.id)));
 * client.assignProfilesToParameter(parameter.id, ...(profiles.map(p=>p.id)));
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param parameter The Parameter or its ID to be assigned to the Profiles given
 * by `profile0` and `profiles`.
 * @param profile0 The ID of a Profile - possibly in concert with variadic extra
 * Profiles specified by `profiles` - to which the Parameter given by
 * `parameter` will be assigned.
 * @param profiles Variadic IDs of Profiles to which the Parameter identified by
 * `parameter` will be assigned.
 * @returns The server's response. See
 * [#6943](https://github.com/apache/trafficcontrol/issues/6943).
 */
export async function assignProfilesToParameter(
	this: Client,
	parameter: number | ResponseParameter,
	profile0: number,
	...profiles: number[]
): Promise<APIResponse<null>>;
/**
 * Convenience function for assigning a single Parameter to multiple Profiles.
 * This is exactly equivalent to calling
 * `client.assignParametersToProfiles([profile0, ...profiles], parameter)`, but
 * has a somewhat simpler call signature that may make it easier to use.
 *
 * @example
 * // Assuming that `parameter` is a `ResponseParameter`, `profiles` holds an
 * // array of `ResponseProfile`s, and `client` is a reference to a `Client`
 * // instance, all of the following calls have the same effect of assigning the
 * // Parameter `parameter` to all of the Profiles in `profiles`.
 * client.assignProfilesToParameter(parameter, ...profiles);
 * client.assignProfilesToParameter(parameter.id, ...profiles);
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param parameter The Parameter or its ID to be assigned to the Profiles given
 * by `profile0` and `profiles`.
 * @param profile0 A Profile - possibly in concert with variadic extra Profiles
 * specified by `profiles` - to which the Parameter given by `parameter` will be
 * assigned.
 * @param profiles Variadic Profiles to which the Parameter identified by
 * `parameter` will be assigned.
 * @returns The server's response. See
 * [#6943](https://github.com/apache/trafficcontrol/issues/6943).
 */
export async function assignProfilesToParameter(
	this: Client,
	parameter: number | ResponseParameter,
	profile0: ResponseProfile,
	...profiles: Array<ResponseProfile>
): Promise<APIResponse<null>>;
/**
 * Convenience function for assigning a single Parameter to multiple Profiles.
 * This is exactly equivalent to calling
 * `client.assignParametersToProfiles([profile0, ...profiles], parameter)`
 * (assuming the types of `profile0` and each element of `profiles` are the
 * same), but has a somewhat simpler call signature that may make it easier to
 * use.
 *
 * @example
 * // Assuming that `parameter` is a `ResponseParameter`, `profiles` holds an
 * // array of `ResponseProfile`s, and `client` is a reference to a `Client`
 * // instance, all of the following calls have the same effect of assigning the
 * // Parameter `parameter` to all of the Profiles in `profiles`.
 * client.assignProfilesToParameter(parameter, profiles);
 * client.assignProfilesToParameter(parameter.id, profiles);
 * client.assignProfilesToParameter(parameter, profiles.map(p=>p.id));
 * client.assignProfilesToParameter(parameter.id, profiles.map(p=p.id));
 * client.assignProfilesToParameter(parameter, ...profiles);
 * client.assignProfilesToParameter(parameter.id, ...profiles);
 * client.assignProfilesToParameter(parameter, ...(profiles.map(p=>p.id)));
 * client.assignProfilesToParameter(parameter.id, ...(profiles.map(p=>p.id)));
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param parameter The Parameter which will be assigned to the Profiles given
 * by `profile` and possibly `profiles`.
 * @param profile Either a single Profile - possibly in concert with variadic
 * extra Profiles specified by `profiles` - to which the Parameter given by
 * `parameter` will be assigned  or an array of those Profiles or their IDs.
 * @param profiles Variadic Profiles to which the Parameter given by `parameter`
 * will be assigned. This must not be used if `profile` is an array of Profiles
 * (or their IDs).
 * @returns The server's response. See
 * [#6943](https://github.com/apache/trafficcontrol/issues/6943).
 */
export async function assignProfilesToParameter(
	this: Client,
	parameter: number | ResponseParameter,
	profile: number | ResponseProfile | AtLeastOne<number> | AtLeastOne<ResponseProfile>,
	...profiles: number[] | ResponseProfile[]
): Promise<APIResponse<RequestProfileParametersResponse | null>> {
	if (Array.isArray(profile)) {
		if (profiles) {
			throw new ClientError(
				"invalid call signature for assignProfilesToParameter - cannot give variadic Profiles when specifying as an Array"
			);
		}
		return this.assignParametersToProfiles(profile, parameter);
	}
	if (profiles) {
		const firstId = typeof(profile) === "number" ? profile : profile.id;
		const profs: [number, ...number[] | ResponseProfile[]] = [firstId, ...profiles];
		if (isArrayOfNumbers(profs)) {
			return this.assignParametersToProfiles(profs, parameter);
		}
		// This `as` assumption is safe based on above type checking
		// it's just that TypeScript refuses to narrow as such.
		const profileIds: AtLeastOne<number> = [firstId, ...(profiles as Array<ResponseProfile>).map(p=>p.id)];
		return this.assignParametersToProfiles(profileIds, parameter);
	}
	return this.assignParametersToProfiles(profile, parameter);
}

/**
 * Convenience function for assigning a single Parameter to a single Profile.
 * This is exactly equivalent to calling
 * `client.assignParametersToProfiles(profile, parameter)`, but with a somewhat
 * simpler call signature that may make it easy to use.
 * This is also equivalent to calling
 * `client.assignParameterToProfile(profile, parameter)`, which is even simpler
 * than this convenience method, and should be used instead in general whenever
 * it is known that exactly one such association should be created.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param profile The Profile or its ID to which the Parameter given by
 * `parameter` will be assigned.
 * @param parameter The Parameter or its ID which will be assigned to the
 * Profile given by `profile`.
 */
export async function assignParametersToProfile(
	this: Client,
	profile: number | ResponseProfile,
	parameter: number | ResponseParameter
): Promise<APIResponse<RequestProfileParametersResponse>>;
/**
 * Convenience function for assigning multiple Parameters to a single Profile.
 * This is exactly equivalent to calling
 * `client.assignParametersToProfiles(profile, parameters), but has a somewhat
 * simpler call signature that may make it easier to use.
 *
 * @example
 * // Assuming that `profile` is a `ResponseProfile`, `parameters` holds an
 * // array of `ResponseParameter`s, and `client` is a reference to a `Client`
 * // instance, all of the following calls have the same effect of assigning all
 * // of the Parameters in `parameters` to `profile`.
 * client.assignParametersToProfile(profile, parameters);
 * client.assignParametersToProfile(profile.id, parameters);
 * client.assignParametersToProfile(profile, parameters.map(p=>p.id));
 * client.assignParametersToProfile(profile.id, parameters.map(p=p.id));
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param profile The Profile to which the Parameter(s) given in `parameters`
 * will be assigned (or just its ID).
 * @param parameters An array of Parameters - or their IDs - to be assigned to
 * the Profile given by `profile`.
 * @returns The server's response. See
 * [#6943](https://github.com/apache/trafficcontrol/issues/6943).
 */
export async function assignParametersToProfile(
	this: Client,
	profile: number | ResponseProfile,
	parameters: AtLeastOne<number> | AtLeastOne<ResponseParameter>
): Promise<APIResponse<null>>;
/**
 * Convenience function for assigning multiple Parameters to a single Profile.
 * This is exactly equivalent to calling
 * `client.assignParametersToProfiles(profile, [parameter0, parameters[]])`, but
 * has a somewhat simpler call signature that may make it easier to use.
 *
 * @example
 * // Assuming that `profile` is a `ResponseProfile`, `parameters` holds an
 * // array of `ResponseParameter`s, and `client` is a reference to a `Client`
 * // instance, all of the following calls have the same effect of assigning all
 * // of the Parameters in `parameters` to `profile`.
 * client.assignParametersToProfile(profile, ...(parameters.map(p=>p.id)));
 * client.assignParametersToProfile(profile.id, ...(parameters.map(p=>p.id)));
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param profile The Profile to which the Parameter(s) given in `parameter0`
 * and possibly `parameters` will be assigned (or just its ID).
 * @param parameter0 The ID of a Parameter to be assigned - possibly in concert
 * with variadic extra Parameters specified by `parameters` - to the Profile
 * given by `profile`.
 * @param parameters Variadic IDs of Parameters to be assigned to the Profile
 * given by `profile`.
 * @returns The server's response. See
 * [#6943](https://github.com/apache/trafficcontrol/issues/6943).
 */
export async function assignParametersToProfile(
	this: Client,
	profile: number | ResponseProfile,
	parameter0: number,
	...parameters: number[]
): Promise<APIResponse<null>>;
/**
 * Convenience function for assigning multiple Parameters to a single Profile.
 * This is exactly equivalent to calling
 * `client.assignParametersToProfiles(profile, [parameter0, parameters[]])`, but
 * has a somewhat simpler call signature that may make it easier to use.
 *
 * @example
 * // Assuming that `profile` is a `ResponseProfile`, `parameters` holds an
 * // array of `ResponseParameter`s, and `client` is a reference to a `Client`
 * // instance, all of the following calls have the same effect of assigning all
 * // of the Parameters in `parameters` to `profile`.
 * client.assignParametersToProfile(profile, ...parameters);
 * client.assignParametersToProfile(profile.id, ...parameters);
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param profile The Profile to which the Parameter(s) given in `parameter0`
 * and possibly `parameters` will be assigned (or just its ID).
 * @param parameter0 A Parameter to be assigned - possibly in concert with
 * variadic extra Parameters specified by `parameters` - to the Profile given by
 * `profile.
 * @param parameters Variadic Parameters to be assigned to the Profile given by
 * `profile`.
 * @returns The server's response. See
 * [#6943](https://github.com/apache/trafficcontrol/issues/6943).
 */
export async function assignParametersToProfile(
	this: Client,
	profile: number | ResponseProfile,
	parameter0: ResponseParameter,
	...parameters: ResponseParameter[]
): Promise<APIResponse<null>>;
/**
 * Convenience function for assigning multiple Parameters to a single Profile.
 * This is exactly equivalent to calling
 * `client.assignParametersToProfiles(profile, [parameter0, parameters[]])`
 * (assuming the types of `parameter0` and each element of `parameters` are the
 * same), but has a somewhat simpler call signature that may make it easier to
 * use.
 *
 * @example
 * // Assuming that `profile` is a `ResponseProfile`, `parameters` holds an
 * // array of `ResponseParameter`s, and `client` is a reference to a `Client`
 * // instance, all of the following calls have the same effect of assigning all
 * // of the Parameters in `parameters` to `profile`.
 * client.assignParametersToProfile(profile, parameters);
 * client.assignParametersToProfile(profile.id, parameters);
 * client.assignParametersToProfile(profile, parameters.map(p=>p.id));
 * client.assignParametersToProfile(profile.id, parameters.map(p=p.id));
 * client.assignParametersToProfile(profile, ...parameters);
 * client.assignParametersToProfile(profile.id, ...parameters);
 * client.assignParametersToProfile(profile, ...(parameters.map(p=>p.id)));
 * client.assignParametersToProfile(profile.id, ...(parameters.map(p=>p.id)));
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param profile The Profile to which the Parameter(s) given in `parameter` and
 * possibly `parameters` will be assigned.
 * @param parameter Either a single Parameter to be assigned - possibly in
 * concert with variadic extra Parameters specified by `parameters` - or an
 * array of those Parameters or their IDs.
 * @param parameters Variadic Parameters to be assigned to the Profile given by
 * `profile`. This must not be used if `parameter` is an array of Parameters (or
 * their IDs).
 * @returns The server's response. See
 * [#6943](https://github.com/apache/trafficcontrol/issues/6943).
 */
export async function assignParametersToProfile(
	this: Client,
	profile: number | ResponseProfile,
	parameter: number | ResponseParameter | AtLeastOne<number> | AtLeastOne<ResponseParameter>,
	...parameters: number[] | ResponseParameter[]
): Promise<APIResponse<RequestProfileParametersResponse | null>> {
	if (Array.isArray(parameter)) {
		if (parameters) {
			throw new ClientError(
				"invalid call signature for assignParametersToProfile - cannot give variadic Parameters when specifying as an Array"
			);
		}
		return this.assignParametersToProfiles(profile, parameter);
	}
	if (parameters) {
		const firstId = typeof(parameter) === "number" ? parameter : parameter.id;
		const params: [number, ...number[] | ResponseParameter[]] = [firstId, ...parameters];
		if (isArrayOfNumbers(params)) {
			return this.assignParametersToProfiles(profile, parameter);
		}
		// This `as` assumption is safe based on above type checking
		// it's just that TypeScript refuses to narrow as such.
		return this.assignParametersToProfiles(profile, [firstId, ...(parameters as Array<ResponseParameter>).map(p=>p.id)]);
	}
	return this.assignParametersToProfiles(profile, parameter);
}

/**
 * Convenience function for assigning a single Parameter to a single Profile.
 * This is exactly equivalent to calling
 * `client.assignParametersToProfiles(association)`, but has a much simpler call
 * signature that may make it easier to use.
 *
 * @example
 * // Assuming `client` is a Client instance, each of the below calls has the
 * // same effect of assigning some Profile stored as `profile` to some
 * // Parameter stored as `parameter`.
 * client.assignParameterToProfile([profile, parameter]);
 * client.assignParameterToProfile([profile.id, parameter]);
 * client.assignParameterToProfile([profile, parameter.id]);
 * client.assignParameterToProfile([profile.id, parameter.id]);
 * client.assignParameterToProfile(
 * 	{
 * 		parameterId: parameter.id,
 * 		profileId: profile.id
 * 	}
 * );
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param association The association between a Profile and a Parameter being
 * created as a {@link RequestProfileParameters}, or tuple of a Profile or
 * Profile ID and a Parameter or Parameter ID.
 * @returns The server's response. See
 * [#6943](https://github.com/apache/trafficcontrol/issues/6943).
 */
export async function assignParameterToProfile(
	this: Client,
	association: [number | ResponseProfile, number | ResponseParameter] | RequestProfileParameters
): Promise<APIResponse<RequestProfileParametersResponse>>;
/**
 * Convenience function for assigning a single Parameter to a single Profile.
 * This is exactly equivalent to calling
 * `client.assignParametersToProfiles(profile, parameter)`, but has a much
 * simpler call signature that may make it easier to use.
 *
 * @example
 * // Assuming `client` is a Client instance, each of the below calls has the
 * // same effect of assigning some Profile stored as `profile` to some
 * // Parameter stored as `parameter`.
 * client.assignParameterToProfile(profile, parameter);
 * client.assignParameterToProfile(profile.id, parameter);
 * client.assignParameterToProfile(profile, parameter.id);
 * client.assignParameterToProfile(profile.id, parameter.id);
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param profile Either the Profile to be associated with the Parameter
 * specified by `parameter`, or its ID.
 * @param parameter The Parameter being associated with the Profile given by
 * `profile`, or its ID.
 * @returns The server's response. See
 * [#6943](https://github.com/apache/trafficcontrol/issues/6943).
 */
export async function assignParameterToProfile(
	this: Client,
	profile: number | ResponseProfile,
	parameter: number | ResponseParameter
): Promise<APIResponse<RequestProfileParameters>>;
/**
 * Convenience function for assigning a single Parameter to a single Profile.
 * This is exactly equivalent to calling
 * `client.assignParametersToProfiles(profileOrAssoc)` (if `profileOrAssoc` is a
 * {@link RequestProfileParameters} or tuple of Profile/Parameter (or their
 * respective identifiers)) or
 * `client.assignParametersToProfiles(profileOrAssoc, parameter)` (if
 * `profileOrAssoc` is a Profile or its ID and `parameter` is a Parameter or its
 * ID), but has a much simpler call signature that may make it easier to use.
 *
 * @example
 * // Assuming `client` is a Client instance, each of the below calls has the
 * // same effect of assigning some Profile stored as `profile` to some
 * // Parameter stored as `parameter`.
 * client.assignParameterToProfile(profile, parameter);
 * client.assignParameterToProfile([profile, parameter]);
 * client.assignParameterToProfile(profile.id, parameter);
 * client.assignParameterToProfile([profile.id, parameter]);
 * client.assignParameterToProfile(profile, parameter.id);
 * client.assignParameterToProfile([profile, parameter.id]);
 * client.assignParameterToProfile(profile.id, parameter.id);
 * client.assignParameterToProfile([profile.id, parameter.id]);
 * client.assignParameterToProfile(
 * 	{
 * 		parameterId: parameter.id,
 * 		profileId: profile.id
 * 	}
 * );
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param profileOrAssoc Either the association between a Profile and a
 * Parameter being created as a {@link RequestProfileParameters} or tuple of
 * a Profile or Profile ID and a Parameter or Parameter ID, or a Profile or its
 * ID to be associated with the Parameter specified by `parameter` (which is
 * required in that case).
 * @param parameter The Parameter being associated with the Profile given by
 * `profileOrAssoc`. This is required if `profileOrAssoc` is a Profile (or its
 * ID), and is ignored otherwise.
 * @returns The server's response.
 */
export async function assignParameterToProfile(
	this: Client,
	profileOrAssoc: number | ResponseProfile | [number | ResponseProfile, number | ResponseParameter] | RequestProfileParameters,
	parameter?: number | ResponseParameter
): Promise<APIResponse<RequestProfileParametersResponse>> {
	let parameterId, profileId;
	if (Array.isArray(profileOrAssoc)) {
		const [prof, param] = profileOrAssoc;
		parameterId = typeof(prof) === "number" ? prof : prof.id;
		profileId = typeof(param) === "number" ? param : param.id;
	} else if (isFullRequest(profileOrAssoc)) {
		return createProfileParameters(this, profileOrAssoc);
	} else if (parameter === undefined) {
		throw new ClientError("assignParameterToProfile", "parameter");
	} else {
		parameterId = typeof(parameter) === "number" ? parameter : parameter.id;
		profileId = typeof(profileOrAssoc) === "number" ? profileOrAssoc : profileOrAssoc.id;
	}
	return createProfileParameters(this, {parameterId, profileId});
}

/**
 * Removes a Parameter from a Profile.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param profile The Profile from which a Parameter is being removed, or its
 * ID.
 * @param parameter The Parameter being removed from the Profile given by
 * `profile`, or its ID.
 * @returns The server's response.
 */
export async function removeParameterFromProfile(
	this: Client,
	profile: number | ResponseProfile,
	parameter: number | ResponseParameter
): Promise<APIResponse<undefined>> {
	const profileID = typeof(profile) === "number" ? profile : profile.id;
	const parameterID = typeof(parameter) === "number" ? parameter : parameter.id;
	return (await this.apiDelete(`profileparameters/${profileID}/${parameterID}`)).data;
}

/**
 * "Exports" a Profile in a format accepted by Traffic Portal (and
 * {@link importProfile} which uses the same underlying API as TP) for importing
 * Profiles.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param profile The Profile to export, or just its ID.
 * @returns The server's response.
 */
export async function exportProfile(this: Client, profile: ResponseProfile | number): Promise<ProfileExport> {
	const id = typeof(profile) === "number" ? profile : profile.id;
	return (await this.apiGet<ProfileExport>(`profiles/${id}/export`)).data;
}

/**
 * "Imports" a Profile and its associated Parameters from an input of the kind
 * exported by Traffic Portal (and {@link exportProfile} which uses the same
 * underlying API as TP).
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param profile The Profile being imported.
 * @returns The server's response.
 */
export async function importProfile(this: Client, profile: ProfileImport): Promise<APIResponse<ProfileImportResponse>> {
	return (await this.apiPost<APIResponse<ProfileImportResponse>>("profiles/import", profile)).data;
}

/**
 * Makes a copy of a Profile under a different name.
 *
 * @param this Tells TypeScript that this is a Client method.
 * @param profile The Profile being copied, or just its name.
 * @param copyName The name of the new copy of `profile`.
 * @returns The server's response.
 */
export async function copyProfile(this: Client, profile: Profile | string, copyName: string): Promise<APIResponse<ProfileCopyResponse>> {
	const name = typeof(profile) === "string" ? profile : profile.name;
	return (await this.apiPost<APIResponse<ProfileCopyResponse>>(`profiles/name/${copyName}/copy/${name}`)).data;
}
