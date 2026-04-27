import { motion } from 'framer-motion'
import { Droplets, Wind } from 'lucide-react'
import { useWeatherStore } from '../../store/weatherStore'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export function ForecastSection() {
  const { forecastData } = useWeatherStore()

  if (!forecastData.length) return null

  const chartData = forecastData.map((d) => ({
    day: d.dayName.slice(0, 3),
    max: d.tempMax,
    min: d.tempMin,
    rain: d.pop,
  }))

  return (
    <div className="space-y-4">
      <h2 className="font-display font-bold text-xl text-white">5-Day Forecast</h2>

      {/* Forecast cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {forecastData.map((day, i) => {
          const iconUrl = `https://openweathermap.org/img/wn/${day.conditionIcon}@2x.png`
          const isToday = i === 0

          return (
            <motion.div
              key={day.dt}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              whileHover={{ scale: 1.03, translateY: -3 }}
              className={`glass-card p-4 text-center relative overflow-hidden transition-all ${
                isToday ? 'border-sky-500/30 bg-sky-500/5' : ''
              }`}
            >
              {isToday && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2">
                  <span className="text-[10px] font-display font-bold text-sky-400 uppercase tracking-wider bg-sky-500/20 px-2 py-0.5 rounded-full">Today</span>
                </div>
              )}

              <p className="font-display font-semibold text-slate-400 text-xs mt-4 uppercase tracking-wide">
                {isToday ? 'Today' : day.dayName.slice(0, 3)}
              </p>
              <p className="text-slate-600 text-xs font-mono">{day.date.split('/').slice(0, 2).join('/')}</p>

              <img src={iconUrl} alt={day.condition} className="w-12 h-12 mx-auto my-1" />

              <p className="font-display font-bold text-white text-base">{day.tempMax}°</p>
              <p className="text-slate-500 text-sm font-display">{day.tempMin}°</p>

              {/* Rain probability */}
              {day.pop > 0 && (
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Droplets className="w-3 h-3 text-blue-400" />
                  <span className="text-blue-400 text-xs font-mono">{day.pop}%</span>
                </div>
              )}

              {/* Wind */}
              <div className="flex items-center justify-center gap-1 mt-1">
                <Wind className="w-3 h-3 text-teal-400" />
                <span className="text-teal-400 text-xs font-mono">{day.windSpeed}</span>
              </div>

              <p className="text-slate-500 text-xs mt-1.5 capitalize font-body leading-tight">{day.conditionDescription}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Temperature chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-5"
      >
        <p className="font-display font-semibold text-white mb-4 text-sm">Temperature Trend</p>
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="maxGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fb923c" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#fb923c" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="minGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Syne' }} axisLine={false} tickLine={false} />
            <YAxis hide domain={['dataMin - 3', 'dataMax + 3']} />
            <Tooltip
              contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f1f5f9', fontFamily: 'DM Sans' }}
              formatter={(val: number, name: string) => [`${val}°C`, name === 'max' ? 'Max Temp' : 'Min Temp']}
            />
            <Area type="monotone" dataKey="max" stroke="#fb923c" strokeWidth={2} fill="url(#maxGrad)" dot={{ fill: '#fb923c', r: 4 }} />
            <Area type="monotone" dataKey="min" stroke="#38bdf8" strokeWidth={2} fill="url(#minGrad)" dot={{ fill: '#38bdf8', r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  )
}
