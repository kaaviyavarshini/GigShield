import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

app.post('/api/check-road-risk', async (req, res) => {
  try {
    // Read the API key from process.env.OPENWEATHER_API_KEY
    const apiKey = process.env.OPENWEATHER_API_KEY || process.env.VITE_OWM_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: "Missing OPENWEATHER_API_KEY" });
    }

    // Sample track array (lat/lon/dt)
    const track = req.body.track || [
      {
        lat: 12.9716, // Sample: Bengaluru
        lon: 77.5946,
        dt: Math.floor(Date.now() / 1000)
      }
    ];

    // Call the OpenWeather Road Risk API
    const response = await fetch(`https://api.openweathermap.org/data/2.5/roadrisk?appid=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(track)
    });

    let riskLevel = "low";

    if (!response.ok) {
      console.warn("OpenWeather API call failed (might require enterprise access), returning default risk.", await response.text());
      // Fallback for demonstration if API fails
      riskLevel = "medium";
    } else {
      const data = await response.json();
      
      // Determine risk level based on response (simplified logic)
      // OpenWeather Road Risk returns an array matching the track array.
      // E.g. [{ "alerts": [...], "weather": { "temp": ... } }]
      if (data && data.length > 0) {
        const pointData = data[0];
        if (pointData.alerts && pointData.alerts.length > 0) {
          riskLevel = "high";
        } else if (pointData.weather && pointData.weather.temp < 273.15) { // Freezing
          riskLevel = "medium";
        }
      }
    }

    // Return simplified JSON response
    return res.json({ riskLevel });
    
  } catch (error) {
    console.error("Error in /api/check-road-risk:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY || 
                   process.env.ANTHROPIC_KEY || 
                   process.env.VITE_ANTHROPIC_API_KEY ||
                   process.env.CLAUDE_API_KEY ||
                   process.env.AI_API_KEY;
    
    if (!apiKey) {
      const allKeys = Object.keys(process.env);
      console.error("No Anthropic API key found. Available keys:", allKeys.filter(k => !k.includes('SESSION') && !k.includes('TOKEN')));
      return res.status(500).json({ error: "Missing Anthropic API key in environment" });
    }

    const { model, max_tokens, system, messages } = req.body;
//... (keep the rest)
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        max_tokens,
        system,
        messages
      })
    });
//...
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Anthropic API error:", errorData);
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error("Error in /api/chat:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});
