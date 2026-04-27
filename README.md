# 🌦️ WeathCare — AI-Powered Weather Safety App

> Weather that keeps you safe. Gemini AI + OpenWeatherMap + Hyperlocal insights.

## ✨ Features

- **Auto Location Detection** — detects your GPS coordinates automatically
- **Gemini AI Analysis** — generates hyperlocal safety advice (ponds, floods, disease risks)
- **5-Day Forecast** with temperature trend charts
- **Smart Alert System** — Red/Yellow/Green based on weather severity
- **Emergency Page** — contacts, scenario guides, preparedness checklist
- **Animated Backgrounds** — rain, lightning, snow, fog, clear sky animations
- **Futuristic Glassmorphism UI** — built with Tailwind + Framer Motion

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/yourname/weathercare.git
cd weathercare
npm install
```

### 2. Get Your API Keys

#### OpenWeatherMap (Free)
1. Go to [openweathermap.org](https://openweathermap.org/api)
2. Create account → API Keys → Copy your key
3. Free tier includes: current weather, 5-day forecast, air pollution, UV index

#### Google Gemini (Free)
1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Click "Get API Key" → Create API Key
3. Free tier: 1500 requests/day (more than enough!)

### 3. Create .env file

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_OPENWEATHER_API_KEY=your_openweathermap_key_here
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🏗️ Project Structure

```
weathercare/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx          # Navigation with mobile menu
│   │   │   └── HeroSection.tsx     # Landing hero with search
│   │   ├── weather/
│   │   │   ├── WeatherBackground.tsx  # Animated weather backgrounds
│   │   │   ├── SearchBar.tsx          # City search + location detect
│   │   │   ├── CurrentWeatherCard.tsx # Main weather display
│   │   │   └── ForecastSection.tsx    # 5-day forecast + charts
│   │   └── precautions/
│   │       └── AIPrecautionsPanel.tsx # AI advice, alerts, tips
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── AboutPage.tsx
│   │   └── EmergencyPage.tsx
│   ├── services/
│   │   ├── weatherService.ts    # OpenWeatherMap API calls
│   │   └── geminiService.ts     # Gemini AI + fallback logic
│   ├── hooks/
│   │   └── useWeatherData.ts    # Orchestrates all data fetching
│   ├── store/
│   │   └── weatherStore.ts      # Zustand state management
│   └── index.css                # Animations + global styles
```

---

## 🤖 How the AI Works

1. **User opens app** → browser GPS is requested automatically
2. **WeatherService** calls OpenWeatherMap for: current weather, 5-day forecast, UV index, AQI
3. **GeminiService** receives all data + exact city/coordinates
4. **Gemini AI prompt** includes:
   - Temperature, humidity, wind, visibility, AQI, UV index
   - The user's exact city and coordinates
   - Time of day and season
5. **Gemini responds** with:
   - `riskLevel` + `riskScore`
   - `safeToGoOut` verdict
   - `localInsights` — hyperlocal tips based on city geography
   - Disease/mosquito warnings after rain
   - Clothing, health, travel, emergency advice
6. **Fallback** — if Gemini fails, rule-based system kicks in automatically

---

## 🌐 Deploy to Vercel

```bash
npm install -g vercel
vercel login
vercel

# Set environment variables in Vercel dashboard:
# VITE_OPENWEATHER_API_KEY
# VITE_GEMINI_API_KEY
```

Or connect your GitHub repo to Vercel for automatic deploys.

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS + custom animations |
| Animations | Framer Motion |
| Charts | Recharts |
| State | Zustand (with persistence) |
| Data Fetching | TanStack Query |
| Routing | React Router v6 |
| Icons | Lucide React |
| AI | Google Gemini 2.0 Flash |
| Weather | OpenWeatherMap API |

---

## 📱 API Keys Note

API keys are stored in `.env` (never commit this file). For production, add them in your Vercel/Netlify dashboard under Environment Variables.

---

Made with ❤️ for safety-first weather intelligence.
