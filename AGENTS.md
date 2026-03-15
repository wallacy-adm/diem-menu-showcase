# Legacy Repository Guardrails

This repository is a READ ONLY reference project.

- Do not modify application code, database schema, migrations, snapshots, scripts, assets, or configuration by automation.
- Do not create commits, push changes, or open pull requests unless a human explicitly requests repository recovery work.
- Allowed automation tasks are limited to inspection, diffing, reporting, and build verification that does not change tracked files.
- If recovery is requested, keep the scope minimal and restore the repository to the last known good state.
