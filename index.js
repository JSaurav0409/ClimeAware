const apiKey = "762e0d66e1d2164dc962b6c905eb6abc";  // Use your own generated apikey using openweather api
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";

const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const weatherIcon = document.querySelector(".weather-icon");
const unitToggle = document.querySelector(".unit-toggle");
let isCelsius = true;
let forecastData = []; // Global variable to store forecast data
const forecastLimit = 6; // Number of forecast days to show

async function checkWeather(city) {
    document.querySelector(".loading").style.display = "block";
    
    const response = await fetch(apiUrl + city + `&appid=${apiKey}`);
    
    document.querySelector(".loading").style.display = "none"; // Hide loading

    if (response.ok) {
        const data = await response.json();
        displayWeather(data);
        await fetchForecast(data.coord.lat, data.coord.lon); // Fetch forecast using latitude and longitude
    } else {
        document.querySelector(".error").style.display = "block";
        document.querySelector(".weather").style.display = "none";
        document.querySelector(".forecast-container").style.display = "none"; // Hide forecast
    }
}

function displayWeather(data) {
    const tempCelsius = Math.round(data.main.temp);
    const tempFahrenheit = Math.round((tempCelsius * 9 / 5) + 32);

    document.querySelector(".temp").textContent = `${isCelsius ? tempCelsius : tempFahrenheit}°${isCelsius ? 'C' : 'F'}`;
    document.querySelector(".city").textContent = data.name;
    document.querySelector(".humidity").textContent = `${data.main.humidity}%`;
    document.querySelector(".wind").textContent = `${data.wind.speed} km/h`;
    weatherIcon.src = getWeatherIcon(data.weather[0].main);
    document.querySelector(".weather").style.display = "block";
    document.querySelector(".error").style.display = "none";
}
// Assuming other parts of your code remain unchanged

async function fetchForecast(lat, lon) {
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?units=metric&lat=${lat}&lon=${lon}&appid=${apiKey}`;
    
    const response = await fetch(forecastUrl);
    const data = await response.json();
    forecastData = data.list; // Store the forecast data globally
    createForecastCards(forecastData); // Pass forecast data to create cards
    document.querySelector(".forecast-container").style.display = "block"; // Show forecast container
}

function createForecastCards(forecast) {
    const forecastContainer = document.querySelector(".forecast");
    forecastContainer.innerHTML = ""; // Clear previous cards

    const uniqueDays = {}; // Store unique days to ensure we get one entry per day

    forecast.forEach(item => {
        const date = new Date(item.dt * 1000); // Convert to a Date object
        const dateString = date.toLocaleDateString(); // Get the date in a readable format
        const dayOfWeek = date.toLocaleDateString(undefined, { weekday: 'long' }); // Get the full day name

        // Check if the date is already processed
        if (!uniqueDays[dateString] && Object.keys(uniqueDays).length < forecastLimit) {
            uniqueDays[dateString] = true; // Mark this date as processed

            const tempCelsius = Math.round(item.main.temp);
            const tempFahrenheit = Math.round((tempCelsius * 9 / 5) + 32);
            const humidity = item.main.humidity; // Humidity
            const windSpeed = item.wind.speed; // Wind speed
            const weatherDescription = item.weather[0].description; // Weather description

            const forecastCard = document.createElement("div");
            forecastCard.classList.add("forecast-card");
            forecastCard.innerHTML = `
                <h3>${dayOfWeek}, ${dateString}</h3> <!-- Display day and date -->
                <img src="${getWeatherIcon(item.weather[0].main)}" alt="forecast-icon">
                <p>${isCelsius ? tempCelsius : tempFahrenheit}°${isCelsius ? 'C' : 'F'}</p>
                <p>Humidity: ${humidity}%</p>
                <p>Wind Speed: ${windSpeed} km/h</p>
                <p>${weatherDescription.charAt(0).toUpperCase() + weatherDescription.slice(1)}</p>
            `;
            forecastContainer.appendChild(forecastCard);
        }
    });
}



function getWeatherIcon(condition) {
    // Map weather conditions to icon paths
    const icons = {
        Clear: 'images/clear.png',
        Clouds: 'images/clouds.png',
        Rain: 'images/rain.png',
        Drizzle: 'images/drizzle.png',
        Mist: 'images/mist.png',
        // Add more conditions as needed
    };

    return icons[condition] || 'images/clouds.png'; // Return a default icon if no match is found
}


// Function to handle the search functionality
function handleSearch() {
    const city = searchBox.value;
    if (city) {
        checkWeather(city);
        searchBox.value = ""; // Clear the input after search
    }
}

// Event listener for the search button
searchBtn.addEventListener("click", handleSearch);

// Event listener for the Enter key press in the search input
searchBox.addEventListener("keydown", (event) => {
    if (event.key === "Enter") { // Check if Enter key is pressed
        handleSearch(); // Call the handleSearch function
    }
});


unitToggle.addEventListener("click", () => {
    isCelsius = !isCelsius; // Toggle the unit
    unitToggle.textContent = isCelsius ? '°F' : '°C'; // Change button text

    // Update the current temperature
    const tempElement = document.querySelector(".temp");
    const currentTemp = parseInt(tempElement.textContent);
    
    // Update temperature based on current unit
    const newTemp = isCelsius ? Math.round((currentTemp - 32) * 5/9) : Math.round((currentTemp * 9/5) + 32);
    tempElement.textContent = `${newTemp}°${isCelsius ? 'C' : 'F'}`;

    // Update forecast cards using the stored forecastData
    createForecastCards(forecastData);
});
