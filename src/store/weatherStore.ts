import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WeatherData, ForecastDay } from '../services/weatherService'
import type { AIAdvice } from '../services/geminiService'

interface WeatherState {
  // Current data
  weatherData: WeatherData | null
  forecastData: ForecastDay[]
  aiAdvice: AIAdvice | null
  
  // UI state
  isLoading: boolean
  isAILoading: boolean
  error: string | null
  searchQuery: string
  
  // User preferences
  darkMode: boolean
  savedCities: string[]
  lastLocation: { lat: number; lon: number; city: string } | null
  
  // Actions
  setWeatherData: (data: WeatherData) => void
  setForecastData: (data: ForecastDay[]) => void
  setAIAdvice: (advice: AIAdvice) => void
  setLoading: (loading: boolean) => void
  setAILoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSearchQuery: (q: string) => void
  toggleDarkMode: () => void
  addSavedCity: (city: string) => void
  removeSavedCity: (city: string) => void
  setLastLocation: (loc: { lat: number; lon: number; city: string }) => void
  clearData: () => void
}

export const useWeatherStore = create<WeatherState>()(
  persist(
    (set) => ({
      weatherData: null,
      forecastData: [],
      aiAdvice: null,
      isLoading: false,
      isAILoading: false,
      error: null,
      searchQuery: '',
      darkMode: true,
      savedCities: [],
      lastLocation: null,

      setWeatherData: (data) => set({ weatherData: data }),
      setForecastData: (data) => set({ forecastData: data }),
      setAIAdvice: (advice) => set({ aiAdvice: advice }),
      setLoading: (loading) => set({ isLoading: loading }),
      setAILoading: (loading) => set({ isAILoading: loading }),
      setError: (error) => set({ error }),
      setSearchQuery: (q) => set({ searchQuery: q }),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      addSavedCity: (city) =>
        set((state) => ({
          savedCities: state.savedCities.includes(city)
            ? state.savedCities
            : [...state.savedCities, city].slice(0, 5),
        })),
      removeSavedCity: (city) =>
        set((state) => ({
          savedCities: state.savedCities.filter((c) => c !== city),
        })),
      setLastLocation: (loc) => set({ lastLocation: loc }),
      clearData: () => set({ weatherData: null, forecastData: [], aiAdvice: null, error: null }),
    }),
    {
      name: 'weathercare-storage',
      partialize: (state) => ({
        savedCities: state.savedCities,
        darkMode: state.darkMode,
        lastLocation: state.lastLocation,
      }),
    }
  )
)
