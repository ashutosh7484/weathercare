import { motion } from 'framer-motion'
import { CloudLightning, Brain, MapPin, Shield, Zap, Heart } from 'lucide-react'

const FEATURES = [
  { icon: Brain, color: 'text-purple-400', bg: 'bg-purple-500/10', title: 'Gemini AI Engine', desc: 'Uses Google Gemini to generate intelligent, context-aware safety advice based on live weather data — not just hardcoded rules.' },
  { icon: MapPin, color: 'text-amber-400', bg: 'bg-amber-500/10', title: 'Hyperlocal Awareness', desc: 'AI considers your exact location — nearby ponds, flood-prone areas, markets, and local geography to give pinpoint safety tips.' },
  { icon: Shield, color: 'text-sky-400', bg: 'bg-sky-500/10', title: 'Multi-Layer Safety', desc: 'Covers precautions, clothing, health, travel, and emergency measures — all in one unified dashboard.' },
  { icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10', title: 'Real-Time Data', desc: 'Powered by OpenWeatherMap API — temperature, wind, UV index, AQI, visibility updated in real time.' },
  { icon: Heart, color: 'text-red-400', bg: 'bg-red-500/10', title: 'Health-Centric Design', desc: 'Special focus on disease risks, respiratory health, heat stroke, dehydration, and mosquito/water-borne illness warnings.' },
  { icon: CloudLightning, color: 'text-teal-400', bg: 'bg-teal-500/10', title: 'Emergency Alerts', desc: 'Color-coded alert system (Red/Yellow/Green) with emergency tips, contacts, and preparedness checklists for severe weather.' },
]

export function AboutPage() {
  return (
    <div className="relative min-h-screen pt-24 pb-16">
      {/* BG */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 z-0" />
      <div className="fixed top-20 right-20 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl z-0" />
      <div className="fixed bottom-20 left-20 w-80 h-80 rounded-full bg-sky-600/10 blur-3xl z-0" />

      <div className="relative z-10 max-w-5xl mx-auto px-4">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 shadow-xl">
              <CloudLightning className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-display font-extrabold text-5xl text-white">WeathCare</h1>
          </div>
          <p className="text-slate-400 text-xl font-body max-w-2xl mx-auto leading-relaxed">
            The weather app that doesn't just tell you the forecast — it tells you{' '}
            <span className="text-sky-400 font-semibold">how to stay safe</span>.
          </p>
        </motion.div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-8 mb-12 text-center"
        >
          <h2 className="font-display font-bold text-2xl text-white mb-4">Our Mission</h2>
          <p className="text-slate-300 font-body text-lg leading-relaxed max-w-3xl mx-auto">
            Most weather apps stop at temperature. WeathCare goes further — using AI to analyze your local 
            geography, current conditions, and health risks to give you advice that is <em>actually useful</em>. 
            Whether you're a daily commuter in Mumbai, a farmer in rural Jharkhand, or a student heading to class 
            in a monsoon — WeathCare has advice built specifically for your situation.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i + 0.3 }}
              className="glass-card glass-card-hover p-6"
            >
              <div className={`p-3 rounded-xl ${f.bg} w-fit mb-4`}>
                <f.icon className={`w-6 h-6 ${f.color}`} />
              </div>
              <h3 className="font-display font-bold text-white text-base mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm font-body leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-8"
        >
          <h2 className="font-display font-bold text-2xl text-white mb-6 text-center">How the AI Works</h2>
          <div className="space-y-4">
            {[
              { step: '01', title: 'Location Detection', desc: 'Auto-detects your GPS coordinates or searches by city name.' },
              { step: '02', title: 'Live Data Fetch', desc: 'Pulls real-time weather from OpenWeatherMap — temp, humidity, wind, UV index, AQI, visibility, forecast.' },
              { step: '03', title: 'Gemini AI Analysis', desc: 'Sends all data + your exact location to Gemini AI, which uses its knowledge of local geography to generate personalized safety advice.' },
              { step: '04', title: 'Hyperlocal Insights', desc: 'AI considers local features (ponds, rivers, markets, roads) and current disease risks (mosquitoes after rain, heat stroke, fog accidents).' },
              { step: '05', title: 'Structured Safety Report', desc: 'Returns a complete safety report: precautions, clothing, health tips, travel score, can-I-go-out verdict, and emergency contacts.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-5 items-start">
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="font-mono font-bold text-sky-400 text-sm">{step}</span>
                </div>
                <div>
                  <h4 className="font-display font-semibold text-white text-base">{title}</h4>
                  <p className="text-slate-400 text-sm font-body mt-1">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tech stack */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        >
          <p className="text-slate-500 text-sm font-body mb-3">Built with</p>
          <div className="flex flex-wrap justify-center gap-2">
            {['React + Vite', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Zustand', 'TanStack Query', 'Recharts', 'Gemini AI', 'OpenWeatherMap'].map((tech) => (
              <span key={tech} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 text-xs font-display">
                {tech}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
