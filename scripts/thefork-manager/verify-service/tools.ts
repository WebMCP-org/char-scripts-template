import '@mcp-b/global';

/**
 * TheFork Manager — Service page verification tools.
 *
 * These tools read the DOM on /service/* pages to verify that GraphQL
 * mutations to service settings actually took effect in the UI.
 *
 * Pattern: ACT via the graphql tool, then VERIFY with these tools.
 */

navigator.modelContext.registerTool({
  name: 'verify_services',
  description:
    'Read the list of services (Lunch, Dinner, etc.) visible on the service settings page. ' +
    'Returns service names, time ranges, capacity, and status. ' +
    'Use after modifying service settings via GraphQL to confirm changes.',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  annotations: {
    title: 'Verify Services',
    readOnlyHint: true,
  },
  async execute() {
    const url = window.location.href;

    // Read service cards/sections
    const services: Array<Record<string, string>> = [];

    // Look for service sections — TheFork shows services as cards with name, times, capacity
    const sections = document.querySelectorAll('[class*="service"], [data-testid*="service"]');
    sections.forEach(section => {
      const name = section.querySelector('h3, h4, [class*="name"]')?.textContent?.trim() ?? '';
      const text = section.textContent?.trim() ?? '';
      if (name) {
        services.push({
          name,
          details: text.substring(0, 300),
        });
      }
    });

    // Fallback: parse from general page structure
    if (services.length === 0) {
      const headings = Array.from(document.querySelectorAll('h3, h4'));
      headings.forEach(h => {
        const text = h.textContent?.trim() ?? '';
        if (/lunch|dinner|brunch|service/i.test(text)) {
          const parent = h.closest('section, div[class*="card"], div[class*="service"]');
          services.push({
            name: text,
            details: parent?.textContent?.trim().substring(0, 300) ?? '',
          });
        }
      });
    }

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({
            url,
            serviceCount: services.length,
            services,
          }, null, 2),
        },
      ],
    };
  },
});
