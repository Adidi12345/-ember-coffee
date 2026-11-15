(function () {
    "use strict";
    const store = window.EmberStore;
    const catalog = window.EmberCatalog;
    if (!store || !catalog) return;
    const format = amount => new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(amount) + " ₸";
    const sizes = { small: -200, medium: 0, large: 300 };
    const milkExtras = { regular: 0, plant: 200 };
    const products = () => catalog.items();
    const getProduct = id => products().find(item => item.id === id);

    function normalOptions(item, requested) {
        const options = requested || {};
        return {
            size: item.sizeOptions && Object.hasOwn(sizes, options.size) ? options.size : "medium",
            milk: item.plantMilk && options.milk === "plant" ? "plant" : "regular"
        };
    }
    function unitPrice(item, options) {
        const chosen = normalOptions(item, options);
        return Math.max(0, item.price + (item.sizeOptions ? sizes[chosen.size] : 0) + milkExtras[chosen.milk]);
    }
    function currentOrder() {
        const raw = store.read("order", []);
        if (!Array.isArray(raw)) return [];
        const found = new Map();
        raw.forEach(entry => {
            if (!entry || typeof entry.id !== "string") return;
            const item = getProduct(entry.id);
            if (!item) return;
            const quantity = Number(entry.qty);
            if (!Number.isInteger(quantity) || quantity < 1) return;
            const options = normalOptions(item, entry);
            const key = JSON.stringify([entry.id, options.size, options.milk]);
            if (found.has(key)) found.get(key).qty = Math.min(99, found.get(key).qty + quantity);
            else found.set(key, { id: entry.id, ...options, qty: Math.min(99, quantity) });
        });
        return [...found.values()];
    }
    function save(entries) {
        if (!store.write("order", entries)) return false;
        render();
        document.dispatchEvent(new Event("ember:order-changed"));
        return true;
    }
    function add(id, options) {
        const item = getProduct(id);
        if (!item) return false;
        const selected = normalOptions(item, options);
        const order = currentOrder();
        const matching = order.find(row => row.id === id && row.size === selected.size && row.milk === selected.milk);
        if (matching) matching.qty = Math.min(99, matching.qty + 1);
        else order.push({ id, ...selected, qty: 1 });
        return save(order);
    }
    function make(tag, className, label) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (label !== undefined) node.textContent = label;
        return node;
    }
    function control(text, name, action, disabled) {
        const button = make("button", "order-action", text);
        button.type = "button";
        button.setAttribute("aria-label", name);
        button.disabled = Boolean(disabled);
        button.addEventListener("click", action);
        return button;
    }
    const account = document.getElementById("account-link");
    const navList = account?.closest("li");
    if (!navList) return;
    const nav = make("li", "nav-item order-nav-item");
    const trigger = make("button", "nav-link order-trigger");
    trigger.type = "button";
    trigger.setAttribute("aria-label", "Open my order");
    const navText = document.createTextNode("My order (");
    const counter = make("span", "", "0");
    counter.id = "order-count";
    trigger.append(navText, counter, document.createTextNode(")"));
    nav.append(trigger);
    navList.after(nav);

    const panel = make("aside", "offcanvas offcanvas-end order-panel");
    panel.id = "order-panel";
    panel.tabIndex = -1;
    panel.setAttribute("aria-labelledby", "order-heading");
    const header = make("div", "offcanvas-header");
    const heading = make("h2", "offcanvas-title", "My Order");
    heading.id = "order-heading";
    const close = make("button", "btn-close");
    close.type = "button";
    close.setAttribute("data-bs-dismiss", "offcanvas");
    close.setAttribute("aria-label", "Close order");
    header.append(heading, close);
    const body = make("div", "offcanvas-body order-panel-body");
    const orderList = make("div", "order-lines");
    const empty = make("p", "order-empty", "Your order is empty. Choose something delicious from the menu.");
    const goMenu = make("a", "text-link", "Explore the menu");
    goMenu.href = "menu.html";
    empty.append(document.createElement("br"), goMenu);
    const footer = make("div", "order-summary");
    const totalRow = make("div", "order-total-row");
    totalRow.append(make("strong", "", "Total"));
    const total = make("strong", "", "0 ₸");
    total.id = "order-total";
    totalRow.append(total);
    const hint = make("p", "order-demo-note", "Demo order only. No payment or real order is sent.");
    const clear = make("button", "btn btn-outline-primary order-clear", "Clear order");
    clear.type = "button";
    clear.addEventListener("click", () => save([]));
    footer.append(totalRow, hint, clear);
    body.append(orderList, empty, footer);
    panel.append(header, body);
    document.body.append(panel);
    trigger.addEventListener("click", () => window.bootstrap.Offcanvas.getOrCreateInstance(panel).show());

    function render() {
        const entries = currentOrder();
        counter.textContent = String(entries.reduce((sum, entry) => sum + entry.qty, 0));
        orderList.replaceChildren();
        let totalValue = 0;
        entries.forEach(entry => {
            const item = getProduct(entry.id);
            const options = normalOptions(item, entry);
            const price = unitPrice(item, options);
            totalValue += price * entry.qty;
            const line = make("article", "order-line");
            const title = make("h3", "", item.name);
            const details = [];
            if (item.sizeOptions) details.push(options.size[0].toUpperCase() + options.size.slice(1));
            if (item.plantMilk) details.push(options.milk === "plant" ? "Plant-based milk" : "Regular milk");
            line.append(title);
            if (details.length) line.append(make("p", "order-line-options", details.join(" · ")));
            line.append(make("p", "order-line-price", format(price) + " each"));
            const actions = make("div", "order-line-actions");
            const quantity = make("div", "order-quantity");
            const change = amount => {
                const order = currentOrder();
                const row = order.find(candidate => candidate.id === entry.id && candidate.size === entry.size && candidate.milk === entry.milk);
                if (!row) return;
                row.qty += amount;
                save(order.filter(candidate => candidate.qty > 0));
            };
            quantity.append(
                control("−", "Remove one " + item.name, () => change(-1)),
                make("span", "order-quantity-value", String(entry.qty)),
                control("+", "Add one " + item.name, () => change(1), entry.qty >= 99)
            );
            const remove = control("Remove", "Remove " + item.name + " from order", () => {
                save(currentOrder().filter(candidate => !(candidate.id === entry.id && candidate.size === entry.size && candidate.milk === entry.milk)));
            });
            actions.append(quantity, remove, make("strong", "order-line-subtotal", format(price * entry.qty)));
            line.append(actions);
            orderList.append(line);
        });
        empty.hidden = entries.length > 0;
        footer.hidden = entries.length === 0;
        total.textContent = format(totalValue);
    }
    window.EmberOrder = { add, items: currentOrder, price: unitPrice, refresh: render };
    window.addEventListener("storage", event => { if (event.key === "ember.order" || event.key === "ember.menu") render(); });
    render();
})();
