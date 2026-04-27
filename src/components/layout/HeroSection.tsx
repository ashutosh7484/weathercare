import { motion } from 'framer-motion'
import { Sparkles, Shield, MapPin } from 'lucide-react'
import { SearchBar } from '../weather/SearchBar'
import { useWeatherData } from '../../hooks/useWeatherData'
import { useEffect } from 'react'
import { useWeatherStore } from '../../store/weatherStore'

export function HeroSection() {
  const { fetchByLocation } = useWeatherData()
  const { weatherData, lastLocation } = useWeatherStore()

  // Auto-load last location or attempt auto-detect on first visit
  useEffect(() => {
    if (!weatherData && lastLocation) {
      // Restore last location silently
      import('../../hooks/useWeatherData').then(() => {})
    }
  }, [])

  return (
    <div className="relative pt-32 pb-12 px-4">
      <div className="max-w-4xl mx-auto text-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/10 border border-sky-500/20 mb-8"
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-sky-400 text-xs font-display font-semibold uppercase tracking-wider">
            AI-Powered Weather Safety
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display font-bold leading-[1.05] tracking-tight mb-6"
          style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)' }}
        >
          <span className="text-white">Weather that </span>
          <span className="font-serif italic font-normal text-gradient-blue">keeps you</span>
          <br />
          <span className="text-white font-bold"> safe.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-slate-400 text-base font-body font-light max-w-xl mx-auto mb-10 leading-[1.8] tracking-wide"
        >
          Beyond forecasts — Gemini AI delivers{' '}
          <span className="text-sky-300 font-medium">hyperlocal safety advice</span>, health tips,
          clothing guidance, and emergency alerts tailored to exactly where you are.
        </motion.p>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mb-8"
        >
          <SearchBar />
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          {[
            { icon: '🌍', label: 'Auto Location' },
            { icon: '🤖', label: 'Gemini AI' },
            { icon: '📍', label: 'Hyperlocal' },
            { icon: '⚡', label: 'Real-time' },
            { icon: '🛡️', label: 'Safety First' },
          ].map((feat) => (
            <div
              key={feat.label}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400 text-xs font-display"
            >
              <span>{feat.icon}</span>
              <span>{feat.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
