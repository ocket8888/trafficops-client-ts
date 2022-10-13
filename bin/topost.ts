#!/usr/bin/env -S node --no-warnings
import { handleErr, request } from "./main.js";

request("post").then(c=>process.exit(c)).catch(handleErr);
