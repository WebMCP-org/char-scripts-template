import '@mcp-b/global';

/**
 * TheFork Manager — GraphQL API tool.
 *
 * Single tool that lets the agent execute any GraphQL query or mutation against
 * the TheFork Manager API. Auth is handled via Bearer token from localStorage.
 *
 * Pattern: ACT via this tool, then VERIFY with page-scoped verify tools.
 */

const GRAPHQL_ENDPOINT = '/api/graphql';

function getAuthToken(): string | null {
  try {
    const raw = localStorage.getItem('tfm-front:persist');
    if (!raw) return null;
    const parsed = JSON.parse(JSON.parse(raw));
    return parsed.token ?? null;
  } catch {
    return null;
  }
}

navigator.modelContext.registerTool({
  name: 'graphql',
  description: `Execute a GraphQL query or mutation against the TheFork Manager API.

Auth is automatic — the Bearer token is read from localStorage.

## Context

Extract the restaurant UUID from the current page URL:
  https://manager.thefork.com/{locale}/booking/{date}/{serviceUuid}
  https://manager.thefork.com/{locale}/service/{serviceUuid}

Or use the "me" query to get the current user's restaurant UUID.

## Queries

### me — current user & restaurant
\`\`\`graphql
query me {
  me {
    id userName userType restaurantUuid groupUuid restaurantLegacyId isMultiUser
    restaurantUser {
      firstName lastName mobile
      account { login isEnabled }
      roles { roleUuid label restaurants { id legacyId name address { country } } }
    }
  }
}
\`\`\`

### restaurant — details & configuration
\`\`\`graphql
query restaurant($restaurantUuid: String!) {
  restaurant(restaurantUuid: $restaurantUuid) {
    id legacyId timezone origin name preferredLocale currency
    currentPlan { name displayName }
    address { country city zipCode }
    delay groupUuid createdDate
    configuration {
      id isTest isPublished hasNoOnlineBooking hasNoOfflineBooking
      chooseSeating isEnabledQueue seatingTime isAutoTableFreeingEnabled
      waitingList { isEnabled isEnabledOnEmptyTimeslot maxPeople }
    }
  }
}
\`\`\`
variables: { restaurantUuid: "..." }

### servicesPerDay — services with capacity & stock
\`\`\`graphql
query servicesPerDay($restaurantUuid: ID!, $startDate: String!, $endDate: String!) {
  servicesPerDay(restaurantUuid: $restaurantUuid, startDate: $startDate, endDate: $endDate) {
    date
    services {
      id isClosed isFinished dayId
      service {
        uuid name isBookableOnline
        startTime { default }
        endTime { default }
        capacity { default }
      }
      stock {
        timeslotStocks {
          startMinutes xOccupancy yOccupancy
          nbBookings { offline online }
        }
      }
    }
  }
}
\`\`\`
variables: { restaurantUuid: "...", startDate: "YYYY-MM-DD", endDate: "YYYY-MM-DD" }
Note: startMinutes is minutes since midnight (720 = 12:00, 1080 = 18:00, 1200 = 20:00).

### dayReservations — all reservations for a date
\`\`\`graphql
query dayReservations($dayId: String!, $restaurantUuid: String!) {
  dayReservations(dayId: $dayId, restaurantUuid: $restaurantUuid) {
    id status mealDate partySize isOnline restaurantNote
    customer { firstName lastName email phone }
  }
}
\`\`\`
variables: { dayId: "YYYY-MM-DD", restaurantUuid: "..." }

### reservation — single reservation by UUID
\`\`\`graphql
query reservation($reservationUuid: String!) {
  reservation(reservationUuid: $reservationUuid) {
    id status mealDate partySize isOnline restaurantNote createdAt
    customer { firstName lastName email phone }
    restaurantUuid
  }
}
\`\`\`

### serviceAtDateTime — find service for a date/time
\`\`\`graphql
query serviceAtDateTime($dateTime: String!, $restaurantUuid: ID!) {
  serviceAtDateTime(dateTime: $dateTime, restaurantUuid: $restaurantUuid) {
    id dayId
    service { uuid name hasTurnaround }
  }
}
\`\`\`
variables: { restaurantUuid: "...", dateTime: "2026-02-25T19:00:00.000+01:00" }

### searchCustomers — find a customer
\`\`\`graphql
query searchCustomers($restaurantUuid: GUID!, ...) {
  searchCustomers(restaurantUuid: $restaurantUuid, ...) { ... }
}
\`\`\`

## Mutations

### createReservation
\`\`\`graphql
mutation createReservation(
  $customer: ReservationUpsertCustomerInput!,
  $reservation: CreateReservationInput!,
  $restaurantUuid: String!
) {
  createReservation(customer: $customer, reservation: $reservation, restaurantUuid: $restaurantUuid) {
    id status mealDate partySize restaurantNote isOnline createdAt
  }
}
\`\`\`
variables:
  customer: { ownerId: "<userId>", firstName, lastName, email, phone, locale, civility, isVip, notes, tags, address }
  reservation: { mealDate: "ISO-8601 datetime", partySize: int, restaurantNote?: string }
  restaurantUuid: "..."

### updateReservation
\`\`\`graphql
mutation updateReservation($reservation: UpdateReservationInput!) {
  updateReservation(reservation: $reservation) {
    id status mealDate partySize restaurantNote
  }
}
\`\`\`
variables:
  reservation: { id: "<reservationUuid>", status?, mealDate?, partySize?, restaurantNote? }

### updateReservationStatus — change status (cancel, no-show, arrive, etc.)
\`\`\`graphql
mutation updateReservationStatus($reservation: UpdateReservationStatusInput!) {
  updateReservationStatus(reservation: $reservation) {
    id status
  }
}
\`\`\`
variables:
  reservation: { id: "<reservationUuid>", status: MealStatusEnum }

MealStatusEnum values: CANCELED, NO_SHOW, ARRIVED, SEATED, BILL, LEFT, REJECTED, PARTIALLY_ARRIVED

### createWalkin
\`\`\`graphql
mutation createWalkin($reservation: WalkinInput!, $restaurantUuid: String!) {
  createWalkin(reservation: $reservation, restaurantUuid: $restaurantUuid) { id status }
}
\`\`\`

### Service management
- createService(serviceInput: ServiceCreationInput!) → Service
- updateService(serviceInput: ServiceInput!, serviceUuid: ID!) → Service
- deleteService(serviceUuid: ID!)

## Tips

- Use "me" query first if you don't know the restaurant UUID.
- Times are in minutes since midnight: divide by 60 for hours.
- yOccupancy in stock timeslots = capacity at that timeslot.
- The API returns __typename fields — you can omit them.
- Apollo introspection is disabled — use the queries documented above.
- Token expires every ~10 min. If you get UNAUTHENTICATED, reload the page.
`,
  inputSchema: {
    type: 'object',
    properties: {
      operationName: {
        type: 'string',
        description: 'GraphQL operation name (matches the query/mutation name)',
      },
      query: {
        type: 'string',
        description: 'GraphQL query or mutation string',
      },
      variables: {
        type: 'object',
        description: 'Variables object to pass to the GraphQL operation',
      },
    },
    required: ['query'],
  },
  annotations: {
    title: 'TheFork GraphQL',
    readOnlyHint: false,
  },
  async execute({ operationName, query, variables }) {
    try {
      const token = getAuthToken();

      const headers: Record<string, string> = {
        'content-type': 'application/json',
        'x-app-name': 'tfm-front',
        'x-app-type': 'web',
      };
      if (token) {
        headers['authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify({
          operationName: operationName ?? undefined,
          query: query as string,
          variables: (variables as Record<string, unknown>) ?? {},
        }),
      });

      if (!res.ok) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `HTTP ${res.status}: ${await res.text()}`,
            },
          ],
          isError: true,
        };
      }

      const data = await res.json();

      if (data.errors) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `GraphQL errors:\n${JSON.stringify(data.errors, null, 2)}${data.data ? `\n\nPartial data:\n${JSON.stringify(data.data, null, 2)}` : ''}`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(data.data, null, 2),
          },
        ],
      };
    } catch (err) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Fetch failed: ${err instanceof Error ? err.message : String(err)}`,
          },
        ],
        isError: true,
      };
    }
  },
});
