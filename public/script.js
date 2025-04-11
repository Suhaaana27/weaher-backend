document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const searchBtn = document.getElementById("searchBtn");
  const cityInput = document.getElementById("cityInput");
  const themeToggle = document.getElementById("themeToggle");
  const unitToggle = document.getElementById("unitToggle");
  const usernameDisplay = document.getElementById("usernameDisplay");

  // Login handler
  if (loginForm) {
    loginForm.addEventListener("submit", async e => {
      e.preventDefault();
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      const res = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("username", username);
        window.location.href = "weather.html";
      } else {
        document.getElementById("loginError").textContent = data.message;
      }
    });
  }

  // Register handler
  if (registerForm) {
    registerForm.addEventListener("submit", async e => {
      e.preventDefault();
      const username = document.getElementById("regUsername").value;
      const password = document.getElementById("regPassword").value;

      const res = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("username", username);
        window.location.href = "weather.html";
      } else {
        document.getElementById("registerError").textContent = data.message;
      }
    });
  }

  // Weather page logic
  if (usernameDisplay) {
    const username = localStorage.getItem("username");
    if (!username) window.location.href = "index.html";
    else usernameDisplay.textContent = username;
  }

  async function getWeather() {
    const city = cityInput.value.trim();
    const units = unitToggle?.checked ? "imperial" : "metric";
    if (!city) return;

    document.getElementById("loading").style.display = "block";
    document.getElementById("errorMsg").textContent = "";
    document.getElementById("weatherResult").innerHTML = "";

    try {
      const res = await fetch(`/weather?city=${city}&units=${units}`);
      const data = await res.json();

      if (res.ok) {
        const { name, main, weather } = data;
        const condition = weather[0].main.toLowerCase();
        const temp = main.temp;
        const unitSymbol = units === "metric" ? "°C" : "°F";

        document.getElementById("weatherResult").innerHTML = `
          <div class="result">
            <h2>${name}</h2>
            <p>${weather[0].description}</p>
            <p>${temp} ${unitSymbol}</p>
            <img src="https://openweathermap.org/img/wn/${weather[0].icon}@2x.png" />
          </div>
        `;

        document.body.classList.remove("sunny", "rain", "clouds", "snow", "thunderstorm", "mist", "fog");
        if (condition.includes("rain")) document.body.classList.add("rain");
        else if (condition.includes("cloud")) document.body.classList.add("clouds");
        else if (condition.includes("snow")) document.body.classList.add("snow");
        else if (condition.includes("thunderstorm")) document.body.classList.add("thunderstorm");
        else if (condition.includes("mist") || condition.includes("fog")) document.body.classList.add("fog");
        else document.body.classList.add("sunny");
      } else {
        document.getElementById("errorMsg").textContent = data.message || "City not found.";
      }
    } catch (err) {
      document.getElementById("errorMsg").textContent = "Failed to fetch weather.";
    } finally {
      document.getElementById("loading").style.display = "none";
    }
  }

  if (searchBtn) searchBtn.addEventListener("click", getWeather);
  if (cityInput) cityInput.addEventListener("keypress", e => {
    if (e.key === "Enter") getWeather();
  });

  // Theme toggle
  if (themeToggle) {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.body.classList.add("dark");
      themeToggle.checked = true;
    }

    themeToggle.addEventListener("change", () => {
      document.body.classList.toggle("dark");
      localStorage.setItem("theme", themeToggle.checked ? "dark" : "light");
    });
  }

  // Unit toggle save
  if (unitToggle) {
    const savedUnits = localStorage.getItem("units");
    if (savedUnits === "imperial") unitToggle.checked = true;

    unitToggle.addEventListener("change", () => {
      localStorage.setItem("units", unitToggle.checked ? "imperial" : "metric");
    });
  }
});

// Logout
function logout() {
  localStorage.removeItem("username");
  window.location.href = "index.html";
}
