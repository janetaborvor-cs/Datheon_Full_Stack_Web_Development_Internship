
import express from "express";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.OPENWEATHER_API_KEY;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve the existing WeatherWise frontend.
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});


app.get("/api/weather", async (req, res) => {
  const city = String(req.query.city || "").trim();

  if (!city || city.length > 100) {
    return res.status(400).json({
      message: "Enter a valid city name."
    });
  }

  if (!API_KEY) {
    return res.status(500).json({
      message: "Weather service is not configured."
    });
  }

  try {
    const url = new URL(
      "https://api.openweathermap.org/data/2.5/weather"
    );

    url.searchParams.set("q", city);
    url.searchParams.set("appid", API_KEY);
    url.searchParams.set("units", "metric");

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      const status = response.status === 404 ? 404 :
        response.status === 401 ? 502 :
        response.status === 429 ? 503 : 502;

      return res.status(status).json({
        message: response.status === 404
          ? "We couldn't find that city. Check the spelling and try again."
          : response.status === 401
          ? "The weather API key is invalid or not active yet."
          : response.status === 429
          ? "The weather service is busy. Please try again shortly."
          : "The weather service is temporarily unavailable."
      });
    }

    res.set("Cache-Control", "no-store");
    return res.json(data);
  } catch {
    return res.status(502).json({
      message: "Unable to contact the weather service. Please try again."
    });
  }
});

app.get("/api/forecast", async (req, res) => {
  const city = String(req.query.city || "").trim();

  if (!city || city.length > 100) {
    return res.status(400).json({
      message: "Enter a valid city name."
    });
  }

  if (!API_KEY) {
    return res.status(500).json({
      message: "Weather service is not configured."
    });
  }

  try {
    const url = new URL(
      "https://api.openweathermap.org/data/2.5/forecast"
    );

    url.searchParams.set("q", city);
    url.searchParams.set("appid", API_KEY);
    url.searchParams.set("units", "metric");

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      const status = response.status === 404 ? 404 :
        response.status === 401 ? 502 :
        response.status === 429 ? 503 : 502;

      return res.status(status).json({
        message: response.status === 404
          ? "We couldn't find that city. Check the spelling and try again."
          : response.status === 401
          ? "The weather API key is invalid or not active yet."
          : response.status === 429
          ? "The weather service is busy. Please try again shortly."
          : "The forecast service is temporarily unavailable."
      });
    }

    res.set("Cache-Control", "no-store");
    return res.json(data);
  } catch {
    return res.status(502).json({
      message: "Unable to retrieve the forecast. Please try again."
    });
  }
});

app.listen(PORT, () => {
  console.log(`WeatherWise server running at http://localhost:${PORT}`);
});
