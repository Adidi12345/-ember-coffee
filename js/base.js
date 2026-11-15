(function () {
    "use strict";

    const clock = document.getElementById("current-date-time");
    if (clock) {
        const updateClock = function () {
            clock.textContent = new Intl.DateTimeFormat("en-GB", {
                dateStyle: "full",
                timeStyle: "medium",
            }).format(new Date());
        };

        updateClock();
        window.setInterval(updateClock, 1000);
    }

    const popup = document.getElementById("subscription-popup");
    const openButton = document.getElementById("open-subscription");
    const closeButton = document.getElementById("close-subscription");

    if (popup && openButton && closeButton) {
        const dialog = popup.querySelector(".subscription-dialog");
        let previousFocus = null;

        const closePopup = function () {
            if (popup.hidden) {
                return;
            }
            popup.hidden = true;
            document.body.classList.remove("subscription-open");
            if (previousFocus && previousFocus.isConnected) {
                previousFocus.focus();
            }
        };

        openButton.addEventListener("click", function () {
            previousFocus = document.activeElement;
            popup.hidden = false;
            document.body.classList.add("subscription-open");
            const firstField = popup.querySelector("input");
            if (firstField) {
                firstField.focus();
            } else if (dialog) {
                dialog.focus();
            }
        });

        closeButton.addEventListener("click", closePopup);

        popup.addEventListener("click", function (event) {
            if (event.target === popup) {
                closePopup();
            }
        });

        document.addEventListener("keydown", function (event) {
            if (popup.hidden) {
                return;
            }
            if (event.key === "Escape") {
                closePopup();
                return;
            }
            if (event.key !== "Tab" || !dialog) {
                return;
            }

            const focusable = dialog.querySelectorAll(
                'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
            );
            if (focusable.length === 0) {
                event.preventDefault();
                dialog.focus();
                return;
            }

            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        });
    }

    const subscriptionForm = document.getElementById("subscription-form");
    if (subscriptionForm) {
        const fields = [
            {
                input: document.getElementById("subscription-name"),
                error: document.getElementById("subscription-name-error"),
                message: window.EmberValidation.name,
            },
            {
                input: document.getElementById("subscription-email"),
                error: document.getElementById("subscription-email-error"),
                message: window.EmberValidation.email,
            },
        ].filter(function (field) {
            return field.input && field.error;
        });
        const successMessage = document.getElementById("subscription-success");

        const validateField = function (field) {
            const message = field.message(field.input);
            field.error.textContent = message;
            field.input.setAttribute("aria-invalid", message ? "true" : "false");
            return !message;
        };

        subscriptionForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const isValid = fields.map(validateField).every(Boolean);
            if (!isValid) {
                const firstInvalid = fields.find(function (field) {
                    return field.input.getAttribute("aria-invalid") === "true";
                });
                if (firstInvalid) {
                    firstInvalid.input.focus();
                }
                if (successMessage) {
                    successMessage.hidden = true;
                }
                return;
            }

            subscriptionForm.reset();
            fields.forEach(function (field) {
                field.error.textContent = "";
                field.input.removeAttribute("aria-invalid");
            });
            if (successMessage) {
                successMessage.hidden = false;
            }
        });

        fields.forEach(function (field) {
            field.input.addEventListener("input", function () {
                validateField(field);
                if (successMessage) {
                    successMessage.hidden = true;
                }
            });
        });
    }

    const faqButtons = document.querySelectorAll(".faq-question[aria-controls]");
    const closeTimers = new WeakMap();

    faqButtons.forEach(function (button) {
        const panel = document.getElementById(button.getAttribute("aria-controls"));
        if (!panel) {
            return;
        }

        button.addEventListener("click", function () {
            const willOpen = button.getAttribute("aria-expanded") !== "true";
            const timer = closeTimers.get(panel);
            if (timer) {
                window.clearTimeout(timer);
            }

            button.setAttribute("aria-expanded", String(willOpen));
            if (willOpen) {
                panel.hidden = false;
                panel.style.maxHeight = "0px";
                panel.offsetHeight;
                panel.classList.add("is-open");
                panel.style.maxHeight = panel.scrollHeight + "px";
                return;
            }

            panel.classList.remove("is-open");
            panel.style.maxHeight = "0px";
            closeTimers.set(
                panel,
                window.setTimeout(function () {
                    if (button.getAttribute("aria-expanded") === "false") {
                        panel.hidden = true;
                    }
                }, 350),
            );
        });
    });
    window.addEventListener("resize", function () {
        faqButtons.forEach(function (button) {
            if (button.getAttribute("aria-expanded") !== "true") return;
            const panel = document.getElementById(button.getAttribute("aria-controls"));
            if (panel) panel.style.maxHeight = panel.scrollHeight + "px";
        });
    });
})();
