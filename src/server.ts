import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { quote, type LineItem } from "./cart";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..", "public");
const port = Number(process.env.PORT ?? 4173);

/** The demo catalogue. Small on purpose — this exists to be priced, not browsed. */
export const CATALOGUE: LineItem[] = [
  { sku: "DSK-1", name: "Standing desk", unitCents: 89_900, quantity: 1 },
  { sku: "CHR-2", name: "Task chair", unitCents: 34_950, quantity: 1 },
  { sku: "MON-3", name: "27\" monitor", unitCents: 42_500, quantity: 1 },
  { sku: "LMP-4", name: "Desk lamp", unitCents: 7_900, quantity: 1 },
];

const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);

  if (url.pathname === "/api/catalogue") {
    return json(res, 200, { items: CATALOGUE });
  }

  if (url.pathname === "/api/quote") {
    const skus = (url.searchParams.get("skus") ?? "").split(",").filter(Boolean);
    const discount = Number(url.searchParams.get("discount") ?? 0);

    const items = skus
      .map((sku) => CATALOGUE.find((c) => c.sku === sku))
      .filter((i): i is LineItem => Boolean(i));

    return json(res, 200, { items, ...quote(items, discount) });
  }

  // Static files. normalize() resolves any "../" before we join, and dropping
  // every leading separator keeps the result relative so it can't climb out of
  // public/ and start serving the source tree.
  const rel =
    url.pathname === "/"
      ? "index.html"
      : normalize(url.pathname).split(/[/\\]+/).filter(Boolean).join("/");
  try {
    const body = await readFile(join(root, rel));
    res.writeHead(200, { "Content-Type": TYPES[extname(rel)] ?? "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  }
});

function json(res: import("node:http").ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

server.listen(port, () => console.log(`demo_test652 listening on http://localhost:${port}`));
