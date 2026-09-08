import { describe, expect, it } from "vitest";
import { lineTotalCents, quote, subtotalCents, TAX_PERCENT, type LineItem } from "./cart";

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

  it("handles an empty cart", () => {
    expect(quote([], 10)).toEqual({
      subtotalCents: 0,
      discountCents: 0,
      taxCents: 0,
      totalCents: 0,
    });
  });
});

function applyTax(cents: number): number {
  return Math.round((cents * TAX_PERCENT) / 100);
}
