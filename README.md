# demo_test652

A deliberately small app, used to exercise [Phantom](https://20.70.103.197.sslip.io)
end to end: triage → implement → push → verify.

It prices a shopping cart. That is the whole domain, and it is small on purpose —
a big repository makes every triage run slow and expensive, and the point here is
to run the loop often.

## Running it

```
npm install
npm start      # http://localhost:4173
npm test       # vitest
npm run build  # typecheck only
```

## Layout

| Path | What it is |
|---|---|
| `src/money.ts` | Currency helpers. Everything is integer cents. |
| `src/cart.ts` | Line items, discounts, tax. The pricing rules live here. |
| `src/server.ts` | Serves `public/` and a small JSON API. |
| `public/` | The quote builder page. |

## House rules

- **Money is integer cents, never floats.** A cent of drift is the kind of bug
  customers notice and nobody can reproduce.
- **Discount comes off before tax.** Tax is charged on what the customer
  actually pays.
- Tests live next to the code they cover, as `*.test.ts`.
