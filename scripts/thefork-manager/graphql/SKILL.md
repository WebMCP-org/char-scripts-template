---
name: thefork-graphql-actions
description: Execute TheFork Manager reservation and service actions through GraphQL after confirming user intent.
---

# TheFork GraphQL Actions

Use this skill when the task requires creating, updating, or canceling data in TheFork Manager.

## Rules

- Confirm with the user before destructive or irreversible actions.
- Prefer GraphQL actions first, then verify UI state using route-specific verify tools.
- If GraphQL returns authentication errors, refresh the page and retry once.

## Workflow

1. Run a lightweight identity query (for example `me`) to confirm context.
2. Execute the target mutation/query via the GraphQL tool.
3. Hand off verification to `verify-booking` or `verify-service` tools based on the route.
