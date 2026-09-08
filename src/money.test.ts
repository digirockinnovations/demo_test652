import { describe, expect, it } from "vitest";
import { applyPercent, formatCents, parseAmount, sumCents } from "./money";

describe("applyPercent", () => {
  it("takes a whole-number percentage", () => {
    expect(applyPercent(10_000, 10)).toBe(1000);
  });

  it("rounds to the nearest cent", () => {
    expect(applyPercent(1999, 10)).toBe(200);
    expect(applyPercent(1994, 10)).toBe(199);
  });

  it("is zero for a zero percentage", () => {
    expect(applyPercent(5000, 0)).toBe(0);
  });
});

describe("sumCents", () => {
  it("adds without float drift", () => {
    expect(sumCents([10, 20])).toBe(30);
    expect(sumCents([])).toBe(0);
  });
});

describe("formatCents", () => {
  it("always shows two decimal places", () => {
    expect(formatCents(1234)).toBe("$12.34");
    expect(formatCents(1200)).toBe("$12.00");
    expect(formatCents(5)).toBe("$0.05");
  });

  it("keeps the sign outside the symbol", () => {
    expect(formatCents(-250)).toBe("-$2.50");
  });
});

describe("parseAmount", () => {
  it("accepts plain and prefixed amounts", () => {
    expect(parseAmount("12.34")).toBe(1234);
    expect(parseAmount("$12.34")).toBe(1234);
    expect(parseAmount("7")).toBe(700);
    expect(parseAmount("7.5")).toBe(750);
  });

  it("rejects anything that isn't money", () => {
    expect(parseAmount("twelve")).toBeNull();
    expect(parseAmount("12.345")).toBeNull();
    expect(parseAmount("")).toBeNull();
  });
});
