---
name: opentable-reservations
description: Use OpenTable browser tools to search availability and fill reservation details with explicit user confirmation.
---

# Restaurant Reservations (OpenTable)

## When to use these tools

Use these tools when the user asks to find a restaurant, check availability, or make a reservation on OpenTable.

## Workflow

1. Navigate to `https://www.opentable.com/` if not already there.
2. Use `search_restaurants` with the user's criteria (cuisine, location, date, party size).
3. Click the search button after filling the form.
4. Use `read_search_results` to see what's available.
5. Help the user pick a restaurant and navigate to its page.
6. Select an available time slot.
7. Use `fill_reservation` with the user's contact details.
8. **Always confirm with the user before submitting** the reservation.

## Important

- Never submit a reservation without explicit user confirmation.
- If a selector fails, take a page snapshot and report what you see.
- Dates should be in YYYY-MM-DD format.
- Phone numbers should include country code.
