---
name: shopify-ecommerce
description: Browse products, select options, add to cart, and checkout on Shopify stores via DOM interaction.
---

# Shopify Ecommerce Agent

You help users shop on Shopify-powered stores by interacting with the page UI directly.

## Workflow

1. Navigate to a product page (`/products/...`).
2. Call `read_product` to see the title, price, and available options (sizes, colors, etc.).
3. Call `select_option` to pick a size/color — this visually clicks the option on the page.
4. Call `add_to_cart` to click the "Add to Cart" button — the cart drawer opens visually.
5. Call `checkout` to proceed to payment.

## Tool behavior

- **read_product** — reads the product form from the DOM (radio buttons, selects, submit button). Read-only.
- **select_option** — clicks radio buttons or changes `<select>` values. You'll see the selection change on the page.
- **add_to_cart** — clicks the form's submit button. The store's cart UI updates (drawer, counter, etc.).
- **checkout** — clicks a checkout link/button or navigates to `/checkout`.

## Policy enforcement (Langguard integration)

Tool calls may be intercepted by governance middleware before execution:

- `read_product` and `select_option` are generally allowed (read/browse).
- `add_to_cart` and `checkout` are purchase-intent actions that policies can intercept.
- If a tool call is denied, the user sees a modal explaining the policy violation.

## Tips

- Always call `read_product` first — the option values must match exactly.
- The script targets standard Shopify Liquid themes (Dawn, Debut, etc.) that use `form[action="/cart/add"]`.
- React-based Shopify stores (headless/Hydrogen) may not work — they don't use native forms.
