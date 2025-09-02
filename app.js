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
