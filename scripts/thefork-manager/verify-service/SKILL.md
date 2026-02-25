---
name: thefork-verify-service-ui
description: Verify service-page configuration and operational UI state in TheFork Manager after API changes.
---

# TheFork Service Verification

Use this skill to validate service configuration pages after GraphQL mutations.

## Rules

- Treat DOM verification as source of truth for user-visible outcome.
- If a value differs from expected, provide exact observed text/value and location.

## Workflow

1. Open the relevant service route.
2. Read service fields with verification tools.
3. Compare observed values against expected mutation output.
4. Return a concise verification result with any discrepancies.
