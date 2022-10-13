# trafficops-client-ts
A TypeScript client for the Traffic Ops component of
[Apache Traffic Control](https://github.com/apache/trafficcontrol).

## Installation
To install from `npm`, use `npm install trafficops-client` (*not*
`trafficops-client-ts`).

### Versioning
The client package version matches the API version for which its use is
approved, in major and minor terms (which is why version history starts at
3.1.0). The patch version is reserved for bugfix updates to the client itself.

So versions 3.1.0 and 3.1.1 are both suitable for use with API version 3, up to
minor version 1 (although `toaccess` scripts will let you use whatever version
you want with `-a`/`--api-version`), but 3.1.1 has at least one fix for at least
one bug that exists in 3.1.0. So, in general, your patch version should always
just be the latest.

## Usage
This package can be used in one of two ways; as a set of command-line utilities
(Linux-only supported), or as a client library.

### Usage as a Client Library
Simple usage is as follows:
```typescript
import { Client } from "trafficops-client";

// myTrafficOpsURL can be a string or a URL
const client = new Client(myTrafficOpsURL, options);
client.login(myTrafficOpsUsername, myTrafficOpsPassword).then(
	async (): Promise<void> => {
		// client is now authenticated, do things like e.g. get servers and
		// print their hostnames.
		const servers = (await client.getServers()).response;
		for (const server of servers) {
			console.log(server.hostName);
		}
	}
);
```
Note that for the vast majority of endpoints, you must manually log-in using
`Client.login` before sending any requests, otherwise they will all fail. Even
for endpoints that don't require authentication, the Client method that calls
them may assume you are authenticated and could throw an error if called without
first authenticating.

For further information on what options are available, what methods are exposed,
their return types and respective request options, consult the JSDoc comment
documentation.

### Usage as a Set of Command-Line Utilities
This package provides scripts for easily and conveniently sending requests to
Traffic Ops directly from your Linux shell. These are listed below.

- `todelete` - Sends DELETE requests
- `toget` - Sends GET requests
- `tohead` - Sends HEAD requests
- `tooptions` - Sends OPTIONS requests
- `topatch` - Sends PATCH requests
- `topost` - Sends POST requests
- `toput` - Sends PUT requests

Note that at the time of this writing, no Traffic Ops API endpoints support the
PATCH or HEAD HTTP request methods.

The flags and required positional arguments can be found by calling e.g.
`toget --help` (or just `toget -h`). All of these scripts support the same set
of options and arguments and option-arguments, so if you've read one help
message, you've read them all.

For information on which Traffic Ops API endpoints are available, consult
[the 'Traffic Ops API' section of the Apache Traffic Control documentation](https://traffic-control-cdn.readthedocs.io/en/latest/api/index.html).

## Testing
Currently, the only tests are "integration" tests that just call as many of the
methods of the Client as possible (some have bugs in the TO API at the time of
this writing that prevent proper usage, some have obscure or confusing
requirements that cannot be guaranteed to be met during testing etc.) and just
recording how many fail.

In order to run these tests, the following requirements must be met:

* You must be running a Linux or Linux-like operating system with NodeJS
installed.
* An accessible Traffic Ops instance running at `localhost` on port `6443`
(allowing specifying this is on my to-do list; for now its CDN-in-a-Box
standard).
* The Types registered with your Traffic Ops instance must be sufficient to
create all of the different objects to which a Type might refer (generally this
shouldn't be a problem for users that started at ATCv3 or later).
* The running user must have the username `admin` and the password `twelve12`
(allowing specifying this is on my to-do list; for now its CDN-in-a-Box
standard).
* The running user must be in the "root" Tenant, and must have a Role with
"admin-level" Permissions (`privLevel` >= 30 in legacy API versions, or
literally the special Role `admin` in newer versions - which are unimplemented
at the time of this writing).

To run the tests, use `npm test`. It will output the request method,
API-version-path-relative path (e.g. `/users` for `/api/4.1/users`), and the
parsed response JSON (for JSON responses) for each of the requests it runs, and
at the end will print the requests that failed on consecutive lines. This
outputs a lot, so you may wish to pipe it to a file for later viewing. The exit
code of the test script will be the number of failed requests. Note that at the
time of this writing, deficiencies in the CDN-in-a-Box environment will cause
`POST /consistenthash`, `PUT /user/current` (this can be fixed by modifying the
`admin` user to be valid), and `POST /isos` to always fail when the tests are
run against that environment.
