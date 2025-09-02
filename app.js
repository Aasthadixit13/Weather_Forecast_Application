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

// Fetch 5-day forecast data
async function fetchForecast(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${isCelsius ? 'metric' : 'imperial'}`);
        const data = await response.json();
        displayForecast(data, city);
    } catch (error) {
        console.error('Error fetching forecast:', error);
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
// Display 5-day forecast
function displayForecast(data, city) {
    forecastTitle.textContent = `5-Day Forecast for ${city}`;
    forecastContainer.innerHTML = '';

    const forecasts = [];
    for (let i = 0; i < data.list.length; i += 8) {
        forecasts.push(data.list[i]);
    }

    forecasts.forEach(item => {
        if (item) {  // Ensure item exists
            const date = new Date(item.dt * 1000).toLocaleDateString();
            const desc = item.weather[0].description;
            const temp = item.main.temp;
            const humidity = item.main.humidity;
            const wind = item.wind.speed;
            const icon = getWeatherIcon(item.weather[0].main);

            const article = document.createElement('article');
article.classList.add('city-card', 'glass-card', 'bg-white/70', 'backdrop-blur-md', 'rounded-lg', 'p-2', 'sm:p-3', 'shadow-inner');
article.innerHTML = `
    <h3 class="text-sm sm:text-base md:text-base lg:text-lg font-bold"><i class="${icon} mr-2"></i>${date}</h3>
    <p class="text-xs sm:text-sm md:text-sm lg:text-base">${desc}</p>
    <p class="text-xs sm:text-sm md:text-sm lg:text-base"><i class="fas fa-thermometer-half mr-1"></i>Temp: ${temp}°${isCelsius ? 'C' : 'F'}</p>
    <p class="text-xs sm:text-sm md:text-sm lg:text-base"><i class="fas fa-tint mr-1"></i>Humidity: ${humidity}%</p>
    <p class="text-xs sm:text-sm md:text-sm lg:text-base"><i class="fas fa-wind mr-1"></i>Wind: ${wind} m/s</p>
`;
forecastContainer.appendChild(article);
        }
    });
}
// Get weather icon based on condition
function getWeatherIcon(main) {
    switch (main) {
        case 'Clear': return 'fas fa-sun text-yellow-500';
        case 'Clouds': return 'fas fa-cloud text-gray-500';
        case 'Rain': return 'fas fa-cloud-rain text-blue-500';
        default: return 'fas fa-cloud-sun text-yellow-600';
    }
}
// Handle error message
function displayError(message) {
    errorInfo.textContent = message;
    errorInfo.classList.remove('hidden');
    weatherInfo.classList.add('hidden');
}
// Handle button click to fetch weather for a city
getWeatherBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        fetchWeather(city);
    } else {
        displayError('Please enter a valid city name.');
    }
});

// Toggle temperature unit between Celsius and Fahrenheit
unitToggleBtn.addEventListener('click', () => {
    isCelsius = !isCelsius;
    const city = cityInput.value.trim() || cityDropdown.value;
    if (city) {
        fetchWeather(city);
    }
    unitToggleBtn.textContent = `Switch to ${isCelsius ? '°F' : '°C'}`;
});

// Store city in localStorage and add it to the dropdown
function addCityToDropdown(cityName) {
    let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
    if (!recentCities.includes(cityName)) {
        recentCities.push(cityName);
        localStorage.setItem('recentCities', JSON.stringify(recentCities));
    }
    updateCityDropdown();
}

// Update the city dropdown with recently searched cities
function updateCityDropdown() {
    const recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
    cityDropdown.innerHTML = '<option value="" disabled selected>Select Recently Searched City</option>';

    recentCities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        cityDropdown.appendChild(option);
    });

    if (recentCities.length === 0) {
        cityDropdown.classList.add('hidden');
    } else {
        cityDropdown.classList.remove('hidden');
    }

    cityDropdown.removeEventListener('change', handleDropdownChange);
    cityDropdown.addEventListener('change', handleDropdownChange);
}
// Handle city selection from dropdown
function handleDropdownChange() {
    const selectedCity = cityDropdown.value;
    if (selectedCity) {
        fetchWeather(selectedCity);
    }
}