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

const analysisInsights = document.getElementById('analysisInsights'); // ✅ ADDED
let isCelsius = true;

// ===================== FETCH WEATHER =====================
async function fetchWeather(city) {
  if (!/^[a-zA-Z\s,]+$/.test(city)) {
    displayError('Invalid city name. Use letters and spaces only.');
    return;
  }
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${
        isCelsius ? 'metric' : 'imperial'
      }`
    );
    const data = await response.json();

    if (data.cod !== 200) {
      if (data.cod === '401') throw new Error('Invalid API key.');
      if (data.cod === '429') throw new Error('Too many requests.');
      throw new Error(data.message || 'City not found');
    }

    displayWeather(data);
    addCityToDropdown(city);
    await fetchForecast(city);
  } catch (error) {
    displayError(error.message);
  }
}

// ===================== GEO LOCATION =====================
async function getCurrentLocationWeather() {
  if (!navigator.geolocation) {
    displayError('Geolocation is not supported.');
    return;
  }

  navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude } = position.coords;
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=${
          isCelsius ? 'metric' : 'imperial'
        }`
      );
      const data = await response.json();
      if (data.cod !== 200) throw new Error(data.message);
      displayWeather(data);
      await fetchForecast(data.name);
    } catch (error) {
      displayError(error.message);
    }
  });
}

// ===================== FORECAST =====================
async function fetchForecast(city) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${
        isCelsius ? 'metric' : 'imperial'
      }`
    );
    const data = await response.json();
    if (data.cod !== '200') throw new Error(data.message);
    displayForecast(data, city);
  } catch (error) {
    console.error(error);
  }
}

// ===================== CURRENT WEATHER =====================
function displayWeather(data) {
  const { name, main, weather, wind } = data;

  document.getElementById('cityName').textContent = name;
  document.getElementById('description').textContent = weather[0].description;
  document.getElementById('temperature').textContent = `${main.temp}°${
    isCelsius ? 'C' : 'F'
  }`;
  document.getElementById(
    'humidity'
  ).textContent = `Humidity: ${main.humidity}%`;
  document.getElementById('windSpeed').textContent = `Wind: ${wind.speed} m/s`;

  document.body.className = weather[0].main.toLowerCase().includes('rain')
    ? 'rainy-bg'
    : 'default-bg';

  if ((isCelsius && main.temp > 40) || (!isCelsius && main.temp > 104)) {
    extremeAlert.textContent = 'Extreme temperature! Be cautious!';
    extremeAlert.classList.remove('hidden');
  } else {
    extremeAlert.classList.add('hidden');
  }

  weatherInfo.classList.remove('hidden');
  errorInfo.classList.add('hidden');
}

// ===================== DISPLAY FORECAST + ANALYSIS =====================
function displayForecast(data, city) {
  forecastTitle.textContent = `5-Day Forecast for ${city}`;
  forecastContainer.innerHTML = '';

  const forecasts = data.list
    .filter((item) => item.dt_txt.includes('12:00:00'))
    .slice(0, 5);

  // 🔹 Build UI cards
  forecasts.forEach((item) => {
    const date = new Date(item.dt * 1000).toLocaleDateString();

    const article = document.createElement('article');
    article.classList.add(
      'city-card',
      'glass-card',
      'bg-white/70',
      'rounded-lg',
      'p-3'
    );

    article.innerHTML = `
      <h3 class="font-bold">${date}</h3>
      <p>${item.weather[0].description}</p>
      <p>🌡 ${item.main.temp}°</p>
      <p>💧 ${item.main.humidity}%</p>
      <p>💨 ${item.wind.speed} m/s</p>
    `;

    forecastContainer.appendChild(article);
  });

  // 🔹 LABELS
  const labels = forecasts.map((item) =>
    new Date(item.dt * 1000).toLocaleDateString()
  );

  // 🔹 DATA ANALYSIS (FROM analysis.js)
  const analysis = analyzeForecast(forecasts);

  // 🔹 INSIGHTS
  analysisInsights.innerHTML = `
    <p>📈 Average Temperature: <b>${analysis.avgTemp}°</b></p>
    <p>🔥 Max Temperature: <b>${analysis.maxTemp}°</b></p>
    <p>❄ Min Temperature: <b>${analysis.minTemp}°</b></p>
  `;

  // 🔹 CHARTS (ONE CALL ONLY)
  renderCharts(labels, analysis.temps, analysis.humidity, analysis.rain);
}


// ===================== ICONS =====================
function getWeatherIcon(main) {
  switch (main) {
    case 'Clear':
      return 'fas fa-sun';
    case 'Clouds':
      return 'fas fa-cloud';
    case 'Rain':
      return 'fas fa-cloud-rain';
    default:
      return 'fas fa-cloud-sun';
  }
}

// ===================== ERROR =====================
function displayError(message) {
  errorInfo.textContent = message;
  errorInfo.classList.remove('hidden');
  weatherInfo.classList.add('hidden');
  setTimeout(() => errorInfo.classList.add('hidden'), 5000);
}

// ===================== EVENTS =====================
getWeatherBtn.addEventListener('click', () => {
  if (cityInput.value.trim()) fetchWeather(cityInput.value.trim());
});

unitToggleBtn.addEventListener('click', () => {
  isCelsius = !isCelsius;
  const city = cityInput.value.trim() || cityDropdown.value;
  if (city) fetchWeather(city);
});

getLocationWeatherBtn.addEventListener('click', getCurrentLocationWeather);

// ===================== DROPDOWN =====================
function addCityToDropdown(city) {
  let cities = JSON.parse(localStorage.getItem('recentCities')) || [];
  if (!cities.includes(city)) {
    cities.push(city);
    cities = cities.slice(-5);
    localStorage.setItem('recentCities', JSON.stringify(cities));
  }
  updateCityDropdown();
}

function updateCityDropdown() {
  const cities = JSON.parse(localStorage.getItem('recentCities')) || [];
  cityDropdown.innerHTML = '<option value="">Recent Cities</option>';
  cities.forEach((city) => {
    const opt = document.createElement('option');
    opt.value = city;
    opt.textContent = city;
    cityDropdown.appendChild(opt);
  });
}

cityDropdown.addEventListener('change', () => {
  if (cityDropdown.value) fetchWeather(cityDropdown.value);
});

window.onload = updateCityDropdown;
