'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useTheme } from 'next-themes'

// ============================================
// SEASON DATA - India Seasons
// ============================================
const seasons = {
  summer: {
    name: 'Summer',
    months: [3, 4, 5], // March, April, May
    icon: '☀️',
    emoji: '🌞',
    color: 'from-orange-500 to-yellow-500',
    bgDark: 'from-orange-950 via-yellow-950 to-amber-950',
    bgLight: 'from-orange-50 via-yellow-50 to-amber-50',
    borderColor: 'border-orange-500/30',
    textColor: 'text-orange-400',
    description: 'Hot and dry season. Stay cool and hydrated!',
    commonProblems: [
      { icon: '🌡️', name: 'Heat Stroke', risk: 'HIGH' },
      { icon: '💧', name: 'Dehydration', risk: 'HIGH' },
      { icon: '😎', name: 'Sunburn', risk: 'HIGH' },
      { icon: '🤢', name: 'Food Poisoning', risk: 'MEDIUM' },
      { icon: '😴', name: 'Fatigue', risk: 'MEDIUM' },
      { icon: '🔴', name: 'Prickly Heat', risk: 'MEDIUM' },
      { icon: '👁️', name: 'Eye Infection', risk: 'LOW' },
      { icon: '🦟', name: 'Insect Bites', risk: 'LOW' },
    ],
    doThis: [
      '💧 Drink 3-4 liters water daily',
      '🥤 Have coconut water, lemon water, buttermilk',
      '🌿 Eat cooling foods (cucumber, watermelon, mint)',
      '👕 Wear light cotton clothes',
      '🕐 Stay indoors 12pm-4pm',
      '🧴 Apply sunscreen SPF 30+',
      '😴 Take afternoon rest if possible',
      '🌡️ Check on elderly and children',
    ],
    avoidThis: [
      '🚫 Direct sun between 12-4pm',
      '🚫 Heavy oily spicy food',
      '🚫 Excess tea and coffee',
      '🚫 Alcohol (dehydrates)',
      '🚫 Street food (spoils fast)',
      '🚫 Strenuous outdoor exercise',
    ],
    eatThis: [
      { food: '🍉 Watermelon', reason: 'Hydration + cooling' },
      { food: '🥒 Cucumber', reason: 'Cooling + hydrating' },
      { food: '🥛 Buttermilk (Chaas)', reason: 'Probiotics + cooling' },
      { food: '🥭 Raw Mango (Aamras)', reason: 'Prevents heat stroke' },
      { food: '🌿 Mint (Pudina)', reason: 'Natural coolant' },
      { food: '🥥 Coconut Water', reason: 'Electrolytes' },
      { food: '🍋 Lemon Water', reason: 'Vitamin C + hydration' },
      { food: '🧅 Onion', reason: 'Prevents heat stroke' },
    ],
    remedies: [
      {
        problem: 'Heat Stroke Prevention',
        remedy: 'Raw onion paste on pulse points + eat onion daily',
        icon: '🌡️',
      },
      {
        problem: 'Prickly Heat Rash',
        remedy: 'Sandalwood powder + rose water paste on affected area',
        icon: '🔴',
      },
      {
        problem: 'Sunburn',
        remedy: 'Refrigerated aloe vera gel + cold cucumber slices',
        icon: '☀️',
      },
      {
        problem: 'Dehydration',
        remedy: 'ORS or 1L water + 6 tsp sugar + 1/2 tsp salt',
        icon: '💧',
      },
    ],
    tip: 'Keep a bottle of water with you everywhere this summer! 💧',
  },

  monsoon: {
    name: 'Monsoon',
    months: [6, 7, 8, 9], // June to September
    icon: '🌧️',
    emoji: '⛈️',
    color: 'from-blue-500 to-cyan-500',
    bgDark: 'from-blue-950 via-cyan-950 to-teal-950',
    bgLight: 'from-blue-50 via-cyan-50 to-teal-50',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-400',
    description: 'Rainy season. High risk of infections!',
    commonProblems: [
      { icon: '🦟', name: 'Dengue / Malaria', risk: 'HIGH' },
      { icon: '🤒', name: 'Viral Fever', risk: 'HIGH' },
      { icon: '🤧', name: 'Cold & Flu', risk: 'HIGH' },
      { icon: '🤮', name: 'Food Poisoning', risk: 'HIGH' },
      { icon: '🍄', name: 'Fungal Infection', risk: 'MEDIUM' },
      { icon: '😷', name: 'Cholera/Typhoid', risk: 'MEDIUM' },
      { icon: '🦠', name: 'Leptospirosis', risk: 'MEDIUM' },
      { icon: '🤢', name: 'Stomach Infections', risk: 'HIGH' },
    ],
    doThis: [
      '🚰 Drink only boiled or filtered water',
      '🦟 Use mosquito nets and repellent',
      '👟 Keep feet dry (change wet socks)',
      '🌿 Eat immunity boosting foods',
      '🏠 Keep surroundings clean and dry',
      '🧴 Use antifungal powder in skin folds',
      '🥘 Eat freshly cooked hot food only',
      '💊 Keep ORS sachets at home',
    ],
    avoidThis: [
      '🚫 Street food and outside food',
      '🚫 Standing water near home',
      '🚫 Walking in flood water',
      '🚫 Raw salads outside',
      '🚫 Stored cut fruits',
      '🚫 Swimming in lakes/rivers',
    ],
    eatThis: [
      { food: '🫚 Turmeric', reason: 'Anti-viral + immunity' },
      { food: '🧄 Garlic', reason: 'Natural antibiotic' },
      { food: '🫚 Ginger', reason: 'Anti-nausea + immunity' },
      { food: '🌿 Tulsi Tea', reason: 'Fights viral infections' },
      { food: '🍵 Hot soups', reason: 'Immunity + warmth' },
      { food: '🥘 Khichdi', reason: 'Easy to digest' },
      { food: '🫙 Probiotics (curd)', reason: 'Gut immunity' },
      { food: '🍋 Vitamin C foods', reason: 'Immunity boost' },
    ],
    remedies: [
      {
        problem: 'Viral Fever',
        remedy: 'Tulsi + ginger + black pepper tea with honey, 3x daily',
        icon: '🌡️',
      },
      {
        problem: 'Mosquito Repellent',
        remedy: 'Neem oil + coconut oil mix on exposed skin',
        icon: '🦟',
      },
      {
        problem: 'Fungal Infection',
        remedy: 'Tea tree oil + coconut oil on affected area, keep dry',
        icon: '🍄',
      },
      {
        problem: 'Cold & Flu',
        remedy: 'Steam inhalation with eucalyptus + turmeric milk at night',
        icon: '🤧',
      },
    ],
    tip: 'Boil your water, avoid street food this monsoon! Stay safe! 🌧️',
  },

  autumn: {
    name: 'Post-Monsoon',
    months: [10, 11], // October, November
    icon: '🍂',
    emoji: '🌤️',
    color: 'from-amber-500 to-orange-500',
    bgDark: 'from-amber-950 via-orange-950 to-red-950',
    bgLight: 'from-amber-50 via-orange-50 to-red-50',
    borderColor: 'border-amber-500/30',
    textColor: 'text-amber-400',
    description: 'Transition season. Body adjusting to change!',
    commonProblems: [
      { icon: '🤧', name: 'Seasonal Allergies', risk: 'HIGH' },
      { icon: '😷', name: 'Respiratory Issues', risk: 'MEDIUM' },
      { icon: '🦟', name: 'Dengue (late)', risk: 'MEDIUM' },
      { icon: '🤒', name: 'Viral Fever', risk: 'MEDIUM' },
      { icon: '😴', name: 'Fatigue', risk: 'LOW' },
      { icon: '🌿', name: 'Skin Dryness', risk: 'LOW' },
    ],
    doThis: [
      '🌿 Boost immunity with herbs',
      '💧 Continue good hydration',
      '🧥 Layer clothing for temperature changes',
      '🏃 Resume outdoor exercise',
      '🥗 Eat seasonal vegetables',
      '😴 Maintain good sleep schedule',
    ],
    avoidThis: [
      '🚫 Sudden exposure to cold',
      '🚫 Still waters (dengue risk)',
      '🚫 Skipping meals',
      '🚫 Excess cold drinks',
    ],
    eatThis: [
      { food: '🎃 Pumpkin', reason: 'Immunity + vitamin A' },
      { food: '🍠 Sweet Potato', reason: 'Energy + vitamins' },
      { food: '🥕 Carrots', reason: 'Eye health + immunity' },
      { food: '🍎 Apples', reason: 'Gut health + immunity' },
      { food: '🫚 Ginger', reason: 'Anti-inflammatory' },
      { food: '🌿 Tulsi', reason: 'Immunity boost' },
    ],
    remedies: [
      {
        problem: 'Seasonal Allergies',
        remedy: 'Turmeric + honey + warm water in morning daily',
        icon: '🤧',
      },
      {
        problem: 'Dry Skin',
        remedy: 'Coconut oil massage before bath daily',
        icon: '🌿',
      },
    ],
    tip: 'Perfect time to reset your health routine! 🍂',
  },

  winter: {
    name: 'Winter',
    months: [12, 1, 2], // Dec, Jan, Feb
    icon: '❄️',
    emoji: '🌨️',
    color: 'from-sky-500 to-indigo-500',
    bgDark: 'from-sky-950 via-indigo-950 to-blue-950',
    bgLight: 'from-sky-50 via-indigo-50 to-blue-50',
    borderColor: 'border-sky-500/30',
    textColor: 'text-sky-400',
    description: 'Cold season. Keep warm and boost immunity!',
    commonProblems: [
      { icon: '🤧', name: 'Cold & Flu', risk: 'HIGH' },
      { icon: '😷', name: 'Cough', risk: 'HIGH' },
      { icon: '🤒', name: 'Fever', risk: 'MEDIUM' },
      { icon: '🦴', name: 'Joint Pain', risk: 'HIGH' },
      { icon: '🧴', name: 'Dry Skin', risk: 'HIGH' },
      { icon: '😔', name: 'Winter Blues', risk: 'MEDIUM' },
      { icon: '💤', name: 'Low Energy', risk: 'MEDIUM' },
      { icon: '💆', name: 'Headache', risk: 'LOW' },
    ],
    doThis: [
      '🧥 Layer up properly',
      '☀️ Get morning sunlight (Vitamin D)',
      '🌿 Eat warming foods',
      '💧 Stay hydrated (easy to forget in winter)',
      '🏃 Exercise indoors',
      '😴 Sleep early, wake with sunrise',
      '🛁 Warm water bath (not too hot)',
      '🧴 Moisturize skin daily',
    ],
    avoidThis: [
      '🚫 Cold water bath',
      '🚫 Going out without jacket',
      '🚫 Cold drinks and ice cream',
      '🚫 Skipping breakfast',
      '🚫 Excess alcohol (false warmth)',
    ],
    eatThis: [
      { food: '🧄 Garlic', reason: 'Natural antibiotic + warming' },
      { food: '🫚 Ginger Tea', reason: 'Warming + immunity' },
      { food: '🍯 Honey', reason: 'Soothes throat + immunity' },
      { food: '🌰 Dry Fruits', reason: 'Energy + warmth' },
      { food: '🥛 Turmeric Milk', reason: 'Immunity + anti-inflammatory' },
      { food: '🫘 Sesame (Til)', reason: 'Warming + iron' },
      { food: '🥘 Warm Soups', reason: 'Immunity + comfort' },
      { food: '🫚 Mustard Oil', reason: 'Warming massage oil' },
    ],
    remedies: [
      {
        problem: 'Cold & Flu',
        remedy: 'Ginger + tulsi + honey tea 3x daily + steam inhalation',
        icon: '🤧',
      },
      {
        problem: 'Joint Pain',
        remedy: 'Warm mustard oil massage + turmeric milk before bed',
        icon: '🦴',
      },
      {
        problem: 'Dry Skin',
        remedy: 'Coconut oil + few drops almond oil massage before bath',
        icon: '🧴',
      },
      {
        problem: 'Low Energy',
        remedy: 'Dates + milk + ashwagandha drink every morning',
        icon: '💤',
      },
    ],
    tip: 'Morning sunlight is FREE Vitamin D! Get 15 mins daily! ☀️',
  },
}

// ============================================
// GET CURRENT SEASON
// ============================================
function getCurrentSeason() {
  const month = new Date().getMonth() + 1
  for (const [key, season] of Object.entries(seasons)) {
    if (season.months.includes(month)) return { key, ...season }
  }
  return { key: 'summer', ...seasons.summer }
}

// Risk badge color
function getRiskColor(risk: string) {
  if (risk === 'HIGH') return 'bg-red-500/20 text-red-400 border-red-500/30'
  if (risk === 'MEDIUM') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
  return 'bg-green-500/20 text-green-400 border-green-500/30'
}

// ============================================
// MAIN PAGE
// ============================================
export default function SeasonalPage() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [selectedSeason, setSelectedSeason] = useState<string>('')
  const [activeTab, setActiveTab] = useState('problems')

  const isDark = theme === 'dark'

  useEffect(() => {
    setMounted(true)
    const current = getCurrentSeason()
    setSelectedSeason(current.key)
  }, [])

  if (!mounted) return null

  const currentSeason = seasons[selectedSeason as keyof typeof seasons] || seasons.summer
  const isCurrentSeason = getCurrentSeason().key === selectedSeason

  const tabs = [
    { id: 'problems', label: '⚠️ Problems', },
    { id: 'do', label: '✅ Do This', },
    { id: 'eat', label: '🥗 Eat This', },
    { id: 'remedies', label: '🌿 Remedies', },
  ]

  return (
    <div className={`min-h-screen ${isDark
      ? `bg-gradient-to-br ${currentSeason.bgDark}`
      : `bg-gradient-to-br ${currentSeason.bgLight}`}`}>

      {/* HEADER */}
      <nav className={`sticky top-0 z-30 backdrop-blur-xl border-b
                      ${isDark ? 'bg-black/30 border-white/10' : 'bg-white/70 border-gray-200'}`}>
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link href="/home">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2 rounded-lg transition-all
                           ${isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                ← Back
              </motion.button>
            </Link>
            <div>
              <h1 className={`font-black text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Seasonal Health Guide
              </h1>
              <p className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                Stay healthy every season 🌿
              </p>
            </div>
          </div>

          {/* Current season badge */}
          {isCurrentSeason && (
            <div className={`px-3 py-1.5 rounded-full text-xs font-bold
                            bg-gradient-to-r ${currentSeason.color} text-white`}>
              Current Season
            </div>
          )}
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Season Selector */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {Object.entries(seasons).map(([key, season]) => (
            <motion.button
              key={key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedSeason(key)}
              className={`p-3 rounded-2xl border text-center transition-all
                         ${selectedSeason === key
                           ? `bg-gradient-to-br ${season.color} text-white border-transparent shadow-lg`
                           : isDark
                             ? 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                             : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <div className="text-2xl mb-1">{season.icon}</div>
              <div className="text-xs font-bold">{season.name}</div>
              {getCurrentSeason().key === key && (
                <div className="text-xs mt-1 opacity-80">● Now</div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Season Header Card */}
        <motion.div
          key={selectedSeason}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-3xl mb-6 bg-gradient-to-br ${currentSeason.color}
                      text-white relative overflow-hidden`}
        >
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-3">
              <span className="text-5xl">{currentSeason.emoji}</span>
              <div>
                <h2 className="text-3xl font-black">{currentSeason.name}</h2>
                <p className="text-white/80 text-sm">{currentSeason.description}</p>
              </div>
            </div>

            {/* Tip */}
            <div className="bg-white/15 rounded-2xl p-3 mt-3">
              <p className="text-sm font-medium">💡 {currentSeason.tip}</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {tabs.map(tab => (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold
                         transition-all border
                         ${activeTab === tab.id
                           ? `bg-gradient-to-r ${currentSeason.color} text-white border-transparent shadow-md`
                           : isDark
                             ? 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                             : 'bg-white border-gray-200 text-gray-600'}`}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">

          {/* PROBLEMS TAB */}
          {activeTab === 'problems' && (
            <motion.div
              key="problems"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h3 className={`text-lg font-black mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Common Health Problems This Season
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {currentSeason.commonProblems.map((problem, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className={`p-4 rounded-2xl border
                               ${isDark
                                 ? 'bg-white/5 border-white/10'
                                 : 'bg-white border-gray-100 shadow-sm'}`}
                  >
                    <div className="text-3xl mb-2">{problem.icon}</div>
                    <div className={`text-sm font-bold mb-2
                                    ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {problem.name}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full border font-bold
                                     ${getRiskColor(problem.risk)}`}>
                      {problem.risk} RISK
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Chat CTA */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className={`mt-6 p-5 rounded-2xl border text-center
                           ${isDark
                             ? 'bg-white/5 border-white/10'
                             : 'bg-white border-gray-100 shadow-sm'}`}
              >
                <p className={`text-sm mb-3 ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
                  Have any of these symptoms?
                </p>
                <Link href="/chat">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-6 py-3 rounded-full font-bold text-sm text-white
                               bg-gradient-to-r ${currentSeason.color} shadow-lg`}
                  >
                    Chat with AI for Remedies →
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>
          )}

          {/* DO THIS TAB */}
          {activeTab === 'do' && (
            <motion.div
              key="do"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h3 className={`text-lg font-black mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ✅ Do This This Season
              </h3>
              <div className="space-y-3 mb-6">
                {currentSeason.doThis.map((tip, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`flex items-center gap-3 p-4 rounded-2xl border
                               ${isDark
                                 ? 'bg-white/5 border-white/10'
                                 : 'bg-white border-gray-100 shadow-sm'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center
                                    flex-shrink-0 text-sm font-bold text-white
                                    bg-gradient-to-br ${currentSeason.color}`}>
                      ✓
                    </div>
                    <p className={`text-sm font-medium ${isDark ? 'text-white/90' : 'text-gray-800'}`}>
                      {tip}
                    </p>
                  </motion.div>
                ))}
              </div>

              <h3 className={`text-lg font-black mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                🚫 Avoid This Season
              </h3>
              <div className="space-y-3">
                {currentSeason.avoidThis.map((tip, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`flex items-center gap-3 p-4 rounded-2xl border
                               ${isDark
                                 ? 'bg-red-900/20 border-red-900/30'
                                 : 'bg-red-50 border-red-100'}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center
                                    justify-center flex-shrink-0 text-red-400 font-bold text-sm">
                      ✕
                    </div>
                    <p className={`text-sm font-medium ${isDark ? 'text-red-200' : 'text-red-800'}`}>
                      {tip}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* EAT THIS TAB */}
          {activeTab === 'eat' && (
            <motion.div
              key="eat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h3 className={`text-lg font-black mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                🥗 Best Foods This Season
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {currentSeason.eatThis.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`flex items-center justify-between p-4 rounded-2xl border
                               ${isDark
                                 ? 'bg-white/5 border-white/10'
                                 : 'bg-white border-gray-100 shadow-sm'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.food.split(' ')[0]}</span>
                      <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {item.food.split(' ').slice(1).join(' ')}
                      </span>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full
                                     ${isDark
                                       ? 'bg-white/10 text-white/60'
                                       : 'bg-gray-100 text-gray-600'}`}>
                      {item.reason}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* REMEDIES TAB */}
          {activeTab === 'remedies' && (
            <motion.div
              key="remedies"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h3 className={`text-lg font-black mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                🌿 Quick Seasonal Remedies
              </h3>
              <div className="space-y-4">
                {currentSeason.remedies.map((remedy, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`p-5 rounded-2xl border
                               ${isDark
                                 ? 'bg-white/5 border-white/10'
                                 : 'bg-white border-gray-100 shadow-sm'}`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{remedy.icon}</span>
                      <div>
                        <h4 className={`font-black text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {remedy.problem}
                        </h4>
                      </div>
                    </div>
                    <div className={`p-3 rounded-xl text-sm
                                    ${isDark
                                      ? 'bg-white/5 text-white/80'
                                      : 'bg-gray-50 text-gray-700'}`}>
                      🌿 {remedy.remedy}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* AI Chat CTA */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className={`mt-6 p-5 rounded-2xl border text-center
                           ${isDark
                             ? 'bg-white/5 border-white/10'
                             : 'bg-white border-gray-100'}`}
              >
                <p className={`text-sm mb-3 ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
                  Need more personalized remedies?
                </p>
                <Link href="/chat">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-6 py-3 rounded-full font-bold text-sm text-white
                               bg-gradient-to-r ${currentSeason.color} shadow-lg`}
                  >
                    Ask AI for Personalized Help →
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}