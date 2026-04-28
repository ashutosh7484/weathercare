import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, RefreshCw } from 'lucide-react'
import { HeroSection } from '../components/layout/HeroSection'
import { CurrentWeatherCard } from '../components/weather/CurrentWeatherCard'
import { ForecastSection } from '../components/weather/ForecastSection'
import { AIPrecautionsPanel } from '../components/precautions/AIPrecautionsPanel'
import { WeatherBackground } from '../components/weather/WeatherBackground'
import { useWeatherStore } from '../store/weatherStore'
import { getWeatherTheme } from '../services/weatherService'
import { useWeatherData } from '../hooks/useWeatherData'
import { useEffect, useState } from 'react'

export function HomePage() {
  const { weatherData, isLoading, error, setError } = useWeatherStore()
  const { fetchByLocation } = useWeatherData()
  const [locationDenied, setLocationDenied] = useState(false)
  const [asking, setAsking] = useState(false)

  const isDay = new Date().getHours() >= 6 && new Date().getHours() < 20
  const theme = weatherData ? getWeatherTheme(weatherData.conditionId, isDay) : 'clear-night'
  const temp = weatherData?.temp ?? 25

  // On first load — don't auto-request. Just show the prompt card.
  useEffect(() => {
    // If user had a last session, we show the prompt still — don't auto-fire
  }, [])

  const handleAllowLocation = async () => {
    setAsking(true)
    setLocationDenied(false)
    setError(null)
    try {
      await fetchByLocation()
    } catch {
      setLocationDenied(true)
    } finally {
      setAsking(false)
    }
  }

  // Detect if error is a location denial
  const isLocationError = error?.toLowerCase().includes('location') ||
    error?.toLowerCase().includes('denied') ||
    error?.toLowerCase().includes('detect')

  return (
    <div className="relative min-h-screen">
      <WeatherBackground theme={theme} conditionId={weatherData?.conditionId ?? 800} temp={temp} />

      <div className="relative z-10">
        <HeroSection />

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

        {/* Main weather content */}
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
                <div className="xl:col-span-2 space-y-6">
                  <CurrentWeatherCard />
                  <ForecastSection />
                </div>
                <div className="xl:col-span-3">
                  <AIPrecautionsPanel />
                </div>
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-8 text-center text-slate-600 text-xs font-body"
              >
                Powered by OpenWeatherMap & Google Gemini AI • Always follow official safety guidelines
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state — shown when no weather loaded yet */}
        {!weatherData && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-sm mx-auto px-4 pb-20 text-center"
          >
            <div className="glass-card p-8 border border-white/10">

              {/* Icon */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="text-5xl mb-5"
              >
                📍
              </motion.div>

              {!locationDenied && !isLocationError ? (
                <>
                  <h3 className="font-display font-bold text-xl text-white mb-2">
                    Allow Location Access
                  </h3>
                  <p className="text-slate-400 text-sm font-body mb-6 leading-relaxed">
                    WeathCare needs your location to show real-time weather and
                    AI-powered safety advice for exactly where you are.
                  </p>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={handleAllowLocation}
                    disabled={asking}
                    className="btn-primary flex items-center gap-2 mx-auto mb-3 w-full justify-center"
                  >
                    <MapPin className="w-4 h-4" />
                    {asking ? 'Detecting location...' : 'Allow & Get My Weather'}
                  </motion.button>
                  <p className="text-slate-600 text-xs font-body">
                    Or search your city above ↑
                  </p>
                </>
              ) : (
                <>
                  <h3 className="font-display font-bold text-lg text-white mb-2">
                    Location Access Denied
                  </h3>
                  <p className="text-slate-400 text-sm font-body mb-5 leading-relaxed">
                    To enable it — tap the 🔒 lock icon in your browser's address bar
                    and allow location, then try again.
                  </p>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={handleAllowLocation}
                    disabled={asking}
                    className="btn-primary flex items-center gap-2 mx-auto mb-3 w-full justify-center"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </motion.button>
                  <p className="text-slate-600 text-xs font-body">
                    Or search your city above ↑
                  </p>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}