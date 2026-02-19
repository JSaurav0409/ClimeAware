const apiKey = "762e0d66e1d2164dc962b6c905eb6abc";
const apiUrl =
  "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";

const searchInput = document.querySelector(".search-input");
const searchBtn = document.querySelector(".search-btn");
const unitBtn = document.getElementById("unit-btn");

let isCelsius = true;
let lastFetchedCity = "New Delhi";

// --- Core Logic ---

async function checkWeather(city) {
  toggleStatus("loading", true);
  toggleStatus("error", false);

  try {
    const response = await fetch(apiUrl + city + `&appid=${apiKey}`);
    if (!response.ok) throw new Error("City not found");

    const data = await response.json();
    lastFetchedCity = city;
    displayWeather(data);
    await fetchForecast(data.coord.lat, data.coord.lon);
  } catch (err) {
    toggleStatus("error", true);
  } finally {
    toggleStatus("loading", false);
  }
}

async function fetchForecast(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?units=metric&lat=${lat}&lon=${lon}&appid=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();

  // Filter to get roughly one reading per day (e.g., mid-day)
  const dailyData = data.list.filter((item) =>
    item.dt_txt.includes("12:00:00"),
  );
  renderForecast(dailyData);
}

// --- UI Helpers ---

function displayWeather(data) {
  const tempC = Math.round(data.main.temp);
  const tempF = Math.round((tempC * 9) / 5 + 32);

  document.querySelector(".temp").textContent = isCelsius ? tempC : tempF;
  document.querySelector(".city").textContent = data.name;
  document.querySelector(".humidity").textContent = `${data.main.humidity}%`;
  document.querySelector(".wind").textContent = `${data.wind.speed} km/h`;
  document.querySelector(".main-icon").src = getWeatherIcon(
    data.weather[0].main,
  );
}

function renderForecast(days) {
  const container = document.getElementById("forecast");
  container.innerHTML = "";

  days.forEach((day) => {
    const date = new Date(day.dt * 1000);
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
    const tempC = Math.round(day.main.temp);
    const tempF = Math.round((tempC * 9) / 5 + 32);

    const card = document.createElement("div");
    card.className = "forecast-card";
    card.innerHTML = `
            <p class="forecast-day">${dayName}</p>
            <img src="${getWeatherIcon(day.weather[0].main)}" alt="icon">
            <p>${isCelsius ? tempC : tempF}°</p>
        `;
    container.appendChild(card);
  });
}

function getWeatherIcon(condition) {
  const icons = {
    Clear: "images/clear.png",
    Clouds: "images/clouds.png",
    Rain: "images/rain.png",
    Drizzle: "images/drizzle.png",
    Mist: "images/mist.png",
    Snow: "images/snow.png",
  };
  return icons[condition] || "images/clouds.png";
}

function toggleStatus(type, show) {
  document.querySelector(`.${type}`).style.display = show ? "block" : "none";
}

// --- Listeners ---

searchBtn.addEventListener("click", () => checkWeather(searchInput.value));

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") checkWeather(searchInput.value);
});

unitBtn.addEventListener("click", () => {
  isCelsius = !isCelsius;
  unitBtn.textContent = isCelsius ? "°C" : "°F";
  // Refresh UI with new units
  if (lastFetchedCity) checkWeather(lastFetchedCity);
});

// Start with a default
checkWeather("New Delhi");
