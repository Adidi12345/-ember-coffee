window.EmberValidation = {
    name(input) {
        const value = input.value.trim();
        if (!value) return "Please enter your name.";
        if (value.length > 100) return "Please use no more than 100 characters.";
        return /^\p{L}[\p{L}\p{M}]*(?: +\p{L}[\p{L}\p{M}]*)*$/u.test(value)
            ? "" : "Use letters and spaces only. Numbers and symbols are not allowed.";
    },
    email(input) {
        const value = input.value.trim();
        if (!value) return "Please enter your email address.";
        return value.length <= 254 && /^[a-z0-9.!#$%&'*+\/=?^_`{|}~-]+@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i.test(value)
            ? "" : "Please enter a valid email address, such as name@example.com.";
    },
    password(input) {
        const value = input.value;
        return value.length >= 8 && value.length <= 64 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value) && /[^A-Za-z0-9\s]/.test(value) && !/\s/.test(value)
            ? "" : "Use 8–64 characters with uppercase, lowercase, a number and a symbol; no spaces.";
    },
    phone(input) {
        const value = input.value.trim();
        if (!value) return "Please enter your phone number.";
        const compact = value.replace(/[ ()-]/g, "");
        return /^\+?[1-9]\d{9,14}$/.test(compact) ? "" : "Use a valid phone number, for example +7 700 123 45 67.";
    },
    message(input) {
        const value = input.value.trim();
        return value.length >= 5 && value.length <= 2000 ? "" : "Please write a message of 5–2,000 characters.";
    },
    show(input, message) {
        input.setAttribute("aria-invalid", String(Boolean(message)));
        const error = document.getElementById(input.id + "-error");
        if (error) error.textContent = message;
        return !message;
    },
    form(form, rules) {
        let firstInvalid = null;
        Object.entries(rules).forEach(([id, rule]) => {
            const input = form.querySelector("#" + id);
            if (!this.show(input, rule(input)) && !firstInvalid) firstInvalid = input;
        });
        if (firstInvalid) firstInvalid.focus();
        return !firstInvalid;
    }
};
