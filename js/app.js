(function () {
    "use strict";
    const store = window.EmberStore;
    const root = document.documentElement;
    const themeButton = document.getElementById("theme-toggle");
    const paletteButton = document.getElementById("change-background");
    function renderAppearance() {
        const dark = root.dataset.theme === "dark";
        themeButton.setAttribute("aria-pressed", String(dark));
        themeButton.textContent = dark ? "☀ Light mode" : "☾ Dark mode";
        paletteButton.setAttribute("aria-label", "Change page color. Current palette: " + root.dataset.palette);
        document.getElementById("palette-name").textContent = root.dataset.palette[0].toUpperCase() + root.dataset.palette.slice(1);
        root.dataset.bsTheme = root.dataset.theme;
    }
    themeButton.addEventListener("click", function () {
        root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
        store.write("theme", root.dataset.theme);
        renderAppearance();
    });
    paletteButton.addEventListener("click", function () {
        const palettes = ["cream", "sage", "clay"];
        root.dataset.palette = palettes[(palettes.indexOf(root.dataset.palette) + 1) % palettes.length];
        store.write("palette", root.dataset.palette);
        renderAppearance();
    });
    renderAppearance();
    const user = store.currentUser();
    const accountLink = document.getElementById("account-link");
    if (user) {
        accountLink.href = "profile.html";
        accountLink.textContent = "My profile";
    }
    if (["profile.html", "login.html", "signup.html", "admin.html"].includes(location.pathname.split("/").pop())) {
        accountLink.classList.add("active");
        accountLink.setAttribute("aria-current", "page");
    }
    function storageWarning() {
        if (document.getElementById("storage-warning")) return;
        const message = document.createElement("div");
        message.id = "storage-warning";
        message.className = "storage-warning";
        message.setAttribute("role", "alert");
        message.textContent = "Browser storage is unavailable or damaged. Changes cannot be saved. Enable site storage and reload.";
        document.querySelector("main").prepend(message);
    }
    window.addEventListener("ember:storage-error", storageWarning);
    if (store.failed) storageWarning();
    window.addEventListener("storage", function (event) {
        if (["ember.theme", "ember.palette"].includes(event.key)) {
            root.dataset.theme = store.read("theme", "light");
            root.dataset.palette = store.read("palette", "cream");
            renderAppearance();
        }
        if (event.key === "ember.session") location.reload();
    });
    document.querySelectorAll("#login-form input[type='password'], #signup-form input[type='password']").forEach(input => {
        const wrapper = document.createElement("div");
        wrapper.className = "password-control";
        input.before(wrapper);
        wrapper.append(input);
        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "password-toggle";
        toggle.textContent = "Show";
        toggle.setAttribute("aria-label", "Show " + input.id.replace(/^(login|signup)-/, "").replace(/-/g, " "));
        toggle.setAttribute("aria-controls", input.id);
        toggle.setAttribute("aria-pressed", "false");
        toggle.addEventListener("click", () => {
            const visible = input.type === "password";
            input.type = visible ? "text" : "password";
            toggle.textContent = visible ? "Hide" : "Show";
            toggle.setAttribute("aria-pressed", String(visible));
            toggle.setAttribute("aria-label", (visible ? "Hide " : "Show ") + input.id.replace(/^(login|signup)-/, "").replace(/-/g, " "));
        });
        wrapper.append(toggle);
    });
})();
