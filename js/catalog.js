(function () {
    "use strict";
    const store = window.EmberStore;
    function items() {
        let saved = store.read("menu", null);
        if (!Array.isArray(saved)) {
            // The first admin edit should not cause the new defaults to be re-added.
            if (store.read("menuVersion", 1) < 2) store.write("menuVersion", 2);
            return window.EmberMenuDefaults.map(item => ({ ...item }));
        }
        // Upgrade older local catalogs once, preserving edited prices, custom items,
        // and products previously removed through Admin.
        if (store.read("menuVersion", 1) < 2) {
            const existing = new Set(saved.map(item => item?.id));
            const additions = window.EmberMenuDefaults.filter(item =>
                window.EmberMenuNewIds.includes(item.id) && !existing.has(item.id)
            );
            const upgraded = [...saved, ...additions.map(item => ({ ...item }))];
            if (store.write("menu", upgraded)) store.write("menuVersion", 2);
            saved = upgraded;
        }
        return saved.filter(item => item && typeof item.id === "string" && typeof item.name === "string" && typeof item.description === "string" && Number.isFinite(item.price) && ["coffee", "other", "bakery"].includes(item.category)).map(item => {
            const original = window.EmberMenuDefaults.find(defaultItem => defaultItem.id === item.id);
            const flags = {};
            ["sizeOptions", "cold", "decaf", "plantMilk"].forEach(key => {
                flags[key] = typeof item[key] === "boolean" ? item[key] : (original?.[key] === true);
            });
            if (item.category === "bakery") Object.keys(flags).forEach(key => { flags[key] = false; });
            return { ...item, ...flags };
        });
    }
    function element(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }
    function favorites(user) {
        return user && Array.isArray(user.favorites) ? user.favorites : [];
    }
    function card(item) {
        const article = element("article", "menu-item");
        article.dataset.id = item.id;
        article.dataset.price = item.price;
        article.dataset.cold = String(item.cold === true);
        article.dataset.decaf = String(item.decaf === true);
        article.dataset.plantMilk = String(item.plantMilk === true);
        const image = element("img", "menu-item-photo");
        const allowedImages = window.EmberMenuDefaults.map(product => product.image);
        const original = window.EmberMenuDefaults.find(product => product.id === item.id);
        image.src = allowedImages.includes(item.image) ? item.image : "images/espresso.jpg";
        // New Pexels images are optional online enhancements. Local assets keep
        // the cards usable even without an internet connection.
        image.addEventListener("error", () => {
            const fallback = original?.fallbackImage || "images/espresso.jpg";
            if (image.getAttribute("src") !== fallback) image.src = fallback;
        });
        image.referrerPolicy = "no-referrer";
        image.alt = item.name;
        image.width = 800;
        image.height = 600;
        image.loading = "lazy";
        const body = element("div", "menu-item-body");
        body.append(element("h3", "", item.name), element("p", "", item.description), element("span", "menu-price", new Intl.NumberFormat("en-US").format(item.price) + " ₸"));
        const button = element("button", "favorite-button");
        button.type = "button";
        function updateButton() {
            const saved = favorites(store.currentUser()).includes(item.id);
            button.textContent = saved ? "♥ Saved" : "♡ Save favorite";
            button.setAttribute("aria-pressed", String(saved));
            button.setAttribute("aria-label", (saved ? "Remove " : "Save ") + item.name + (saved ? " from favorites" : " to favorites"));
        }
        updateButton();
        button.addEventListener("click", function () {
            const user = store.currentUser();
            if (!user) {
                location.href = "login.html?next=menu";
                return;
            }
            const saved = favorites(user);
            user.favorites = saved.includes(item.id) ? saved.filter(id => id !== item.id) : [...saved, item.id];
            if (!store.updateUser(user)) return;
            updateButton();
            document.dispatchEvent(new Event("ember:favorites-changed"));
        });
        body.append(button);
        if (document.getElementById("menu-catalog")) {
            const options = element("div", "menu-order-options");
            const size = element("select", "form-select order-option-size");
            size.setAttribute("aria-label", "Size for " + item.name);
            [["small", "Small (−200 ₸)"], ["medium", "Medium"], ["large", "Large (+300 ₸)"]].forEach(([value, label]) => {
                const choice = element("option", "", label);
                choice.value = value;
                if (value === "medium") choice.selected = true;
                size.append(choice);
            });
            if (item.sizeOptions) {
                const label = element("label", "", "Size");
                label.append(size);
                options.append(label);
            }
            const milk = element("select", "form-select order-option-milk");
            milk.setAttribute("aria-label", "Milk for " + item.name);
            [["regular", "Regular milk"], ["plant", "Plant-based milk (+200 ₸)"]].forEach(([value, label]) => {
                const choice = element("option", "", label);
                choice.value = value;
                milk.append(choice);
            });
            if (item.plantMilk) {
                const label = element("label", "", "Milk");
                label.append(milk);
                options.append(label);
            }
            const price = body.querySelector(".menu-price");
            function selected() { return { size: item.sizeOptions ? size.value : "medium", milk: item.plantMilk ? milk.value : "regular" }; }
            function updatePrice() {
                const chosen = selected();
                const difference = (item.sizeOptions ? { small: -200, medium: 0, large: 300 }[chosen.size] : 0) + (chosen.milk === "plant" ? 200 : 0);
                price.textContent = new Intl.NumberFormat("en-US").format(Math.max(0, item.price + difference)) + " ₸";
            }
            size.addEventListener("change", updatePrice);
            milk.addEventListener("change", updatePrice);
            const add = element("button", "btn btn-primary menu-add-button", "Add to order");
            add.type = "button";
            const feedback = element("span", "menu-order-feedback");
            feedback.setAttribute("role", "status");
            add.addEventListener("click", () => {
                const success = window.EmberOrder?.add(item.id, selected());
                feedback.textContent = success ? "Added to your order." : "Could not save order.";
            });
            options.append(add, feedback);
            body.append(options);
        }
        article.append(image, body);
        if (window.EmberMenuNewIds.includes(item.id)) {
            article.append(element("span", "menu-new-badge", "New"));
        }
        return article;
    }
    window.EmberCatalog = { items, card, element, favorites };
    const catalog = document.getElementById("menu-catalog");
    if (!catalog) return;
    const products = items();
    const categories = { coffee: "Coffee", other: "Something else", bakery: "Bakery" };
    Object.entries(categories).forEach(([category, title]) => {
        const wrapper = element("div", "menu-category-section");
        const group = element("div", "menu-group mb-5");
        group.dataset.category = category;
        const cards = element("div", "menu-cards");
        const categoryItems = products.filter(item => item.category === category);
        categoryItems.forEach(item => cards.append(card(item)));
        const heading = element("h2", "", title);
        heading.append(element("span", "menu-category-count", categoryItems.length + " choices"));
        group.append(heading, cards);
        wrapper.append(group);
        catalog.append(wrapper);
    });
    if (products.length) {
        const sortedSection = element("div", "menu-category-section");
        sortedSection.id = "sorted-section";
        sortedSection.hidden = true;
        const sortedGroup = element("div", "menu-group mb-5");
        sortedGroup.append(element("h2", "", "Sorted results"));
        const cards = element("div", "menu-cards");
        cards.id = "sorted-cards";
        sortedGroup.append(cards);
        sortedSection.append(sortedGroup);
        catalog.append(sortedSection);
    } else catalog.append(element("p", "empty-state", "The menu is being refreshed. Please check back soon."));
})();
