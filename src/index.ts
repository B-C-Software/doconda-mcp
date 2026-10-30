import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { CallToolRequestSchema, ListToolsRequestSchema, type ToolAnnotations } from "@modelcontextprotocol/sdk/types.js"
import { type Doconda, DocondaError, type ToolOptions } from "@doconda/sdk"

// ===== Constants =====

const READ: ToolAnnotations = { readOnlyHint: true, idempotentHint: true, openWorldHint: false }
const WRITE: ToolAnnotations = {
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
  openWorldHint: false,
}

export const TOOL_ANNOTATIONS: Record<string, { title: string; annotations: ToolAnnotations }> = {
  create_document: { title: "Create document", annotations: WRITE },
  upload_file: { title: "Upload file", annotations: { ...WRITE, openWorldHint: true } },
  convert_file: { title: "Convert file", annotations: WRITE },
  edit_document: { title: "Edit document", annotations: WRITE },
  list_documents: { title: "List documents", annotations: READ },
  get_document: { title: "Get document", annotations: READ },
  get_report: { title: "Get report", annotations: READ },
  read_artifact_data: { title: "Read artifact data", annotations: READ },
}

export const SERVER_INFO = { name: "doconda", title: "Doconda", version: "0.5.0" }

// ===== Public API =====

export function listTools(doconda: Doconda, options: ToolOptions = {}) {
  return doconda.tools(options).map(({ name, description, inputSchema }) => {
    const { title, annotations } = TOOL_ANNOTATIONS[name]
    return { name, title, description, inputSchema, annotations: { title, ...annotations } }
  })
}

export function createServer(doconda: Doconda, options: ToolOptions = {}): Server {
  const tools = doconda.tools(options)
  const server = new Server(SERVER_INFO, {
    capabilities: { tools: {} },
    instructions:
      "Doconda converts files between formats, and creates and edits documents (Word, PDF, PowerPoint, Excel) and artifacts (web pages with shared data). Share the links it returns with the user; they expire, so call get_document for fresh ones.",
  })

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: listTools(doconda, options) }))

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const tool = tools.find((t) => t.name === request.params.name)
    if (!tool) return { isError: true, content: [{ type: "text", text: `Unknown tool ${request.params.name}.` }] }
    try {
      const result = await tool.run(request.params.arguments ?? {})
      const failed = typeof result === "object" && result !== null && "error" in result
      return {
        ...(failed ? { isError: true } : {}),
        content: [{ type: "text", text: failed ? JSON.stringify(result) : JSON.stringify(result, null, 2) }],
      }
    } catch (err) {
      const e =
        err instanceof DocondaError
          ? { error: err.code, message: err.message, fields: err.errors }
          : { error: "failed", message: String((err as Error)?.message ?? err) }
      return { isError: true, content: [{ type: "text", text: JSON.stringify(e) }] }
    }
  })

  return server
}
