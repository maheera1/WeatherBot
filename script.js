// API Keys
const weatherApiKey = 'd8e3bc9b3aff1fd98d377677cd64913a';
const geminiApiKey = 'AIzaSyAkDZVQ1z7LWjcIfDVqNgiWJPUF6qIZAj0';

// Get elements from the DOM
const cityInput = document.getElementById('city-input');
const getWeatherBtn = document.getElementById('get-weather');
const cityNameElem = document.getElementById('city');
const tempElem = document.getElementById('temp');
const tempUnitToggle = document.getElementById('temp-unit-toggle');
const descriptionElem = document.getElementById('description');
const iconElem = document.getElementById('icon');
const weatherWidget = document.getElementById('weather-widget');
const errorElem = document.getElementById('error');
const forecastTableBody = document.getElementById('forecast-table-body');
const paginationElem = document.getElementById('pagination');
const dashboardSection = document.getElementById('dashboard-section');
const tablesSection = document.getElementById('tables-section');
const dashboardLink = document.getElementById('dashboard-link');
const tablesLink = document.getElementById('tables-link');
const chatInput = document.getElementById('chat-input');
const chatSendBtn = document.getElementById('chat-send');
const chatResponseElem = document.getElementById('chat-response');
const loadingSpinner = document.getElementById('loading-spinner');

// New elements for sorting and buttons
const tempSortDropdown = document.getElementById('temp-sort-dropdown');
const sortedTempResults = document.getElementById('sorted-temp-results');
const showRainyDaysBtn = document.getElementById('show-rainy-days');
const showHighestTempBtn = document.getElementById('show-highest-temp');
const rainyDaysResult = document.getElementById('rainy-days-result');
const highestTempResult = document.getElementById('highest-temp-result');

// Charts contexts
const tempBarChartCtx = document.getElementById('temp-bar-chart').getContext('2d');
const doughnutChartCtx = document.getElementById('weather-doughnut-chart').getContext('2d');
const lineChartCtx = document.getElementById('temp-line-chart').getContext('2d');

// Global state variables
let currentTempInKelvin;
let forecastData = [];
let barChart, doughnutChart, lineChart;
let currentPage = 1;
const rowsPerPage = 10; 

// Show Spinner while waiting for the API call
function showSpinner() {
    loadingSpinner.classList.remove('hidden');
}

// Hide Spinner after data is loaded
function hideSpinner() {
    loadingSpinner.classList.add('hidden');
}

// Fetch weather data using geolocation
window.onload = function () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            fetchWeatherByLocation(lat, lon);
            fetchForecastByLocation(lat, lon);
        });
    }
};

// Fetch weather by location
function fetchWeatherByLocation(lat, lon) {
    const apiURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherApiKey}`;
    fetchWeatherData(apiURL);
}

// Fetch forecast by location
function fetchForecastByLocation(lat, lon) {
    const apiURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${weatherApiKey}`;
    fetchForecastData(apiURL);
}

// Event listener for the weather button
getWeatherBtn.addEventListener('click', () => {
    const city = cityInput.value;
    if (city) {
        const apiURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}`;
        fetchWeatherData(apiURL);
        fetchForecast(city);
    }
});

// Fetch weather data from the OpenWeather API
function fetchWeatherData(apiURL) {
    showSpinner();
    fetch(apiURL)
        .then(response => {
            if (!response.ok) {
                throw new Error('City not found');
            }
            return response.json();
        })
        .then(data => {
            hideSpinner();
            const cityName = data.name;
            currentTempInKelvin = data.main.temp; 
            const humidity = data.main.humidity;
            const windSpeed = data.wind.speed;
            const weatherDescription = data.weather[0].main;
            const icon = data.weather[0].icon;

            cityNameElem.textContent = cityName;
            updateTemperature();  // Handles the temp unit toggle
            descriptionElem.textContent = weatherDescription;
            document.getElementById('humidity').textContent = `Humidity: ${humidity}%`;
            document.getElementById('wind-speed').textContent = `Wind Speed: ${windSpeed} m/s`;
            iconElem.src = `https://openweathermap.org/img/wn/${icon}.png`;
            errorElem.textContent = ''; 
            updateBackgroundImage(weatherDescription);
        })
        .catch(error => {
            hideSpinner();
            errorElem.textContent = 'City not found';
        });
}

// Update background image based on weather condition
function updateBackgroundImage(weather) {
    let imageUrl = '';
    switch (weather.toLowerCase()) {
        case 'clear': imageUrl = 'https://media.istockphoto.com/id/1188520316/photo/landscape-of-the-clear-sky.jpg?s=612x612&w=0&k=20&c=Vnk6XNgITN9AkTk7KMSdYZG7Olk4rAIvJNpm_nCM7t0='; break;
        case 'clouds': imageUrl = 'https://t3.ftcdn.net/jpg/03/10/45/78/360_F_310457894_HIpFBaxSQxiptoVgx0y1o4ZGXyH92YO9.jpg'; break;
        case 'rain': imageUrl = 'https://media.istockphoto.com/id/503284599/photo/rainy-weather.jpg?s=612x612&w=0&k=20&c=pV38CVp0CLArYEZ6OUWnaqo6J5mo4JpbEZd61Vxr_I4='; break;
        case 'thunderstorm': imageUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLqEQ8o0EL2r-9SzPywZWrFqw5UnPimpYv4A&s'; break;
        case 'snow': imageUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRj102iDPG6R3exjEUScJOM0WmFWLbAk3l0dQ&s'; break;
        case 'mist': case 'haze': case 'https://media.istockphoto.com/id/1181216754/photo/realistic-dry-ice-smoke-clouds-fog.jpg?s=612x612&w=0&k=20&c=_o4JkCuYoigaL4xJcQTYh7d5Ow6-tDGevyujO1NyaGY=': imageUrl = 'fog.jpg'; break;
        case 'drizzle': imageUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRp07FzoOgJHtIz_BbQgMupGxEM1acr1mnqkw&s'; break;
        case 'smoke': case 'dust': case 'sand': imageUrl = 'https://www.shutterstock.com/image-photo/scenic-view-beautiful-dusty-canyon-600nw-2194352013.jpg'; break;
        case 'squall': case 'tornado': imageUrl = 'https://media.istockphoto.com/id/697333214/photo/powerful-tornado-on-road-in-stormy-landscape.jpg?s=612x612&w=0&k=20&c=i9hO829EJp9c0UPQPc6iucpH979kQpUCf_c_uUjVtjg='; break;
        default: imageUrl = 'https://static.vecteezy.com/system/resources/previews/001/226/748/non_2x/colorful-sunset-sky-free-photo.jpg';
    }
    weatherWidget.style.backgroundImage = `url(${imageUrl})`;
}

// Function to update temperature based on the selected unit
function updateTemperature() {
    const unit = tempUnitToggle.value;
    if (unit === 'C') {
        tempElem.textContent = `${Math.round(currentTempInKelvin - 273.15)}°C`;
    } else {
        tempElem.textContent = `${Math.round((currentTempInKelvin - 273.15) * 9 / 5 + 32)}°F`;
    }
}

// Add event listener to temperature unit toggle
tempUnitToggle.addEventListener('change', updateTemperature);

// Function to Create Charts with Forecast Data
function createCharts(forecastData) {
    const tempData = forecastData.list.map(item => Math.round(item.main.temp - 273.15));
    const labels = forecastData.list.map(item => new Date(item.dt_txt).toLocaleDateString());
    const weatherConditions = forecastData.list.map(item => item.weather[0].main);
    const conditionCounts = weatherConditions.reduce((acc, condition) => {
        acc[condition] = (acc[condition] || 0) + 1;
        return acc;
    }, {});

    // Destroy previous charts before creating new ones
    if (barChart) barChart.destroy();
    if (doughnutChart) doughnutChart.destroy();
    if (lineChart) lineChart.destroy();

    // Vertical Bar Chart
    barChart = new Chart(tempBarChartCtx, {
        type: 'bar',
        data: {
            labels: labels.slice(0, 5),
            datasets: [{
                label: 'Temperature (°C)',
                data: tempData.slice(0, 5),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart'
            },
            scales: { y: { beginAtZero: true } }
        }
    });

    // Doughnut Chart
    doughnutChart = new Chart(doughnutChartCtx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(conditionCounts),
            datasets: [{
                data: Object.values(conditionCounts),
                backgroundColor: [
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(54, 162, 235, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(54, 162, 235, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            animation: {
                duration: 2000,
                easing: 'easeInOutBounce'
            }
        }
    });

    // Line Chart
    lineChart = new Chart(lineChartCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: tempData,
                fill: false,
                borderColor: 'rgba(75, 192, 192, 1)',
                tension: 0.1
            }]
        },
        options: {
            animation: { duration: 1500, easing: 'easeOutBounce' },
            scales: { y: { beginAtZero: true } }
        }
    });
}

// Fetch forecast data and create charts
function fetchForecast(city) {
    const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${weatherApiKey}`;
    fetchForecastData(forecastURL);
}

// Fetch forecast data and display in table
function fetchForecastData(forecastURL) {
    fetch(forecastURL)
        .then(response => {
            if (!response.ok) {
                throw new Error('City not found');
            }
            return response.json();
        })
        .then(data => {
            forecastData = data.list.map(item => ({
                date: new Date(item.dt_txt).toLocaleDateString(),
                temp: Math.round(item.main.temp - 273.15),
                weather: item.weather[0].description
            }));

            createCharts(data);
            displayTablePage(1);
            handleSorting(); // Call sorting function after data is loaded
        })
        .catch(error => {
            errorElem.textContent = 'Unable to fetch forecast data';
        });
}

// Display paginated forecast data in a table
function displayTablePage(page) {
    forecastTableBody.innerHTML = '';
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = forecastData.slice(start, end);

    pageData.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${row.date}</td><td>${row.temp}°C</td><td>${row.weather}</td>`;
        forecastTableBody.appendChild(tr);
    });

    paginationElem.innerHTML = '';
    for (let i = 1; i <= Math.ceil(forecastData.length / rowsPerPage); i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.addEventListener('click', () => displayTablePage(i));
        paginationElem.appendChild(btn);
    }
}

// Navigation between Dashboard and Tables Page
dashboardLink.addEventListener('click', () => {
    dashboardSection.classList.remove('hidden');
    tablesSection.classList.add('hidden');
});

tablesLink.addEventListener('click', () => {
    dashboardSection.classList.add('hidden');
    tablesSection.classList.remove('hidden');
    displayTablePage(1);
});

// Event listener for chatbot
chatSendBtn.addEventListener('click', () => {
    const userInput = chatInput.value;
    if (userInput.toLowerCase().includes('weather')) {
        chatResponseElem.textContent = 'Fetching weather information...';
        fetchGeminiResponse(userInput);
    } else {
        fetchGeminiResponse(userInput);
    }
});

// Fetch response from Gemini API
function fetchGeminiResponse(userInput) {
    const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`;

    fetch(apiURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: userInput }]
            }]
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to get response from Gemini API');
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            chatResponseElem.textContent = `Error: ${data.error.message}`;
        } else if (data && data.candidates && data.candidates.length > 0) {
            chatResponseElem.textContent = data.candidates[0].content.parts[0].text;
        } else {
            chatResponseElem.textContent = 'No valid response from Gemini API';
        }
    })
    .catch(error => {
        chatResponseElem.textContent = 'Error processing your request';
    });
}

// Handle Sorting for Ascending/Descending Temperatures
function handleSorting() {
    tempSortDropdown.addEventListener('change', function() {
        const sortType = this.value;
        let sortedTemps;

        if (sortType === 'ascending') {
            sortedTemps = [...forecastData].sort((a, b) => a.temp - b.temp);
        } else {
            sortedTemps = [...forecastData].sort((a, b) => b.temp - a.temp);
        }

        sortedTempResults.innerHTML = sortedTemps.map(temp => `<li>${temp.temp}°C - ${temp.date}</li>`).join('');
    });
}

// Show Rainy Days and Highest Temperature on Button Click
showRainyDaysBtn.addEventListener('click', function () {
    const rainyDays = forecastData.filter(entry => entry.weather.toLowerCase().includes('rain'));
    rainyDaysResult.innerHTML = rainyDays.map(day => `<li>${day.date} - ${day.weather}</li>`).join('');
});

showHighestTempBtn.addEventListener('click', function () {
    const highestTemp = Math.max(...forecastData.map(entry => entry.temp));
    const highestTempDay = forecastData.find(entry => entry.temp === highestTemp);
    highestTempResult.innerHTML = `<p>Highest Temperature: ${highestTemp}°C on ${highestTempDay.date}</p>`;
});
