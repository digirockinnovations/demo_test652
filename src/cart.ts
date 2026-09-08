import { applyPercent, sumCents } from "./money";

export interface LineItem {
  sku: string;
  name: string;
  unitCents: number;
  quantity: number;
}

export interface Quote {
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  totalCents: number;
  /** How far under MINIMUM_ORDER_CENTS this cart is, or 0 if it clears it. */
  shortfallCents: number;
}

/** GST, as a whole-number percent. */
export const TAX_PERCENT = 10;

/**
 * Smallest order we will quote. Checked against the taxable amount — what the
 * customer actually pays us, before tax — because that is what has to cover
 * the packing and courier cost.
 */
export const MINIMUM_ORDER_CENTS = 15_000;

export function lineTotalCents(item: LineItem): number {
  return item.unitCents * item.quantity;
}

export function subtotalCents(items: LineItem[]): number {
  return sumCents(items.map(lineTotalCents));
}

/**
 * Prices a cart.
 *
 * Order matters: the discount comes off the subtotal, and tax is charged on
 * what the customer actually pays, not on the pre-discount figure.
 */
export function quote(items: LineItem[], discountPercent = 0): Quote {
  const subtotal = subtotalCents(items);

  let discount = 0;
  if (discountPercent > 0) {
    discount = applyPercent(subtotal, discountPercent);
  }

  const taxable = subtotal - discount;
  const tax = applyPercent(taxable, TAX_PERCENT);

  // An empty cart is not under the minimum, it is just empty — there is
  // nothing to push back on until the customer has picked something.
  const shortfall =
    items.length === 0 ? 0 : Math.max(0, MINIMUM_ORDER_CENTS - taxable);

  return {
    subtotalCents: subtotal,
    discountCents: discount,
    taxCents: tax,
    totalCents: taxable + tax,
    shortfallCents: shortfall,
  };
}
