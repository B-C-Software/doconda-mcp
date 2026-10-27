# Changelog

## 0.3.3 (2026-10-26)

- `create_document` and `edit_document` take `quality` (`auto`, `fast`, `standard` or `best`) and `max_quality` (the cap for `auto`). Without them nothing changes (`auto`). With a low balance an agent can pick `fast` or cap the level: the highest level's price is held while the document is made.
- Field errors name the tool's own arguments (`file_id`, `instructions`, `markdown`, `source_file_ids`, `data`), not the API's fields.
- On the hosted server, `upload_file` with a `url` only downloads from public addresses.

## 0.3.2 (2026-10-26)

- Every tool now declares a `title` and annotations in `tools/list`: `readOnlyHint` (true for `list_documents`, `get_document`, `get_report` and `read_artifact_data`), `destructiveHint: false` on the tools that write (`create_document`, `upload_file`, `review_document`, `edit_document`), `idempotentHint` and `openWorldHint`. Clients that confirm destructive tools no longer treat reads as destructive, and the server meets the Claude connectors directory's requirement.
- The tools' names, descriptions and schemas don't change.

## 0.3.1 (2026-10-14)

- The package's repository and issues links point to its public repository, `B-C-Software/doconda-mcp`.
- README: the Claude Code command (`claude mcp add --transport stdio doconda --env DOCONDA_API_KEY=ak_eu_… -- npx -y @doconda/mcp`) and how to build and test it.
- `engines`: Node 22 or newer.
- The tools don't change.

## 0.3.0 (2026-10-10)

- Built on `@doconda/sdk` 0.4.0: tool errors come back as `{ error, message, fields? }` with `isError: true`, as before, now also when the SDK returns them instead of throwing.
