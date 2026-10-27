
async function fetchWeather(endpoint, city) {
  const route =
    endpoint === "weather" ? "/api/weather" : "/api/forecast";

  const url = new URL(route, window.location.origin);
  url.searchParams.set("city", city);

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Weather request failed. Please try again."
    );
  }

  return data;
}



const searchForm = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const searchButton = document.getElementById("search-button");
const statusMessage = document.getElementById("status-message");
const weatherContent = document.getElementById("weather-content");
const forecastGrid = document.getElementById("forecast-grid");

const weatherElements = {
  date: document.getElementById("current-date"),
  city: document.getElementById("city-name"),
  description: document.getElementById("weather-description"),
  icon: document.getElementById("weather-icon"),
  temperature: document.getElementById("temperature"),
  feelsLike: document.getElementById("feels-like"),
  humidity: document.getElementById("humidity"),
  wind: document.getElementById("wind-speed"),
  pressure: document.getElementById("pressure"),
  visibility: document.getElementById("visibility"),
};

function setStatus(message, type = "") {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`.trim();
}

function setLoading(isLoading) {
  searchButton.disabled = isLoading;
  cityInput.disabled = isLoading;
  searchButton.innerHTML = isLoading
    ? "Loading…"
    : 'Search <span>→</span>';
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatDay(date) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
  }).format(date);
}


function iconUrl(iconCode) {
  return `https://openweathermap.org/img/wn/${encodeURIComponent(iconCode)}@2x.png`;
}

function updateWeatherBackground(weather, iconCode) {
  const body = document.body;
  const condition = weather.toLowerCase();
  const isNight = iconCode.endsWith("n");

  body.classList.remove(
    "weather-clear",
    "weather-clouds",
    "weather-rain",
    "weather-thunderstorm",
    "weather-snow",
    "weather-mist",
    "weather-night"
  );

  if (isNight) {
    body.classList.add("weather-night");
    return;
  }

  if (condition.includes("thunderstorm")) {
    body.classList.add("weather-thunderstorm");
  } else if (condition.includes("rain") || condition.includes("drizzle")) {
    body.classList.add("weather-rain");
  } else if (condition.includes("snow")) {
    body.classList.add("weather-snow");
  } else if (
    condition.includes("mist") ||
    condition.includes("fog") ||
    condition.includes("haze") ||
    condition.includes("smoke")
  ) {
    body.classList.add("weather-mist");
  } else if (condition.includes("cloud")) {
    body.classList.add("weather-clouds");
  } else {
    body.classList.add("weather-clear");
  }
}


async function fetchWeather(endpoint, city) {
  const route =
    endpoint === "weather" ? "/api/weather" : "/api/forecast";

  const url = new URL(route, window.location.origin);
  url.searchParams.set("city", city);

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Weather request failed. Please try again."
    );
  }

  return data;
}


    


function renderCurrentWeather(data) {
  weatherElements.date.textContent = formatDate(new Date());
  weatherElements.city.textContent = `${data.name}, ${data.sys.country}`;
  weatherElements.description.textContent = data.weather[0].description;
  weatherElements.icon.src = iconUrl(data.weather[0].icon);
  updateWeatherBackground(
  data.weather[0].main,
  data.weather[0].icon
);
  weatherElements.icon.alt = data.weather[0].description;
  weatherElements.temperature.textContent = Math.round(data.main.temp);
  weatherElements.feelsLike.textContent =
    `Feels like ${Math.round(data.main.feels_like)}°C`;
  weatherElements.humidity.textContent = `${data.main.humidity}%`;
  weatherElements.wind.textContent = `${data.wind.speed} m/s`;
  weatherElements.pressure.textContent = `${data.main.pressure} hPa`;
  weatherElements.visibility.textContent =
    `${(data.visibility / 1000).toFixed(1)} km`;

  document.body.dataset.weather = data.weather[0].main.toLowerCase();
}

function renderForecast(data) {
  // OpenWeatherMap's free forecast API returns readings every three hours.
  // Select one reading around midday for each of the next five calendar days.
  const dailyForecasts = new Map();
  const today = new Date().toISOString().slice(0, 10);

  for (const item of data.list) {
    const date = item.dt_txt.slice(0, 10);

    if (date <= today) continue;

    const hour = Number(item.dt_txt.slice(11, 13));
    const existing = dailyForecasts.get(date);

    if (
      !existing ||
      Math.abs(hour - 12) < Math.abs(Number(existing.dt_txt.slice(11, 13)) - 12)
    ) {
      dailyForecasts.set(date, item);
    }
  }

  const days = [...dailyForecasts.entries()].slice(0, 5);

  if (days.length === 0) {
    forecastGrid.replaceChildren();
    setStatus(
      "Current weather loaded, but the forecast is not available yet.",
      "success"
    );
    return;
  }

  forecastGrid.replaceChildren();

  for (const [dateString, item] of days) {
    const card = document.createElement("article");
    card.className = "forecast-card";

    const day = document.createElement("p");
    day.className = "forecast-day";
    day.textContent = formatDay(new Date(`${dateString}T12:00:00`));

    const icon = document.createElement("img");
    icon.src = iconUrl(item.weather[0].icon);
    icon.alt = item.weather[0].description;
    icon.loading = "lazy";

    const description = document.createElement("p");
    description.className = "forecast-description";
    description.textContent = item.weather[0].description;

    const temperatures = document.createElement("div");
    temperatures.className = "forecast-temperatures";

    const high = document.createElement("span");
    high.textContent = `${Math.round(item.main.temp_max)}°`;

    const low = document.createElement("span");
    low.className = "forecast-low";
    low.textContent = `${Math.round(item.main.temp_min)}°`;

    temperatures.append(high, low);
    card.append(day, icon, description, temperatures);
    forecastGrid.append(card);
  }
}

async function searchWeather(city) {
  const cleanCity = city.trim();

  if (!cleanCity) {
    setStatus("Please enter a city name.", "error");
    cityInput.focus();
    return;
  }

  

  setLoading(true);
  setStatus(`Looking up weather for ${cleanCity}…`);
  weatherContent.hidden = true;

  try {
    const currentWeather = await fetchWeather("weather", cleanCity);
    const forecast = await fetchWeather("forecast", cleanCity);

    renderCurrentWeather(currentWeather);
    renderForecast(forecast);

    weatherContent.hidden = false;
    setStatus(
      `Weather updated for ${currentWeather.name}.`,
      "success"
    );
  } catch (error) {
    setStatus(
      error instanceof TypeError
        ? "Network error. Check your internet connection and try again."
        : error.message,
      "error"
    );
  } finally {
    setLoading(false);
  }
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  searchWeather(cityInput.value);
});

weatherElements.date.textContent = formatDate(new Date());
