(function () {
    "use strict";
    const store = window.EmberStore;
    const catalog = window.EmberCatalog;
    const validation = window.EmberValidation;
    const user = store.currentUser();
    if (!user || user.role !== "admin") { location.replace(user ? "profile.html" : "login.html"); return; }
    const byId = id => document.getElementById(id);
    const form = byId("menu-editor");
    // Offer every new catalog image in Admin without maintaining duplicate HTML.
    const photoSelect = byId("item-image");
    window.EmberMenuDefaults.forEach(item => {
        if ([...photoSelect.options].some(option => option.value === item.image)) return;
        const option = document.createElement("option");
        option.value = item.image;
        option.textContent = item.name;
        photoSelect.append(option);
    });
    const dialog = byId("delete-dialog");
    let pendingDelete = null;
    byId("admin-content").hidden = false;
    byId("item-price").inputMode = "decimal";
    function authorized() {
        if (store.currentUser()?.role === "admin") return true;
        location.replace("login.html");
        return false;
    }
    function resetEditor() {
        form.reset();
        byId("item-id").value = "";
        byId("editor-heading").textContent = "Add an item.";
        byId("save-item").textContent = "Add item";
        byId("cancel-edit").hidden = true;
        ["size-options", "cold", "decaf", "plant-milk"].forEach(key => { byId("item-" + key).checked = false; });
        form.querySelectorAll(".field-error").forEach(node => { node.textContent = ""; });
        form.querySelectorAll("[aria-invalid]").forEach(node => node.removeAttribute("aria-invalid"));
    }
    function edit(item) {
        resetEditor();
        ["id", "name", "description", "price", "category", "image"].forEach(key => { byId("item-" + key).value = item[key]; });
        byId("item-size-options").checked = item.sizeOptions === true;
        byId("item-cold").checked = item.cold === true;
        byId("item-decaf").checked = item.decaf === true;
        byId("item-plant-milk").checked = item.plantMilk === true;
        byId("editor-heading").textContent = "Edit item.";
        byId("save-item").textContent = "Save changes";
        byId("cancel-edit").hidden = false;
        byId("admin-status").textContent = "";
        byId("item-name").focus();
    }
    function render() {
        const list = byId("admin-items");
        list.replaceChildren();
        const products = catalog.items();
        byId("admin-count").textContent = products.length + " items";
        products.forEach(item => {
            const row = catalog.element("article", "admin-item");
            const details = catalog.element("div", "admin-item-details");
            details.append(catalog.element("h3", "", item.name), catalog.element("p", "", item.category + " · " + item.price + " ₸"));
            const actions = catalog.element("div", "form-actions");
            const editButton = catalog.element("button", "btn btn-outline-primary btn-sm", "Edit");
            editButton.type = "button";
            editButton.setAttribute("aria-label", "Edit " + item.name);
            editButton.addEventListener("click", () => edit(item));
            const deleteButton = catalog.element("button", "btn btn-outline-primary btn-sm", "Remove");
            deleteButton.type = "button";
            deleteButton.setAttribute("aria-label", "Remove " + item.name);
            deleteButton.addEventListener("click", () => {
                pendingDelete = item.id;
                byId("delete-description").textContent = item.name + " will be removed from the menu and will no longer appear in favorites.";
                dialog.showModal();
                byId("cancel-delete").focus();
            });
            actions.append(editButton, deleteButton);
            row.append(details, actions);
            list.append(row);
        });
        if (!products.length) list.append(catalog.element("p", "empty-state", "No items yet. Add the first one using the form."));
    }
    byId("cancel-edit").addEventListener("click", resetEditor);
    byId("cancel-delete").addEventListener("click", () => dialog.close());
    byId("confirm-delete").addEventListener("click", () => {
        if (!authorized() || !pendingDelete) return;
        if (store.write("menu", catalog.items().filter(item => item.id !== pendingDelete))) {
            if (byId("item-id").value === pendingDelete) resetEditor();
            byId("admin-status").textContent = "Item removed.";
            render();
        }
        dialog.close();
        pendingDelete = null;
    });
    form.addEventListener("submit", event => {
        event.preventDefault();
        if (!authorized()) return;
        byId("admin-status").textContent = "";
        const rules = {
            "item-name": input => /^[A-Za-z]+(?: [A-Za-z]+)*$/.test(input.value.trim()) && input.value.trim().length <= 60 ? "" : "Use English letters and spaces, up to 60 characters.",
            "item-description": input => input.value.trim().length >= 5 && input.value.trim().length <= 300 ? "" : "Use a description of 5–300 characters.",
            "item-price": input => /^\d+(?:\.\d{1,2})?$/.test(input.value.trim()) && Number(input.value) > 0 && Number(input.value) <= 100000 ? "" : "Enter a price above 0 and up to 100,000 ₸, with up to two decimal places."
        };
        if (!validation.form(form, rules)) return;
        const products = catalog.items();
        const id = byId("item-id").value;
        const name = byId("item-name").value.trim();
        if (products.some(item => item.id !== id && item.name.toLowerCase() === name.toLowerCase())) {
            validation.show(byId("item-name"), "An item with this name already exists.");
            return;
        }
        const category = byId("item-category").value;
        const isDrink = category !== "bakery";
        const item = {
            id: id || "item-" + Date.now(), name,
            description: byId("item-description").value.trim(),
            price: Number(byId("item-price").value), category,
            image: byId("item-image").value,
            sizeOptions: isDrink && byId("item-size-options").checked,
            cold: isDrink && byId("item-cold").checked,
            decaf: isDrink && byId("item-decaf").checked,
            plantMilk: isDrink && byId("item-plant-milk").checked
        };
        if (!store.write("menu", id ? products.map(product => product.id === id ? item : product) : [...products, item])) return;
        resetEditor();
        render();
        byId("admin-status").textContent = id ? "Item updated." : "Item added.";
    });
    render();
})();
