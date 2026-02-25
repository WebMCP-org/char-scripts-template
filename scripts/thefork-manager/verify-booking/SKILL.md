---
name: thefork-verify-booking-ui
description: Verify booking-page UI state in TheFork Manager after API actions and report mismatches.
---

# TheFork Booking Verification

Use this skill to validate booking list and booking detail pages after GraphQL actions.

## Rules

- Do not assume a mutation succeeded until UI evidence matches expected state.
- If verification fails, capture what is visible and report exact mismatch details.

## Workflow

1. Navigate to the relevant booking route.
2. Use booking verification tools to read visible reservation state.
3. Compare against expected values from the API response.
4. Report pass/fail with concrete fields (date, status, party size, customer).
