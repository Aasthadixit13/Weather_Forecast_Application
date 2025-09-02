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
    // UPDATE: Added regex validation to ensure city name contains only letters, spaces, and commas
    if (!/^[a-zA-Z\s,]+$/.test(city)) {
        displayError('Invalid city name. Use letters and spaces only.');
        return;
    }
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${isCelsius ? 'metric' : 'imperial'}`);
        const data = await response.json();
        // UPDATE: Added specific error handling for 401 (invalid API key) and 429 (rate limit) status codes
        if (data.cod !== 200) {
            if (data.cod === '401') throw new Error('Invalid API key. Please try again later.');
            if (data.cod === '429') throw new Error('Too many requests. Please try again later.');
            throw new Error(data.message || 'City not found');
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
    if (!navigator.geolocation) {
        displayError('Geolocation is not supported by this browser.');
        return;
    }
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            try {
                const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${isCelsius ? 'metric' : 'imperial'}`);
                const data = await response.json();
                // UPDATE: Added error handling for non-200 API responses
                if (data.cod !== 200) throw new Error(data.message || 'Unable to fetch weather data.');
                displayWeather(data);
                await fetchForecast(data.name);
            } catch (error) {
                displayError(error.message);
            }
        },
        (error) => {
            // UPDATE: Added specific handling for geolocation permission denial
            if (error.code === error.PERMISSION_DENIED) {
                displayError('Location access denied. Please enter a city name.');
            } else {
                displayError('Unable to access location.');
            }
        }
    );
}

// Fetch 5-day forecast data
async function fetchForecast(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${isCelsius ? 'metric' : 'imperial'}`);
        const data = await response.json();
        // UPDATE: Added error handling for non-200 API responses
        if (data.cod !== '200') throw new Error(data.message || 'Unable to fetch forecast.');
        displayForecast(data, city);
    } catch (error) {
        console.error('Error fetching forecast:', error);
    }
}

// Display weather data
function displayWeather(data) {
    const { name, main, weather, wind } = data;
    document.getElementById('cityName').textContent = name;
    document.getElementById('description').textContent = weather[0].description;
    document.getElementById('temperature').textContent = `${main.temp}°${isCelsius ? 'C' : 'F'}`;
    document.getElementById('humidity').textContent = `Humidity: ${main.humidity}%`;
    document.getElementById('windSpeed').textContent = `Wind: ${wind.speed} m/s`;

    document.body.classList.remove('rainy-bg', 'default-bg');
    document.body.classList.add(weather[0].main.toLowerCase().includes('rain') ? 'rainy-bg' : 'default-bg');

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
    // UPDATE: Filter forecast for 12:00 daily to ensure consistent time selection
    const forecasts = data.list.filter(item => item.dt_txt.includes('12:00:00')).slice(0, 5);
    
    forecasts.forEach(item => {
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
    });
}

// Get weather icon based on condition
function getWeatherIcon(main) {
    // UPDATE: Expanded icon mappings to include Snow, Thunderstorm, and Fog/Mist
    switch (main) {
        case 'Clear': return 'fas fa-sun text-yellow-500';
        case 'Clouds': return 'fas fa-cloud text-gray-500';
        case 'Rain': return 'fas fa-cloud-rain text-blue-500';
        case 'Snow': return 'fas fa-snowflake text-blue-300';
        case 'Thunderstorm': return 'fas fa-bolt text-yellow-600';
        case 'Fog': case 'Mist': return 'fas fa-smog text-gray-400';
        default: return 'fas fa-cloud-sun text-yellow-600';
    }
}

// Handle error message
function displayError(message) {
    errorInfo.textContent = message;
    errorInfo.classList.remove('hidden');
    weatherInfo.classList.add('hidden');
    // UPDATE: Added auto-clearing of error messages after 5 seconds
    setTimeout(() => errorInfo.classList.add('hidden'), 5000);
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

// Toggle temperature unit
unitToggleBtn.addEventListener('click', () => {
    isCelsius = !isCelsius;
    const city = cityInput.value.trim() || cityDropdown.value;
    if (city) fetchWeather(city);
    unitToggleBtn.textContent = `Switch to ${isCelsius ? '°F' : '°C'}`;
});

// Store city in localStorage and limit to 5
function addCityToDropdown(cityName) {
    let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
    if (!recentCities.includes(cityName)) {
        recentCities.push(cityName);
        // UPDATE: Limited recent cities to 5 to improve dropdown usability
        recentCities = recentCities.slice(-5);
        localStorage.setItem('recentCities', JSON.stringify(recentCities));
    }
    updateCityDropdown();
}

// Update city dropdown
function updateCityDropdown() {
    const recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
    cityDropdown.innerHTML = '<option value="" disabled selected>Select Recently Searched City</option>';
    recentCities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        cityDropdown.appendChild(option);
    });
    cityDropdown.classList.toggle('hidden', recentCities.length === 0);
    cityDropdown.removeEventListener('change', handleDropdownChange);
    cityDropdown.addEventListener('change', handleDropdownChange);
}

// Handle dropdown selection
function handleDropdownChange() {
    const selectedCity = cityDropdown.value;
    if (selectedCity) fetchWeather(selectedCity);
}

// Load dropdown on page load
window.onload = updateCityDropdown;

// Handle current location weather
getLocationWeatherBtn.addEventListener('click', getCurrentLocationWeather);