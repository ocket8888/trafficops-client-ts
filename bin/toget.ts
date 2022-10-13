#!/usr/bin/env -S node --no-warnings
import { handleErr, request } from "./main.js";

request("get").then(c=>process.exit(c)).catch(handleErr);
