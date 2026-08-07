export type SymptomInfo = {
  slug: string
  icon: string
  name: string
  name_te?: string
  name_hi?: string
  shortDesc: string
  fullDesc: string
  causes: string[]
  remedies: {
    title: string
    description: string
    ingredients?: string[]
    steps?: string[]
  }[]
  foods: {
    eat: string[]
    avoid: string[]
  }
  prevention: string[]
  seeDoctor: string[]
  related: string[]
  category: string
  seoKeywords: string[]
}

export const symptomsData: Record<string, SymptomInfo> = {
  cold: {
    slug: 'cold',
    icon: '🤧',
    name: 'Common Cold',
    name_te: 'జలుబు',
    name_hi: 'सर्दी',
    shortDesc: 'Natural remedies for cold, blocked nose, and runny nose',
    fullDesc: 'A common cold is a viral infection of the nose and throat. It usually harmless and clears up within 7-10 days with proper care. Natural remedies can help ease symptoms and boost recovery.',
    causes: [
      'Viral infection (200+ viruses)',
      'Weak immune system',
      'Cold weather exposure',
      'Contact with infected person',
      'Touching contaminated surfaces',
      'Stress and lack of sleep',
    ],
    remedies: [
      {
        title: 'Ginger Tea',
        description: 'Powerful anti-viral and warming remedy',
        ingredients: ['1 inch ginger', '1 cup water', '1 tsp honey', 'Lemon juice'],
        steps: [
          'Grate fresh ginger',
          'Boil in 1 cup water for 5 minutes',
          'Strain into cup',
          'Add honey and lemon juice',
          'Drink warm 3 times daily'
        ]
      },
      {
        title: 'Steam Inhalation',
        description: 'Clears blocked nose instantly',
        ingredients: ['Hot water', 'Optional: eucalyptus oil (2-3 drops)'],
        steps: [
          'Boil water in a bowl',
          'Place towel over head',
          'Inhale steam for 5-10 minutes',
          'Blow nose after',
          'Do 2-3 times daily'
        ]
      },
      {
        title: 'Turmeric Milk (Golden Milk)',
        description: 'Anti-inflammatory bedtime remedy',
        ingredients: ['1 cup warm milk', '1/2 tsp turmeric', 'Pinch black pepper', '1 tsp honey'],
        steps: [
          'Warm milk in pan',
          'Add turmeric and pepper',
          'Stir well',
          'Add honey when slightly cool',
          'Drink before bedtime'
        ]
      },
      {
        title: 'Tulsi Kadha',
        description: 'Traditional Ayurvedic immunity booster',
        ingredients: ['10 tulsi leaves', '5 black pepper', '1 inch ginger', '1 cinnamon stick', '2 cups water'],
        steps: [
          'Boil all ingredients in water',
          'Reduce to half',
          'Strain',
          'Add honey',
          'Drink twice daily'
        ]
      },
      {
        title: 'Salt Water Gargle',
        description: 'Soothes sore throat',
        ingredients: ['1 tsp salt', '1 glass warm water'],
        steps: [
          'Mix salt in warm water',
          'Gargle for 30 seconds',
          'Spit out',
          'Repeat 3-4 times daily'
        ]
      },
      {
        title: 'Honey with Warm Water',
        description: 'Natural antibiotic and soother',
        ingredients: ['2 tsp raw honey', '1 cup warm water', 'Lemon juice'],
        steps: [
          'Mix all in cup',
          'Drink first thing morning',
          'Also before bed'
        ]
      },
      {
        title: 'Chicken Soup / Vegetable Soup',
        description: 'Hydrating and nutritious',
        ingredients: ['Chicken/vegetables', 'Garlic', 'Ginger', 'Black pepper', 'Salt'],
        steps: [
          'Slow cook chicken/vegetables',
          'Add garlic and ginger',
          'Season with pepper and salt',
          'Eat warm 2-3 times daily'
        ]
      },
      {
        title: 'Nasal Saline Rinse',
        description: 'Clears nasal congestion',
        ingredients: ['1/4 tsp salt', '1 cup warm water', 'Neti pot'],
        steps: [
          'Mix salt in warm distilled water',
          'Use neti pot',
          'Rinse each nostril',
          'Do once daily'
        ]
      },
    ],
    foods: {
      eat: [
        'Warm soups (chicken, vegetable)',
        'Ginger and garlic',
        'Citrus fruits (oranges, lemons)',
        'Warm herbal teas',
        'Honey (raw)',
        'Turmeric',
        'Dark leafy greens',
        'Yogurt with honey',
      ],
      avoid: [
        'Cold drinks and ice cream',
        'Fried and oily foods',
        'Excessive sugar',
        'Alcohol',
        'Dairy (may increase mucus)',
        'Processed foods',
      ]
    },
    prevention: [
      'Wash hands frequently',
      'Avoid touching face',
      'Stay hydrated (8 glasses water)',
      'Get 7-8 hours sleep',
      'Exercise regularly',
      'Eat vitamin C rich foods',
      'Take vitamin D if needed',
      'Avoid close contact with sick people',
    ],
    seeDoctor: [
      'High fever above 39°C',
      'Symptoms lasting more than 10 days',
      'Severe headache or facial pain',
      'Difficulty breathing',
      'Chest pain',
      'Persistent cough with blood',
      'Very young infant affected',
      'Existing chronic conditions worsen',
    ],
    related: ['cough', 'sore_throat', 'fever', 'headache'],
    category: 'Respiratory',
    seoKeywords: ['cold remedies', 'blocked nose', 'natural cold treatment', 'home remedies for cold', 'runny nose'],
  },
  headache: {
    slug: 'headache',
    icon: '🤕',
    name: 'Headache',
    name_te: 'తలనొప్పి',
    name_hi: 'सिरदर्द',
    shortDesc: 'Natural remedies for headache, migraine, and tension headache',
    fullDesc: 'Headaches are common and can be caused by stress, dehydration, lack of sleep, or eye strain. Most headaches can be relieved with natural remedies and lifestyle changes.',
    causes: [
      'Dehydration',
      'Stress and anxiety',
      'Lack of sleep',
      'Eye strain (screens)',
      'Poor posture',
      'Skipping meals',
      'Caffeine withdrawal',
      'Hormonal changes',
    ],
    remedies: [
      {
        title: 'Peppermint Oil',
        description: 'Cooling relief for tension headaches',
        ingredients: ['Peppermint essential oil', 'Carrier oil (coconut/almond)'],
        steps: [
          'Dilute 2 drops peppermint oil in 1 tsp carrier oil',
          'Apply to temples and forehead',
          'Massage gently',
          'Rest in dark room'
        ]
      },
      {
        title: 'Cool Compress',
        description: 'Reduces inflammation and pain',
        ingredients: ['Ice pack or cold cloth'],
        steps: [
          'Wrap ice in cloth',
          'Apply to forehead',
          'Leave for 15 minutes',
          'Repeat as needed'
        ]
      },
      {
        title: 'Hydration Therapy',
        description: 'For dehydration headaches',
        ingredients: ['Water', 'Pinch of salt', 'Lemon (optional)'],
        steps: [
          'Drink 2-3 glasses water immediately',
          'Add pinch salt for electrolytes',
          'Rest for 30 minutes',
          'Continue hydrating throughout day'
        ]
      },
      {
        title: 'Ginger Tea for Headache',
        description: 'Anti-inflammatory relief',
        ingredients: ['1 inch ginger', 'Water', 'Honey'],
        steps: [
          'Boil ginger in water',
          'Strain and add honey',
          'Sip slowly',
          'Rest afterwards'
        ]
      },
      {
        title: 'Head Massage',
        description: 'Improves blood circulation',
        ingredients: ['Warm coconut/sesame oil'],
        steps: [
          'Warm oil slightly',
          'Massage scalp gently',
          'Focus on temples and base of skull',
          'Leave for 30 minutes',
          'Wash hair with warm water'
        ]
      },
      {
        title: 'Deep Breathing (4-7-8)',
        description: 'Reduces stress headache',
        steps: [
          'Sit comfortably',
          'Inhale through nose for 4 seconds',
          'Hold breath for 7 seconds',
          'Exhale slowly for 8 seconds',
          'Repeat 4-5 times'
        ]
      },
      {
        title: 'Yoga - Child Pose',
        description: 'Relieves tension',
        steps: [
          'Kneel on floor',
          'Sit back on heels',
          'Bend forward, arms extended',
          'Rest forehead on floor',
          'Breathe deeply for 2-5 minutes'
        ]
      },
    ],
    foods: {
      eat: [
        'Water (plenty!)',
        'Ginger',
        'Watermelon (hydrating)',
        'Almonds (magnesium)',
        'Spinach',
        'Bananas',
        'Dark chocolate (small amounts)',
        'Fatty fish (omega-3)',
      ],
      avoid: [
        'Caffeine excess',
        'Alcohol',
        'Aged cheese',
        'Processed meats',
        'Artificial sweeteners',
        'MSG in foods',
        'Cold drinks (for some)',
      ]
    },
    prevention: [
      'Drink 8 glasses of water daily',
      'Get 7-8 hours sleep',
      'Take breaks from screens (20-20-20 rule)',
      'Manage stress with meditation',
      'Maintain good posture',
      'Regular exercise',
      "Don't skip meals",
      'Limit caffeine',
    ],
    seeDoctor: [
      'Sudden severe headache (worst of life)',
      'Headache after head injury',
      'Fever with stiff neck',
      'Vision changes',
      'Confusion or difficulty speaking',
      'Weakness or numbness',
      'Persistent for days',
      'Getting worse over time',
    ],
    related: ['stress', 'sleep_issues', 'eye_strain', 'dehydration'],
    category: 'Neurological',
    seoKeywords: ['headache remedies', 'migraine natural treatment', 'tension headache', 'headache relief'],
  },
  cough: {
    slug: 'cough',
    icon: '😷',
    name: 'Cough',
    name_te: 'దగ్గు',
    name_hi: 'खांसी',
    shortDesc: 'Natural remedies for dry cough and wet cough',
    fullDesc: 'Cough is your body\'s way of clearing airways. It can be dry or productive (with mucus). Most coughs resolve with home remedies within 2-3 weeks.',
    causes: [
      'Common cold or flu',
      'Allergies',
      'Air pollution',
      'Smoking',
      'Dry air',
      'Acid reflux',
      'Post-nasal drip',
      'Asthma',
    ],
    remedies: [
      {
        title: 'Honey and Ginger',
        description: 'Powerful natural cough suppressant',
        ingredients: ['2 tsp raw honey', '1 tsp fresh ginger juice'],
        steps: [
          'Grate ginger and extract juice',
          'Mix with honey',
          'Take 1 tsp 3 times daily',
          'Do not give honey to children under 1 year'
        ]
      },
      {
        title: 'Turmeric Milk',
        description: 'Reduces inflammation',
        ingredients: ['1 cup warm milk', '1/2 tsp turmeric', 'Pinch pepper', 'Honey'],
        steps: [
          'Heat milk',
          'Add turmeric and pepper',
          'Mix well',
          'Cool slightly, add honey',
          'Drink before bed'
        ]
      },
      {
        title: 'Steam Inhalation',
        description: 'Loosens mucus',
        ingredients: ['Hot water', 'Optional: menthol or eucalyptus'],
        steps: [
          'Boil water in bowl',
          'Cover head with towel',
          'Inhale steam 5-10 min',
          'Repeat 2-3 times daily'
        ]
      },
      {
        title: 'Salt Water Gargle',
        description: 'Soothes throat irritation',
        ingredients: ['1 tsp salt', 'Warm water'],
        steps: [
          'Mix salt in warm water',
          'Gargle 30 seconds',
          'Spit out',
          'Repeat 4-5 times daily'
        ]
      },
      {
        title: 'Warm Salt Water',
        description: 'Hydrates and soothes',
        ingredients: ['Warm water', 'Pinch salt'],
        steps: [
          'Sip warm water throughout day',
          'Add pinch of salt occasionally',
          'Helps clear phlegm'
        ]
      },
    ],
    foods: {
      eat: [
        'Warm soups',
        'Honey',
        'Ginger',
        'Garlic',
        'Turmeric',
        'Warm teas',
        'Chicken broth',
        'Pineapple (contains bromelain)',
      ],
      avoid: [
        'Cold drinks',
        'Ice cream',
        'Fried foods',
        'Dairy (some people)',
        'Spicy food (can irritate)',
        'Alcohol',
        'Caffeine',
      ]
    },
    prevention: [
      'Avoid smoke and pollutants',
      'Cover mouth when coughing',
      'Stay hydrated',
      'Use humidifier',
      'Wash hands frequently',
      'Avoid allergens',
      'Get flu vaccine',
    ],
    seeDoctor: [
      'Cough with blood',
      'Persistent for 3+ weeks',
      'Difficulty breathing',
      'Chest pain',
      'High fever',
      'Weight loss',
      'Night sweats',
      'Rapid breathing in children',
    ],
    related: ['cold', 'sore_throat', 'fever', 'allergies'],
    category: 'Respiratory',
    seoKeywords: ['cough remedies', 'natural cough treatment', 'dry cough', 'wet cough', 'cough syrup'],
  },
  fever: {
    slug: 'fever',
    icon: '🌡️',
    name: 'Fever',
    name_te: 'జ్వరం',
    name_hi: 'बुखार',
    shortDesc: 'Natural ways to reduce mild fever safely',
    fullDesc: 'Fever is body\'s natural response to infection. Mild fever (under 39°C) actually helps fight infection. Focus on hydration, rest, and comfort.',
    causes: [
      'Viral infections',
      'Bacterial infections',
      'Heat exhaustion',
      'Immunizations',
      'Certain medications',
      'Inflammatory conditions',
    ],
    remedies: [
      {
        title: 'Cool Compress',
        description: 'Reduces body temperature',
        ingredients: ['Cool water', 'Soft cloth'],
        steps: [
          'Dip cloth in cool water',
          'Wring out excess',
          'Place on forehead',
          'Change every 10 minutes',
          'Also apply to wrists and neck'
        ]
      },
      {
        title: 'Tulsi and Ginger Tea',
        description: 'Natural fever reducer',
        ingredients: ['10 tulsi leaves', '1 inch ginger', 'Water', 'Honey'],
        steps: [
          'Boil leaves and ginger in water',
          'Simmer 10 minutes',
          'Strain',
          'Add honey when warm',
          'Drink 2-3 times daily'
        ]
      },
      {
        title: 'Coriander Seed Tea',
        description: 'Traditional cooling remedy',
        ingredients: ['1 tsp coriander seeds', '1 cup water'],
        steps: [
          'Boil seeds in water',
          'Simmer 10 minutes',
          'Strain and cool',
          'Drink 2-3 times daily'
        ]
      },
      {
        title: 'Lukewarm Bath',
        description: 'Helps regulate temperature',
        steps: [
          'Fill tub with lukewarm water',
          'Bath for 15-20 minutes',
          'Do NOT use cold water',
          'Pat dry gently'
        ]
      },
      {
        title: 'Onion Slices in Socks',
        description: 'Traditional folk remedy',
        ingredients: ['Fresh onion', 'Cotton socks'],
        steps: [
          'Cut onion in half',
          'Place slices on feet',
          'Wear socks over',
          'Leave overnight',
          'May help draw out heat'
        ]
      },
    ],
    foods: {
      eat: [
        'Water (lots!)',
        'Coconut water',
        'Fresh fruit juices',
        'Clear soups',
        'Rice porridge',
        'Fresh fruits (watermelon, oranges)',
        'Yogurt',
        'Herbal teas',
      ],
      avoid: [
        'Heavy oily food',
        'Spicy food',
        'Caffeine',
        'Alcohol',
        'Cold foods',
        'Sugary drinks',
      ]
    },
    prevention: [
      'Stay hydrated',
      'Get vaccinations',
      'Wash hands',
      'Avoid sick people',
      'Get enough sleep',
      'Eat balanced diet',
      'Manage stress',
    ],
    seeDoctor: [
      'Fever above 39.5°C (103°F)',
      'Fever in infant under 3 months',
      'Fever lasting more than 3 days',
      'Difficulty breathing',
      'Severe headache',
      'Stiff neck',
      'Rash',
      'Confusion',
      'Persistent vomiting',
    ],
    related: ['cold', 'flu', 'body_aches', 'chills'],
    category: 'General',
    seoKeywords: ['fever remedies', 'reduce fever naturally', 'home remedies for fever', 'natural fever treatment'],
  },
  acidity: {
    slug: 'acidity',
    icon: '🤢',
    name: 'Acidity / Heartburn',
    name_te: 'ఆమ్లత',
    name_hi: 'एसिडिटी',
    shortDesc: 'Natural remedies for acidity, heartburn, and indigestion',
    fullDesc: 'Acidity occurs when stomach produces excess acid, causing burning sensation. Common triggers include spicy food, stress, and irregular eating.',
    causes: [
      'Spicy or oily foods',
      'Overeating',
      'Eating late at night',
      'Stress',
      'Smoking and alcohol',
      'Certain medications',
      'Pregnancy',
      'Being overweight',
    ],
    remedies: [
      {
        title: 'Cold Milk',
        description: 'Instant relief from acidity',
        ingredients: ['1 glass cold milk'],
        steps: [
          'Drink slowly',
          'Do not add sugar',
          'Effective within 15 minutes'
        ]
      },
      {
        title: 'Fennel Seeds (Saunf)',
        description: 'Traditional after-meal digestive',
        ingredients: ['1 tsp fennel seeds'],
        steps: [
          'Chew slowly after meals',
          'Can also boil in water and drink',
          'Reduces bloating and acidity'
        ]
      },
      {
        title: 'Coconut Water',
        description: 'Neutralizes stomach acid',
        ingredients: ['1 fresh coconut water'],
        steps: [
          'Drink 1-2 glasses daily',
          'Best on empty stomach',
          'Natural cooling effect'
        ]
      },
      {
        title: 'Buttermilk with Cumin',
        description: 'Aids digestion',
        ingredients: ['1 glass buttermilk', '1/2 tsp roasted cumin', 'Pinch salt'],
        steps: [
          'Mix all ingredients',
          'Drink after meals',
          'Excellent for acidity'
        ]
      },
      {
        title: 'Ginger Tea',
        description: 'Reduces inflammation',
        ingredients: ['1 inch ginger', 'Water'],
        steps: [
          'Boil ginger in water',
          'Sip slowly',
          'Drink before meals'
        ]
      },
      {
        title: 'Banana',
        description: 'Natural antacid',
        steps: [
          'Eat 1 ripe banana',
          'Neutralizes acid',
          'Provides quick relief'
        ]
      },
    ],
    foods: {
      eat: [
        'Bananas',
        'Coconut water',
        'Cold milk',
        'Buttermilk',
        'Cucumber',
        'Watermelon',
        'Papaya',
        'Ginger',
        'Fennel',
      ],
      avoid: [
        'Spicy food',
        'Oily and fried food',
        'Coffee and tea',
        'Carbonated drinks',
        'Alcohol',
        'Chocolate',
        'Tomatoes (some people)',
        'Citrus fruits (some people)',
      ]
    },
    prevention: [
      'Eat small frequent meals',
      'Don\'t lie down after eating',
      'Wait 2-3 hours after meal before bed',
      'Chew food thoroughly',
      'Avoid trigger foods',
      'Manage stress',
      'Maintain healthy weight',
      'Elevate head while sleeping',
    ],
    seeDoctor: [
      'Blood in vomit',
      'Severe chest pain',
      'Difficulty swallowing',
      'Symptoms daily for weeks',
      'Unexplained weight loss',
      'Persistent nausea',
      'Black stools',
    ],
    related: ['nausea', 'stomach_pain', 'bloating', 'indigestion'],
    category: 'Digestive',
    seoKeywords: ['acidity remedies', 'heartburn treatment', 'indigestion natural', 'stomach acid home remedy'],
  },
  stress: {
    slug: 'stress',
    icon: '😰',
    name: 'Stress & Anxiety',
    name_te: 'ఒత్తిడి',
    name_hi: 'तनाव',
    shortDesc: 'Natural ways to manage stress and reduce anxiety',
    fullDesc: 'Stress is your body\'s response to challenges. Chronic stress can affect physical and mental health. Natural remedies can help you relax and feel calmer.',
    causes: [
      'Work pressure',
      'Financial worries',
      'Relationship issues',
      'Health concerns',
      'Major life changes',
      'Lack of sleep',
      'Overthinking',
      'Social media overload',
    ],
    remedies: [
      {
        title: 'Deep Breathing (4-7-8)',
        description: 'Instant calming technique',
        steps: [
          'Sit comfortably',
          'Inhale nose 4 seconds',
          'Hold 7 seconds',
          'Exhale mouth 8 seconds',
          'Repeat 4 times'
        ]
      },
      {
        title: 'Chamomile Tea',
        description: 'Natural relaxant',
        ingredients: ['Chamomile tea bag', 'Hot water', 'Honey'],
        steps: [
          'Steep tea 5-10 minutes',
          'Add honey to taste',
          'Drink before bed',
          'Calms nervous system'
        ]
      },
      {
        title: 'Warm Milk with Turmeric',
        description: 'Traditional relaxer',
        ingredients: ['1 cup milk', '1/2 tsp turmeric', 'Honey'],
        steps: [
          'Warm milk',
          'Add turmeric',
          'Cool slightly, add honey',
          'Drink before sleep'
        ]
      },
      {
        title: 'Meditation (10 min)',
        description: 'Calms the mind',
        steps: [
          'Sit in quiet place',
          'Close eyes',
          'Focus on breath',
          'When mind wanders, return to breath',
          'Do 10 minutes daily'
        ]
      },
      {
        title: 'Nature Walk',
        description: 'Reduces cortisol',
        steps: [
          'Walk in park or nature',
          '20-30 minutes',
          'Leave phone behind',
          'Focus on surroundings',
          'Breathe fresh air'
        ]
      },
      {
        title: 'Warm Bath with Epsom Salt',
        description: 'Full body relaxation',
        ingredients: ['1 cup Epsom salt', 'Warm bath water', 'Optional: lavender oil'],
        steps: [
          'Fill tub with warm water',
          'Add Epsom salt',
          'Add few drops lavender',
          'Soak 20 minutes',
          'Deeply relaxing'
        ]
      },
    ],
    foods: {
      eat: [
        'Dark chocolate (70%+)',
        'Almonds and walnuts',
        'Berries',
        'Avocado',
        'Salmon (omega-3)',
        'Green tea',
        'Bananas',
        'Yogurt',
        'Leafy greens',
      ],
      avoid: [
        'Excessive caffeine',
        'Alcohol',
        'Sugar excess',
        'Processed foods',
        'Fried foods',
        'Energy drinks',
      ]
    },
    prevention: [
      'Regular exercise',
      'Adequate sleep (7-8 hrs)',
      'Meditation practice',
      'Journaling',
      'Time in nature',
      'Social connections',
      'Hobbies you enjoy',
      'Limit social media',
      'Say no when needed',
    ],
    seeDoctor: [
      'Feeling hopeless',
      'Thoughts of self-harm',
      'Cannot function daily',
      'Panic attacks',
      'Physical symptoms (chest pain, palpitations)',
      'Substance use to cope',
      'Persistent sadness',
    ],
    related: ['anxiety', 'sleep_issues', 'headache', 'fatigue'],
    category: 'Mental Health',
    seoKeywords: ['stress relief', 'anxiety natural remedies', 'stress management', 'relaxation techniques'],
  },
}

export const symptomCategories = {
  Respiratory: ['cold', 'cough'],
  Neurological: ['headache'],
  General: ['fever'],
  Digestive: ['acidity'],
  'Mental Health': ['stress'],
}