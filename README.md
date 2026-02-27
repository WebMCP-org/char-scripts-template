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

Produces `scripts/<site>/tools.user.iife.js` — a single runnable artifact with `@mcp-b/global` polyfill bundled in.

### 3. Publish

Commit and push to the org's GitHub repo. The Char extension syncs artifacts automatically.

```bash
git add scripts/restaurant-example/tools.user.iife.js char.config.json
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
    ├── restaurant-example/        # DOM manipulation approach (OpenTable)
    │   ├── tools.ts
    │   ├── tools.user.iife.js
    │   └── SKILL.md
    └── thefork-manager/           # Act/Verify approach (TheFork)
        ├── SKILL.md               # Workflow guidance for all TheFork tools
        ├── graphql/
        │   ├── tools.ts           # GraphQL API tool (act layer)
        │   └── tools.user.iife.js
        ├── verify-booking/
        │   ├── tools.ts           # Booking DOM verification (verify layer)
        │   └── tools.user.iife.js
        └── verify-service/
            ├── tools.ts           # Service DOM verification (verify layer)
            └── tools.user.iife.js
```

## Patterns

### DOM Manipulation (restaurant-example)

Direct DOM interaction — fill forms, click buttons, read results. Best for apps without a usable API.

### Act / Verify (thefork-manager)

One flexible API tool for actions, route-scoped DOM tools for confirmation. Best for apps with a GraphQL or REST API:

1. **Act** — Use the `graphql` tool to query or mutate data. Auth flows through session cookies automatically.
2. **Verify** — Use route-scoped DOM tools to confirm the mutation took effect in the UI.

The act/verify split means the API tool is scoped to the whole domain (`manager.thefork.com/*`) while verify tools are scoped to specific routes (`/booking/*`, `/service/*`). Each group gets its own `tool_prefix` to avoid name collisions.

## Adding a new site

1. Create `scripts/<site-name>/tools.ts`
2. Add a `SKILL.md` with workflow instructions
3. Add an entry to `char.config.json`
4. Add an entry to `tsdown.config.ts`
5. `pnpm build` and commit the artifact
