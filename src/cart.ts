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
}

/** GST, as a whole-number percent. */
export const TAX_PERCENT = 10;

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

  return {
    subtotalCents: subtotal,
    discountCents: discount,
    taxCents: tax,
    totalCents: taxable + tax,
  };
}
