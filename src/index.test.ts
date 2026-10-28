import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import { type TestContext, test } from "node:test"
import { fileURLToPath } from "node:url"
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js"
import { Doconda, type ToolOptions } from "@doconda/sdk"
import { createServer, TOOL_ANNOTATIONS } from "./index.ts"

const TOOLS = [
  "create_document",
  "upload_file",
  "review_document",
  "edit_document",
  "list_documents",
  "get_document",
  "get_report",
  "read_artifact_data",
]
const READERS = ["list_documents", "get_document", "get_report", "read_artifact_data"]
const CLI = fileURLToPath(new URL("./cli.ts", import.meta.url))

function api(answer: () => Response) {
  const urls: string[] = []
  const fetch = (async (url: string) => {
    urls.push(url)
    return answer()
  }) as unknown as typeof globalThis.fetch
  return { fetch, urls }
}

async function connect(t: TestContext, fetch: typeof globalThis.fetch, options: ToolOptions = {}) {
  const doconda = new Doconda({ apiKey: "ak_eu_test", baseUrl: "http://doconda.test/v1", maxRetries: 0, fetch })
  const [clientSide, serverSide] = InMemoryTransport.createLinkedPair()
  const client = new Client({ name: "test", version: "1.0.0" })
  await createServer(doconda, options).connect(serverSide)
  await client.connect(clientSide)
  t.after(() => client.close())
  return client
}

async function call(client: Client, name: string, args: Record<string, unknown> = {}) {
  const res = (await client.callTool({ name, arguments: args })) as { isError?: boolean; content: { text: string }[] }
  return { isError: Boolean(res.isError), text: res.content[0].text }
}

const unreachable = () => {
  throw new Error("no API call expected")
}

test("lists the 8 tools, each with a description and an object input schema; a local path only with localFiles", async (t) => {
  const remote = await connect(t, api(unreachable).fetch)
  const { tools } = await remote.listTools()
  assert.deepEqual(
    tools.map((tool) => tool.name),
    TOOLS,
  )
  for (const tool of tools) {
    assert.ok((tool.description ?? "").length > 20, tool.name)
    assert.equal(tool.inputSchema.type, "object", tool.name)
    assert.equal(tool.inputSchema.additionalProperties, false, tool.name)
  }
  const uploadOf = async (client: Client) =>
    (await client.listTools()).tools.find((tool) => tool.name === "upload_file")!.inputSchema.properties ?? {}
  assert.equal("path" in (await uploadOf(remote)), false)
  const local = await connect(t, api(unreachable).fetch, { localFiles: true })
  assert.equal("path" in (await uploadOf(local)), true)
})

test("every tool has a title, also in its annotations, and annotations: readers are read-only, writers say they are not destructive", async (t) => {
  const { tools } = await (await connect(t, api(unreachable).fetch)).listTools()
  assert.deepEqual(Object.keys(TOOL_ANNOTATIONS), TOOLS)
  for (const tool of tools) {
    assert.ok((tool.title ?? "").length > 3, tool.name)
    assert.equal(tool.annotations?.title, tool.title, tool.name)
    const reader = READERS.includes(tool.name)
    assert.equal(tool.annotations?.readOnlyHint, reader, tool.name)
    assert.equal(tool.annotations?.destructiveHint, reader ? undefined : false, tool.name)
    assert.equal(typeof tool.annotations?.idempotentHint, "boolean", tool.name)
    assert.equal(typeof tool.annotations?.openWorldHint, "boolean", tool.name)
  }
})

test("a tool's result comes back as JSON text", async (t) => {
  const doc = {
    id: "doc_1",
    name: "Memo",
    operation: "create",
    type: "memo",
    status: "ready",
    created_at: "2026-10-10",
  }
  const { fetch, urls } = api(() => Response.json({ object: "list", data: [doc], next_cursor: null }))
  const res = await call(await connect(t, fetch), "list_documents", { limit: 5 })
  assert.equal(res.isError, false)
  assert.deepEqual(JSON.parse(res.text), [doc])
  assert.deepEqual(urls, ["http://doconda.test/v1/documents?limit=5"])
})

test("errors come back as { error, message, fields? } with isError: true", async (t) => {
  const fields = [{ path: "prompt", message: "Give prompt or markdown." }]
  const problem = { title: "The request is not valid.", code: "input_invalid", errors: fields }
  const invalid = await connect(t, api(() => Response.json(problem, { status: 422 })).fetch)
  const rejected = await call(invalid, "create_document", { format: "docx" })
  assert.equal(rejected.isError, true)
  assert.deepEqual(JSON.parse(rejected.text), { error: "input_invalid", message: problem.title, fields })

  const offline = await connect(t, (async () => {
    throw new TypeError("fetch failed")
  }) as unknown as typeof fetch)
  const failed = await call(offline, "get_document", { document_id: "doc_1" })
  assert.equal(failed.isError, true)
  assert.deepEqual(JSON.parse(failed.text), { error: "failed", message: "fetch failed" })

  const unknown = await call(offline, "make_coffee")
  assert.equal(unknown.isError, true)
  assert.match(unknown.text, /Unknown tool make_coffee/)
})

test("the CLI without DOCONDA_API_KEY exits 1 and says to set it", () => {
  const run = spawnSync(process.execPath, [CLI], {
    env: { PATH: process.env.PATH },
    input: "",
    encoding: "utf8",
    timeout: 10_000,
  })
  assert.equal(run.status, 1)
  assert.match(run.stderr, /set DOCONDA_API_KEY/)
})
