import '@mcp-b/global';

/**
 * TheFork Manager — Booking page verification tools.
 *
 * These tools read specific UI elements on /booking/* pages to verify that
 * GraphQL mutations actually took effect.
 *
 * Pattern: ACT via the graphql tool, then VERIFY with these tools.
 */

navigator.modelContext.registerTool({
  name: 'verify_booking_list',
  description:
    'Read the booking list visible on the page. Returns the date, active service, ' +
    'total reservation count, and each reservation\'s summary text. ' +
    'Use after a GraphQL mutation to confirm the change is reflected in the UI.',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  annotations: {
    title: 'Verify Booking List',
    readOnlyHint: true,
  },
  async execute() {
    const url = window.location.href;

    // Date button — e.g. "Tue 24 Feb"
    const dateButtons = Array.from(document.querySelectorAll('button'));
    const dateBtn = dateButtons.find(b => /\b\d{1,2}\s\w{3}\b/.test(b.textContent ?? ''));
    const date = dateBtn?.textContent?.trim() ?? 'unknown';

    // Service buttons — e.g. "Dinner 0p", "Lunch 5p"
    const serviceButtons = dateButtons.filter(b =>
      /(?:Lunch|Dinner|Brunch|Service)\s*\d+p/i.test(b.textContent ?? ''),
    );
    const services = serviceButtons.map(b => ({
      name: b.textContent?.trim() ?? '',
      active: b.getAttribute('aria-pressed') === 'true'
        || b.classList.contains('active')
        || getComputedStyle(b).fontWeight >= '600',
    }));

    // Total reserved text — "Total reserved: N reservations (M people)"
    const allText = Array.from(document.querySelectorAll('*'));
    const totalEl = allText.find(el => {
      const t = el.textContent ?? '';
      return t.includes('Total reserved:') && el.children.length < 5;
    });
    const total = totalEl?.textContent?.trim().replace(/\s+/g, ' ') ?? 'unknown';

    // No reservations flag
    const noReservations = dateButtons.some(b => b.textContent?.includes('No reservations'));

    // Reservation rows — look for elements with time + guest info patterns
    const reservations: Array<{ text: string }> = [];
    const rows = document.querySelectorAll(
      '[data-testid*="reservation"], [class*="reservation-row"], [class*="booking-row"]',
    );
    rows.forEach(row => {
      const text = row.textContent?.trim().replace(/\s+/g, ' ') ?? '';
      if (text.length > 3) {
        reservations.push({ text: text.substring(0, 200) });
      }
    });

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({
            url,
            date,
            services,
            total,
            noReservations,
            reservationCount: reservations.length,
            reservations: reservations.slice(0, 20),
          }, null, 2),
        },
      ],
    };
  },
});

navigator.modelContext.registerTool({
  name: 'verify_page_context',
  description:
    'Read the current page context: URL, date, selected service, timeslot occupancy. ' +
    'Use to understand where you are before taking actions.',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  annotations: {
    title: 'Verify Page Context',
    readOnlyHint: true,
  },
  async execute() {
    const url = window.location.href;

    // Parse URL for date and service UUID
    const urlMatch = url.match(/\/booking\/(\d{4}-\d{2}-\d{2})\/([a-f0-9-]+)/);
    const urlDate = urlMatch?.[1] ?? null;
    const urlServiceUuid = urlMatch?.[2] ?? null;

    // Read the main heading — e.g. "Wednesday 25 February - Dinner"
    const mainEl = document.querySelector('main');
    const heading = mainEl?.querySelector('h3, h2')?.textContent?.trim() ?? null;

    // Capacity summary — "Total booked: Np" / "Total bookable: Np"
    const staticTexts = mainEl
      ? Array.from(mainEl.querySelectorAll('*'))
          .filter(el => el.children.length === 0)
          .map(el => el.textContent?.trim())
          .filter(Boolean) as string[]
      : [];
    const totalBooked = staticTexts.find(t => t.startsWith('Total booked')) ?? null;
    const totalBookable = staticTexts.find(t => t.startsWith('Total bookable')) ?? null;

    // Timeslot occupancy — "18:00" followed by "0/15"
    const timeslots: Array<{ time: string; occupancy: string }> = [];
    for (let i = 0; i < staticTexts.length - 1; i++) {
      const timeMatch = staticTexts[i].match(/^(\d{2}:\d{2})$/);
      const occMatch = staticTexts[i + 1]?.match(/^(\d+\/\d+)$/);
      if (timeMatch && occMatch) {
        timeslots.push({ time: timeMatch[1], occupancy: occMatch[1] });
      }
    }

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({
            url,
            urlDate,
            urlServiceUuid,
            heading,
            totalBooked,
            totalBookable,
            timeslots: timeslots.slice(0, 20),
          }, null, 2),
        },
      ],
    };
  },
});
