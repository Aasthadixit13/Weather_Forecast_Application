const apiKey = '9bc1aad54389d8e686b900b61a901d1e';
const weatherInfo = document.getElementById('weatherInfo');
const errorInfo = document.getElementById('error');
const getWeatherBtn = document.getElementById('getWeatherBtn');
const cityInput = document.getElementById('cityInput');
const unitToggleBtn = document.getElementById('unitToggleBtn');
const getLocationWeatherBtn = document.getElementById('getLocationWeatherBtn');
const cityDropdown = document.getElementById('cityDropdown');
const extremeAlert = document.getElementById('extremeAlert');
const forecastTitle = document.getElementById('forecastTitle');
const forecastContainer = document.getElementById('forecastContainer');
let isCelsius = true;

// Fetch weather data based on city name
async function fetchWeather(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${isCelsius ? 'metric' : 'imperial'}`);
        const data = await response.json();

        if (data.cod === '404') {
            throw new Error('City not found');
        }

        displayWeather(data);
        addCityToDropdown(city);
        await fetchForecast(city);
    } catch (error) {
        displayError(error.message);
    }
}

// Fetch weather data based on current location
async function getCurrentLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            try {
                const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${isCelsius ? 'metric' : 'imperial'}`);
                const data = await response.json();
                displayWeather(data);
                await fetchForecast(data.name);
            } catch (error) {
                displayError('Unable to fetch weather data for your location.');
            }
        });
    } else {
        displayError('Geolocation is not supported by this browser.');
    }
}


// Display weather data
function displayWeather(data) {
    const { name, main, weather, wind } = data;

    // Display weather info
    document.getElementById('cityName').textContent = name;
    document.getElementById('description').textContent = weather[0].description;
    document.getElementById('temperature').textContent = `${main.temp}°${isCelsius ? 'C' : 'F'}`;
    document.getElementById('humidity').textContent = `Humidity: ${main.humidity}%`;
    document.getElementById('windSpeed').textContent = `Wind: ${wind.speed} m/s`;

    // Dynamic background for rainy conditions
    document.body.classList.remove('rainy-bg');
    document.body.classList.add('default-bg');
    if (weather[0].main.toLowerCase().includes('rain')) {
        document.body.classList.remove('default-bg');
        document.body.classList.add('rainy-bg');
    }

    // Check for extreme temperature and show UI alert
    if ((isCelsius && main.temp > 40) || (!isCelsius && main.temp > 104)) {
        extremeAlert.textContent = 'Extreme temperature! Be cautious!';
        extremeAlert.classList.remove('hidden');
    } else {
        extremeAlert.classList.add('hidden');
    }

    weatherInfo.classList.remove('hidden');
    errorInfo.classList.add('hidden');
}
