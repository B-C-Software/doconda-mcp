# @doconda/mcp

[![CI](https://github.com/B-C-Software/doconda-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/B-C-Software/doconda-mcp/actions/workflows/ci.yml)

MCP server for [Doconda](https://doconda.com): give your AI agent tools to convert, create and edit **Word, PowerPoint,
Excel and PDF** documents. Editable files, reviewed before delivery, with a PDF and a preview of each page.

## Remote server (for your app's agent)

No install: `https://api.eu.doconda.com/mcp` (Streamable HTTP). Clients with MCP authorization (Claude connectors,
Claude Code, Cursor, MCP Inspector) only need the URL: they open Doconda in the browser to sign in and approve access
to one project, read-only if you prefer. Agent frameworks and model APIs send an API key instead, as
`Authorization: Bearer ak_eu_…`. With the OpenAI Responses API:

```python
from openai import OpenAI

response = OpenAI().responses.create(
    model="gpt-5",
    input="Make an Excel with the event budget",
    tools=[{
        "type": "mcp",
        "server_label": "doconda",
        "server_url": "https://api.eu.doconda.com/mcp",
        "headers": {"Authorization": "Bearer ak_eu_…"},
        "require_approval": "never",
    }],
)
print(response.output_text)
```

Messages (errors, report texts) come in English; the remote server follows `Accept-Language`, so send
`Accept-Language: es` for Spanish.

Not using MCP? The SDKs return the same tools for any model with tool calling: [`@doconda/sdk`](https://www.npmjs.com/package/@doconda/sdk) · [`doconda`](https://pypi.org/project/doconda/).

## Local server (stdio)

With Claude Code:

```sh
claude mcp add --transport stdio doconda --env DOCONDA_API_KEY=ak_eu_… -- npx -y @doconda/mcp
```

For other MCP clients, such as Claude Desktop:

```json
{
  "mcpServers": {
    "doconda": {
      "command": "npx",
      "args": ["-y", "@doconda/mcp"],
      "env": { "DOCONDA_API_KEY": "ak_eu_…" }
    }
  }
}
```

## Tools

`create_document`, `upload_file`, `convert_file`, `edit_document`, `list_documents`, `get_document`, `get_report`,
`read_artifact_data`.

Docs: https://docs.doconda.com/en/agents/mcp · Examples: https://github.com/B-C-Software/doconda-examples · Get an API key: https://doconda.com

## Development

Node 22.18 or later:

```sh
npm install
npm run build
npm test
```

The tests need no API key and make no network calls. This repository is published from Doconda's main repository:
open issues and pull requests here, and accepted changes are applied upstream and arrive with the next release.
