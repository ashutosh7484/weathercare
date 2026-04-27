// Custom hook to orchestrate all weather data fetching
import { useCallback } from 'react'
import { getWeatherByCity, getWeatherByCoords, getForecastByCoords, getBrowserLocation, reverseGeocode } from '../services/weatherService'
import { getAIWeatherAdvice } from '../services/geminiService'
import { useWeatherStore } from '../store/weatherStore'

function getSeason(lat: number, month: number): string {
  const isNorthern = lat >= 0
  if (isNorthern) {
    if (month >= 3 && month <= 5) return 'Spring'
    if (month >= 6 && month <= 8) return 'Summer/Monsoon'
    if (month >= 9 && month <= 11) return 'Autumn'
    return 'Winter'
  } else {
    if (month >= 3 && month <= 5) return 'Autumn'
    if (month >= 6 && month <= 8) return 'Winter'
    if (month >= 9 && month <= 11) return 'Spring'
    return 'Summer'
  }
}

function getTimeOfDay(): string {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'Morning'
  if (hour >= 12 && hour < 17) return 'Afternoon'
  if (hour >= 17 && hour < 20) return 'Evening'
  return 'Night'
}

export function useWeatherData() {
  const store = useWeatherStore()

  const fetchWeatherData = useCallback(async (lat: number, lon: number, cityName?: string) => {
    store.setLoading(true)
    store.setError(null)

    try {
      // Fetch current weather and forecast in parallel
      const [weather, forecast] = await Promise.all([
        getWeatherByCoords(lat, lon),
        getForecastByCoords(lat, lon),
      ])

      if (cityName) weather.city = cityName

      store.setWeatherData(weather)
      store.setForecastData(forecast)
      store.setLastLocation({ lat, lon, city: weather.city })

      // Now fetch AI advice (separate loading state)
      store.setAILoading(true)
      store.setLoading(false)

      const forecastSummary = forecast
        .slice(0, 3)
        .map((d) => `${d.dayName}: ${d.condition}, ${d.tempMin}–${d.tempMax}°C, Rain ${d.pop}%`)
        .join('; ')

      const month = new Date().getMonth() + 1
      const season = getSeason(lat, month)

      const advice = await getAIWeatherAdvice({
        city: weather.city,
        country: weather.country,
        lat,
        lon,
        temp: weather.temp,
        feelsLike: weather.feelsLike,
        humidity: weather.humidity,
        windSpeed: weather.windSpeed,
        condition: weather.condition,
        conditionDescription: weather.conditionDescription,
        visibility: weather.visibility,
        uvi: weather.uvi,
        aqi: weather.aqi,
        aqiLabel: weather.aqiLabel,
        pressure: weather.pressure,
        clouds: weather.clouds,
        forecast: forecastSummary,
        timeOfDay: getTimeOfDay(),
        season,
      })

      store.setAIAdvice(advice)
    } catch (err: any) {
      store.setError(err.message || 'Failed to fetch weather data')
    } finally {
      store.setLoading(false)
      store.setAILoading(false)
    }
  }, [])

  const fetchByCity = useCallback(async (city: string) => {
    store.setLoading(true)
    store.setError(null)

    try {
      const weather = await getWeatherByCity(city)
      await fetchWeatherData(weather.lat, weather.lon, weather.city)
    } catch (err: any) {
      store.setLoading(false)
      if (err.response?.status === 404) {
        store.setError(`City "${city}" not found. Please check the spelling.`)
      } else {
        store.setError('Failed to fetch weather. Please try again.')
      }
    }
  }, [fetchWeatherData])

  const fetchByLocation = useCallback(async () => {
    store.setLoading(true)
    store.setError(null)

    try {
      const position = await getBrowserLocation()
      const { latitude: lat, longitude: lon } = position.coords
      const location = await reverseGeocode(lat, lon)
      await fetchWeatherData(lat, lon, location.name)
    } catch (err: any) {
      store.setLoading(false)
      if (err.code === 1) {
        store.setError('Location access denied. Please search for your city manually.')
      } else {
        store.setError('Could not detect your location. Please search manually.')
      }
    }
  }, [fetchWeatherData])

  return {
    weatherData: store.weatherData,
    forecastData: store.forecastData,
    aiAdvice: store.aiAdvice,
    isLoading: store.isLoading,
    isAILoading: store.isAILoading,
    error: store.error,
    fetchByCity,
    fetchByLocation,
    fetchWeatherData,
  }
}
