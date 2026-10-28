# Changelog

## 0.4.2 (2026-10-28)

- After an edit, `get_report` returns `changes` (each passage added, changed or removed, with the text before and after) instead of `edits` (SDK 0.6.3).
- The `quality` description says `fast` now takes about a minute, takes any style and can't copy a file's design (SDK 0.6.3).

## 0.4.1 (2026-10-27)

- The `get_report` tool lists each automatic fix it tried in `fixes` (what it was, `applied` or `rejected`, and why it was rejected) instead of only counting them. Its description says what it returns, when to call it, and that it answers `report_not_ready` until the document finishes and `content_deleted` once its retention ends (SDK 0.6.2).

## 0.4.0 (2026-10-27)

- The remote server (`https://api.eu.doconda.com/mcp`) accepts OAuth sign-in: clients with MCP authorization add the URL, and the user signs in to Doconda and approves access to one project (read-only or read and write). API keys keep working as before.
- Without a token, the remote server answers every request with `401` and `WWW-Authenticate` pointing at its OAuth metadata; it no longer answers `initialize` and `tools/list` anonymously. Its tools are listed in `/.well-known/mcp/server-card.json`.
- New exports `SERVER_INFO` and `listTools(doconda)`; the server info now has a `title`.
- `upload_file` returns `file_id` and `filename`; it no longer returns `pages`, which was always `null` (SDK 0.6.1).
- A `url` that `upload_file` can't download, including a private address on the hosted server, is `file_unreachable` on `/url` instead of `failed`, so an agent can tell a bad URL from a passing failure.
- `list_documents` leaves out `type` when a document has none (an edit or a review), as it already did with `name`.

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
