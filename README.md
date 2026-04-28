<div align="center">

<img src="https://img.shields.io/badge/WeathCare-AI%20Weather%20Safety-0ea5e9?style=for-the-badge&logo=cloudflare&logoColor=white" />

# WeathCare

### *Weather that keeps you safe.*

**The AI-powered weather app that doesn't just show the forecast **  
**it tells you what to do about it.**

<br/>

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-weathercare--pearl.vercel.app-0ea5e9?style=for-the-badge)](https://weathercare-pearl.vercel.app)

<br/>

> *Built for India. Built for the heat, the floods, the fog, and everything in between.*

</div>

---

## 🌡️ Why WeathCare?

Most weather apps stop at a number. **47°C? Just "Sunny ☀️".**

India doesn't just have weather it has *extreme* weather. Heatwaves that hospitalise. Monsoons that flood streets overnight. Dense fog that shuts down highways. And every standard weather app just shows a number and calls it a day.

**WeathCare is different.** It uses Google Gemini AI to read your exact location and tell you what *actually* matters:

- 🛡️ Is it safe to step outside right now?
- 👕 What should you wear today?
- 🦟 Are nearby ponds a disease risk after the rain?
- 🕐 When is the safest time to travel?
- 🚨 What do you do if a storm hits?

---

## ✨ Features

### 🤖 AI-Powered Hyperlocal Advice
Gemini AI receives your exact coordinates and live weather data, then generates advice specific to your city's geography mentioning real local risks like flood-prone areas, water bodies, crowded markets, and disease risks after rain.

### 🌦️ Immersive Weather Backgrounds
The entire UI transforms based on your current weather:
- 🔴 **Extreme heat** → Deep red with rising glowing embers
- 🌧️ **Rain / Monsoon** → Dark navy with cinematic falling rain
- ❄️ **Snow / Freezing** → Icy blue with drifting snowflakes
- ⚡ **Storm** → Deep purple with lightning streaks
- 🌫️ **Fog** → Grey wisps drifting across the screen
- 🍃 **Mild / Autumn** → Dark green with falling leaves

### 📊 Complete Weather Dashboard
- Current temperature, feels like, humidity, wind speed, pressure
- UV Index with risk bar
- Air Quality Index (AQI)
- Sunrise / sunset times
- 5-day forecast with temperature trend chart

### 🛡️ Smart Safety System
- **Risk Level** Low / Moderate / High / Extreme with score
- **Can I Go Out?** Clear verdict with reason
- **Best Time to Go Outside** specific time window
- **Travel Safety Score** 0–10 rating
- **Color-coded alerts** Red / Yellow / Green

### 📍 Hyperlocal Insights
AI-generated advice specific to your city not generic tips. If it's raining in Dhanbad, it knows about local ponds and drainage. If it's 45°C in Delhi, it knows about outdoor laborers and street food safety.

### 🚨 Emergency Page
- Emergency contacts (India: 112, 108, 101, 100)
- Scenario-specific guides Thunderstorm, Flood, Heatwave, Cyclone, Fog
- Interactive preparedness checklist with progress tracking

### 📱 Fully Responsive
Works beautifully on mobile, tablet, and desktop.

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/weathercare.git
cd weathercare
npm install
```

### 2. Get Free API Keys

#### 🌤️ OpenWeatherMap (Free)
1. Sign up at [openweathermap.org](https://openweathermap.org/api)
2. Go to **API Keys** tab → copy your key
3. Free tier gives you: current weather, 5-day forecast, UV index, AQI

#### 🤖 Google Gemini (Free)
1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Click **"Get API Key"** → **"Create API key in new project"**
3. Free tier: **1,500 requests/day** — more than enough

### 3. Set Up Environment

```bash
cp .env.example .env
```

Open `.env` and fill in your keys:
```env
VITE_OPENWEATHER_API_KEY=your_openweathermap_key_here
VITE_GEMINI_API_KEY=your_gemini_key_here
```

> ⚠️ Make sure each key is on a **single line** with no spaces or line breaks.

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — allow location when prompted.

---

## 🏗️ Project Structure

```
weathercare/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx              # Navigation + mobile menu
│   │   │   └── HeroSection.tsx         # Landing hero + search
│   │   ├── weather/
│   │   │   ├── WeatherBackground.tsx   # Full canvas weather animations
│   │   │   ├── SearchBar.tsx           # City search + GPS location
│   │   │   ├── CurrentWeatherCard.tsx  # Main weather display
│   │   │   └── ForecastSection.tsx     # 5-day forecast + Recharts
│   │   └── precautions/
│   │       └── AIPrecautionsPanel.tsx  # AI safety advice UI
│   ├── pages/
│   │   ├── HomePage.tsx                # Main dashboard
│   │   ├── AboutPage.tsx               # About WeathCare
│   │   └── EmergencyPage.tsx           # Emergency contacts + guides
│   ├── services/
│   │   ├── weatherService.ts           # OpenWeatherMap API
│   │   └── geminiService.ts            # Gemini AI + smart fallback
│   ├── hooks/
│   │   └── useWeatherData.ts           # Data orchestration hook
│   └── store/
│       └── weatherStore.ts             # Zustand global state
```

---

## 🤖 How the AI Engine Works

```
User opens app
      ↓
GPS coordinates detected (or city searched)
      ↓
OpenWeatherMap API called
→ Temperature, humidity, wind, UV index, AQI, visibility, 5-day forecast
      ↓
All data sent to Google Gemini AI with location context:
"Generate hyperlocal safety advice for [City], [Country]
 considering local geography, water bodies, disease risks..."
      ↓
Gemini responds with structured JSON:
{
  riskLevel, riskScore, safeToGoOut,
  precautions[], clothing[], healthAdvice[],
  travelAdvice[], localInsights[], alerts[]
}
      ↓
If Gemini fails → Smart rule-based fallback
(changes per temperature + condition + city — never generic)
      ↓
Beautiful UI renders everything
```

### What makes it hyperlocal?
The AI prompt includes your exact city name and coordinates, and instructs Gemini to use its knowledge of that specific area — local rivers, ponds, flood-prone zones, market areas, altitude, coastal or inland nature — to generate advice you won't find on any generic weather app.

---

## 🎨 Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | React 18 + Vite + TypeScript |
| **Styling** | Tailwind CSS + Glassmorphism |
| **Animations** | Framer Motion + Canvas API |
| **Charts** | Recharts |
| **State Management** | Zustand (with localStorage persistence) |
| **Data Fetching** | TanStack Query |
| **Routing** | React Router v6 |
| **Icons** | Lucide React |
| **Fonts** | Space Grotesk + Inter + Instrument Serif |
| **AI** | Google Gemini 2.5 Flash (free tier) |
| **Weather Data** | OpenWeatherMap API (free tier) |
| **Deployment** | Vercel |

---

## 🌐 Deploy to Vercel

```bash
# Build first
npm run build

# Push to GitHub
git add .
git commit -m "deploy WeathCare"
git push
```

Then on [vercel.com](https://vercel.com):
1. Import your GitHub repository
2. Add environment variables:
   - `VITE_OPENWEATHER_API_KEY`
   - `VITE_GEMINI_API_KEY`
3. Click **Deploy** — live in 60 seconds ✅

Every `git push` auto-redeploys. Your URL stays the same.

---

## 📱 Pages

| Page | Route | Description |
|------|-------|-------------|
| **Home** | `/` | Weather dashboard + AI advice |
| **About** | `/about` | How WeathCare works |
| **Emergency** | `/emergency` | Contacts, guides, checklist |

---

## 🔒 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_OPENWEATHER_API_KEY` | OpenWeatherMap API key | ✅ Yes |
| `VITE_GEMINI_API_KEY` | Google Gemini API key | ✅ Yes |

> Never commit your `.env` file. It's already in `.gitignore`.

---

## 🙌 Contributing

Pull requests are welcome. For major changes, open an issue first.

1. Fork the repo
2. Create your branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

<div align="center">

**Built with ❤️ for the people of India**

*Stay safe. Stay informed. Stay ahead of the weather.*

[![Live App](https://img.shields.io/badge/🚀%20Try%20WeathCare-weathercare--pearl.vercel.app-0ea5e9?style=for-the-badge)](https://weathercare-pearl.vercel.app)

</div>
