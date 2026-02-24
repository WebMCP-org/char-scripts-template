import '@mcp-b/global';

/**
 * Restaurant reservation tools for OpenTable.
 *
 * These tools let the Char agent search for restaurants, read availability,
 * and fill reservation forms on opentable.com.
 */

navigator.modelContext.registerTool({
  name: 'search_restaurants',
  description:
    'Search for restaurants on the current OpenTable page by entering a query into the search field',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Restaurant name, cuisine, or location to search for',
      },
      date: {
        type: 'string',
        description: 'Reservation date in YYYY-MM-DD format',
      },
      party_size: {
        type: 'number',
        description: 'Number of guests (default: 2)',
      },
    },
    required: ['query'],
  },
  async execute({ query, date, party_size }) {
    const searchInput = document.querySelector<HTMLInputElement>(
      'input[data-test="search-autocomplete-input"], input[aria-label*="Location"]'
    );
    if (!searchInput) {
      return {
        content: [
          {
            type: 'text' as const,
            text: 'Search input not found on page. Make sure you are on opentable.com.',
          },
        ],
      };
    }

    // Fill search field
    searchInput.focus();
    searchInput.value = query as string;
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));

    // Fill date if provided
    if (date) {
      const dateInput = document.querySelector<HTMLInputElement>(
        'input[data-test="date-picker"], input[aria-label*="Date"]'
      );
      if (dateInput) {
        dateInput.value = date as string;
        dateInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }

    // Fill party size if provided
    if (party_size) {
      const sizeSelector = document.querySelector<HTMLSelectElement>(
        'select[data-test="party-size-picker"], select[aria-label*="Party"]'
      );
      if (sizeSelector) {
        sizeSelector.value = String(party_size);
        sizeSelector.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }

    return {
      content: [
        {
          type: 'text' as const,
          text: `Filled search with query="${query}"${date ? `, date=${date}` : ''}${party_size ? `, party_size=${party_size}` : ''}. Click the search button to see results.`,
        },
      ],
    };
  },
});

navigator.modelContext.registerTool({
  name: 'read_search_results',
  description:
    'Read the list of restaurant search results currently visible on the OpenTable page',
  inputSchema: {
    type: 'object',
    properties: {
      limit: {
        type: 'number',
        description: 'Maximum number of results to return (default: 10)',
      },
    },
  },
  async execute({ limit }) {
    const maxResults = (limit as number) || 10;
    const cards = document.querySelectorAll(
      '[data-test="restaurant-card"], [class*="RestaurantCard"]'
    );

    if (cards.length === 0) {
      return {
        content: [
          {
            type: 'text' as const,
            text: 'No restaurant results found on the page. Try searching first.',
          },
        ],
      };
    }

    const results = Array.from(cards)
      .slice(0, maxResults)
      .map((card, i) => {
        const name =
          card.querySelector('h2, [class*="Name"]')?.textContent?.trim() ??
          'Unknown';
        const cuisine =
          card.querySelector('[class*="Cuisine"]')?.textContent?.trim() ?? '';
        const rating =
          card.querySelector('[class*="Rating"], [aria-label*="star"]')
            ?.textContent?.trim() ?? '';
        const price =
          card.querySelector('[class*="Price"]')?.textContent?.trim() ?? '';
        return `${i + 1}. ${name}${cuisine ? ` (${cuisine})` : ''}${rating ? ` - ${rating}` : ''}${price ? ` - ${price}` : ''}`;
      });

    return {
      content: [
        {
          type: 'text' as const,
          text: `Found ${cards.length} results:\n${results.join('\n')}`,
        },
      ],
    };
  },
});

navigator.modelContext.registerTool({
  name: 'fill_reservation',
  description:
    'Fill out the reservation form fields on an OpenTable restaurant page',
  inputSchema: {
    type: 'object',
    properties: {
      first_name: { type: 'string', description: "Guest's first name" },
      last_name: { type: 'string', description: "Guest's last name" },
      email: { type: 'string', description: "Guest's email address" },
      phone: { type: 'string', description: "Guest's phone number" },
      special_requests: {
        type: 'string',
        description: 'Any special requests or notes',
      },
    },
    required: ['first_name', 'last_name', 'email', 'phone'],
  },
  async execute({ first_name, last_name, email, phone, special_requests }) {
    const fieldMap: Record<string, string> = {
      first_name:
        'input[data-test="first-name"], input[name="firstName"], input[autocomplete="given-name"]',
      last_name:
        'input[data-test="last-name"], input[name="lastName"], input[autocomplete="family-name"]',
      email:
        'input[data-test="email"], input[name="email"], input[type="email"]',
      phone:
        'input[data-test="phone"], input[name="phone"], input[type="tel"]',
      special_requests:
        'textarea[data-test="special-requests"], textarea[name="specialRequests"]',
    };

    const values: Record<string, unknown> = {
      first_name,
      last_name,
      email,
      phone,
      special_requests,
    };
    const filled: string[] = [];
    const missing: string[] = [];

    for (const [field, selector] of Object.entries(fieldMap)) {
      const value = values[field];
      if (!value) continue;

      const el = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(
        selector
      );
      if (el) {
        el.focus();
        el.value = String(value);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        filled.push(field);
      } else {
        missing.push(field);
      }
    }

    return {
      content: [
        {
          type: 'text' as const,
          text: `Reservation form: filled ${filled.join(', ')}${missing.length ? `. Could not find: ${missing.join(', ')}` : ''}. Review and submit when ready.`,
        },
      ],
    };
  },
});
