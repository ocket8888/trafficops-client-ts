#!/usr/bin/env node
import {
	type Alert,
	errors,
	Protocol,
	RangeRequestHandling,
	QStringHandling,
	GeoLimit,
	GeoProvider,
	type TypeFromResponse,
	ProfileType,
	type ResponseParameter,
	DSRChangeType,
	DSRStatus,
	type ResponseCurrentUser,
} from "trafficops-types";

import { Client } from "./index.js";

const erroredRequests = new Set<string>();

/**
 * Small convenience function that checks if a response object has any error
 * Alerts, and returns a value that can be added to the return code to
 * effectively count errors encountered.
 *
 * @param method The request method used.
 * @param endpoint The requested endpoint.
 * @param chkMe The object containing the Alerts to check.
 * @returns `1` if there were errors in the `chkMe` Alerts, `0` otherwise.
 */
function checkAlerts(method: string, endpoint: string, chkMe?: {alerts?: Array<Alert>} | null | undefined): 1 | 0 {
	endpoint = `/${endpoint.replace(/^\/+/, "")}`;
	console.log(method, endpoint);
	console.log(JSON.stringify(chkMe, undefined, "\t"));
	console.log();
	const errored = chkMe && chkMe.alerts && chkMe.alerts.length > 0 && errors(chkMe.alerts).length > 0 ? 1 : 0;
	if (errored) {
		erroredRequests.add(`${method} ${endpoint}`);
	}
	return errored;
}

const remapConfigParam = {
	configFile: "remap.config",
	name: "location"
};

/**
 * Ensures a "location" Parameter for remap.config exists, creating one if none
 * do, and returns either the newly created one or some random pre-existing one.
 *
 * @param client A Client with which to make requests
 * @returns Some remap.config "location" Parameter.
 * @throws {Error} if no existing "location" Parameter exists for the
 * "remap.config" Config File can be successfully retrieved and creating one
 * fails.
 */
async function getOrCreateRemapDotConfigParameter(client: Client): Promise<ResponseParameter> {
	const remapResponse = await client.getParameters(remapConfigParam);
	if (remapResponse.alerts) {
		const errs = errors(remapResponse.alerts);
		if (errs.length > 0) {
			console.error("error fetching remap.config location parameter:", errs.join("\n\t"));
		}
	} else if (remapResponse?.response?.length > 0) {
		return remapResponse.response[0];
	}
	console.warn("No remap.config 'location' Parameter found; creating one - will NOT be removed by these tests!");
	const newParam = await client.createParameter({
		...remapConfigParam,
		secure: false,
		value: "/anywhere"
	});
	if (newParam.alerts) {
		const errs = errors(newParam.alerts);
		if (errs.length > 0) {
			throw new Error(`failed to create remap.config Parameter: ${errs.join("\n\t")}`);
		}
	}
	return newParam.response;
}

let cachedCurrentUser: ResponseCurrentUser | null = null;

/**
 * Retrieves the current user. This sends an API request a maximum of once per
 * run.
 *
 * @param client An API client for sending requests.
 * @returns The currently authenticated user.
 */
async function getCurrentUser(client: Client): Promise<ResponseCurrentUser> {
	if (cachedCurrentUser === null) {
		cachedCurrentUser = (await client.getCurrentUser()).response;
	}
	return cachedCurrentUser;
}
/**
 * Holds the different Types of things for later use in creating those things.
 */
interface Types {
	cacheGroup: TypeFromResponse;
	deliveryService: TypeFromResponse;
	edgeCacheServer: TypeFromResponse;
	midCacheServer: TypeFromResponse;
	originCacheServer: TypeFromResponse;
}

/**
 * Throws an error saying there're no Types of the requested kind in Traffic
 * Ops.
 *
 * @param useInTable The `useInTable` value that Traffic Ops is missing.
 * @throws {Error & {message: `Traffic Ops has no ${string} Types`}}
 */
function throwTypeError(useInTable: string): never {
	throw new Error(`Traffic Ops has no ${useInTable} Types`);
}

/**
 * Fetches certain necessary kinds of Types from Traffic Ops.
 *
 * For Delivery Services, it'll try to find 'HTTP' but if it can't it'll use one
 * at random. For servers it looks specifically for 'EDGE', 'MID', and 'ORG' and
 * throws an error if it can't find them.
 *
 * @param client An authenticated Traffic Ops client.
 * @returns The Types of things.
 */
async function getTypes(client: Client): Promise<Types> {
	const cgResp = await client.getTypes({useInTable: "cachegroup"});
	const cgType = cgResp.response[0];
	if (!cgType) {
		throwTypeError("cachegroup");
	}
	const dsResp = await client.getTypes({useInTable: "deliveryservice"});
	let dsType = dsResp.response.find(t=>t.name==="HTTP");
	if (!dsType) {
		console.warn("'HTTP' type not found");
		dsType = dsResp.response[0];
	}
	if (!dsType) {
		throwTypeError("deliveryservice");
	}
	let serverResp = await client.getTypes({useInTable: "server"});
	const edgeType = serverResp.response.find(t=>t.name === "EDGE");
	if (!edgeType) {
		throwTypeError("'EDGE' server");
	}
	const midType = serverResp.response.find(t=>t.name === "MID");
	if (!midType) {
		throwTypeError("'MID' server");
	}
	const orgType = serverResp.response.find(t=>t.name === "ORG");
	if (!orgType) {
		throwTypeError("'ORG' server");
	}
	return {
		cacheGroup: cgType,
		deliveryService: dsType,
		edgeCacheServer: edgeType,
		midCacheServer: midType,
		originCacheServer: orgType
	};
}

/**
 * The main function.
 *
 * @todo Finish this. Right now, it just runs through all the methods and prints
 * everything.
 *
 * @returns An exit code for the script.
 */
async function main(): Promise<number> {
	const client = new Client("https://localhost:6443", {logAlerts: true, logger: console, raiseErrorAlerts: false});
	console.log("GET /ping");
	console.log((await client.ping()).data);
	console.log();
	await client.login("admin", "twelve12");
	checkAlerts("GET", "about", await client.about() as {});
	checkAlerts("GET", "system/info", await client.systemInfo());

	const types = await getTypes(client);
	const remapDotConfigLocationParam = await getOrCreateRemapDotConfigParameter(client);
	console.info("remap.config location:", remapDotConfigLocationParam.value);

	checkAlerts("POST", "deliveryservices/request", await client.sendDeliveryServicesRequest({
		details: {
			contentType: "VOD",
			customer: "someone",
			deepCachingType: "NEVER",
			deliveryProtocol: "http",
			hasNegativeCachingCustomization: false,
			hasOriginACLWhitelist: false,
			hasOriginDynamicRemap: false,
			hasSignedURLs: false,
			maxLibrarySizeEstimate: "50G",
			negativeCachingCustomizationNote: "but it's false...",
			originTestFile: "/test",
			originURL: "https://google.com",
			peakBPSEstimate: "100",
			peakTPSEstimate: "100",
			queryStringHandling: "DROP",
			rangeRequestHandling: "HANDLE",
			routingType: "HTTP",
			serviceDesc: "test"
		},
		emailTo: "someone@ciab.test"
	}));

	const acmeAccount = {
		email: "something@mail.com",
		privateKey: "privkey",
		provider: "provider",
		uri: "https://uri.com/"
	};
	const newAcct = await client.createACMEAccount(acmeAccount);
	checkAlerts("POST", "acme_accounts", newAcct);
	checkAlerts("GET", "acme_accounts", await client.getACMEAccounts());
	acmeAccount.privateKey = "new privkey";
	checkAlerts("PUT", "acme_accounts", await client.updateACMEAccount(acmeAccount));
	checkAlerts("DELETE", "acme_accounts/{{provider}}/{{email}}", await client.deleteACMEAccount(newAcct.response));

	checkAlerts("GET", "api_capabilities", await client.getAPICapabilities());
	checkAlerts("GET", "capabilities", await client.getCapabilities());

	const newCDN = await client.createCDN({dnssecEnabled: false, domainName: "test", name: "test-cdn"});
	checkAlerts("POST", "cdns", newCDN);
	checkAlerts("GET", "cdns/{{ID}}", await client.getCDNs({id: newCDN.response.id}));
	newCDN.response.dnssecEnabled = !newCDN.response.dnssecEnabled;
	checkAlerts("PUT", "cdns/{{ID}}", await client.updateCDN(newCDN.response));
	checkAlerts("POST", "cdns/{{ID}}/queue_updates", await client.queueCDNUpdates(newCDN.response));
	checkAlerts("POST", "cdns/{{ID}}/queue_updates", await client.dequeueCDNUpdates(newCDN.response));
	checkAlerts("POST", "cdns/dnsseckeys/generate", await client.generateCDNDNSSECKeys(
		{
			key: newCDN.response.name,
			kskExpirationDays: 1,
			ttl: 100,
			zskExpirationDays: 1
		}
	));
	checkAlerts("POST", "cdns/{{name}}/dnsseckeys/ksk/generate", await client.generateCDNKSK(newCDN.response,
		{
			expirationDays: 1
		}
	));
	checkAlerts("GET", "cdns/dnsseckeys/refresh", await client.refreshAllDNSSECKeys());
	checkAlerts("GET", "cdns/domains", await client.getCDNDomains());
	checkAlerts("GET", "cdns/name/{{name}}/sslkeys", await client.getCDNSSLKeys(newCDN.response));

	const newDS = await client.createDeliveryService({
		active: false,
		cacheurl: null,
		cdnId: newCDN.response.id,
		displayName: "test ds",
		dscp: 1,
		geoLimit: GeoLimit.NONE,
		geoProvider: GeoProvider.MAX_MIND,
		httpBypassFqdn: "ciab.dev",
		infoUrl: null,
		initialDispersion: 2,
		ipv6RoutingEnabled: true,
		logsEnabled: true,
		missLat: 0,
		missLong: 0,
		multiSiteOrigin: false,
		orgServerFqdn: "https://ciab-dev.test",
		protocol: Protocol.HTTP,
		qstringIgnore: QStringHandling.USE,
		rangeRequestHandling: RangeRequestHandling.NONE,
		regionalGeoBlocking: false,
		remapText: null,
		tenantId: 1,
		typeId: types.deliveryService.id,
		xmlId: "test-ds",
	});
	checkAlerts("POST", "deliveryservices", newDS);
	newDS.response[0].logsEnabled = !newDS.response[0].logsEnabled;
	checkAlerts("PUT", "deliveryservices/{{ID}}", await client.updateDeliveryService(newDS.response[0]));
	checkAlerts("GET", "deliveryservices", await client.getDeliveryServices(newDS.response[0].xmlId));

	const newDSR = await client.createDSR({
		changeType: DSRChangeType.DELETE,
		deliveryService: newDS.response[0],
		status: DSRStatus.DRAFT
	});
	checkAlerts("POST", "deliveryservice_requests", newDSR);
	newDSR.response.status = DSRStatus.SUBMITTED;
	checkAlerts("PUT", "deliveryservice_requests", await client.updateDSR(newDSR.response));
	checkAlerts("GET", "deliveryservice_requests", await client.getDSRs(newDSR.response.id));
	checkAlerts("DELETE", "deliveryservice_requests", await client.deleteDSR(newDSR.response));

	const newCDNFed = await client.createCDNFederation(newCDN.response, {cname: "test.", ttl: 100});
	checkAlerts("POST", "cdns/{{name}}/federations", newCDNFed);
	newCDNFed.response.description = "quest";
	checkAlerts("PUT", "cdns/{{name}}/federations/{{ID}}", await client.updateCDNFederation(newCDN.response, newCDNFed.response));
	checkAlerts("GET", "cdns/{{name}}/federations", await client.getCDNFederations(newCDN.response, {limit: 1}));

	const newCG = await client.createCacheGroup({name: "test", shortName: "quest", typeId: types.cacheGroup.id});
	checkAlerts("POST", "cachegroups", newCG);
	checkAlerts("GET", `cachegroups?id=${newCG.response.id}`, await client.getCacheGroups(newCG.response.id));
	newCG.response.fallbackToClosest = !newCG.response.fallbackToClosest;
	checkAlerts("PUT", "cachegroups/{{ID}}", await client.updateCacheGroup(newCG.response));
	checkAlerts("POST", "cachegroups/{{ID}}/queue_updates", await client.queueCacheGroupUpdates(newCG.response, newCDN.response));
	checkAlerts("POST", "cachegroups/{{ID}}/queue_updates", await client.dequeueCacheGroupUpdates(newCG.response, newCDN.response));

	const newASN = await client.createASN({asn: 1, cachegroupId: newCG.response.id});
	checkAlerts("POST", "asns", newASN);
	checkAlerts("GET", "asns", await client.getASNs());
	newASN.response.asn = 2;
	checkAlerts("PUT", `asns/${newASN.response.id}`, await client.updateASN(newASN.response));
	checkAlerts("DELETE", `asns/${newASN.response.id}`, await client.deleteASN(newASN.response.id));

	const newType = await client.createType({description: "foo", name: "foo", useInTable: "server"});
	checkAlerts("POST", "types", newType);
	checkAlerts("GET", "types", await client.getTypes({id: newType.response.id}));
	checkAlerts("DELETE", "types/{{ID}}", await client.deleteType(newType.response));

	const newParam = await client.createParameter({configFile: "foo", name: "test", secure: false, value: "quest"});
	checkAlerts("POST", "parameters", newParam);
	checkAlerts("GET", "parameters", await client.getParameters({id: newParam.response.id}));
	newParam.response.value = "bar";
	checkAlerts("PUT", `parameters/${newParam.response.id}`, await client.updateParameter(newParam.response));

	const newProfile = await client.createProfile({
		cdn: newCDN.response.id,
		description: "test",
		name: "test",
		routingDisabled: false,
		type: ProfileType.ATS_PROFILE
	});
	checkAlerts("POST", "profiles", newProfile);
	newProfile.response.description = "quest";
	checkAlerts("PUT", "profiles/{{ID}}", await client.updateProfile(newProfile.response));
	checkAlerts("GET", "profiles?id={{ID}}", await client.getProfiles(newProfile.response.id));
	checkAlerts("POST", "profileparameters", await client.assignParameterToProfile(newProfile.response, newParam.response));

	checkAlerts("POST", "cachegroupparameters", await client.assignParameterToCacheGroup(newCG.response.id, newParam.response.id));
	checkAlerts("GET", "cachegroupparameters", await client.getCacheGroupParameters());
	checkAlerts(
		"DELETE",
		"cachegroupparameters/{{Cache Group ID}}/{{Parameter ID}}",
		await client.removeParameterFromCacheGroup(newCG.response.id, newParam.response.id)
	);

	checkAlerts("GET", "cache_stats", await client.cacheStats("ALL", "bandwidth", new Date((new Date()).setDate(-1)), new Date()));

	checkAlerts("GET", "cdns/{{name}}/snapshot/new", await client.getSnapshotState(newCDN.response));
	checkAlerts("PUT", "snapshot", await client.takeSnapshot(newCDN.response));
	checkAlerts("GET", "cdns/{{name}}/snapshot", await client.getSnapshot(newCDN.response));
	checkAlerts("GET", "cdns/{{name}}/configs/monitoring", await client.getMonitoringConfiguration(newCDN.response));

	const newRole = await client.createRole({
		capabilities: [],
		description: "test",
		name: "test",
		privLevel: 30
	});
	checkAlerts("POST", "roles", newRole);
	checkAlerts("GET", "roles?id={{ID}}", await client.getRoles(newRole.response.id));
	newRole.response.description += "quest";
	checkAlerts("PUT", "roles?id={{ID}}", await client.updateRole(newRole.response));

	const me = await getCurrentUser(client);
	const myTenant = (await client.getTenants(me.tenantId)).response;
	const newTenant = await client.createTenant({
		active: true,
		name: "TSClientTestingTenant",
		parentId: myTenant.id
	});
	checkAlerts("GET", "tenants?id={{ID}}", await client.getTenants(newTenant.response.id));
	const newDivision = await client.createDivision("test");
	checkAlerts("POST", "divisions", newDivision);
	checkAlerts("GET", "divisions", await client.getDivisions(newDivision.response.id));
	newDivision.response.name = "testquest";
	checkAlerts("PUT", "divisions/{{ID}}", await client.updateDivision(newDivision.response));
	const newRegion = await client.createRegion({division: newDivision.response.id, name: "test"});
	checkAlerts("POST", "regions", newRegion);
	checkAlerts("GET", "regions", await client.getRegions(newRegion.response.id));
	newRegion.response.name = "testquest";
	checkAlerts("PUT", "regions/{{ID}}", await client.updateRegion(newRegion.response));
	const newPhysLoc = await client.createPhysicalLocation({
		address: "123 You Got Your Life Back Lane",
		city: "Monstropolis",
		name: "test",
		regionId: newRegion.response.id,
		shortName: "test",
		state: "Denial",
		zip: "0"
	});
	checkAlerts("POST", "phys_locations", newPhysLoc);
	checkAlerts("GET", "phys_locations", await client.getPhysicalLocations(newPhysLoc.response.id));
	newPhysLoc.response.state = "Decay";
	checkAlerts("PUT", "phys_locations/{{ID}}", await client.updatePhysicalLocation(newPhysLoc.response));

	const newStatus = await client.createStatus({description: "test status", name: "test"});
	checkAlerts("POST", "statuses", newStatus);
	newStatus.response.description = "a status for testing the TS client";
	checkAlerts("PUT", "statuses/{{ID}}", await client.updateStatus(newStatus.response));
	checkAlerts("GET", "statuses?id={{ID}}", await client.getStatuses(newStatus.response.id));

	const newServer = await client.createServer({
		cachegroupId: newCG.response.id,
		cdnId: newCDN.response.id,
		domainName: "test",
		hostName: "test",
		interfaces: [
			{
				ipAddresses: [
					{
						address: "127.0.0.1",
						gateway: null,
						serviceAddress: true
					}
				],
				maxBandwidth: null,
				monitor: true,
				mtu: null,
				name: "eth0"
			}
		],
		physLocationId: newPhysLoc.response.id,
		profileId: newProfile.response.id,
		statusId: newStatus.response.id,
		typeId: types.edgeCacheServer.id
	});
	newServer.response.domainName = "quest";
	checkAlerts("PUT", "servers/{{ID}}", await client.updateServer(newServer.response));
	checkAlerts("GET", "servers?id={{ID}}", await client.getServers(newServer.response.id));

	checkAlerts(
		"POST",
		"cachegroups/{{ID}}/deliveryservices",
		await client.assignCacheGroupToDS(newCG.response, [newDS.response[0].id])
	);

	checkAlerts("GET", "cdns/health", await client.getCDNsHealth());
	checkAlerts("GET", "cdns/routing", await client.getCDNsRoutingInfo());
	checkAlerts("GET", "current_stats", await client.getCurrentStats());

	checkAlerts("POST", "consistenthash", await client.testConsistentHashingRegexp(newCDN.response, /some regexp/, "/asset.m3u8"));

	const newCoordinate = await client.createCoordinate({latitude: 1, longitude: -1, name: "test"});
	checkAlerts("POST", "coordinates", newCoordinate);
	++newCoordinate.response.latitude;
	checkAlerts("PUT", "coordinates", await client.updateCoordinate(newCoordinate.response));
	checkAlerts("GET", "coordinates", await client.getCoordinates(newCoordinate.response));

	try {
		await client.dbdump();
	} catch (e) {
		console.error("dbdump failed:", e);
		erroredRequests.add("GET /dbdump");
	}

	checkAlerts("DELETE", "coordinates", await client.deleteCoordinate(newCoordinate.response));
	checkAlerts("DELETE", "servers/{{ID}}", await client.deleteServer(newServer.response));
	checkAlerts("DELETE", "statuses/{{ID}}", await client.deleteStatus(newStatus.response));
	checkAlerts("DELETE", "phys_locations/{{ID}}", await client.deletePhysicalLocation(newPhysLoc.response));
	checkAlerts("DELETE", "regions/{{ID}}", await client.deleteRegion(newRegion.response));
	checkAlerts("DELETE", "divisions/{{ID}}", await client.deleteDivision(newDivision.response));
	checkAlerts("DELETE", `cachegroups/${newCG.response.id}`, await client.deleteCacheGroup(newCG.response));
	checkAlerts(
		"DELETE",
		"profileparameters/{{Profile ID}}/{{Parameter ID}}",
		await client.removeParameterFromProfile(newProfile.response, newParam.response)
	);
	checkAlerts("DELETE", `parameters/${newParam.response.id}`, await client.deleteParameter(newParam.response));
	checkAlerts("DELETE", "profiles/{{ID}}", await client.deleteProfile(newProfile.response));
	checkAlerts("DELETE", "cdns/{{name}}/dnsseckeys", await client.deleteCDNDNSSECKeys(newCDN.response));
	checkAlerts(
		"DELETE",
		"cdns/{{name}}/federations/{{ID}}",
		await client.deleteCDNFederation(newCDN.response, newCDNFed.response)
	);
	checkAlerts("DELETE", "roles?id={{ID}}", await client.deleteRole(newRole.response));
	checkAlerts("DELETE", "tenants?id={{ID}}", await client.deleteTenant(newTenant.response));
	checkAlerts("DELETE", "deliveryservices/{{ID}}", await client.deleteDeliveryService(newDS.response[0]));
	checkAlerts("DELETE", "cdns/{{ID}}", await client.deleteCDN(newCDN.response));

	if (erroredRequests.size > 0) {
		console.error();
		console.error("the following requests failed:");
		for (const r of erroredRequests) {
			console.error(`\t${r}`);
		}
	}
	return erroredRequests.size;
}

/**
 * Handles any errors thrown by `main`.
 *
 * @param e The thrown error.
 */
function handleErr(e: unknown): void {
	const msg = e instanceof Error ? e.message : String(e);
	console.error("client crashed:", msg);
	process.exit(255);
}

main().then(ec=>process.exit(ec)).catch(handleErr);
