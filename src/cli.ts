#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { Doconda } from "@doconda/sdk"
import { createServer } from "./index.ts"

// ===== Main =====

const server = createServer(new Doconda(), { localFiles: true })
await server.connect(new StdioServerTransport())
