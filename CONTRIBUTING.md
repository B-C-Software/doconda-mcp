# Contributing

This repository is published from Doconda's main repository. Issues and pull requests are welcome here: accepted
changes are applied upstream and arrive with the next release, credited to you in the changelog.

## Before you open an issue

- Bugs: use the bug report template. Include the `@doconda/mcp` version (`npm ls @doconda/mcp`, or the `serverInfo.version` the server reports on `initialize`), the client you
  use (Claude, Cursor, Inspector…), whether you connect to the remote server or run it locally, and the tool call that
  failed. Never paste an API key.
- Ideas: open an issue first and describe the problem you want solved.
- Security problems: do not open an issue, see [SECURITY.md](SECURITY.md).

## Pull requests

Node 22.18 or later:

```sh
npm install
npm run lint
npm run typecheck
npm test
```

Keep a pull request to one concern. The tests need no API key and make no network calls. A change to a tool's name,
description or schema also needs a line in `CHANGELOG.md`.

We aim to answer issues and pull requests within five working days.
