-- Kitchen Pharmacy Scanner Schema

CREATE TABLE IF NOT EXISTS kitchen_remedies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  ingredients TEXT[] NOT NULL, -- e.g., ['turmeric', 'honey', 'ginger']
  ingredient_amounts TEXT[], -- e.g., ['1 tsp', '2 tbsp', '1 inch']
  preparation_steps TEXT[] NOT NULL,
  uses TEXT[] NOT NULL, -- e.g., ['cold', 'cough', 'immunity']
  prep_time INTEGER, -- minutes
  difficulty VARCHAR(20) DEFAULT 'easy', -- easy, medium, hard
  category VARCHAR(50), -- drink, paste, food, oil, decoction
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_remedies_uses ON kitchen_remedies USING GIN(uses);
CREATE INDEX IF NOT EXISTS idx_remedies_ingredients ON kitchen_remedies USING GIN(ingredients);
CREATE INDEX IF NOT EXISTS idx_remedies_category ON kitchen_remedies(category);

ALTER TABLE kitchen_remedies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read published remedies" ON kitchen_remedies;
CREATE POLICY "Anyone can read published remedies" ON kitchen_remedies
  FOR SELECT USING (is_published = TRUE);

-- Seed with common Indian kitchen remedies
INSERT INTO kitchen_remedies (title, description, ingredients, ingredient_amounts, preparation_steps, uses, prep_time, difficulty, category) VALUES
('Golden Milk (Haldi Doodh)', 'Anti-inflammatory drink that boosts immunity and helps with cold and cough', 
  ARRAY['turmeric', 'milk', 'black pepper', 'honey'],
  ARRAY['1 tsp', '1 cup', 'a pinch', '1 tsp'],
  ARRAY['Heat milk in a saucepan', 'Add turmeric powder and a pinch of black pepper', 'Stir well and bring to gentle boil', 'Pour into cup, add honey when warm (not hot)'],
  ARRAY['cold', 'cough', 'immunity', 'inflammation', 'sleep'],
  5, 'easy', 'drink'),

('Ginger-Tulsi Tea', 'Powerful remedy for cold, cough, and sore throat',
  ARRAY['ginger', 'tulsi', 'water', 'honey', 'lemon'],
  ARRAY['1 inch', '5-6 leaves', '1.5 cups', '1 tsp', '1/2'],
  ARRAY['Boil water in a pan', 'Add crushed ginger and tulsi leaves', 'Simmer for 5-7 minutes', 'Strain into cup', 'Add honey and lemon'],
  ARRAY['cold', 'cough', 'sore_throat', 'immunity', 'congestion'],
  10, 'easy', 'drink'),

('Honey-Lemon Warm Water', 'Morning detox drink that aids digestion and boosts immunity',
  ARRAY['honey', 'lemon', 'water'],
  ARRAY['1 tbsp', '1/2', '1 cup'],
  ARRAY['Heat water until warm (not boiling)', 'Squeeze fresh lemon juice', 'Add honey and stir well', 'Drink on empty stomach in morning'],
  ARRAY['digestion', 'immunity', 'weight_loss', 'detox'],
  3, 'easy', 'drink'),

('Turmeric Paste for Wounds', 'Antiseptic paste for minor cuts and burns',
  ARRAY['turmeric', 'water'],
  ARRAY['1 tsp', 'few drops'],
  ARRAY['Mix turmeric with few drops of water to form thick paste', 'Apply directly to clean wound', 'Let it dry for 15 minutes', 'Rinse with clean water'],
  ARRAY['cuts', 'burns', 'wound_healing', 'skin'],
  3, 'easy', 'paste'),

('Cinnamon-Honey Mixture', 'Helps control blood sugar and improves heart health',
  ARRAY['cinnamon', 'honey'],
  ARRAY['1 tsp', '1 tbsp'],
  ARRAY['Mix cinnamon powder with raw honey', 'Store in airtight jar', 'Take 1/2 tsp daily morning'],
  ARRAY['blood_sugar', 'heart_health', 'immunity', 'cholesterol'],
  3, 'easy', 'paste'),

('Fennel Seed Water (Saunf)', 'Cooling drink that aids digestion and reduces bloating',
  ARRAY['fennel_seeds', 'water'],
  ARRAY['1 tsp', '1 cup'],
  ARRAY['Soak fennel seeds in water overnight', 'Strain and drink in morning', 'Can also chew seeds after meals'],
  ARRAY['digestion', 'bloating', 'bad_breath', 'cooling'],
  5, 'easy', 'drink'),

('Ajwain (Carom Seeds) Decoction', 'Quick relief from stomach ache and acidity',
  ARRAY['ajwain', 'water', 'lemon'],
  ARRAY['1 tsp', '1 cup', 'few drops'],
  ARRAY['Boil water and add ajwain', 'Simmer for 5 minutes', 'Strain and add lemon', 'Drink warm for best results'],
  ARRAY['stomach_ache', 'acidity', 'indigestion', 'gas'],
  7, 'easy', 'decoction'),

('Coconut Oil Hair Mask', 'Deep conditioning treatment for dry and damaged hair',
  ARRAY['coconut_oil'],
  ARRAY['2-3 tbsp'],
  ARRAY['Warm coconut oil slightly', 'Apply to scalp and hair lengths', 'Massage gently for 5 minutes', 'Leave for 1 hour or overnight', 'Wash with mild shampoo'],
  ARRAY['hair_fall', 'dry_hair', 'dandruff', 'hair_growth'],
  5, 'easy', 'oil'),

('Methi (Fenugreek) Water', 'Helps control blood sugar and aids weight loss',
  ARRAY['fenugreek_seeds', 'water'],
  ARRAY['1 tbsp', '1 cup'],
  ARRAY['Soak fenugreek seeds overnight', 'Strain and drink water in morning on empty stomach', 'Can chew the seeds too'],
  ARRAY['blood_sugar', 'weight_loss', 'digestion', 'lactation'],
  5, 'easy', 'drink'),

('Aloe Vera Juice', 'Soothes acidity, improves digestion, and boosts skin health',
  ARRAY['aloe_vera'],
  ARRAY['2 tbsp gel'],
  ARRAY['Extract fresh aloe vera gel from leaf', 'Blend with little water', 'Drink on empty stomach', 'Optional: add honey for taste'],
  ARRAY['acidity', 'digestion', 'skin', 'constipation', 'immunity'],
  5, 'easy', 'drink'),

('Garlic-Honey Tonic', 'Powerful immune booster for cold and flu season',
  ARRAY['garlic', 'honey'],
  ARRAY['4-5 cloves', '1 cup'],
  ARRAY['Crush garlic cloves slightly', 'Mix with raw honey in jar', 'Let sit for 2-3 days', 'Take 1 tsp daily'],
  ARRAY['cold', 'flu', 'immunity', 'cough', 'infection'],
  5, 'easy', 'paste'),

('Clove Oil for Toothache', 'Instant relief from tooth pain using kitchen clove',
  ARRAY['clove'],
  ARRAY['2-3 cloves'],
  ARRAY['Crush 2-3 cloves to release oil', 'Place on affected tooth', 'Bite gently to release oil', 'Leave for 10-15 minutes'],
  ARRAY['toothache', 'gum_pain', 'bad_breath'],
  2, 'easy', 'oil'),

('Coriander Seed Water', 'Reduces heat in body and helps with urinary issues',
  ARRAY['coriander_seeds', 'water'],
  ARRAY['1 tbsp', '1 cup'],
  ARRAY['Soak coriander seeds in water overnight', 'Strain and drink in morning', 'Can add lemon for taste'],
  ARRAY['body_heat', 'urinary_issues', 'indigestion', 'bloating'],
  5, 'easy', 'drink'),

('Multani Mitti Face Pack', 'Deep cleansing face pack for oily and acne-prone skin',
  ARRAY['multani_mitti', 'rose_water', 'turmeric'],
  ARRAY['2 tbsp', '2 tbsp', 'a pinch'],
  ARRAY['Mix multani mitti with rose water', 'Add pinch of turmeric', 'Apply evenly on face', 'Let dry for 15-20 minutes', 'Wash with lukewarm water'],
  ARRAY['acne', 'oily_skin', 'pimples', 'glow'],
  5, 'easy', 'paste'),

('Dalchini (Cinnamon) Tea', 'Helps boost metabolism and control blood sugar',
  ARRAY['cinnamon', 'water', 'honey', 'lemon'],
  ARRAY['1 stick', '1 cup', '1 tsp', 'few drops'],
  ARRAY['Boil water with cinnamon stick for 5 minutes', 'Strain into cup', 'Add honey and lemon', 'Drink warm'],
  ARRAY['blood_sugar', 'metabolism', 'cold', 'immunity', 'weight_loss'],
  7, 'easy', 'drink'),

('Jeera (Cumin) Water', 'Aids digestion and boosts metabolism',
  ARRAY['cumin_seeds', 'water', 'lemon'],
  ARRAY['1 tsp', '1 cup', 'few drops'],
  ARRAY['Boil cumin seeds in water for 5 minutes', 'Strain and let cool slightly', 'Add lemon juice', 'Drink before meals'],
  ARRAY['digestion', 'metabolism', 'bloating', 'weight_loss'],
  7, 'easy', 'drink'),

('Onion Juice for Cough', 'Traditional remedy for severe cough and cold',
  ARRAY['onion', 'honey'],
  ARRAY['1 medium', '1 tbsp'],
  ARRAY['Grate onion and extract juice', 'Mix with equal honey', 'Take 1 tsp of mixture', 'Repeat 2-3 times daily'],
  ARRAY['cough', 'cold', 'sore_throat', 'congestion'],
  10, 'easy', 'drink'),

('Tulsi Kadha (Decoction)', 'Powerful Ayurvedic immunity booster',
  ARRAY['tulsi', 'ginger', 'black_pepper', 'cinnamon', 'clove', 'water', 'honey'],
  ARRAY['10-12 leaves', '1 inch', '3-4', '1 small stick', '2', '2 cups', '1 tsp'],
  ARRAY['Boil water with all spices for 10 minutes', 'Add tulsi leaves and simmer', 'Strain and add honey', 'Drink warm twice daily'],
  ARRAY['immunity', 'cold', 'cough', 'fever', 'sore_throat'],
  15, 'medium', 'decoction'),

('Sesame Oil for Joints', 'Traditional massage oil for joint pain relief',
  ARRAY['sesame_oil', 'garlic'],
  ARRAY['3 tbsp', '3-4 cloves'],
  ARRAY['Heat sesame oil with crushed garlic', 'Let it cool down', 'Massage on affected joints', 'Apply warm for best results'],
  ARRAY['joint_pain', 'arthritis', 'muscle_pain', 'inflammation'],
  10, 'easy', 'oil'),

('Curd (Yogurt) for Sunburn', 'Cooling remedy for sunburn and skin irritation',
  ARRAY['curd'],
  ARRAY['3-4 tbsp'],
  ARRAY['Take fresh cold curd from fridge', 'Apply directly on sunburn area', 'Leave for 15-20 minutes', 'Wash with cool water'],
  ARRAY['sunburn', 'skin_irritation', 'cooling', 'rash'],
  3, 'easy', 'paste');
