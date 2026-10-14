import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js"
import { type Doconda, DocondaError, type ToolOptions } from "@doconda/sdk"

// ===== Public API =====

export function createServer(doconda: Doconda, options: ToolOptions = {}): Server {
  const tools = doconda.tools(options)
  const server = new Server(
    { name: "doconda", version: "0.3.1" },
    {
      capabilities: { tools: {} },
      instructions:
        "Doconda creates, reviews and edits documents (Word, PDF, PowerPoint, Excel) and artifacts (web pages with shared data). Share the links it returns with the user; they expire, so call get_document for fresh ones.",
    },
  )

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: tools.map(({ name, description, inputSchema }) => ({ name, description, inputSchema })),
  }))

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
