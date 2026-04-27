import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { HeroSection } from '../components/layout/HeroSection'
import { CurrentWeatherCard } from '../components/weather/CurrentWeatherCard'
import { ForecastSection } from '../components/weather/ForecastSection'
import { AIPrecautionsPanel } from '../components/precautions/AIPrecautionsPanel'
import { WeatherBackground } from '../components/weather/WeatherBackground'
import { useWeatherStore } from '../store/weatherStore'
import { getWeatherTheme } from '../services/weatherService'
import { useWeatherData } from '../hooks/useWeatherData'
import { useEffect } from 'react'

export function HomePage() {
  const { weatherData, forecastData, aiAdvice, isLoading, isAILoading, error } = useWeatherStore()
  const { fetchByLocation } = useWeatherData()

  const isDay = new Date().getHours() >= 6 && new Date().getHours() < 20
  const theme = weatherData
    ? getWeatherTheme(weatherData.conditionId, isDay)
    : 'clear-night'
  const temp = weatherData?.temp ?? 25

  // Try auto location on first load
  useEffect(() => {
    if (!weatherData) {
      fetchByLocation().catch(() => {})
    }
  }, [])

  return (
    <div className="relative min-h-screen">
      <WeatherBackground theme={theme} conditionId={weatherData?.conditionId ?? 800} temp={temp} />

      <div className="relative z-10">
        {/* Hero + search */}
        <HeroSection />

        {/* Error state */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto px-4 mb-6"
            >
              <div className="flex items-center gap-3 glass-card p-4 border border-red-500/30 bg-red-950/30">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-300 text-sm font-body">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="max-w-7xl mx-auto px-4 pb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="skeleton h-96 rounded-2xl" />
              <div className="space-y-4">
                <div className="skeleton h-40 rounded-2xl" />
                <div className="skeleton h-40 rounded-2xl" />
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <AnimatePresence>
          {weatherData && !isLoading && (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-4 pb-16"
            >
              <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                {/* Left column - weather data */}
                <div className="xl:col-span-2 space-y-6">
                  <CurrentWeatherCard />
                  <ForecastSection />
                </div>

                {/* Right column - AI precautions */}
                <div className="xl:col-span-3">
                  <AIPrecautionsPanel />
                </div>
              </div>

              {/* Footer note */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-8 text-center text-slate-600 text-xs font-body"
              >
                Powered by OpenWeatherMap & Google Gemini AI • Data refreshes every 5 minutes • 
                <span className="text-slate-500"> Always follow official safety guidelines</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!weatherData && !isLoading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-md mx-auto px-4 pb-20 text-center"
          >
            <div className="glass-card p-10">
              <div className="text-6xl mb-4">🌍</div>
              <h3 className="font-display font-bold text-xl text-white mb-2">Detect your location</h3>
              <p className="text-slate-400 text-sm font-body mb-6">
                Allow location access or search for your city to get personalized, hyperlocal weather safety advice.
              </p>
              <button
                onClick={() => fetchByLocation()}
                className="btn-primary flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                Use My Location
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
