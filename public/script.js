// Replace this with your actual deployed backend URL
const BACKEND_URL = "https://weaher-backend.onrender.com";

const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const weatherForm = document.getElementById("weather-form");
const weatherResult = document.getElementById("weather-result");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = loginForm.username.value;
    const password = loginForm.password.value;

    try {
      const res = await fetch(`${BACKEND_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("username", username);
        window.location.href = "weather.html";
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Login failed. Please try again.");
    }
  });
}

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = registerForm.username.value;
    const password = registerForm.password.value;

    try {
      const res = await fetch(`${BACKEND_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (res.ok) {
        alert("Registration successful! You can now log in.");
        window.location.href = "index.html";
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Registration failed. Please try again.");
    }
  });
}

if (weatherForm) {
  document.getElementById("logout").addEventListener("click", () => {
    localStorage.removeItem("username");
    window.location.href = "index.html";
  });

  const username = localStorage.getItem("username");
  if (!username) {
    window.location.href = "index.html";
  }

  weatherForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const city = document.getElementById("city").value;
    const units = document.querySelector('input[name="unit"]:checked')?.value || "metric";

    try {
      const res = await fetch(`${BACKEND_URL}/api/weather?city=${city}&units=${units}`);
      const data = await res.json();

      if (res.ok) {
        weatherResult.innerHTML = `
          <h2>${data.name}, ${data.sys.country}</h2>
          <p>${data.weather[0].description}</p>
          <p>Temperature: ${data.main.temp}°${units === "metric" ? "C" : "F"}</p>
          <p>Humidity: ${data.main.humidity}%</p>
          <p>Wind Speed: ${data.wind.speed} ${units === "metric" ? "m/s" : "mph"}</p>
        `;
      } else {
        weatherResult.innerHTML = `<p>Error: ${data.message}</p>`;
      }
    } catch (err) {
      weatherResult.innerHTML = "<p>Unable to fetch weather data.</p>";
    }
  });
}
