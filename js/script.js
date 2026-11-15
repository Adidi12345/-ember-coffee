$(document).ready(function () {
    "use strict";
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let toastTimer;

    function showToast(message) {
        clearTimeout(toastTimer);
        $("#toast-message")
            .stop(true, true)
            .text(message)
            .fadeIn(reducedMotion ? 0 : 180);
        toastTimer = setTimeout(function () {
            $("#toast-message").fadeOut(reducedMotion ? 0 : 350);
        }, 3200);
    }

    // Tasks 1–3: the original text stays separate from highlighted output.
    const items = $(".menu-item")
        .map(function () {
            return {
                element: this,
                title: $(this).find("h3").text().trim(),
                description: $(this).find("p").text().trim(),
                category: $(this).closest(".menu-group").data("category"),
                id: this.dataset.id,
                price: Number(this.dataset.price),
                cold: this.dataset.cold === "true",
                decaf: this.dataset.decaf === "true",
                plantMilk: this.dataset.plantMilk === "true",
                originalContainer: this.parentElement,
            };
        })
        .get();
    const search = $("#menu-search");
    const suggestions = $("#search-suggestions");
    let suggestionIndex = -1;

    function highlight(element, text, query) {
        element.empty();
        let offset = 0;
        let index = query ? text.toLowerCase().indexOf(query) : -1;
        while (index !== -1) {
            element.append(document.createTextNode(text.slice(offset, index)));
            $("<mark>")
                .text(text.slice(index, index + query.length))
                .appendTo(element);
            offset = index + query.length;
            index = text.toLowerCase().indexOf(query, offset);
        }
        element.append(document.createTextNode(text.slice(offset)));
    }

    function closeSuggestions() {
        suggestions.prop("hidden", true);
        search.attr("aria-expanded", "false").removeAttr("aria-activedescendant");
        suggestionIndex = -1;
    }

    function filterMenu(showSuggestions) {
        const query = (search.val() || "").trim().toLowerCase();
        const category = $("#menu-category").val();
        const sort = $("#menu-sort").val() || "default";
        const cold = $("#filter-cold").prop("checked") === true;
        const decaf = $("#filter-decaf").prop("checked") === true;
        const plant = $("#filter-plant").prop("checked") === true;
        window.EmberStore.write("search", { query: search.val() || "", category, sort, cold, decaf, plant });
        const matches = items.filter(function (item) {
            return (
                (category === "all" || category === item.category) &&
                (!cold || item.cold) && (!decaf || item.decaf) && (!plant || item.plantMilk) &&
                (item.title + " " + item.description).toLowerCase().includes(query)
            );
        });
        items.forEach(function (item) {
            item.element.hidden = !matches.includes(item);
            highlight($(item.element).find("h3"), item.title, query);
            highlight($(item.element).find("p"), item.description, query);
        });
        if (sort !== "default") {
            const sortedCards = document.getElementById("sorted-cards");
            const ordered = [...items].sort((a, b) => sort === "asc" ? a.price - b.price : b.price - a.price);
            ordered.forEach(item => sortedCards.append(item.element));
            $("#menu-catalog > .menu-category-section").not("#sorted-section").prop("hidden", true);
            $("#sorted-section").prop("hidden", matches.length === 0);
        } else {
            items.forEach(item => item.originalContainer.append(item.element));
            $("#sorted-section").prop("hidden", true);
            $("#menu-catalog > .menu-category-section").not("#sorted-section").each(function () {
                $(this).prop("hidden", !$(this).find(".menu-item").get().some(item => !item.hidden));
            });
        }
        $("#search-count").text(
            matches.length
                ? matches.length + " items found"
                : "No matches. Try another word or category.",
        );
        suggestions.empty();
        suggestionIndex = -1;
        search.removeAttr("aria-activedescendant");
        if (showSuggestions && query && matches.length) {
            matches.slice(0, 6).forEach(function (item, index) {
                $("<li>", { id: "suggestion-" + index, role: "option", "aria-selected": "false" })
                    .text(item.title)
                    .appendTo(suggestions);
            });
            suggestions.prop("hidden", false);
            search.attr("aria-expanded", "true");
        } else closeSuggestions();
    }
    if (search.length) {
        const savedSearch = window.EmberStore.read("search", {});
        if (savedSearch && typeof savedSearch.query === "string") search.val(savedSearch.query);
        if (savedSearch && ["all", "coffee", "other", "bakery"].includes(savedSearch.category)) $("#menu-category").val(savedSearch.category);
        if (savedSearch && ["default", "asc", "desc"].includes(savedSearch.sort)) $("#menu-sort").val(savedSearch.sort);
        if (savedSearch) {
            $("#filter-cold").prop("checked", savedSearch.cold === true);
            $("#filter-decaf").prop("checked", savedSearch.decaf === true);
            $("#filter-plant").prop("checked", savedSearch.plant === true);
        }
        const recommendedId = new URLSearchParams(location.search).get("drink");
        const recommended = items.find(item => item.id === recommendedId);
        if (recommended) {
            search.val("");
            $("#menu-category").val("all");
            $("#menu-sort").val("default");
            $("#filter-cold, #filter-decaf, #filter-plant").prop("checked", false);
        }
        $("#menu-sort, #filter-cold, #filter-decaf, #filter-plant").on("change", () => filterMenu(false));
        search.on("input focus", function () {
            filterMenu(true);
        });
        $("#menu-category").on("change", function () {
            filterMenu(false);
        });
        suggestions.on("click", "li", function () {
            search.val($(this).text());
            filterMenu(false);
            search.trigger("focus");
            closeSuggestions();
        });
        search.on("keydown", function (event) {
            const options = suggestions.children();
            if (event.key === "Escape") closeSuggestions();
            if (suggestions.prop("hidden")) return;
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault();
                const direction = event.key === "ArrowDown" ? 1 : -1;
                if (suggestionIndex === -1 && direction === -1) {
                    suggestionIndex = options.length - 1;
                } else {
                    suggestionIndex =
                        (suggestionIndex + direction + options.length) % options.length;
                }
                options
                    .attr("aria-selected", "false")
                    .eq(suggestionIndex)
                    .attr("aria-selected", "true");
                search.attr("aria-activedescendant", options.eq(suggestionIndex).attr("id"));
            }
            if (event.key === "Enter" && suggestionIndex >= 0) {
                event.preventDefault();
                options.eq(suggestionIndex).trigger("click");
            }
            if (event.key === "Tab") closeSuggestions();
        });
        $(document).on("click", function (event) {
            if (!$(event.target).closest(".search-wrap").length) closeSuggestions();
        });
        filterMenu(false);
        if (recommended) {
            recommended.element.classList.add("menu-spotlight");
            recommended.element.tabIndex = -1;
            const url = new URL(location.href);
            url.searchParams.delete("drink");
            history.replaceState(null, "", url.pathname + url.search + url.hash);
            const reveal = () => { recommended.element.scrollIntoView({ block: "center", behavior: "instant" }); recommended.element.focus({ preventScroll: true }); };
            if (document.readyState === "complete") setTimeout(reveal, 100);
            else window.addEventListener("load", () => setTimeout(reveal, 100), { once: true });
        }
    }

    // Tasks 4, 5, 9 share one throttled scroll handler.
    function loadImage(image) {
        const source = $(image).attr("data-src");
        if (!source) return;
        $(image).attr("src", source).removeAttr("data-src");
    }
    function updateViewport() {
        const top = $(window).scrollTop();
        const height = $(window).height();
        const distance = $(document).height() - height;
        const progress = distance > 0 ? Math.min(100, Math.max(0, (top / distance) * 100)) : 100;
        $(".scroll-progress")
            .attr("aria-valuenow", Math.round(progress))
            .find("span")
            .css("width", progress + "%");
        $(".lazy-image[data-src]").each(function () {
            if (!$(this).is(":visible")) return;
            const imageTop = $(this).offset().top;
            if (imageTop < top + height && imageTop + $(this).outerHeight() > top) loadImage(this);
        });
        $(".number-counter:not(.counted)").each(function () {
            const counter = $(this);
            if (counter.offset().top >= top + height) return;
            counter.addClass("counted");
            const target = Number(counter.attr("data-count"));
            $({ value: 0 }).animate(
                { value: target },
                {
                    duration: reducedMotion ? 0 : 1500,
                    step: function (value) {
                        counter.text(Math.floor(value));
                    },
                    complete: function () {
                        counter.text(target);
                    },
                },
            );
        });
    }
    let framePending = false;
    $(window).on("scroll resize load", function () {
        if (framePending) return;
        framePending = true;
        requestAnimationFrame(function () {
            updateViewport();
            framePending = false;
        });
    });
    const carousel = document.getElementById("ember-gallery-carousel");
    if (carousel) {
        carousel.addEventListener("slide.bs.carousel", function (event) {
            $(event.relatedTarget)
                .find("img[data-src]")
                .each(function () {
                    loadImage(this);
                });
        });
    }
    updateViewport();

    // Tasks 6–7: a short demo request, guarded against repeat submissions.
    $("#contact-form").on("ember:form-ready", function () {
        const form = $(this);
        if (form.attr("aria-busy") === "true") return;
        const button = $("#form-submit");
        const name = $("#name").val().trim();
        form.attr("aria-busy", "true");
        const controls = form.find("input, textarea, select, button");
        controls.prop("disabled", true);
        button
            .empty()
            .append($("<span>", { class: "submit-spinner", "aria-hidden": "true" }))
            .append(" Please wait…");
        $("#form-success").text("");
        setTimeout(function () {
            form.attr("aria-busy", "false");
            controls.prop("disabled", false);
            button.text("Send message");
            $("#form-success").text(
                "Thank you, " + name + ". Demo submission complete. No message was sent.",
            );
            showToast("Demo submission complete.");
        }, 1200);
    });

    // Task 8: only show success when the browser confirms the copy.
    $(".copy-button").on("click", async function () {
        const button = $(this);
        const target = document.getElementById(button.attr("data-copy-target"));
        const feedback = button.siblings(".copy-feedback");
        clearTimeout(button.data("feedbackTimer"));
        button.prop("disabled", true);
        button.find(".copy-icon").text("⧉");
        feedback.text("").removeClass("visible");
        try {
            await navigator.clipboard.writeText(target.textContent.trim());
            button.find(".copy-icon").text("✓");
            feedback.text("Copied to clipboard!").addClass("visible");
            showToast("Phone number copied.");
        } catch (error) {
            feedback
                .text("Copy unavailable. Select the number and copy it manually.")
                .addClass("visible");
        } finally {
            button.prop("disabled", false);
        }
        button.data(
            "feedbackTimer",
            setTimeout(function () {
                button.find(".copy-icon").text("⧉");
                feedback.text("").removeClass("visible");
            }, 3500),
        );
    });
});
