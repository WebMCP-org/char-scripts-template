import '@mcp-b/global';

/**
 * Ecommerce tools for Shopify stores (DOM-driven).
 *
 * Visually interacts with the page — clicks buttons, selects sizes,
 * reads product info from the DOM. Designed for standard Shopify Liquid
 * themes (Dawn, Debut, etc.) that use native forms and inputs.
 *
 * Tools:
 *  - read_product: read product details from the current page
 *  - select_option: click a size/color/variant option on the page
 *  - add_to_cart: click the "Add to cart" button
 *  - checkout: click through to checkout
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Find the main product form on the page. */
function findProductForm(): HTMLFormElement | null {
  return document.querySelector('form[action*="/cart/add"]');
}

/** Trigger change event the way Shopify Liquid themes expect. */
function dispatchChange(el: HTMLElement) {
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

// ─── Tools ────────────────────────────────────────────────────────────────────

navigator.modelContext.registerTool({
  name: 'read_product',
  description: `Read product details from the current Shopify product page.

Returns the product title, price, and available options (sizes, colors, etc.)
as they appear in the page UI. Use select_option to pick a variant before adding to cart.`,
  inputSchema: {
    type: 'object',
    properties: {},
  },
  annotations: {
    title: 'Read Product',
    readOnlyHint: true,
  },
  async execute() {
    const title =
      document.querySelector('h1')?.textContent?.trim() ?? 'Unknown';

    const priceEl =
      document.querySelector('.price-item--regular, .product__price, .price .money, [class*="price"]');
    const price = priceEl?.textContent?.trim() ?? 'Unknown';

    const form = findProductForm();
    if (!form) {
      return {
        content: [{
          type: 'text' as const,
          text: `**${title}** — ${price}\n\nNo product form found on this page. Navigate to a /products/... page.`,
        }],
      };
    }

    // Collect available options (radios, selects)
    const options: string[] = [];

    // Radio buttons (e.g., Size radios)
    const radioGroups = new Map<string, { value: string; checked: boolean; label: string }[]>();
    form.querySelectorAll<HTMLInputElement>('input[type="radio"]').forEach((r) => {
      const name = r.name;
      if (!radioGroups.has(name)) radioGroups.set(name, []);
      const labelEl = r.id ? document.querySelector<HTMLLabelElement>(`label[for="${r.id}"]`) : null;
      radioGroups.get(name)!.push({
        value: r.value,
        checked: r.checked,
        label: labelEl?.textContent?.trim() ?? r.value,
      });
    });
    for (const [name, radios] of radioGroups) {
      const items = radios.map((r) => `${r.checked ? '[x]' : '[ ]'} ${r.label}`);
      options.push(`${name}:\n${items.join('\n')}`);
    }

    // Select dropdowns (e.g., variant select)
    form.querySelectorAll<HTMLSelectElement>('select').forEach((sel) => {
      const name = sel.getAttribute('data-option-name') ?? sel.name;
      if (name === 'id') return; // hidden variant select, skip
      const items = Array.from(sel.options).map(
        (o) => `${o.selected ? '[x]' : '[ ]'} ${o.textContent?.trim()}`,
      );
      options.push(`${name}:\n${items.join('\n')}`);
    });

    const submitBtn = form.querySelector<HTMLButtonElement | HTMLInputElement>(
      'button[type="submit"], button[name="add"], input[type="submit"]',
    );
    const submitText = submitBtn
      ? (submitBtn.value || submitBtn.textContent?.trim() || 'Submit')
      : 'No submit button found';

    return {
      content: [{
        type: 'text' as const,
        text: [
          `**${title}** — ${price}`,
          '',
          options.length ? `Options:\n${options.join('\n\n')}` : 'No configurable options.',
          '',
          `Submit button: "${submitText}"`,
        ].join('\n'),
      }],
    };
  },
});

navigator.modelContext.registerTool({
  name: 'select_option',
  description: `Select a product option on the page (size, color, type, etc.).

Clicks the matching radio button or selects the matching dropdown option.
This visually updates the page — you'll see the selection change in the UI.

Example: select_option({ option_name: "Size", value: "M - 40" })`,
  inputSchema: {
    type: 'object',
    properties: {
      option_name: {
        type: 'string',
        description: 'Name of the option group (e.g., "Size", "Color", "Type"). Use read_product to see available options.',
      },
      value: {
        type: 'string',
        description: 'The value to select (e.g., "M - 40", "Blue", "Ground"). Must match exactly.',
      },
    },
    required: ['option_name', 'value'],
  },
  annotations: {
    title: 'Select Option',
    readOnlyHint: false,
  },
  async execute({ option_name, value }) {
    const form = findProductForm();
    if (!form) {
      return {
        content: [{ type: 'text' as const, text: 'No product form found on page.' }],
        isError: true,
      };
    }

    const name = option_name as string;
    const val = value as string;

    // Try radio buttons first
    const radio = form.querySelector<HTMLInputElement>(
      `input[type="radio"][name="${name}"][value="${val}"]`,
    );
    if (radio) {
      radio.click();
      dispatchChange(radio);
      return {
        content: [{ type: 'text' as const, text: `Selected ${name}: ${val}` }],
      };
    }

    // Try select dropdown
    const select = form.querySelector<HTMLSelectElement>(
      `select[data-option-name="${name}" i], select[name="${name}" i]`,
    );
    if (select) {
      const option = Array.from(select.options).find(
        (o) => o.value === val || o.textContent?.trim() === val,
      );
      if (option) {
        select.value = option.value;
        dispatchChange(select);
        return {
          content: [{ type: 'text' as const, text: `Selected ${name}: ${val}` }],
        };
      }
      const available = Array.from(select.options).map((o) => o.textContent?.trim()).join(', ');
      return {
        content: [{ type: 'text' as const, text: `Value "${val}" not found for ${name}. Available: ${available}` }],
        isError: true,
      };
    }

    // Try clicking a label that contains the value (common pattern)
    const labels = Array.from(form.querySelectorAll('label'));
    const matchingLabel = labels.find(
      (l) => l.textContent?.trim() === val || l.textContent?.trim().includes(val),
    );
    if (matchingLabel) {
      matchingLabel.click();
      return {
        content: [{ type: 'text' as const, text: `Clicked label for ${name}: ${val}` }],
      };
    }

    return {
      content: [{
        type: 'text' as const,
        text: `Option "${name}" with value "${val}" not found. Use read_product to see available options.`,
      }],
      isError: true,
    };
  },
});

navigator.modelContext.registerTool({
  name: 'add_to_cart',
  description: `Click the "Add to Cart" button on the current product page.

This visually submits the product form — you'll see the cart update in the store UI.
Make sure you've selected the right options (size, color) first using select_option.

**This is a purchase-intent action.**`,
  inputSchema: {
    type: 'object',
    properties: {},
  },
  annotations: {
    title: 'Add to Cart',
    readOnlyHint: false,
  },
  async execute() {
    const form = findProductForm();
    if (!form) {
      return {
        content: [{ type: 'text' as const, text: 'No product form found on page.' }],
        isError: true,
      };
    }

    const submitBtn = form.querySelector<HTMLButtonElement | HTMLInputElement>(
      'button[type="submit"], button[name="add"], input[type="submit"]',
    );
    if (!submitBtn) {
      return {
        content: [{ type: 'text' as const, text: 'Add to cart button not found.' }],
        isError: true,
      };
    }

    // Read what we're about to add
    const title = document.querySelector('h1')?.textContent?.trim() ?? 'Unknown';
    const selectedOptions: string[] = [];
    form.querySelectorAll<HTMLInputElement>('input[type="radio"]:checked').forEach((r) => {
      selectedOptions.push(`${r.name}: ${r.value}`);
    });

    // Click the button
    submitBtn.click();

    return {
      content: [{
        type: 'text' as const,
        text: `Clicked "Add to Cart" for ${title}${selectedOptions.length ? ` (${selectedOptions.join(', ')})` : ''}. The cart should update in the page UI.`,
      }],
    };
  },
});

navigator.modelContext.registerTool({
  name: 'checkout',
  description: `Navigate to the checkout page.

Clicks the checkout button or navigates to /checkout.
**This is a high-stakes purchase action** — the user will be taken to payment.`,
  inputSchema: {
    type: 'object',
    properties: {},
  },
  annotations: {
    title: 'Checkout',
    readOnlyHint: false,
    destructiveHint: true,
  },
  async execute() {
    // Try to find a checkout button on the page (e.g., in a cart drawer)
    const checkoutBtn = Array.from(document.querySelectorAll('a, button')).find(
      (el) => /check\s*out/i.test(el.textContent ?? ''),
    ) as HTMLElement | undefined;

    if (checkoutBtn) {
      checkoutBtn.click();
      return {
        content: [{ type: 'text' as const, text: 'Clicked checkout button. Navigating to payment.' }],
      };
    }

    // Fallback: navigate directly
    window.location.href = '/checkout';
    return {
      content: [{ type: 'text' as const, text: 'Navigating to /checkout.' }],
    };
  },
});
