(function () {
    "use strict";
    const prefix = "ember.";
    window.EmberStore = {
        failed: false,
        read(key, fallback) {
            try {
                const value = localStorage.getItem(prefix + key);
                return value === null ? fallback : JSON.parse(value);
            } catch (error) {
                this.failed = true;
                return fallback;
            }
        },
        write(key, value) {
            try {
                localStorage.setItem(prefix + key, JSON.stringify(value));
                return true;
            } catch (error) {
                this.failed = true;
                window.dispatchEvent(new Event("ember:storage-error"));
                return false;
            }
        },
        users() {
            const users = this.read("users", []);
            return Array.isArray(users) ? users.filter(user => user && typeof user.id === "string" && typeof user.name === "string" && typeof user.email === "string" && typeof user.password === "string" && ["admin", "customer"].includes(user.role)) : [];
        },
        currentUser() {
            const id = this.read("session", null);
            return this.users().find(user => user.id === id) || null;
        },
        updateUser(user) {
            return this.write("users", this.users().map(item => item.id === user.id ? user : item));
        }
    };
    const store = window.EmberStore;
    const theme = store.read("theme", null);
    document.documentElement.dataset.theme = ["light", "dark"].includes(theme)
        ? theme : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const palette = store.read("palette", "cream");
    document.documentElement.dataset.palette = ["cream", "sage", "clay"].includes(palette) ? palette : "cream";
    document.documentElement.dataset.bsTheme = document.documentElement.dataset.theme;
})();
