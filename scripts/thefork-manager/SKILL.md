---
name: thefork-manager-operations
description: Coordinate TheFork Manager reservation and service workflows by acting via GraphQL and verifying in page UI.
---

# TheFork Manager — Restaurant Operations

You manage reservations and services for a restaurant through TheFork Manager.
**Act** via the GraphQL API, then **verify** the result is reflected in the page UI.

## Getting started

1. Call the `graphql` tool with the `me` query to identify the restaurant.
2. Extract the `restaurantUuid` from the response — you'll need it for everything.

## Authentication

The GraphQL API requires a Bearer token, NOT just cookies. The tool reads it automatically from `localStorage['tfm-front:persist']` (double-JSON-encoded: `JSON.parse(JSON.parse(raw)).token`).

The token has a ~10 minute TTL. If you get `UNAUTHENTICATED`, reload the page — the app refreshes the token on load via a `set-cookie` + `REFRESH_TOKEN` header cycle.

## Make a reservation

1. **Check availability** — query `servicesPerDay` for the target date. Each service (Lunch, Dinner) shows timeslots with `yOccupancy` (capacity) and `nbBookings` (current bookings). Pick a timeslot where capacity exceeds bookings.
2. **Create the reservation** — call `createReservation` with:
   - `restaurantUuid: String!`
   - `customer: { ownerId: ID!, firstName?, lastName?, email?, phone?, locale?, civility?, isVip?, notes?, tags?, address? }`
   - `reservation: { mealDate: String! (ISO-8601 datetime), partySize: Int!, restaurantNote?: String }`
   The `customer.ownerId` is the user ID from the `me` query.
3. **Verify** — use `verify_booking_list` on the booking page to confirm the reservation appears.

**Always confirm with the user before creating a reservation.**

## View today's reservations

Query `dayReservations` with today's date and the restaurantUuid:
```graphql
query dayReservations($dayId: String!, $restaurantUuid: String!) {
  dayReservations(dayId: $dayId, restaurantUuid: $restaurantUuid) {
    id status mealDate partySize isOnline restaurantNote
    customer { firstName lastName email phone }
  }
}
```
Variables: `{ dayId: "YYYY-MM-DD", restaurantUuid: "..." }`

## Cancel or change a reservation status

1. Find the reservation ID via `dayReservations` or `reservation(reservationUuid)`.
2. Call `updateReservationStatus`:
```graphql
mutation updateReservationStatus($reservation: UpdateReservationStatusInput!) {
  updateReservationStatus(reservation: $reservation) { id status }
}
```
Variables: `{ reservation: { id: "<uuid>", status: "<MealStatusEnum>" } }`

**MealStatusEnum values:** `CANCELED`, `NO_SHOW`, `ARRIVED`, `SEATED`, `BILL`, `LEFT`, `REJECTED`, `PARTIALLY_ARRIVED`

**Always confirm with the user before cancelling.**

## Update a reservation

```graphql
mutation updateReservation($reservation: UpdateReservationInput!) {
  updateReservation(reservation: $reservation) { id status mealDate partySize restaurantNote }
}
```
Variables: `{ reservation: { id: "<uuid>", status?, mealDate?, partySize?, restaurantNote? } }`

## Walk-ins

```graphql
mutation createWalkin($reservation: WalkinInput!, $restaurantUuid: String!) {
  createWalkin(reservation: $reservation, restaurantUuid: $restaurantUuid) { id status }
}
```

## Service management

- `createService(serviceInput: ServiceCreationInput!)` — create a new service
- `updateService(serviceInput: ServiceInput!, serviceUuid: ID!)` — update an existing service
- `deleteService(serviceUuid: ID!)` — delete a service

## Other mutations discovered

- `updateReservations` — batch update (plural)
- `reconfirmReservations(reservationUuidList: [ID]!)` — send reconfirmation
- `restoreExpiredReservation(reservationUuid: ID!)` — restore expired
- `swapReservationTables(tables: SwapReservationTablesInput!, restaurantUuid: ID!)` — swap tables
- `setReservationFilepath(paths: [String!]!, reservationUuid: ID!)` — attach files

## Other queries discovered

- `reservation(reservationUuid: String!)` — single reservation by UUID
- `reservations(reservationUuidList: [String]!)` — batch fetch by UUIDs
- `findReservations(restaurantUuid: GUID!, ...)` — search reservations
- `searchReservations(...)` — returns `ReservationSearchResults`
- `searchCustomers(...)` — returns `CustomerSearchResults`
- `customer(id: ID!)` — single customer lookup
- `serviceAtDateTime(dateTime: String!, restaurantUuid: ID!)` — find which service covers a datetime

## Reservation return type fields

When querying reservations, these fields are available on the `Reservation` type:
`id`, `status`, `mealDate`, `partySize`, `createdAt`, `isOnline`, `restaurantUuid`, `restaurantNote`, `customer { ... }`, `tables { ... }`

## Key facts

- **Endpoint**: `POST /api/graphql` (same-origin)
- **Auth**: Bearer token from `localStorage['tfm-front:persist']` + HttpOnly `access_token` cookie scoped to `/api`
- **Times**: Minutes since midnight in the API. 720 = 12:00, 1080 = 18:00, 1200 = 20:00.
- **Timezone**: Europe/Paris
- **Introspection disabled**: Apollo blocks `__schema`/`__type`. Use only the queries documented here.
- **Required headers**: `content-type: application/json`, `x-app-name: tfm-front`, `x-app-type: web`, `authorization: Bearer <token>`
- **Token refresh**: Token expires ~10 min. Page reload triggers refresh via response header cycle.
- **URL patterns**: `/en/booking/{date}/{serviceUuid}` for booking pages, `/en/service/{serviceUuid}` for service settings.

## Known identifiers (test environment)

| Entity | Value |
|--------|-------|
| Restaurant UUID | `d0f3330f-f47a-49e7-821f-e15263980dc2` |
| Restaurant legacy ID | `606037` |
| Restaurant name | Test Tom@bookabletech |
| Group UUID | `b30f2641-d3de-4376-9461-f4498d19a8e6` |
| User ID (ownerId) | `f9b8a0a7-2250-4694-a0af-c50bc2f3b648` |
| Lunch service UUID | `03e2dd7a-634f-49b7-93c6-53384994aa22` |
| Dinner service UUID | `4d17bfdc-a937-49c2-9b46-346093af752c` |
| Lunch hours | 12:00–14:30 (720–870 min), capacity 30 |
| Dinner hours | 18:00–21:00 (1080–1260 min), capacity 15 |
| Timezone | Europe/Paris |
| Currency | EUR |
| Country | FR (Paris, 75009) |

## Approach: why GraphQL over DOM automation

TheFork Manager is a React SPA. Simulating clicks and filling forms is fragile because:
- React controls state internally — native DOM events don't update React state
- React Select/combobox components have hidden inputs the model can't easily target
- DataDome bot detection flags CDP-level page interaction

By talking to the GraphQL API directly and only reading the DOM for verification:
- Mutations are reliable and instant
- No bot detection triggers (userscripts run in page context, no debugger protocol)
- Verification reads are simple text extraction, not stateful form interaction
