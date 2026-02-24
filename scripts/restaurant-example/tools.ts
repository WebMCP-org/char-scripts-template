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
      party_size: {
        type: 'number',
        description: 'Number of guests (default: 2)',
      },
    },
    required: ['query'],
  },
  async execute({ query, party_size }) {
    const searchInput = document.querySelector<HTMLInputElement>(
      'input[data-test="search-autocomplete-input"]'
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

    // Fill search field using native input setter to trigger React state
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype, 'value'
    )!.set!;
    searchInput.focus();
    nativeInputValueSetter.call(searchInput, query as string);
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));

    // Fill party size if provided
    if (party_size) {
      const sizeSelector = document.querySelector<HTMLSelectElement>(
        'select[data-test="party-size-picker"]'
      );
      if (sizeSelector) {
        sizeSelector.value = String(party_size);
        sizeSelector.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }

    // Click "Let's go" to submit search
    await new Promise(r => setTimeout(r, 500));
    const buttons = Array.from(document.querySelectorAll('button'));
    const letsGoBtn = buttons.find(b => b.textContent?.trim() === "Let's go");
    if (letsGoBtn) {
      letsGoBtn.click();
    }

    return {
      content: [
        {
          type: 'text' as const,
          text: `Searched for "${query}"${party_size ? ` with party size ${party_size}` : ''}. Wait for results to load, then use read_search_results.`,
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
    // Restaurant cards are anchor links to /r/ pages
    const cards = document.querySelectorAll('a[href*="/r/"]');

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
          card.querySelector('h3')?.textContent?.trim() ??
          card.textContent?.trim().substring(0, 50) ??
          'Unknown';
        const href = card.getAttribute('href') ?? '';
        // Extract the full card text which includes rating, cuisine, price, location
        const fullText = card.textContent?.trim() ?? '';
        return `${i + 1}. ${name}\n   ${fullText.substring(name.length, name.length + 80)}\n   ${href}`;
      });

    return {
      content: [
        {
          type: 'text' as const,
          text: `Found ${cards.length} restaurants:\n${results.join('\n')}`,
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
