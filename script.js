window.addEventListener("load", function (load) {
  const loader = document.getElementById("loader");
  this.window.removeEventListener("load", load, false);
  this.setTimeout(function () {
    loader.style.display = "none";
  }, 2000);
});
const apiKey = API_KEY;
const searchButton = document.getElementById("search-button");
const cityInput = document.getElementById("city-input");
const forecastDiv = document.getElementById("forecast");
const errorDiv = document.getElementById("api-error");
async function fetchWeather(city) {
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
  const [weatherResponse, forecastResponse] = await Promise.all([
    fetch(weatherUrl),
    fetch(forecastUrl),
  ]);
  const weatherData = await weatherResponse.json();
  const forecastData = await forecastResponse.json();
  if (weatherData.cod == 401 || forecastData.cod == 401) {
    errorDiv.innerHTML = `<div class="center">Sorry, we're currently unable to retrieve the weather information. Please try again later.
</div>`;
    errorDiv.style.display = "block";
  } else if (
    weatherData.cod == 404 ||
    forecastData.cod == 404 ||
    weatherData.cod == 400 ||
    forecastData.cod == 400
  ) {
    console.log("error");
    document.querySelector(".error").style.display = "block";
    cityInput.value = "";
  } else {
    errorDiv.innerHTML = "";
    cityInput.value = "";
    forecastDiv.innerHTML = "";
    document.querySelector(".error").style.display = "none";
    forecastDiv.classList.remove("card");
    displayCurrentWeather(weatherData);
    displayForecast(forecastData.list);
  }
}

function displayCurrentWeather(data) {
  const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
  const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString();
  document.querySelector(".city").innerHTML = data.name;
  document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°C";
  document.querySelector(".weather").innerHTML = data.weather[0].main;
  document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";
  document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
  document.querySelector(".feels-like").innerHTML =
    Math.round(data.main.feels_like) + "°C";
  document.querySelector(".sunrise").innerHTML = sunrise;
  document.querySelector(".sunset").innerHTML = sunset;
  document.querySelector(
    ".weather-img"
  ).src = `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
}

function displayForecast(forecast) {
  console.log(forecast);
  console.log(forecast.filter((_, index) => index % 8 === 0).slice(0, 5));

  const filteredForecast = forecast
    .filter((_, index) => index % 8 === 0)
    .slice(0, 5);
  forecastDiv.classList.add("card");
  filteredForecast.forEach((day, index) => {
    const date = new Date(day.dt_txt);
    forecastDiv.innerHTML += `
    <div class="card-body forcast-item forcastItem_${index}">
              <div class="row">
                <div class="col">
                  <p>${date.toDateString()}</p>
                  <p>${Math.round(day.main.temp_max)}°C</p>
                </div>
                <div class="col">
                  <img src="http://openweathermap.org/img/wn/${
                    day.weather[0].icon
                  }.png" alt="Weather icon">
                 <p>${day.weather[0].description}</p>
                </div>
              </div>
      </div>`;
  });
}
fetchWeather((city = "Delhi"));
searchButton.addEventListener("click", () => {
  fetchWeather(cityInput.value);
});
document
  .getElementById("city-input")
  .addEventListener("keydown", function (event) {
    if (event.target.value != "") {
      if (event.key === "Enter") {
        event.preventDefault();
        searchButton.click();
      }
    }
  });
document.getElementById("location-btn").addEventListener("click", function () {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else {
    alert("Geolocation is not supported by this browser.");
  }
});

function showPosition(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;
  const reverseGeocodingUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;

  fetch(reverseGeocodingUrl)
    .then((response) => response.json())
    .then((data) => {
      if (data.cod === 200) {
        const city = data.name;
        fetchWeather(city);
      } else {
        alert(`Error: ${data.message}`);
      }
    })
    .catch((error) => {
      console.error("Error fetching the location data:", error);
      alert("Unable to retrieve location data at the moment.");
    });
}

function showError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      alert("User denied the request for Geolocation.");
      break;
    case error.POSITION_UNAVAILABLE:
      alert("Location information is unavailable.");
      break;
    case error.TIMEOUT:
      alert("The request to get user location timed out.");
      break;
    case error.UNKNOWN_ERROR:
      alert("An unknown error occurred.");
      break;
  }
}
