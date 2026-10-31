#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { Doconda } from "@doconda/sdk"
import { createServer, SERVER_INFO } from "./index.ts"

// ===== Main =====

const server = createServer(new Doconda({ userAgent: `doconda-mcp/${SERVER_INFO.version}` }), { localFiles: true })
await server.connect(new StdioServerTransport())
