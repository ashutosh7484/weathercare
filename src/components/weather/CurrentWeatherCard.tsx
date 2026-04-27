import { motion } from 'framer-motion'
import { Droplets, Wind, Eye, Gauge, Thermometer, Sun, MapPin, Cloud } from 'lucide-react'
import { useWeatherStore } from '../../store/weatherStore'
import { getWindDirection, getUVILabel } from '../../services/weatherService'

export function CurrentWeatherCard() {
  const { weatherData } = useWeatherStore()

  if (!weatherData) return null

  const now = new Date()
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

  const windDir = getWindDirection(weatherData.windDeg)
  const uvLabel = weatherData.uvi ? getUVILabel(weatherData.uvi) : null

  const isDay = now.getHours() >= 6 && now.getHours() < 20
  const iconUrl = `https://openweathermap.org/img/wn/${weatherData.conditionIcon}@4x.png`

  const stats = [
    { icon: Droplets, label: 'Humidity', value: `${weatherData.humidity}%`, color: 'text-blue-400' },
    { icon: Wind, label: 'Wind', value: `${weatherData.windSpeed} km/h ${windDir}`, color: 'text-teal-400' },
    { icon: Eye, label: 'Visibility', value: `${weatherData.visibility} km`, color: 'text-purple-400' },
    { icon: Gauge, label: 'Pressure', value: `${weatherData.pressure} hPa`, color: 'text-orange-400' },
    { icon: Thermometer, label: 'Feels Like', value: `${weatherData.feelsLike}°C`, color: 'text-red-400' },
    { icon: Cloud, label: 'Cloud Cover', value: `${weatherData.clouds}%`, color: 'text-slate-400' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="gradient-border p-0.5 rounded-2xl"
    >
      <div className="glass-card rounded-2xl p-6 md:p-8 relative overflow-hidden">
        {/* Scan line effect */}
        <div className="scan-line" />

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
              <MapPin className="w-3.5 h-3.5 text-sky-400" />
              <span className="font-body">{weatherData.city}, {weatherData.country}</span>
            </div>
            <h2 className="font-display text-xl font-bold text-white tracking-tight">{dateStr}</h2>
            <p className="text-slate-400 text-sm font-mono mt-0.5">{timeStr}</p>
          </div>

          {/* AQI badge */}
          {weatherData.aqiLabel && (
            <div className={`px-3 py-1.5 rounded-full text-xs font-display font-semibold border ${
              weatherData.aqi! <= 2 ? 'bg-green-500/20 text-green-300 border-green-500/30' :
              weatherData.aqi! <= 3 ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
              'bg-red-500/20 text-red-300 border-red-500/30'
            }`}>
              AQI: {weatherData.aqiLabel}
            </div>
          )}
        </div>

        {/* Main temperature display */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-end gap-2">
              <span className="font-display font-bold text-white" style={{ fontSize: 'clamp(4rem, 12vw, 7rem)', lineHeight: 1, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums' }}>
                {weatherData.temp}
              </span>
              <span className="font-display text-3xl text-slate-400 mb-4">°C</span>
            </div>
            <p className="font-display text-lg font-medium text-sky-300 capitalize mt-1 tracking-tight">
              {weatherData.conditionDescription}
            </p>
            <p className="text-slate-500 text-sm mt-0.5">
              H: {weatherData.tempMax}° / L: {weatherData.tempMin}°
            </p>
          </div>

          {/* Weather icon */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="relative"
          >
            <div className="absolute inset-0 rounded-full bg-sky-400/10 blur-2xl scale-150" />
            <img
              src={iconUrl}
              alt={weatherData.condition}
              className="w-28 h-28 md:w-36 md:h-36 relative z-10 drop-shadow-2xl"
            />
          </motion.div>
        </div>

        {/* UV Index bar */}
        {weatherData.uvi !== undefined && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-slate-400 font-body">UV Index</span>
              </div>
              <span className={`text-sm font-display font-semibold ${uvLabel?.color}`}>
                {weatherData.uvi.toFixed(1)} — {uvLabel?.label}
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((weatherData.uvi / 11) * 100, 100)}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(to right, #4ade80, #facc15, #fb923c, #ef4444, #9333ea)',
                }}
              />
            </div>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {stats.map(({ icon: Icon, label, value, color }) => (
            <motion.div
              key={label}
              whileHover={{ scale: 1.03 }}
              className="bg-white/5 rounded-xl p-3.5 border border-white/5 hover:border-white/10 transition-all"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="text-xs text-slate-500 font-display uppercase tracking-wide">{label}</span>
              </div>
              <p className="text-white font-display font-semibold text-sm">{value}</p>
            </motion.div>
          ))}
        </div>

        {/* Sunrise/Sunset */}
        <div className="flex items-center justify-center gap-8 mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-yellow-400">🌅</span>
            <div>
              <p className="text-xs text-slate-500 font-display uppercase">Sunrise</p>
              <p className="text-white font-mono text-sm">
                {new Date(weatherData.sunrise * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </p>
            </div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex items-center gap-2 text-sm">
            <span className="text-orange-400">🌇</span>
            <div>
              <p className="text-xs text-slate-500 font-display uppercase">Sunset</p>
              <p className="text-white font-mono text-sm">
                {new Date(weatherData.sunset * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
