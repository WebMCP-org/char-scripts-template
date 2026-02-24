# WebMCP Script Workspace Template

Starter workspace for authoring, building, and publishing WebMCP user scripts for the Char extension.

## Quick Start

```bash
pnpm install
pnpm build
```

## Workflow

### 1. Author

Write `registerTool()` calls in `scripts/<site>/tools.ts`. Use Chrome DevTools MCP to inject the script into the target page for rapid iteration:

```
# In Claude Code with CDP MCP attached:
navigate_page → take_snapshot → understand page structure
Write tools.ts → evaluate_script to inject → test → iterate
```

### 2. Build

```bash
pnpm build
```

Produces `scripts/<site>/tools.user.js` — a single runnable artifact with `@mcp-b/global` polyfill bundled in.

### 3. Publish

Commit and push to the org's GitHub repo. The Char extension syncs artifacts automatically.

```bash
git add scripts/restaurant-example/tools.user.js char.config.json
git commit -m "feat: add restaurant reservation tools"
git push
```

The extension picks up changes on its next sync cycle (startup + every 5 minutes).

## Structure

```
├── char.config.json               # Script metadata + match patterns
├── package.json                   # Build scripts
├── tsdown.config.ts               # Single-file artifact bundler config
├── tsconfig.json                  # TypeScript config
└── scripts/
    └── restaurant-example/
        ├── tools.ts               # Source (registerTool calls)
        ├── tools.user.js          # Built artifact (committed)
        └── SKILL.md               # Agent workflow guidance
```

## Adding a new site

1. Create `scripts/<site-name>/tools.ts`
2. Add a `SKILL.md` with workflow instructions
3. Add an entry to `char.config.json`
4. Add an entry to `tsdown.config.ts`
5. `pnpm build` and commit the artifact
