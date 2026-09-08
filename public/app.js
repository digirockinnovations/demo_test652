const money = (cents) => {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  return `${sign}$${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, "0")}`;
};

const itemsEl = document.getElementById("items");
const discountEl = document.getElementById("discount");
const chosen = new Set();

async function load() {
  const { items } = await fetch("/api/catalogue").then((r) => r.json());
  itemsEl.replaceChildren(...items.map((item) => {
    const box = Object.assign(document.createElement("input"), { type: "checkbox", id: item.sku });
    box.addEventListener("change", () => {
      box.checked ? chosen.add(item.sku) : chosen.delete(item.sku);
      refresh();
    });

    const label = Object.assign(document.createElement("label"), {
      htmlFor: item.sku, textContent: item.name,
    });
    const price = Object.assign(document.createElement("span"), {
      className: "price", textContent: money(item.unitCents),
    });

    const row = document.createElement("div");
    row.className = "item";
    row.append(box, label, price);
    return row;
  }));
  refresh();
}

async function refresh() {
  const params = new URLSearchParams({
    skus: [...chosen].join(","),
    discount: String(discountEl.value || 0),
  });
  const q = await fetch(`/api/quote?${params}`).then((r) => r.json());

  document.getElementById("subtotal").textContent = money(q.subtotalCents);
  document.getElementById("discountAmount").textContent = `-${money(q.discountCents)}`;
  document.getElementById("tax").textContent = money(q.taxCents);
  document.getElementById("total").textContent = money(q.totalCents);
}

discountEl.addEventListener("input", refresh);
load();
