// Gemini AI Service - Personalized, hyperlocal weather safety advice

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY

// Current working free-tier models (April 2026)
// gemini-2.5-flash is primary — fast and free on AI Studio
const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite',
]

function getGeminiUrl(model: string) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`
}

// Simple in-memory cache to avoid hammering the API on every refresh
const aiCache = new Map<string, { data: AIAdvice; ts: number }>()
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export interface AIAdvice {
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Extreme'
  riskScore: number
  safeToGoOut: boolean
  bestTimeToGoOut: string
  summary: string
  precautions: string[]
  clothing: string[]
  healthAdvice: string[]
  travelAdvice: string[]
  emergencyTips: string[]
  localInsights: string[]
  travelSafetyScore: number
  canIGoOutCard: {
    verdict: string
    reason: string
    icon: string
  }
  alerts: Alert[]
}

export interface Alert {
  type: 'danger' | 'caution' | 'info' | 'safe'
  title: string
  message: string
}

export async function getAIWeatherAdvice(params: {
  city: string
  country: string
  lat: number
  lon: number
  temp: number
  feelsLike: number
  humidity: number
  windSpeed: number
  condition: string
  conditionDescription: string
  visibility: number
  uvi?: number
  aqi?: number
  aqiLabel?: string
  pressure: number
  clouds: number
  forecast: string
  timeOfDay: string
  season: string
}): Promise<AIAdvice> {

  const prompt = `You are WeathCare's AI safety advisor. Give HYPERLOCAL, personalized weather safety advice for people in ${params.city}, ${params.country} (lat: ${params.lat}, lon: ${params.lon}).

CURRENT WEATHER:
- Location: ${params.city}, ${params.country}
- Temperature: ${params.temp}°C (Feels like ${params.feelsLike}°C)
- Condition: ${params.condition} (${params.conditionDescription})
- Humidity: ${params.humidity}%
- Wind: ${params.windSpeed} km/h
- Visibility: ${params.visibility} km
- UV Index: ${params.uvi ?? 'N/A'}
- AQI: ${params.aqiLabel ?? 'N/A'}
- Pressure: ${params.pressure} hPa
- Cloud Cover: ${params.clouds}%
- Time of Day: ${params.timeOfDay}
- Season: ${params.season}
- Forecast: ${params.forecast}

CRITICAL INSTRUCTIONS:
1. Use your knowledge of ${params.city}'s REAL local geography — rivers, ponds, lakes, flood-prone areas, crowded markets, industrial zones, altitude, coastal/inland nature.
2. For ${params.city} specifically: mention real local risks (e.g. if monsoon rain, warn about local waterlogging areas, mosquito breeding in stagnant ponds/drains, leptospirosis from floodwater).
3. Consider local transport context — auto-rickshaws, two-wheelers, street vendors, outdoor laborers.
4. Give SPECIFIC, ACTIONABLE advice — not generic tips.
5. localInsights MUST be specific to ${params.city}, not generic advice.

Respond ONLY with valid JSON (no markdown, no explanation):
{
  "riskLevel": "Low",
  "riskScore": 25,
  "safeToGoOut": true,
  "bestTimeToGoOut": "Early morning 6-9 AM or evening after 6 PM",
  "summary": "2-3 sentence summary specific to ${params.city} today",
  "precautions": ["precaution 1", "precaution 2", "precaution 3", "precaution 4", "precaution 5"],
  "clothing": ["clothing tip 1", "clothing tip 2", "clothing tip 3"],
  "healthAdvice": ["health tip 1", "health tip 2", "health tip 3", "health tip 4"],
  "travelAdvice": ["travel tip 1", "travel tip 2", "travel tip 3"],
  "emergencyTips": ["emergency tip 1", "emergency tip 2", "emergency tip 3"],
  "localInsights": ["hyperlocal insight specific to ${params.city}", "local disease/mosquito/flood risk if applicable", "local transport or road specific tip"],
  "travelSafetyScore": 8,
  "canIGoOutCard": {
    "verdict": "Go Out with Caution",
    "reason": "One clear reason specific to current conditions",
    "icon": "🌤️"
  },
  "alerts": [
    {"type": "safe", "title": "✅ Conditions OK", "message": "Brief alert message"}
  ]
}`

  // ── In-memory cache: reuse AI advice for same city for 10 minutes ──
  const cacheKey = `${params.city}-${params.condition}-${params.temp}`
  const cached = aiCache.get(cacheKey)
  if (cached && Date.now() - cached.ts < 10 * 60 * 1000) {
    console.log(`[WeathCare] ✅ Returning cached AI advice for ${params.city}`)
    return cached.data
  }

  // Try each model — stop at first success, no spam retries
  for (const model of GEMINI_MODELS) {
    try {
      console.log(`[WeathCare] Trying Gemini model: ${model}`)

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15000) // 15s timeout

      const response = await fetch(getGeminiUrl(model), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000,
          },
        }),
      })
      clearTimeout(timeout)

      // 429 = rate limit, 503 = overloaded — skip to next model
      if (response.status === 429 || response.status === 503) {
        console.warn(`[WeathCare] Model ${model} busy (${response.status}), trying next...`)
        await sleep(1000) // brief pause before next attempt
        continue
      }

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}))
        console.warn(`[WeathCare] Model ${model} failed ${response.status}:`, errBody)
        continue
      }

      const data = await response.json()

      if (data.candidates?.[0]?.finishReason === 'SAFETY') {
        console.warn(`[WeathCare] Model ${model} blocked by safety filters`)
        continue
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text
      if (!text) {
        console.warn(`[WeathCare] Model ${model} returned empty text`)
        continue
      }

      console.log(`[WeathCare] Got response from ${model}, length: ${text.length}`)

      // Extract JSON — works even if Gemini wraps it in ```json fences
      const firstBrace = text.indexOf('{')
      const lastBrace = text.lastIndexOf('}')

      if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
        console.warn(`[WeathCare] No JSON found in response`)
        continue
      }

      const parsed = JSON.parse(text.slice(firstBrace, lastBrace + 1)) as AIAdvice
      
      // Cache successful result
      aiCache.set(cacheKey, { data: parsed, ts: Date.now() })
      
      console.log(`[WeathCare] ✅ AI advice loaded from ${model} for ${params.city}`)
      return parsed

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.warn(`[WeathCare] Model ${model} timed out`)
      } else {
        console.warn(`[WeathCare] Model ${model} error:`, error.message)
      }
      continue
    }
  }

  console.warn('[WeathCare] All Gemini models unavailable — using smart fallback')
  return getFallbackAdvice(params)
}

// Fallback rule-based system when AI fails
function getFallbackAdvice(params: {
  temp: number
  feelsLike?: number
  humidity: number
  windSpeed: number
  condition: string
  visibility: number
  uvi?: number
  city: string
}): AIAdvice {
  const { temp, humidity, windSpeed, condition, visibility, uvi, city } = params
  const isStorm = condition.toLowerCase().includes('storm') || condition.toLowerCase().includes('thunder')
  const isRain = condition.toLowerCase().includes('rain') || condition.toLowerCase().includes('drizzle')
  const isFog = condition.toLowerCase().includes('fog') || condition.toLowerCase().includes('mist')
  const isSnow = condition.toLowerCase().includes('snow')
  const isHot = temp >= 38
  const isCold = temp <= 10
  const isHighWind = windSpeed > 50
  const isLowVis = visibility < 2

  let riskLevel: AIAdvice['riskLevel'] = 'Low'
  let riskScore = 20
  let safeToGoOut = true

  if (isStorm || isHighWind) { riskLevel = 'Extreme'; riskScore = 90; safeToGoOut = false }
  else if (isRain || isFog || isHot || isLowVis) { riskLevel = 'Moderate'; riskScore = 55; safeToGoOut = true }
  else if (humidity > 80 || (uvi ?? 0) > 8) { riskLevel = 'High'; riskScore = 70; safeToGoOut = false }

  const precautions: string[] = []
  const healthAdvice: string[] = []
  const clothing: string[] = []
  const travelAdvice: string[] = []
  const emergencyTips: string[] = []
  const localInsights: string[] = []
  const alerts: Alert[] = []

  if (isStorm) {
    precautions.push('Stay indoors immediately', 'Unplug electronic devices', 'Avoid open areas and trees', 'Do not use water during lightning', 'Keep emergency kit ready')
    healthAdvice.push('Do not use landline phones during lightning', 'Keep emergency numbers ready', 'Stay away from windows', 'Avoid metal objects')
    clothing.push('Wear waterproof jacket', 'Avoid metal accessories', 'Keep dry clothes ready')
    travelAdvice.push('Cancel all non-essential travel', 'If driving, pull over safely', 'Avoid underpasses and low roads')
    emergencyTips.push('Identify the nearest shelter', 'Call emergency services: 112', 'Keep phone charged')
    localInsights.push(`After the storm, stagnant water near ponds and drains in ${city} will breed mosquitoes — use repellent`, 'Avoid walking near electrical poles or trees after storm')
    alerts.push({ type: 'danger', title: '⚡ Thunderstorm Warning', message: 'Severe storm detected. Stay indoors immediately.' })
  } else if (isRain) {
    precautions.push('Carry an umbrella or raincoat', 'Avoid waterlogged streets', 'Watch for slippery surfaces', 'Check drain covers while walking', 'Avoid touching electrical poles')
    healthAdvice.push('Avoid wading through flood water', `Risk of leptospirosis from contaminated water in ${city}`, 'Wash hands frequently', 'Avoid street food during heavy rain')
    clothing.push('Wear waterproof footwear', 'Carry a change of clothes', 'Light rain jacket recommended')
    travelAdvice.push('Allow extra travel time', 'Two-wheelers: reduce speed significantly', 'Avoid low-lying roads that flood easily')
    emergencyTips.push('Know your nearest high ground', 'Keep phone charged', 'Identify flood evacuation routes')
    localInsights.push(
      `Rain in ${city} causes stagnant water to collect near ponds, open drains, and low-lying areas — mosquito breeding risk is HIGH`,
      'Waterlogged roads near markets and residential areas can be slippery for two-wheelers',
      'Risk of dengue and malaria rises after continuous rain — use mosquito repellent and nets'
    )
    alerts.push({ type: 'caution', title: '🌧️ Rain Advisory', message: 'Wet and slippery conditions. Drive carefully and avoid waterlogged areas.' })
  } else if (isHot) {
    precautions.push('Stay hydrated — drink water every hour', 'Avoid direct sunlight between 11am–4pm', 'Use sunscreen SPF 50+', 'Take breaks in shaded areas', 'Never leave children in parked vehicles')
    healthAdvice.push('Risk of heat stroke — watch for dizziness', 'Wear UV-protective sunglasses', 'Eat light meals', 'Avoid alcohol and caffeinated drinks')
    clothing.push('Wear light-colored cotton clothes', 'Cover head with cap or scarf', 'Avoid dark colors that absorb heat')
    travelAdvice.push('Plan travel for early morning or evening', 'Keep water in vehicle', 'Check vehicle cooling system')
    emergencyTips.push('Heat stroke first aid: move to shade, apply cold water', 'Emergency: 108', 'Know the nearest hospital')
    localInsights.push(`High heat in ${city} increases dehydration risk for outdoor workers, auto-rickshaw drivers, and street vendors`, 'Street food spoils faster in extreme heat — eat from hygienic sources only')
    alerts.push({ type: 'caution', title: '🌡️ Extreme Heat', message: 'Heat advisory in effect. Avoid midday sun and stay hydrated.' })
  } else if (isFog || isLowVis) {
    precautions.push('Use fog lights while driving', 'Reduce vehicle speed significantly', 'Maintain safe following distance', 'Do not overtake in fog', 'Use horn at intersections')
    travelAdvice.push('Avoid highway driving', 'Allow 30+ extra minutes for travel', 'Prefer public transport today')
    clothing.push('Wear visible/bright clothing', 'Carry a reflective element', 'Keep warm if temperature is low')
    healthAdvice.push('Fog may worsen respiratory conditions', 'People with asthma: carry inhaler', 'Avoid outdoor exercise in dense fog')
    localInsights.push('Low visibility increases road accident risk near busy junctions and crossings', 'Pedestrians: stay on footpaths and use designated crossings only')
    alerts.push({ type: 'caution', title: '🌫️ Dense Fog', message: 'Visibility severely reduced. Travel with extreme caution.' })
  } else if (isSnow) {
    riskLevel = 'High'; riskScore = 65; safeToGoOut = false
    alerts.push({ type: 'caution', title: '❄️ Snowfall Alert', message: `Snow reported in ${city}. Roads may be slippery.` })
    precautions.push('Avoid driving unless absolutely necessary', 'Wear non-slip footwear', 'Keep body covered fully', 'Watch for black ice on roads', 'Check on elderly neighbours')
    clothing.push('Heavy winter coat, gloves, and thermal layers', 'Waterproof snow boots essential', 'Cover ears and neck — frostbite risk')
    healthAdvice.push('Hypothermia risk — limit time outdoors', 'Keep children and elderly indoors', 'Stay dry — wet clothes accelerate heat loss', 'Hot drinks help maintain body temperature')
    travelAdvice.push('Delay travel until roads are cleared', 'If driving: slow down and increase following distance', 'Public transport may be delayed — check updates')
    localInsights.push(`Snow in ${city} is unusual — local infrastructure may not be prepared`, 'Road salt and gritting may be limited — walk carefully')
  } else if (isCold) {
    riskLevel = 'Moderate'; riskScore = 40; safeToGoOut = true
    alerts.push({ type: 'info', title: '🧊 Cold Weather Advisory', message: `Temperature is low in ${city}. Layer up before heading out.` })
    precautions.push('Wear warm layers before stepping out', 'Protect extremities — gloves and scarf recommended', 'Avoid prolonged exposure to cold wind', 'Keep children and elderly warm indoors', 'Check on vulnerable neighbours')
    clothing.push('Thermal inner layer + sweater + outer jacket', 'Warm socks and closed shoes', 'Scarf, gloves, and beanie if windy')
    healthAdvice.push('Cold air can trigger asthma — carry inhaler', 'Risk of joint pain in cold weather', 'Wash hands frequently to avoid cold and flu', 'Stay hydrated — cold weather masks thirst')
    travelAdvice.push('Roads may be slippery if temperature drops below 5°C', 'Allow extra warm-up time for vehicles', 'Two-wheelers: wear windproof riding gear')
    localInsights.push(`Cold mornings in ${city} — air quality may be affected by heating smoke and reduced circulation`, 'Outdoor vendors and workers are at higher risk — carry warm drinks if possible')
  } else if (temp >= 30 && temp < 38) {
    // Warm but not dangerously hot
    riskLevel = 'Low'; riskScore = 30; safeToGoOut = true
    alerts.push({ type: 'info', title: '🌤️ Warm Day', message: `Warm conditions in ${city} today. Stay hydrated.` })
    precautions.push(`Stay hydrated — carry water when outdoors in ${city}`, 'Apply sunscreen SPF 30+ before going out', 'Avoid peak sun hours between 12pm and 3pm', 'Wear breathable clothing', 'Take breaks in shaded areas')
    clothing.push('Light cotton or linen clothes in light colours', 'Sunglasses and a cap or hat', 'Comfortable breathable footwear')
    healthAdvice.push('Drink at least 2–3 litres of water today', 'Avoid heavy or oily meals in the heat', 'Watch for early signs of heat exhaustion: dizziness, nausea', 'Children and elderly need extra care in warm weather')
    travelAdvice.push('Best travel times: early morning or after 5pm', 'Keep water in your vehicle', 'Check tyre pressure — heat affects tyre inflation')
    localInsights.push(`Warm weather in ${city} means street food quality degrades faster — eat from hygienic sources`, 'Outdoor workers like construction labourers and delivery personnel are at dehydration risk')
  } else if (temp >= 20 && temp < 30) {
    // Pleasant mild
    riskLevel = 'Low'; riskScore = 15; safeToGoOut = true
    alerts.push({ type: 'safe', title: '✅ Pleasant Conditions', message: `Great weather in ${city} today. Enjoy it safely.` })
    precautions.push('Great day to be outdoors — stay aware of changing conditions', 'Carry a light jacket for evening when it gets cooler', 'Stay hydrated even when it feels comfortable', 'Use sunscreen if outdoors for extended periods', 'Check evening forecast before late outings')
    clothing.push('Light to medium layers work well', 'Comfortable casual clothing for most activities', 'A light jacket for mornings and evenings')
    healthAdvice.push('Ideal conditions for outdoor exercise — go for it!', 'Good air quality likely — great for morning runs', 'Mental health boost from spending time outdoors in pleasant weather', 'Stay hydrated even though it does not feel hot')
    travelAdvice.push(`Good day for travel in and around ${city}`, 'Roads should be clear — a great day for a trip', 'Consider walking or cycling for short distances')
    localInsights.push(`Mild and comfortable conditions make this one of the best days to explore ${city}`, 'Local parks, markets, and outdoor areas will be busy — plan accordingly')
  } else {
    // Default fallback for any edge case
    alerts.push({ type: 'safe', title: '✅ Conditions OK', message: `Weather in ${city} is manageable today.` })
    precautions.push('Carry a water bottle', 'Check the forecast before heading out', 'Dress appropriately for the temperature', 'Keep phone charged', 'Stay aware of weather updates')
    clothing.push('Dress in layers to adapt to changing conditions', 'Comfortable footwear recommended', 'Carry an umbrella just in case')
    healthAdvice.push('Stay hydrated throughout the day', 'Take breaks if spending time outdoors', 'Check air quality index before exercising outside')
    travelAdvice.push(`Roads in ${city} should be manageable today`, 'Allow buffer time for unexpected delays', 'Keep emergency contacts handy')
    localInsights.push(`Stay updated with local weather alerts for ${city}`, 'Weather conditions can change — check forecast regularly')
  }

  return {
    riskLevel,
    riskScore,
    safeToGoOut,
    bestTimeToGoOut: isStorm || isHighWind
      ? 'Not recommended — stay indoors'
      : isHot
      ? 'Early morning (6–9 AM) or after 6 PM'
      : isCold || isSnow
      ? 'Midday (11 AM–2 PM) when temperatures are highest'
      : temp >= 30
      ? 'Early morning or evening to avoid peak heat'
      : 'Any time — conditions are favourable',
    summary: `${city} is currently experiencing ${condition.toLowerCase()} at ${temp}°C (feels like ${params.feelsLike ?? temp}°C). Humidity is ${humidity}% with winds at ${windSpeed} km/h. ${safeToGoOut ? 'Conditions are manageable — take the listed precautions before heading out.' : 'It is advisable to stay indoors until conditions improve.'}`,
    precautions,
    clothing,
    healthAdvice,
    travelAdvice,
    emergencyTips: emergencyTips.length ? emergencyTips : ['Keep phone charged at all times', 'Note local emergency contacts', 'Inform family of travel plans'],
    localInsights,
    travelSafetyScore: Math.max(1, Math.round(10 - riskScore / 10)),
    canIGoOutCard: {
      verdict: safeToGoOut ? (riskLevel === 'Moderate' ? 'Go Out with Caution' : 'Go Out Freely') : 'Stay Indoors',
      reason: isStorm ? 'Severe storm conditions make it unsafe' : isRain ? 'Slippery and wet roads' : isHot ? 'Dangerous heat levels' : isFog ? 'Very low visibility' : 'Conditions are favorable',
      icon: isStorm ? '⛈️' : isRain ? '🌧️' : isHot ? '☀️' : isFog ? '🌫️' : '✅',
    },
    alerts,
  }
}