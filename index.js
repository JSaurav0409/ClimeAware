const apiKey = "762e0d66e1d2164dc962b6c905eb6abc";  // Use your own generated apikey using openweather api
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";

const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const weatherIcon = document.querySelector(".weather-icon");
const unitToggle = document.querySelector(".unit-toggle");
let isCelsius = true;

async function checkWeather(city) {
    document.querySelector(".loading").style.display = "block";
    
    const response = await fetch(apiUrl + city + `&appid=${apiKey}`);
    
    document.querySelector(".loading").style.display = "none"; // Hide when data is fetched
    
    if (response.status == 404) {
        document.querySelector(".error").innerHTML = "City not found. Please enter a valid city name.";
        document.querySelector(".error").style.display = "block";
        document.querySelector(".weather").style.display = "none";
    } else if (response.status == 429) {
        document.querySelector(".error").innerHTML = "API limit exceeded. Please try again later.";
        document.querySelector(".error").style.display = "block";
        document.querySelector(".weather").style.display = "none";
    } else {
        let data = await response.json();

        document.querySelector(".city").innerHTML = data.name;
        document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°C";
        document.querySelector(".humidity").innerHTML = data.main.humidity + " %";
        document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";

        // Weather condition icons
        if (data.weather[0].main == "Clouds") {
            weatherIcon.src = "images/clouds.png";
        } else if (data.weather[0].main == "Clear") {
            weatherIcon.src = "images/clear.png";
        } else if (data.weather[0].main == "Rain") {
            weatherIcon.src = "images/rain.png";
        } else if (data.weather[0].main == "Drizzle") {
            weatherIcon.src = "images/drizzle.png";
        } else if (data.weather[0].main == "Mist") {
            weatherIcon.src = "images/mist.png";
        }

        document.querySelector(".weather").style.display = "block";
        document.querySelector(".error").style.display = "none";
    }
}

searchBtn.addEventListener("click", () => {
    checkWeather(searchBox.value);
});

searchBox.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
        checkWeather(searchBox.value);
    }
});

// Geolocation
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
        
        let data = await response.json();
        document.querySelector(".city").innerHTML = data.name;
        document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°C";
        document.querySelector(".humidity").innerHTML = data.main.humidity + " %";
        document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";
    });
}

// Unit conversion
unitToggle.addEventListener("click", () => {
    if (isCelsius) {
        const tempC = parseFloat(document.querySelector(".temp").innerHTML);
        const tempF = Math.round((tempC * 9 / 5) + 32);
        document.querySelector(".temp").innerHTML = tempF + "°F";
        unitToggle.innerHTML = "°C";
    } else {
        const tempF = parseFloat(document.querySelector(".temp").innerHTML);
        const tempC = Math.round((tempF - 32) * 5 / 9);
        document.querySelector(".temp").innerHTML = tempC + "°C";
        unitToggle.innerHTML = "°F";
    }
    isCelsius = !isCelsius;
});
