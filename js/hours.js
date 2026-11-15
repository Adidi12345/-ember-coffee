(function () {
    "use strict";
    const schedule = {
        Mon: ["08:00", "22:00"], Tue: ["08:00", "22:00"],
        Wed: ["08:00", "22:00"], Thu: ["08:00", "22:00"],
        Fri: ["08:00", "22:00"], Sat: ["09:00", "23:00"],
        Sun: ["09:00", "21:00"]
    };
    const timeZone = "Asia/Almaty"; // Astana uses UTC+5, independent of visitor location.
    function astanaNow(date = new Date()) {
        const parts = new Intl.DateTimeFormat("en-US", {
            timeZone, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
        }).formatToParts(date);
        return Object.fromEntries(parts.map(part => [part.type, part.value]));
    }
    function status(date = new Date()) {
        const now = astanaNow(date);
        const [opening, closing] = schedule[now.weekday];
        const minutes = Number(now.hour) * 60 + Number(now.minute);
        const toMinutes = value => Number(value.slice(0, 2)) * 60 + Number(value.slice(3));
        return {
            open: minutes >= toMinutes(opening) && minutes < toMinutes(closing),
            weekday: now.weekday, opening, closing
        };
    }
    window.EmberHours = { schedule, status, astanaNow };
    const label = document.getElementById("open-status");
    const hours = document.getElementById("today-hours");
    function update() {
        if (!label || !hours) return;
        const today = status();
        label.textContent = today.open ? "Open now" : "Closed";
        label.dataset.open = String(today.open);
        hours.textContent = "Today (" + today.weekday + "): " + today.opening + "–" + today.closing + " · Astana time";
    }
    update();
    if (label) setInterval(update, 60000);
    const table = document.getElementById("opening-hours-body");
    if (table) {
        const rows = [["Monday - Friday", schedule.Mon], ["Saturday", schedule.Sat], ["Sunday", schedule.Sun]];
        table.replaceChildren();
        rows.forEach(([day, pair]) => {
            const row = document.createElement("tr");
            [day, ...pair].forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.append(cell);
            });
            table.append(row);
        });
    }
})();
