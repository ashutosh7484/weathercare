import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, Shirt, Heart, Car, AlertTriangle, MapPin,
  CheckCircle, XCircle, Clock, Navigation, Sparkles, Loader2
} from 'lucide-react'
import { useWeatherStore } from '../../store/weatherStore'

const RISK_CONFIG = {
  Low: { color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30', label: 'Low Risk' },
  Moderate: { color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', label: 'Moderate Risk' },
  High: { color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/30', label: 'High Risk' },
  Extreme: { color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30', label: 'Extreme Risk' },
}

const ALERT_CONFIG = {
  danger: { bg: 'bg-red-950/80', border: 'border-red-500/40', icon: '🔴', text: 'text-red-300' },
  caution: { bg: 'bg-yellow-950/80', border: 'border-yellow-500/40', icon: '🟡', text: 'text-yellow-300' },
  info: { bg: 'bg-blue-950/80', border: 'border-blue-500/40', icon: '🔵', text: 'text-blue-300' },
  safe: { bg: 'bg-green-950/80', border: 'border-green-500/40', icon: '🟢', text: 'text-green-300' },
}

function Section({ title, icon: Icon, color, items, delay = 0 }: {
  title: string
  icon: any
  color: string
  items: string[]
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="glass-card p-5 glass-card-hover"
    >
      <div className={`flex items-center gap-3 mb-4`}>
        <div className={`p-2 rounded-xl bg-white/5`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <h3 className="font-display font-semibold text-white text-base">{title}</h3>
      </div>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + i * 0.08, duration: 0.3 }}
            className="flex items-start gap-2.5 text-sm text-slate-300"
          >
            <div className={`mt-0.5 w-1.5 h-1.5 rounded-full ${color.replace('text-', 'bg-')} flex-shrink-0 mt-1.5`} />
            <span className="font-body leading-relaxed">{item}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  )
}

export function AIPrecautionsPanel() {
  const { aiAdvice, isAILoading } = useWeatherStore()

  if (isAILoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card p-10 text-center"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-sky-500/30 animate-pulse" />
            <Sparkles className="w-8 h-8 text-sky-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <div>
            <p className="font-display font-semibold text-white text-lg">AI is analyzing your local weather...</p>
            <p className="text-slate-400 text-sm mt-1 font-body">Generating hyperlocal safety advice for your area</p>
          </div>
          <div className="flex gap-1.5 mt-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-sky-400"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, delay: i * 0.3, repeat: Infinity }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    )
  }

  if (!aiAdvice) return null

  const riskConfig = RISK_CONFIG[aiAdvice.riskLevel]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* AI Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-xs font-display font-semibold text-sky-400 uppercase tracking-wide">AI-Powered Analysis</span>
        </div>
      </div>

      {/* Alert banners */}
      {aiAdvice.alerts.map((alert, i) => {
        const cfg = ALERT_CONFIG[alert.type]
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`${cfg.bg} border ${cfg.border} rounded-xl p-4 flex items-start gap-3 ${alert.type === 'danger' ? 'alert-danger' : ''}`}
          >
            <span className="text-lg flex-shrink-0">{cfg.icon}</span>
            <div>
              <p className={`font-display font-semibold text-sm ${cfg.text}`}>{alert.title}</p>
              <p className="text-slate-400 text-sm mt-0.5 font-body">{alert.message}</p>
            </div>
          </motion.div>
        )
      })}

      {/* Risk Level + Can I Go Out card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Risk level */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-5"
        >
          <p className="text-xs font-display uppercase tracking-wider text-slate-500 mb-3">Risk Level</p>
          <div className="flex items-center gap-3 mb-3">
            <div className={`px-4 py-1.5 rounded-full ${riskConfig.bg} border ${riskConfig.border}`}>
              <span className={`font-display font-bold text-lg ${riskConfig.color}`}>{aiAdvice.riskLevel}</span>
            </div>
          </div>
          {/* Risk bar */}
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${aiAdvice.riskScore}%` }}
              transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{
                background: aiAdvice.riskScore <= 30
                  ? 'linear-gradient(to right, #4ade80, #86efac)'
                  : aiAdvice.riskScore <= 60
                  ? 'linear-gradient(to right, #facc15, #fb923c)'
                  : 'linear-gradient(to right, #fb923c, #ef4444)',
              }}
            />
          </div>
          <p className="text-slate-500 text-xs mt-1.5 font-mono">{aiAdvice.riskScore}/100</p>
        </motion.div>

        {/* Can I go out */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className={`glass-card p-5 border ${aiAdvice.safeToGoOut ? 'border-green-500/20' : 'border-red-500/20'}`}
        >
          <p className="text-xs font-display uppercase tracking-wider text-slate-500 mb-3">Can I Go Out?</p>
          <div className="flex items-start gap-3">
            <span className="text-4xl">{aiAdvice.canIGoOutCard.icon}</span>
            <div>
              <p className={`font-display font-bold text-base ${aiAdvice.safeToGoOut ? 'text-green-400' : 'text-red-400'}`}>
                {aiAdvice.canIGoOutCard.verdict}
              </p>
              <p className="text-slate-400 text-xs mt-1 font-body">{aiAdvice.canIGoOutCard.reason}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* AI Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="glass-card p-5 border border-sky-500/10"
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <p className="text-xs font-display uppercase tracking-wider text-sky-400">AI Summary</p>
        </div>
        <p className="text-slate-300 font-body text-sm leading-relaxed">{aiAdvice.summary}</p>
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/10">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-xs text-slate-400">Best time: <span className="text-sky-300 font-semibold">{aiAdvice.bestTimeToGoOut}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Navigation className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs text-slate-400">Travel score: <span className="text-purple-300 font-semibold">{aiAdvice.travelSafetyScore}/10</span></span>
          </div>
        </div>
      </motion.div>

      {/* Hyperlocal insights */}
      {aiAdvice.localInsights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-5 border border-amber-500/20 bg-amber-950/20"
        >
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-amber-400" />
            <p className="text-xs font-display uppercase tracking-wider text-amber-400">Hyperlocal Insights</p>
          </div>
          <ul className="space-y-2.5">
            {aiAdvice.localInsights.map((insight, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-start gap-2.5"
              >
                <span className="text-amber-400 text-sm flex-shrink-0 mt-0.5">📍</span>
                <span className="text-slate-300 text-sm font-body leading-relaxed">{insight}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Info grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Section title="Safety Precautions" icon={Shield} color="text-sky-400" items={aiAdvice.precautions} delay={0.45} />
        <Section title="What to Wear" icon={Shirt} color="text-purple-400" items={aiAdvice.clothing} delay={0.5} />
        <Section title="Health Advisory" icon={Heart} color="text-red-400" items={aiAdvice.healthAdvice} delay={0.55} />
        <Section title="Travel Advice" icon={Car} color="text-teal-400" items={aiAdvice.travelAdvice} delay={0.6} />
      </div>

      {/* Emergency tips */}
      {aiAdvice.emergencyTips.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="glass-card p-5 border border-red-500/20 bg-red-950/10"
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <p className="font-display font-semibold text-white">Emergency Tips</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {aiAdvice.emergencyTips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2.5 bg-white/5 rounded-xl p-3">
                <span className="text-red-400 font-display font-bold text-sm flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-slate-300 text-sm font-body">{tip}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
