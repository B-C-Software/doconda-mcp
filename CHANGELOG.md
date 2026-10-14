# Changelog

## 0.3.1 (2026-10-14)

- The package's repository and issues links point to its public repository, `B-C-Software/doconda-mcp`.
- README: the Claude Code command (`claude mcp add --transport stdio doconda --env DOCONDA_API_KEY=ak_eu_… -- npx -y @doconda/mcp`) and how to build and test it.
- `engines`: Node 22 or newer.
- The tools don't change.

## 0.3.0 (2026-10-10)

- Built on `@doconda/sdk` 0.4.0: tool errors come back as `{ error, message, fields? }` with `isError: true`, as before, now also when the SDK returns them instead of throwing.
