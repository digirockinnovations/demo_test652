import { describe, expect, it } from "vitest";
import {
  lineTotalCents,
  MINIMUM_ORDER_CENTS,
  quote,
  subtotalCents,
  TAX_PERCENT,
  type LineItem,
} from "./cart";

const desk: LineItem = { sku: "DSK-1", name: "Standing desk", unitCents: 89_900, quantity: 1 };
const chair: LineItem = { sku: "CHR-2", name: "Task chair", unitCents: 34_950, quantity: 2 };

describe("lineTotalCents", () => {
  it("multiplies unit price by quantity", () => {
    expect(lineTotalCents(desk)).toBe(89_900);
    expect(lineTotalCents(chair)).toBe(69_900);
  });
});

describe("subtotalCents", () => {
  it("adds every line", () => {
    expect(subtotalCents([desk, chair])).toBe(159_800);
  });

  it("is zero for an empty cart", () => {
    expect(subtotalCents([])).toBe(0);
  });
});

describe("quote", () => {
  it("charges tax when there is no discount", () => {
    const q = quote([desk, chair]);
    expect(q.subtotalCents).toBe(159_800);
    expect(q.discountCents).toBe(0);
    expect(q.taxCents).toBe(15_980);
    expect(q.totalCents).toBe(175_780);
  });

  it("takes the discount off before tax", () => {
    const q = quote([desk, chair], 10);
    expect(q.discountCents).toBe(15_980);
    // Tax is charged on what the customer actually pays, not the list price.
    expect(q.taxCents).toBe(applyTax(159_800 - 15_980));
    expect(q.totalCents).toBe(159_800 - 15_980 + q.taxCents);
  });

  it("discounts a single-item cart too", () => {
    const q = quote([desk], 10);
    expect(q.discountCents).toBe(8_990);
    expect(q.taxCents).toBe(applyTax(89_900 - 8_990));
    expect(q.totalCents).toBe(89_001);
  });

  it("handles an empty cart", () => {
    expect(quote([], 10)).toEqual({
      subtotalCents: 0,
      discountCents: 0,
      taxCents: 0,
      totalCents: 0,
      shortfallCents: 0,
    });
  });
});

describe("minimum order value", () => {
  const lamp: LineItem = { sku: "LMP-4", name: "Desk lamp", unitCents: 7_900, quantity: 1 };
  const exactly: LineItem = { sku: "MIN-0", name: "On the line", unitCents: MINIMUM_ORDER_CENTS, quantity: 1 };

  it("reports no shortfall for a cart that clears the minimum", () => {
    expect(quote([desk]).shortfallCents).toBe(0);
  });

  it("treats a cart landing exactly on the minimum as clearing it", () => {
    expect(quote([exactly]).shortfallCents).toBe(0);
  });

  it("reports the shortfall for a cart that is too small", () => {
    expect(quote([lamp]).shortfallCents).toBe(MINIMUM_ORDER_CENTS - 7_900);
  });

  it("measures the shortfall after the discount, before tax", () => {
    // $150.00 of goods clears the minimum, but not once 10% comes off.
    expect(quote([exactly], 10).shortfallCents).toBe(1_500);
  });

  it("does not flag an empty cart", () => {
    expect(quote([]).shortfallCents).toBe(0);
    expect(quote([], 10).shortfallCents).toBe(0);
  });
});

function applyTax(cents: number): number {
  return Math.round((cents * TAX_PERCENT) / 100);
}
