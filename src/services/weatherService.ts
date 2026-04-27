// Weather Service - OpenWeatherMap API Integration
import axios from 'axios'

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const BASE_URL = 'https://api.openweathermap.org/data/2.5'
const GEO_URL = 'https://api.openweathermap.org/geo/1.0'

export interface WeatherData {
  city: string
  country: string
  lat: number
  lon: number
  temp: number
  feelsLike: number
  tempMin: number
  tempMax: number
  humidity: number
  pressure: number
  windSpeed: number
  windDeg: number
  visibility: number
  condition: string
  conditionDescription: string
  conditionIcon: string
  conditionId: number
  sunrise: number
  sunset: number
  timezone: number
  clouds: number
  dt: number
  uvi?: number
  aqi?: number
  aqiLabel?: string
}

export interface ForecastDay {
  dt: number
  date: string
  dayName: string
  tempMin: number
  tempMax: number
  temp: number
  humidity: number
  windSpeed: number
  condition: string
  conditionDescription: string
  conditionIcon: string
  conditionId: number
  pop: number // probability of precipitation
}

export interface LocationInfo {
  name: string
  state?: string
  country: string
  lat: number
  lon: number
}

// Get weather by city name
export async function getWeatherByCity(city: string): Promise<WeatherData> {
  const response = await axios.get(`${BASE_URL}/weather`, {
    params: { q: city, appid: API_KEY, units: 'metric' },
  })
  return parseWeatherResponse(response.data)
}

// Get weather by coordinates (for auto-location)
export async function getWeatherByCoords(lat: number, lon: number): Promise<WeatherData> {
  const response = await axios.get(`${BASE_URL}/weather`, {
    params: { lat, lon, appid: API_KEY, units: 'metric' },
  })
  const data = parseWeatherResponse(response.data)

  // Also get UV index and AQI
  try {
    const [uviRes, aqiRes] = await Promise.allSettled([
      axios.get(`${BASE_URL}/uvi`, { params: { lat, lon, appid: API_KEY } }),
      axios.get(`${BASE_URL}/air_pollution`, { params: { lat, lon, appid: API_KEY } }),
    ])

    if (uviRes.status === 'fulfilled') {
      data.uvi = uviRes.value.data.value
    }

    if (aqiRes.status === 'fulfilled') {
      const aqiData = aqiRes.value.data.list[0]
      data.aqi = aqiData.main.aqi
      data.aqiLabel = getAQILabel(aqiData.main.aqi)
    }
  } catch {
    // silently fail - UVI and AQI are bonus data
  }

  return data
}

// Get 5-day forecast
export async function getForecastByCoords(lat: number, lon: number): Promise<ForecastDay[]> {
  const response = await axios.get(`${BASE_URL}/forecast`, {
    params: { lat, lon, appid: API_KEY, units: 'metric' },
  })

  // Group by day and pick midday reading
  const dailyMap = new Map<string, any[]>()
  response.data.list.forEach((item: any) => {
    const date = new Date(item.dt * 1000).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })
    if (!dailyMap.has(date)) dailyMap.set(date, [])
    dailyMap.get(date)!.push(item)
  })

  const days: ForecastDay[] = []
  let count = 0
  for (const [date, items] of dailyMap) {
    if (count >= 5) break
    // Pick item closest to noon
    const noonItem = items.reduce((prev, curr) => {
      const prevHour = new Date(prev.dt * 1000).getHours()
      const currHour = new Date(curr.dt * 1000).getHours()
      return Math.abs(currHour - 12) < Math.abs(prevHour - 12) ? curr : prev
    })

    const temps = items.map((i: any) => i.main.temp)
    const dt = noonItem.dt * 1000
    const dayName = new Date(dt).toLocaleDateString('en-IN', { weekday: 'long', timeZone: 'Asia/Kolkata' })

    days.push({
      dt: noonItem.dt,
      date,
      dayName,
      tempMin: Math.round(Math.min(...temps)),
      tempMax: Math.round(Math.max(...temps)),
      temp: Math.round(noonItem.main.temp),
      humidity: noonItem.main.humidity,
      windSpeed: Math.round(noonItem.wind.speed * 3.6),
      condition: noonItem.weather[0].main,
      conditionDescription: noonItem.weather[0].description,
      conditionIcon: noonItem.weather[0].icon,
      conditionId: noonItem.weather[0].id,
      pop: Math.round(noonItem.pop * 100),
    })
    count++
  }

  return days
}

// Reverse geocode coords to city name
export async function reverseGeocode(lat: number, lon: number): Promise<LocationInfo> {
  const response = await axios.get(`${GEO_URL}/reverse`, {
    params: { lat, lon, limit: 1, appid: API_KEY },
  })
  const loc = response.data[0]
  return {
    name: loc.name,
    state: loc.state,
    country: loc.country,
    lat: loc.lat,
    lon: loc.lon,
  }
}

// Get browser geolocation
export function getBrowserLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'))
    } else {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 10000,
        maximumAge: 300000, // 5 min cache
      })
    }
  })
}

// Parse OpenWeatherMap response
function parseWeatherResponse(data: any): WeatherData {
  return {
    city: data.name,
    country: data.sys.country,
    lat: data.coord.lat,
    lon: data.coord.lon,
    temp: Math.round(data.main.temp),
    feelsLike: Math.round(data.main.feels_like),
    tempMin: Math.round(data.main.temp_min),
    tempMax: Math.round(data.main.temp_max),
    humidity: data.main.humidity,
    pressure: data.main.pressure,
    windSpeed: Math.round(data.wind.speed * 3.6), // m/s to km/h
    windDeg: data.wind.deg || 0,
    visibility: Math.round((data.visibility || 10000) / 1000), // m to km
    condition: data.weather[0].main,
    conditionDescription: data.weather[0].description,
    conditionIcon: data.weather[0].icon,
    conditionId: data.weather[0].id,
    sunrise: data.sys.sunrise,
    sunset: data.sys.sunset,
    timezone: data.timezone,
    clouds: data.clouds?.all || 0,
    dt: data.dt,
  }
}

function getAQILabel(aqi: number): string {
  const labels = ['', 'Good', 'Fair', 'Moderate', 'Poor', 'Very Poor']
  return labels[aqi] || 'Unknown'
}

// Get condition-based background theme
// temp is passed so extreme heat overrides clear/cloudy — background adapts to temperature
export function getWeatherTheme(conditionId: number, isDay: boolean, temp?: number): string {
  if (conditionId >= 200 && conditionId < 300) return 'storm'
  if (conditionId >= 300 && conditionId < 600) return 'rain'
  if (conditionId >= 600 && conditionId < 700) return 'snow'
  if (conditionId >= 700 && conditionId < 800) return 'fog'
  if (conditionId === 800) return isDay ? 'clear-day' : 'clear-night'
  if (conditionId > 800) return isDay ? 'cloudy' : 'clear-night'
  return 'clear-day'
  // Note: temperature-based color is handled inside WeatherBackground via the temp prop
}

export function getWindDirection(deg: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  return dirs[Math.round(deg / 22.5) % 16]
}

export function getUVILabel(uvi: number): { label: string; color: string } {
  if (uvi <= 2) return { label: 'Low', color: 'text-green-400' }
  if (uvi <= 5) return { label: 'Moderate', color: 'text-yellow-400' }
  if (uvi <= 7) return { label: 'High', color: 'text-orange-400' }
  if (uvi <= 10) return { label: 'Very High', color: 'text-red-400' }
  return { label: 'Extreme', color: 'text-purple-400' }
}
