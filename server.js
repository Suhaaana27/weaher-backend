const express = require("express");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const axios = require("axios");
const cors = require("cors");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const USERS_FILE = path.join(__dirname, "users.json");
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// === Helper: Load users from JSON file ===
function loadUsers() {
  if (!fs.existsSync(USERS_FILE)) return {};
  const data = fs.readFileSync(USERS_FILE);
  return JSON.parse(data);
}

// === Helper: Save users to JSON file ===
function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// === Routes ===

// Homepage (Login)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Weather Page
app.get("/weather", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "weather.html"));
});

// === Register User ===
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const users = loadUsers();

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required." });
  }

  if (users[username]) {
    return res.status(400).json({ message: "Username already exists." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users[username] = { password: hashedPassword };
  saveUsers(users);

  res.status(201).json({ message: "User registered successfully." });
});

// === Login User ===
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const users = loadUsers();

  const user = users[username];
  if (!user) {
    return res.status(400).json({ message: "Invalid username or password." });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(400).json({ message: "Invalid username or password." });
  }

  res.status(200).json({ message: "Login successful." });
});

// === Weather API Proxy (Protect API Key) ===
app.get("/api/weather", async (req, res) => {
  const { city, units } = req.query;

  if (!city) {
    return res.status(400).json({ message: "City is required." });
  }

  try {
    const weatherRes = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
      params: {
        q: city,
        appid: WEATHER_API_KEY,
        units: units || "metric"
      }
    });

    res.json(weatherRes.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ message: err.response?.data?.message || "Error fetching weather data." });
  }
});
// === Test API Key Route ===
app.get("/api/test-weather", async (req, res) => {
  try {
    const response = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
      params: {
        q: "London", // test city
        appid: WEATHER_API_KEY,
        units: "metric"
      }
    });
    res.json({ message: "✅ API key is working!", weather: response.data });
  } catch (error) {
    res.status(500).json({
      message: "❌ API key failed. Please check your secret.",
      error: error.response?.data || error.message
    });
  }
});

// === Start Server ===
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
