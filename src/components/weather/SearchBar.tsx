import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, Loader2, X, Star, Clock } from 'lucide-react'
import { useWeatherData } from '../../hooks/useWeatherData'
import { useWeatherStore } from '../../store/weatherStore'

const POPULAR_CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Dhanbad', 'Patna', 'Jaipur', 'Pune']

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [locating, setLocating] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { fetchByCity, fetchByLocation, isLoading } = useWeatherData()
  const { savedCities, addSavedCity, removeSavedCity, weatherData } = useWeatherStore()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      fetchByCity(query.trim())
      setQuery('')
      setIsFocused(false)
    }
  }

  const handleCityClick = (city: string) => {
    fetchByCity(city)
    setQuery('')
    setIsFocused(false)
  }

  const handleLocation = () => {
    setLocating(true)
    fetchByLocation().finally(() => setLocating(false))
  }

  const handleSaveCity = () => {
    if (weatherData) addSavedCity(weatherData.city)
  }

  const suggestions = query.length > 1
    ? POPULAR_CITIES.filter((c) => c.toLowerCase().includes(query.toLowerCase()))
    : []

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <motion.form
        onSubmit={handleSearch}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className={`
          relative flex items-center glass-card transition-all duration-300
          ${isFocused ? 'ring-1 ring-sky-400/50 shadow-lg shadow-sky-900/30' : ''}
        `}>
          {/* Search icon */}
          <div className="pl-5 pr-3">
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-sky-400 animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-slate-400" />
            )}
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder="Search city or district..."
            className="flex-1 bg-transparent py-4 text-white placeholder-slate-500 outline-none font-body text-base"
          />

          {/* Clear button */}
          {query && (
            <button type="button" onClick={() => setQuery('')} className="p-2 text-slate-400 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Save city button */}
          {weatherData && (
            <motion.button
              type="button"
              onClick={handleSaveCity}
              whileTap={{ scale: 0.9 }}
              title="Save city"
              className="p-3 text-slate-400 hover:text-yellow-400 transition-colors"
            >
              <Star className={`w-4 h-4 ${savedCities.includes(weatherData.city) ? 'fill-yellow-400 text-yellow-400' : ''}`} />
            </motion.button>
          )}

          {/* Divider */}
          <div className="w-px h-8 bg-white/10" />

          {/* Location button */}
          <motion.button
            type="button"
            onClick={handleLocation}
            disabled={locating}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-5 py-4 text-sky-400 hover:text-sky-300 transition-colors font-display text-sm font-semibold disabled:opacity-50 min-w-[48px] min-h-[48px]"
          >
            {locating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <MapPin className="w-5 h-5" />
            )}
            <span className="hidden sm:block">Locate Me</span>
          </motion.button>
        </div>
      </motion.form>

      {/* Dropdown */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 glass-card mt-2 p-3 z-50 overflow-hidden"
          >
            {/* Suggestions from query */}
            {suggestions.length > 0 && (
              <div className="mb-3">
                {suggestions.map((city) => (
                  <button
                    key={city}
                    onMouseDown={() => handleCityClick(city)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-all text-sm text-left"
                  >
                    <Search className="w-3.5 h-3.5 text-slate-500" />
                    {city}
                  </button>
                ))}
              </div>
            )}

            {/* Saved cities */}
            {savedCities.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-slate-500 px-3 mb-2 font-display uppercase tracking-wider">Saved Cities</p>
                {savedCities.map((city) => (
                  <div key={city} className="flex items-center group">
                    <button
                      onMouseDown={() => handleCityClick(city)}
                      className="flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-all text-sm text-left"
                    >
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      {city}
                    </button>
                    <button
                      onMouseDown={() => removeSavedCity(city)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-400 transition-all"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Popular cities */}
            {!query && (
              <div>
                <p className="text-xs text-slate-500 px-3 mb-2 font-display uppercase tracking-wider">Popular Cities</p>
                <div className="flex flex-wrap gap-2 px-3">
                  {POPULAR_CITIES.slice(0, 8).map((city) => (
                    <button
                      key={city}
                      onMouseDown={() => handleCityClick(city)}
                      className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:bg-sky-500/20 hover:text-sky-300 hover:border-sky-500/30 transition-all text-xs font-display"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}