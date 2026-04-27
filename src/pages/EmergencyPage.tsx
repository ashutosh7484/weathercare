import { motion } from 'framer-motion'
import { AlertTriangle, Phone, CheckSquare, Shield, Zap, Droplets, Wind, Thermometer, Eye } from 'lucide-react'
import { useState } from 'react'

const EMERGENCY_CONTACTS = [
  { name: 'National Emergency', number: '112', icon: '🚨', color: 'text-red-400', bg: 'bg-red-950/50 border-red-500/30' },
  { name: 'Ambulance', number: '108', icon: '🚑', color: 'text-orange-400', bg: 'bg-orange-950/50 border-orange-500/30' },
  { name: 'Police', number: '100', icon: '👮', color: 'text-blue-400', bg: 'bg-blue-950/50 border-blue-500/30' },
  { name: 'Fire Brigade', number: '101', icon: '🚒', color: 'text-red-400', bg: 'bg-red-950/50 border-red-500/30' },
  { name: 'Disaster Management', number: '1078', icon: '🏚️', color: 'text-yellow-400', bg: 'bg-yellow-950/50 border-yellow-500/30' },
  { name: 'Weather Alerts', number: '1800-180-1717', icon: '🌩️', color: 'text-purple-400', bg: 'bg-purple-950/50 border-purple-500/30' },
]

const SCENARIOS = [
  {
    icon: Zap,
    color: 'text-purple-400',
    title: 'Thunderstorm',
    bg: 'from-purple-950/50 to-slate-950',
    tips: [
      'Stay indoors and away from windows and doors',
      'Unplug electronic devices and avoid using electrical appliances',
      'Do not use landline telephones during lightning',
      'Avoid bathing or using plumbing during a storm',
      'If caught outside, stay low and away from tall objects, trees, or metal',
      'Avoid open fields, hilltops, and bodies of water',
      'Crouch low if outdoors — do not lie flat on the ground',
    ],
  },
  {
    icon: Droplets,
    color: 'text-blue-400',
    title: 'Heavy Rainfall & Flood',
    bg: 'from-blue-950/50 to-slate-950',
    tips: [
      'Move to higher ground immediately if flooding starts',
      'Never walk through moving floodwater — 6 inches can knock you down',
      'Avoid contact with floodwater — it may be contaminated with sewage',
      'Do not drive through flooded roads — "Turn around, don\'t drown"',
      'Shut off electricity if flooding is imminent in your home',
      'Keep a waterproof emergency kit ready',
      'Watch for news and official evacuation orders',
    ],
  },
  {
    icon: Thermometer,
    color: 'text-orange-400',
    title: 'Extreme Heat',
    bg: 'from-orange-950/50 to-slate-950',
    tips: [
      'Stay in an air-conditioned space during peak heat hours (11am–4pm)',
      'Drink at least 2–3 liters of water daily — do not wait until thirsty',
      'Wear light-colored, loose-fitting, lightweight cotton clothing',
      'Never leave children or pets in a parked vehicle',
      'Check on elderly neighbors and those without air conditioning',
      'Apply SPF 50+ sunscreen before going outside',
      'Heat stroke signs: high body temp, confusion, no sweating — call 108 immediately',
    ],
  },
  {
    icon: Wind,
    color: 'text-teal-400',
    title: 'Cyclone / Strong Winds',
    bg: 'from-teal-950/50 to-slate-950',
    tips: [
      'Follow official evacuation orders immediately',
      'Secure or bring indoors loose outdoor items (furniture, plants)',
      'Reinforce windows and doors with shutters or boards',
      'Stay away from coastal areas, rivers, and streams',
      'Keep emergency supplies: food, water (3-day supply), medicines, torch',
      'Store important documents in a waterproof container',
      'Stay tuned to All India Radio and official weather updates',
    ],
  },
  {
    icon: Eye,
    color: 'text-slate-400',
    title: 'Dense Fog',
    bg: 'from-slate-800/50 to-slate-950',
    tips: [
      'Drive slowly and use fog lights — not high beams',
      'Maintain extra following distance between vehicles',
      'Use windshield wipers and defrosters',
      'Pull over safely if visibility becomes near-zero',
      'Avoid highway and expressway driving during dense fog',
      'Pedestrians: walk on footpath, wear bright reflective clothing',
      'People with asthma or COPD: stay indoors, fog worsens symptoms',
    ],
  },
]

const CHECKLIST = [
  'Emergency contact list (saved offline)',
  'First aid kit stocked and accessible',
  'Flashlight with extra batteries / solar torch',
  'Portable phone charger (power bank) charged',
  '3-day supply of drinking water',
  '3-day supply of non-perishable food',
  'Essential medicines and prescriptions',
  'Important documents in waterproof container',
  'Cash (ATMs may not work in emergencies)',
  'Whistle to signal for help',
  'Blankets / warm clothing',
  'Know nearest hospital, shelter, evacuation route',
]

export function EmergencyPage() {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set())
  const [activeScenario, setActiveScenario] = useState(0)

  const toggleItem = (i: number) => {
    setCheckedItems((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  return (
    <div className="relative min-h-screen pt-24 pb-16">
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-red-950/30 to-slate-900 z-0" />
      <div className="fixed top-20 right-20 w-96 h-96 rounded-full bg-red-600/10 blur-3xl z-0 animate-pulse-slow" />

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 mb-6">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-xs font-display font-semibold uppercase tracking-wider">Emergency Resource Center</span>
          </div>
          <h1 className="font-display font-extrabold text-5xl text-white mb-4">Be Prepared</h1>
          <p className="text-slate-400 font-body text-lg max-w-xl mx-auto">
            Know what to do before, during, and after extreme weather events.
          </p>
        </motion.div>

        {/* Emergency contacts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-10"
        >
          <h2 className="font-display font-bold text-xl text-white mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-red-400" />
            Emergency Contacts (India)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {EMERGENCY_CONTACTS.map((c) => (
              <motion.a
                key={c.name}
                href={`tel:${c.number}`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`glass-card p-4 border ${c.bg} flex items-center gap-3 transition-all cursor-pointer`}
              >
                <span className="text-2xl">{c.icon}</span>
                <div>
                  <p className="text-slate-400 text-xs font-body">{c.name}</p>
                  <p className={`font-mono font-bold text-lg ${c.color}`}>{c.number}</p>
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Scenario guides */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-10"
        >
          <h2 className="font-display font-bold text-xl text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-sky-400" />
            Safety Guides by Scenario
          </h2>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {SCENARIOS.map((s, i) => (
              <button
                key={s.title}
                onClick={() => setActiveScenario(i)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-display text-sm font-medium transition-all ${
                  activeScenario === i
                    ? 'bg-white/15 text-white border border-white/20'
                    : 'text-slate-500 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <s.icon className={`w-4 h-4 ${s.color}`} />
                {s.title}
              </button>
            ))}
          </div>

          {/* Scenario content */}
          <motion.div
            key={activeScenario}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`glass-card p-6 bg-gradient-to-br ${SCENARIOS[activeScenario].bg}`}
          >
            <div className="flex items-center gap-3 mb-5">
              {(() => { const Icon = SCENARIOS[activeScenario].icon; return <Icon className={`w-6 h-6 ${SCENARIOS[activeScenario].color}`} /> })()}
              <h3 className="font-display font-bold text-white text-lg">{SCENARIOS[activeScenario].title} — What to Do</h3>
            </div>
            <div className="space-y-3">
              {SCENARIOS[activeScenario].tips.map((tip, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-start gap-3"
                >
                  <span className={`font-display font-bold text-sm ${SCENARIOS[activeScenario].color} flex-shrink-0 mt-0.5`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="text-slate-300 text-sm font-body leading-relaxed">{tip}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Preparedness checklist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="font-display font-bold text-xl text-white mb-4 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-green-400" />
            Emergency Preparedness Checklist
            <span className="text-sm text-slate-500 font-body">({checkedItems.size}/{CHECKLIST.length} done)</span>
          </h2>

          <div className="glass-card p-6">
            {/* Progress bar */}
            <div className="h-2 bg-white/10 rounded-full mb-6 overflow-hidden">
              <motion.div
                animate={{ width: `${(checkedItems.size / CHECKLIST.length) * 100}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-green-500 to-teal-400 rounded-full"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-2.5">
              {CHECKLIST.map((item, i) => (
                <motion.button
                  key={i}
                  onClick={() => toggleItem(i)}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all border ${
                    checkedItems.has(i)
                      ? 'bg-green-950/40 border-green-500/30'
                      : 'bg-white/5 border-white/10 hover:bg-white/8'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center border transition-all ${
                    checkedItems.has(i)
                      ? 'bg-green-500 border-green-500'
                      : 'border-white/30'
                  }`}>
                    {checkedItems.has(i) && <span className="text-white text-xs">✓</span>}
                  </div>
                  <span className={`text-sm font-body ${checkedItems.has(i) ? 'text-green-300 line-through' : 'text-slate-300'}`}>
                    {item}
                  </span>
                </motion.button>
              ))}
            </div>

            {checkedItems.size === CHECKLIST.length && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 text-center p-4 rounded-xl bg-green-950/50 border border-green-500/30"
              >
                <p className="text-green-400 font-display font-bold">✅ You're fully prepared! Stay safe out there.</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
