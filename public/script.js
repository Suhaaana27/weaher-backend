document.addEventListener("DOMContentLoaded", () => {
  const user = localStorage.getItem("user");

  if (!user && window.location.pathname.includes("weather.html")) {
    window.location.href = "index.html";
  } else if (user) {
    document.getElementById("usernameDisplay").textContent = user;
  }

  // Load last city if available
  const lastCity = localStorage.getItem("lastCity");
  if (lastCity) {
    document.getElementById("cityInput").value = lastCity;
    getWeather();
  }

  // Load theme preference
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    document.getElementById("themeToggle").checked = true;
  }

  // Theme toggle handler
  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("change", () => {
      document.body.classList.toggle("dark");
      const theme = document.body.classList.contains("dark") ? "dark" : "light";
      localStorage.setItem("theme", theme);
    });
  }
});

async function getWeather() {
  const city = document.getElementById("cityInput").value;
  const result = document.getElementById("weatherResult");
  const error = document.getElementById("errorMsg");
  const loading = document.getElementById("loading");

  result.innerHTML = "";
  error.innerHTML = "";

  if (!city) {
    error.innerText = "Please enter a city name.";
    return;
  }

  loading.style.display = "block";

  try {
    const useFahrenheit = document.getElementById("unitToggle").checked;
    const units = useFahrenheit ? "imperial" : "metric";

    // === Updated to use backend proxy ===
    const res = await fetch(`/api/weather?city=${city}&units=${units}`);
    const data = await res.json();

    loading.style.display = "none";

    if (data.cod && data.cod !== 200) {
      error.innerText = data.message;
      return;
    }

    const weatherMain = data.weather[0].main.toLowerCase();
    setDynamicBackground(weatherMain);

    const html = `
      <h2>${data.name}, ${data.sys.country}</h2>
      <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Weather icon"/>
      <p><strong>${data.weather[0].description}</strong></p>
      <p>Temperature: ${data.main.temp}°${useFahrenheit ? "F" : "C"}</p>
      <p>Humidity: ${data.main.humidity}%</p>
      <p>Wind: ${data.wind.speed} ${useFahrenheit ? "mph" : "m/s"}</p>
    `;
    result.innerHTML = html;

    localStorage.setItem("lastCity", city);
  } catch (err) {
    loading.style.display = "none";
    error.innerText = "Error fetching weather data.";
    console.error(err);
  }
}

function setDynamicBackground(condition) {
  const body = document.body;
  body.className = body.classList.contains("dark") ? "dark" : "";

  const conditionMap = {
    clear: "sunny",
    rain: "rain",
    drizzle: "rain",
    thunderstorm: "thunderstorm",
    clouds: "clouds",
    snow: "snow",
    mist: "fog",
    fog: "fog",
  };

  const weatherClass = conditionMap[condition] || "";
  if (weatherClass) {
    body.classList.add(weatherClass);
  }
}

function logout() {
  localStorage.removeItem("user");
  localStorage.removeItem("lastCity");
  window.location.href = "index.html";
}
