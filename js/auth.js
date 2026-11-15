(function () {
    "use strict";
    const store = window.EmberStore;
    const validation = window.EmberValidation;
    // These credentials belong to a public classroom demo, not a protected service.
    const admin = { id: "demo-admin", name: "Ember Admin", email: "admin@ember.demo", password: "EmberAdmin1!", role: "admin", favorites: [] };
    if (!store.users().some(user => user.id === admin.id)) store.write("users", [...store.users(), admin]);
    function field(id) { return document.getElementById(id); }
    function status(id, text) { field(id).textContent = text; }
    function loginUser(user) {
        if (!store.write("session", user.id)) return false;
        const next = new URLSearchParams(location.search).get("next");
        location.href = next === "menu" ? "menu.html" : "profile.html";
        return true;
    }
    ["login-email", "signup-email", "profile-email"].forEach(id => {
        if (field(id)) field(id).inputMode = "email";
    });
    const signup = field("signup-form");
    if (signup) {
        signup.addEventListener("submit", function (event) {
            event.preventDefault();
            status("signup-status", "");
            const valid = validation.form(signup, {
                "signup-name": validation.name,
                "signup-email": validation.email,
                "signup-password": validation.password,
                "signup-confirm": input => input.value === field("signup-password").value && input.value ? "" : "Passwords do not match."
            });
            if (!valid) return;
            const email = field("signup-email").value.trim().toLowerCase();
            if (store.users().some(user => user.email.toLowerCase() === email)) {
                validation.show(field("signup-email"), "An account with this email already exists. Please sign in.");
                field("signup-email").focus();
                return;
            }
            const user = { id: "user-" + Date.now() + "-" + Math.random().toString(36).slice(2), name: field("signup-name").value.trim(), email, password: field("signup-password").value, role: "customer", favorites: [] };
            if (store.write("users", [...store.users(), user])) loginUser(user);
        });
    }
    const login = field("login-form");
    if (login) {
        const signupLink = document.querySelector('a[href="signup.html"]');
        if (new URLSearchParams(location.search).get("next") === "menu") signupLink.href = "signup.html?next=menu";
        login.addEventListener("submit", function (event) {
            event.preventDefault();
            status("login-status", "");
            if (!validation.form(login, { "login-email": validation.email, "login-password": input => input.value ? "" : "Please enter your password." })) return;
            const email = field("login-email").value.trim().toLowerCase();
            const user = store.users().find(user => user.email.toLowerCase() === email && user.password === field("login-password").value);
            if (!user) { status("login-status", "Email or password is incorrect."); return; }
            loginUser(user);
        });
    }
    const profile = field("profile-form");
    if (!profile) return;
    const user = store.currentUser();
    if (!user) { location.replace("login.html"); return; }
    field("profile-content").hidden = false;
    field("profile-greeting").textContent = "Hello, " + user.name + ".";
    field("profile-name").value = user.name;
    field("profile-email").value = user.email;
    field("admin-link").hidden = user.role !== "admin";
    field("logout-button").addEventListener("click", function () {
        if (store.write("session", null)) location.href = "login.html";
    });
    profile.addEventListener("submit", function (event) {
        event.preventDefault();
        status("profile-status", "");
        if (!validation.form(profile, { "profile-name": validation.name, "profile-email": validation.email })) return;
        const current = store.currentUser();
        if (!current) { location.replace("login.html"); return; }
        const email = field("profile-email").value.trim().toLowerCase();
        if (store.users().some(item => item.id !== current.id && item.email.toLowerCase() === email)) {
            validation.show(field("profile-email"), "This email is already used by another account.");
            return;
        }
        current.name = field("profile-name").value.trim();
        current.email = email;
        if (store.updateUser(current)) {
            field("profile-greeting").textContent = "Hello, " + current.name + ".";
            status("profile-status", "Your details have been saved.");
        }
    });
    function renderFavorites() {
        const catalog = window.EmberCatalog;
        const list = field("favorites-list");
        list.replaceChildren();
        const saved = catalog.favorites(store.currentUser());
        const products = catalog.items().filter(item => saved.includes(item.id));
        if (!products.length) list.append(catalog.element("p", "empty-state", "Your next favorite is waiting. Save a drink from the menu and find it here."));
        products.forEach(item => list.append(catalog.card(item)));
    }
    renderFavorites();
    document.addEventListener("ember:favorites-changed", renderFavorites);
})();
