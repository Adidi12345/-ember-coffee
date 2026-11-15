(function () {
    "use strict";

    // Assignment 5: keyboard events and switch-based navigation.
    const links = Array.from(document.querySelectorAll(".nav-menu .nav-link"));
    links.forEach(function (link, index) {
        link.addEventListener("keydown", function (event) {
            let nextIndex;
            switch (event.key) {
                case "ArrowRight":
                case "ArrowDown":
                    nextIndex = (index + 1) % links.length;
                    break;
                case "ArrowLeft":
                case "ArrowUp":
                    nextIndex = (index - 1 + links.length) % links.length;
                    break;
                case "Home":
                    nextIndex = 0;
                    break;
                case "End":
                    nextIndex = links.length - 1;
                    break;
                default:
                    return;
            }
            event.preventDefault();
            links[nextIndex].focus();
        });
    });

    const readMore = document.getElementById("read-more");
    if (readMore) {
        const details = document.getElementById("coffee-details");
        readMore.addEventListener("click", function () {
            details.hidden = !details.hidden;
            readMore.setAttribute("aria-expanded", String(!details.hidden));
            readMore.textContent = details.hidden ? "Read more" : "Read less";
        });
    }

    // One audio element is reused so repeated clicks never overlap sounds.
    const rating = {
        value: 0,
        soundEnabled: false,
        audio: new Audio("audio/chime.wav"),
        setValue: function (value) {
            this.value = value;
            document.getElementById("rating-message").textContent =
                "Your personal rating for this visit is " + this.value + " out of 5.";
            for (let index = 0; index < stars.length; index += 1) {
                stars[index].classList.toggle("selected", index < this.value);
                stars[index].setAttribute("aria-pressed", String(index + 1 === this.value));
            }
            if (this.soundEnabled) {
                this.audio.pause();
                this.audio.currentTime = 0;
                this.audio.play().catch(function (error) {
                    // Restarting the same sound can cancel the previous play request.
                    if (error.name === "AbortError") return;
                    document.getElementById("rating-message").textContent +=
                        " Sound is unavailable.";
                });
            }
        },
    };
    const stars = Array.from(document.querySelectorAll(".rating-star"));
    stars.forEach(function (star) {
        star.addEventListener("click", function () {
            rating.setValue(Number(star.dataset.rating));
        });
    });
    const soundToggle = document.getElementById("sound-toggle");
    if (soundToggle) {
        soundToggle.addEventListener("click", function () {
            rating.soundEnabled = !rating.soundEnabled;
            soundToggle.setAttribute("aria-pressed", String(rating.soundEnabled));
            soundToggle.textContent = rating.soundEnabled ? "Sound on" : "Sound off";
            if (!rating.soundEnabled) rating.audio.pause();
        });
    }

    // Assignment 5 callback option: a multi-step form that preserves its inputs.
    const form = document.getElementById("contact-form");
    if (!form) return;
    const steps = [
        document.getElementById("contact-step-1"),
        document.getElementById("contact-step-2"),
    ];
    const next = document.getElementById("form-next");
    const back = document.getElementById("form-back");
    const submit = document.getElementById("form-submit");
    const status = document.getElementById("form-step-status");
    const error = document.getElementById("form-error");
    let currentStep = 0;
    const cupColor = document.getElementById("color");
    const cupPreview = document.getElementById("cup-preview");

    function updateCupPreview() {
        cupPreview.style.setProperty("--cup-color", cupColor.value);
        cupPreview.setAttribute("aria-label", "Cup preview in color " + cupColor.value);
        document.getElementById("cup-color-value").textContent = cupColor.value;
    }

    cupColor.addEventListener("input", updateCupPreview);
    cupColor.addEventListener("change", updateCupPreview);
    updateCupPreview();

    const contactRules = { name: "name", email: "email", phone: "phone", message: "message" };
    Object.keys(contactRules).forEach(function (id) {
        const input = document.getElementById(id);
        const message = document.createElement("span");
        message.className = "field-error";
        message.id = id + "-error";
        input.setAttribute("aria-describedby", message.id);
        input.closest(".form-row").append(message);
    });
    function validateStep(index) {
        let invalid = null;
        Object.entries(contactRules).forEach(function ([id, rule]) {
            const input = document.getElementById(id);
            if (!steps[index].contains(input)) return;
            const message = window.EmberValidation[rule](input);
            window.EmberValidation.show(input, message);
            if (message && !invalid) invalid = input;
        });
        error.textContent = invalid ? "Please check the highlighted fields." : "";
        if (invalid) invalid.focus();
        return !invalid;
    }

    function renderStep(index) {
        steps.forEach(function (step, stepIndex) {
            step.hidden = stepIndex !== index;
        });
        back.hidden = index === 0;
        next.hidden = index === 1;
        submit.hidden = index === 0;
        status.textContent =
            index === 0 ? "Step 1 of 2 · Your details" : "Step 2 of 2 · Your message";
        status.focus();
    }

    function changeStep(index, callback) {
        currentStep = index;
        error.textContent = "";
        callback(currentStep);
    }

    next.addEventListener("click", function () {
        if (validateStep(0)) changeStep(1, renderStep);
    });
    back.addEventListener("click", function () {
        changeStep(0, renderStep);
    });
    document.getElementById("form-reset").addEventListener("click", function () {
        if (form.getAttribute("aria-busy") === "true") return;
        form.reset();
        form.querySelectorAll(".field-error").forEach(node => { node.textContent = ""; });
        updateCupPreview();
        form.querySelectorAll("input, textarea").forEach(function (input) {
            input.setCustomValidity("");
            input.removeAttribute("aria-invalid");
        });
        document.getElementById("form-success").textContent = "";
        changeStep(0, renderStep);
    });
    form.addEventListener("input", function (event) {
        const rule = contactRules[event.target.id];
        if (rule) window.EmberValidation.show(event.target, window.EmberValidation[rule](event.target));
        error.textContent = "";
        document.getElementById("form-success").textContent = "";
    });
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        if (form.getAttribute("aria-busy") === "true") return;
        if (currentStep === 0) {
            if (validateStep(0)) changeStep(1, renderStep);
            return;
        }
        if (!validateStep(0)) {
            changeStep(0, renderStep);
            validateStep(0);
            return;
        }
        if (validateStep(1)) {
            // Assignment 6 listens for this event after successful validation.
            form.dispatchEvent(new CustomEvent("ember:form-ready"));
        }
    });
})();
