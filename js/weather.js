(function () {
    "use strict";
    const card = document.getElementById("weather-card");
    if (!card) return;
    const status = document.getElementById("weather-status");
    const result = document.getElementById("weather-result");
    const refresh = document.getElementById("weather-refresh");
    const endpoint = "https://api.open-meteo.com/v1/forecast?latitude=51.1694&longitude=71.4491&current=temperature_2m,weather_code&timezone=Asia%2FAlmaty";
    function description(code) {
        if (code === 0) return "Clear skies";
        if ([1, 2, 3].includes(code)) return "Cloudy skies";
        if ([45, 48].includes(code)) return "Foggy";
        if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
        if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Rain";
        if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow";
        if ([95, 96, 99].includes(code)) return "Thunderstorms";
        return "Current conditions";
    }
    async function loadWeather() {
        if (refresh.disabled) return;
        refresh.disabled = true;
        card.setAttribute("aria-busy", "true");
        result.hidden = true;
        status.textContent = "Loading current weather…";
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        try {
            const response = await fetch(endpoint, { signal: controller.signal });
            if (!response.ok) throw new Error("Weather request failed");
            const data = await response.json();
            const current = data.current;
            if (!current || !Number.isFinite(current.temperature_2m) || !Number.isFinite(current.weather_code) || typeof current.time !== "string") throw new Error("Invalid weather data");
            const temperature = current.temperature_2m;
            document.getElementById("weather-temperature").textContent = Math.round(temperature) + "°C";
            document.getElementById("weather-description").textContent = description(current.weather_code) + " · Astana";
            const choice = temperature >= 22
                ? { id: "cold-brew", text: "A warm day calls for a slow sip of cold brew." }
                : temperature < 5 ? { id: "velvet-latte", text: "Cold outside. Find a little warmth in a hot latte." }
                : { id: "cappuccino", text: "A good day for a cappuccino and an unhurried break." };
            document.getElementById("weather-recommendation").textContent = choice.text;
            document.getElementById("weather-drink-link").href = "menu.html?drink=" + encodeURIComponent(choice.id);
            status.textContent = "Updated " + current.time.replace("T", " · ") + " (Astana time)";
            result.hidden = false;
            refresh.textContent = "Refresh";
        } catch (error) {
            status.textContent = "Weather is unavailable right now. Check your connection and try again.";
            refresh.textContent = "Try again";
        } finally {
            clearTimeout(timeout);
            refresh.disabled = false;
            card.setAttribute("aria-busy", "false");
        }
    }
    refresh.addEventListener("click", loadWeather);
    loadWeather();
})();
