import type { Article, ComparePair, Condition, MealItem, Myth } from './types';

/* ---------------------------------------------------------------- myths --- */
export const myths: Myth[] = [
  {
    id: 'curd-night',
    claim: 'Curd at night causes a cold',
    verdict: 'myth',
    truth: 'Colds are caused by viruses, not curd. Curd at dinner is fine for most people, and its protein and probiotics are a plus.',
    origin: 'Ayurveda describes curd as heavy and mucus-forming at night. Your mom had a reason to believe this — some people do feel more phlegm after cold dairy.',
    evidence: 'moderate',
    todo: 'Eat it if you like it. If you feel congested afterwards, have it at room temperature or switch to buttermilk.',
    keywords: ['curd', 'dahi', 'yogurt', 'night', 'cold', 'cough'],
  },
  {
    id: 'ghee-fat',
    claim: 'Ghee makes you fat',
    verdict: 'partly',
    truth: 'Ghee is pure fat — 1 teaspoon is about 45 kcal. It only makes you gain weight if total calories go up. 1–2 teaspoons a day fit in most diets.',
    origin: 'The low-fat era of the 1990s blamed all fat. Then social media swung to “ghee is a superfood”. Both overshoot.',
    evidence: 'moderate',
    todo: 'Use it for taste, measured by the teaspoon, not poured. If your LDL cholesterol is high, keep it to 1 tsp a day.',
    keywords: ['ghee', 'fat', 'butter', 'weight'],
  },
  {
    id: 'late-eating',
    claim: 'Eating late at night causes weight gain',
    verdict: 'partly',
    truth: 'Total food matters most. But late dinners often mean bigger portions and snacking, and your body handles sugar a little worse at night.',
    origin: 'Studies do link late eating with weight gain — mostly because late eaters tend to eat more overall.',
    evidence: 'moderate',
    todo: 'Try to finish dinner 2–3 hours before bed. If you work late, keep the late meal light and protein-rich.',
    keywords: ['late', 'night', 'dinner', 'weight', 'eating'],
  },
  {
    id: 'water-meals',
    claim: 'Drinking water with meals ruins digestion',
    verdict: 'myth',
    truth: 'Water doesn’t “dilute” stomach acid in any meaningful way. Sipping water with food is fine and can help you feel full.',
    origin: 'An old idea about “digestive fire” — reasonable-sounding, but not borne out by physiology.',
    evidence: 'moderate',
    todo: 'Drink when you’re thirsty, including at meals.',
    keywords: ['water', 'meal', 'digestion', 'drink', 'acid'],
  },
  {
    id: 'jaggery-better',
    claim: 'Jaggery is much healthier than sugar',
    verdict: 'myth',
    truth: 'Jaggery is about 80% sugar. It has tiny amounts of iron and minerals, but your blood sugar treats it almost like white sugar.',
    origin: 'It’s less processed, and “less processed” often gets read as “healthy”.',
    evidence: 'strong',
    todo: 'Use it for taste if you prefer it — but in the same small amounts you’d use sugar. Not safer for diabetes.',
    keywords: ['jaggery', 'gur', 'sugar', 'brown sugar', 'diabetes'],
  },
  {
    id: 'egg-yolk',
    claim: 'Egg yolks raise cholesterol for everyone',
    verdict: 'partly',
    truth: 'For most people, an egg a day has only a small effect on blood cholesterol. A minority respond more strongly, and people with diabetes may need to be careful.',
    origin: 'Yolks are high in cholesterol, so it seemed logical. Later research found saturated fat moves blood cholesterol more than dietary cholesterol does.',
    evidence: 'moderate',
    todo: 'One whole egg a day is fine for most. If your LDL is high, check with your doctor and watch what you eat with the egg.',
    keywords: ['egg', 'yolk', 'cholesterol'],
  },
  {
    id: 'protein-kidney',
    claim: 'High protein damages healthy kidneys',
    verdict: 'myth',
    truth: 'There’s no good evidence that higher protein harms healthy kidneys. If you already have kidney disease, protein does need to be limited.',
    origin: 'Doctors limit protein for kidney patients, and that advice got stretched to everyone.',
    evidence: 'moderate',
    todo: 'Healthy adults can aim for 0.8–1.2 g per kg body weight (more if strength training). With kidney disease, follow your doctor.',
    keywords: ['protein', 'kidney', 'whey', 'damage'],
  },
  {
    id: 'sugar-free-safe',
    claim: '“Sugar-free” sweets are safe for diabetes',
    verdict: 'myth',
    truth: 'Sugar-free sweets often still contain flour, khoya, ghee and nuts — plenty of carbs and calories that raise blood sugar.',
    origin: 'The label says “sugar-free”, which people reasonably read as “won’t raise sugar”.',
    evidence: 'strong',
    todo: 'Count them like regular sweets: a small piece, after a meal, not on an empty stomach.',
    keywords: ['sugar-free', 'sugar free', 'diabetes', 'sweet', 'mithai'],
  },
];

/* ------------------------------------------------------------- glossary --- */
export const glossary: Record<string, string> = {
  insulin: 'A hormone from the pancreas that lets sugar (glucose) move from your blood into your cells.',
  glucose: 'The main sugar in your blood. Your cells burn it for energy.',
  hba1c: 'A blood test showing your average blood sugar over the last ~3 months.',
  'glycaemic index': 'How fast a food raises blood sugar compared with pure glucose. Lower is gentler.',
  pancreas: 'An organ behind your stomach that makes insulin and digestive juices.',
  'visceral fat': 'Fat stored deep in the belly around your organs — more harmful than fat under the skin.',
  'intrinsic factor': 'A protein made in your stomach that you need to absorb vitamin B12.',
  metformin: 'A common, safe diabetes medicine. Long-term use can lower B12 levels.',
  neuropathy: 'Nerve damage — often felt as tingling, numbness or burning in the hands and feet.',
  absorption: 'How much of a nutrient actually gets from your gut into your blood.',
  maltodextrin: 'A starch powder that digests very fast — raises blood sugar like sugar does.',
  'free sugar': 'Sugar added to food plus sugar in honey, syrups and fruit juice. Not the sugar inside whole fruit or milk.',
};

/* ------------------------------------------------------------- articles --- */
export const articles: Article[] = [
  {
    id: 'insulin-resistance',
    title: 'Insulin resistance',
    kind: 'Concept',
    icon: 'key',
    oneLine: 'Your cells stop responding well to insulin, so your body has to make more and more of it to keep blood sugar normal.',
    ladder: [
      { label: 'One line', text: 'Your cells stop listening to insulin, so sugar stays in your blood longer.' },
      { label: 'Analogy', text: 'Insulin is a key; your cells are locks. With insulin resistance, the locks get rusty. The body makes more keys to force them open — until it can’t keep up.' },
      { label: 'Example', text: 'Ravi, 38, has a 38-inch waist, sleeps 5 hours and sits all day. His fasting sugar is still normal, but his body is making twice the insulin to keep it there. That’s insulin resistance — years before diabetes shows up.' },
      { label: 'In numbers', text: 'An HbA1c of 5.7–6.4% means prediabetes. In studies, losing 5–7% of body weight with ~150 minutes of activity a week cut the risk of progressing to diabetes by about half.' },
    ],
    sections: [
      {
        id: 'how',
        title: 'How it works',
        body: 'After you eat, carbohydrates become [[glucose]] in your blood. Your [[pancreas]] releases [[insulin]], which tells muscle, liver and fat cells to take that glucose in. With insulin resistance, the cells respond weakly, so the pancreas pumps out more insulin to get the same job done.',
        analogy: { title: 'Keys and rusty locks', text: 'Insulin is a key. Your cells are locks. When the locks rust, one key isn’t enough — the body cuts more and more keys. Eventually the key-maker gets tired, and sugar starts piling up in the blood.' },
      },
      {
        id: 'why',
        title: 'Why it matters for you',
        body: 'It usually comes years before type 2 diabetes, and it’s also linked to fatty liver, PCOS and high blood pressure. South Asians tend to develop it at a lower body weight than Europeans, partly because we carry more [[visceral fat]]. {{ev:strong}}',
      },
      {
        id: 'signs',
        title: 'How do you know?',
        body: 'There’s no single home test. Clues: a waist above 90 cm (men) or 80 cm (women), dark velvety skin on the neck, prediabetes on an [[hba1c]] test, high triglycerides, or PCOS. A doctor may order fasting insulin or HOMA-IR, but waist + HbA1c already tells you a lot.',
      },
      {
        id: 'helps',
        title: 'What helps',
        body: 'Muscle is the biggest sink for glucose, so building it helps: strength training twice a week plus a daily walk. {{ev:strong}} Losing even 5% of body weight improves insulin sensitivity. {{ev:strong}} Sleeping 7+ hours helps. {{ev:moderate}} Eating more fibre and protein and fewer sugary drinks makes meals gentler on your sugar. {{ev:strong}}',
      },
      {
        id: 'too',
        title: 'Too little / too much',
        body: 'Too little insulin (type 1 diabetes) means sugar can’t get into cells at all. Too much insulin over years (what insulin resistance causes) drives fat storage and, eventually, a tired pancreas.',
      },
      {
        id: 'myths',
        title: 'Myths to ignore',
        body: '“Cinnamon reverses insulin resistance” — small effects in some studies, nothing that replaces activity. {{ev:weak}} “You must cut all carbs” — portion and type matter more than going zero. {{ev:moderate}} “Thin people don’t get it” — they can, especially South Asians. {{ev:strong}}',
      },
    ],
  },
  {
    id: 'vitamin-b12',
    title: 'Vitamin B12',
    kind: 'Nutrient',
    icon: 'zap',
    oneLine: 'A vitamin your nerves and blood need, found almost only in animal foods — so many Indian vegetarians run low.',
    ladder: [
      { label: 'One line', text: 'B12 keeps your nerves and blood healthy, and vegetarians often don’t get enough.' },
      { label: 'Analogy', text: 'Think of B12 as the wiring insulation for your nerves and the quality check at your blood factory. Without it, signals fray and the factory turns out oversized, clumsy red cells.' },
      { label: 'Example', text: 'Meena, 45, vegetarian, on metformin for 6 years, has tingling feet and is always tired. Her B12 comes back at 150 pg/mL — low. A few months of supplements, and the tiredness lifts.' },
      { label: 'In numbers', text: 'Adults need about 2.2–2.5 micrograms a day. 1 glass of milk ≈ 1 µg; 1 egg ≈ 0.5 µg. Blood levels below ~200 pg/mL are usually called deficient.' },
    ],
    sections: [
      {
        id: 'how',
        title: 'How it works',
        body: 'B12 helps make DNA and red blood cells and keeps the coating on nerves healthy. To absorb it, your stomach makes a helper called [[intrinsic factor]]. Low stomach acid, age, or some medicines can block that [[absorption]].',
        analogy: { title: 'Insulation on wires', text: 'Nerves are like electric wires wrapped in insulation. B12 maintains that insulation. When it runs low, signals leak — you feel it as tingling, numbness or poor balance.' },
      },
      {
        id: 'why',
        title: 'Why it matters for you',
        body: 'Studies in India find B12 deficiency in a large share of adults, especially vegetarians. {{ev:strong}} People on [[metformin]] or acid-reducing tablets for years are at higher risk. {{ev:strong}}',
      },
      {
        id: 'where',
        title: 'Where you get it / how much you need',
        body: 'Milk, curd, paneer, eggs, fish and meat. Plants don’t make B12 — “B12 in spirulina” is mostly an inactive form. {{ev:moderate}} Adults need about 2.5 µg a day: roughly 2 glasses of milk plus a bowl of curd. Vegans need fortified foods or a supplement.',
      },
      {
        id: 'too',
        title: 'Too little / too much',
        body: 'Too little: tiredness, breathlessness, pale skin, mouth ulcers, tingling hands and feet ([[neuropathy]]), memory problems. Nerve damage can become permanent if ignored. Too much: B12 is very safe — extra leaves in urine. Very high blood levels without supplements can be a sign to check your liver, though.',
      },
      {
        id: 'myths',
        title: 'Myths to ignore',
        body: '“B12 injections give energy to everyone” — only if you’re deficient. {{ev:strong}} “Fermented foods give vegetarians enough B12” — not reliably. {{ev:moderate}}',
      },
    ],
  },
];

/* ----------------------------------------------------------- conditions --- */
export const conditions: Condition[] = [
  {
    id: 'diabetes', name: 'Diabetes', icon: 'drop',
    plain: 'Your blood sugar stays too high because your body either doesn’t make enough insulin or doesn’t respond to it well. Over years, high sugar damages eyes, kidneys, nerves and the heart.',
    range: { label: 'HbA1c', unit: '%', min: 4, max: 10, sample: 6.1, zones: [ { upTo: 5.7, label: 'Normal', tone: 'good' }, { upTo: 6.5, label: 'Prediabetes', tone: 'moderate' }, { upTo: 10, label: 'Diabetes', tone: 'bad' } ] },
    helps: [
      { text: 'A 10–15 minute walk after meals', ev: 'strong' },
      { text: 'Half your plate vegetables, a quarter dal/paneer/egg, a quarter grain', ev: 'strong' },
      { text: 'Losing 5–10% body weight if overweight', ev: 'strong' },
      { text: 'Strength training twice a week', ev: 'strong' },
      { text: 'Methi seeds soaked overnight', ev: 'weak' },
    ],
    limit: ['Sweet drinks, juices and “health” malts', 'Large rice portions eaten alone', 'Sweets — “sugar-free” ones too', 'Fried snacks'],
    doctor: ['Sugar above 300 mg/dL, or below 70 with shakiness or confusion', 'Wounds on the feet that don’t heal', 'Blurred vision', 'Before changing any diabetes medicine'],
  },
  {
    id: 'bp', name: 'Blood pressure', icon: 'pulse',
    plain: 'The force of blood against your artery walls is too high. It usually has no symptoms, which is why it’s called a silent killer — it strains the heart, brain and kidneys.',
    range: { label: 'Systolic (top number)', unit: 'mmHg', min: 90, max: 180, sample: 134, zones: [ { upTo: 120, label: 'Normal', tone: 'good' }, { upTo: 140, label: 'Elevated', tone: 'moderate' }, { upTo: 180, label: 'High', tone: 'bad' } ] },
    helps: [
      { text: 'Cut salt to under 5 g a day (1 level teaspoon, all sources)', ev: 'strong' },
      { text: 'Daily brisk walking, 30 minutes', ev: 'strong' },
      { text: 'Potassium-rich foods: banana, coconut water, dal, vegetables', ev: 'strong' },
      { text: 'Less alcohol', ev: 'strong' },
    ],
    limit: ['Pickles, papad, namkeen', 'Packaged soups & instant noodles', 'Extra salt at the table'],
    doctor: ['Readings above 180/120', 'Severe headache, chest pain or vision changes with high BP', 'Never stop BP tablets on your own'],
  },
  {
    id: 'cholesterol', name: 'Cholesterol', icon: 'heart',
    plain: 'Too much LDL (“bad”) cholesterol in your blood can build up in arteries over years, raising heart-attack risk.',
    range: { label: 'LDL cholesterol', unit: 'mg/dL', min: 50, max: 200, sample: 138, zones: [ { upTo: 100, label: 'Optimal', tone: 'good' }, { upTo: 160, label: 'Borderline', tone: 'moderate' }, { upTo: 200, label: 'High', tone: 'bad' } ] },
    helps: [
      { text: 'Swap ghee/vanaspati for mustard, groundnut or rice-bran oil', ev: 'strong' },
      { text: 'Oats, dal, rajma — soluble fibre', ev: 'strong' },
      { text: 'A handful of nuts daily', ev: 'moderate' },
    ],
    limit: ['Vanaspati / dalda', 'Bakery items and deep-fried snacks', 'Lots of ghee and butter'],
    doctor: ['LDL above 190', 'Family history of early heart attacks', 'Chest pain on exertion'],
  },
  {
    id: 'thyroid', name: 'Thyroid', icon: 'shield',
    plain: 'Your thyroid gland makes too little (hypo) or too much (hyper) hormone. Hypothyroidism — tiredness, weight gain, feeling cold — is the common one.',
    range: { label: 'TSH', unit: 'mIU/L', min: 0, max: 10, sample: 5.2, zones: [ { upTo: 0.4, label: 'Low', tone: 'moderate' }, { upTo: 4.5, label: 'Normal', tone: 'good' }, { upTo: 10, label: 'High', tone: 'bad' } ] },
    helps: [
      { text: 'Take thyroxine on an empty stomach, same time daily', ev: 'strong' },
      { text: 'Use iodised salt', ev: 'strong' },
    ],
    limit: ['Calcium or iron tablets within 4 hours of thyroxine', '“Thyroid detox” supplements'],
    doctor: ['Fast heartbeat, weight loss and tremor', 'Before changing your thyroxine dose', 'Planning pregnancy'],
  },
  {
    id: 'pcos', name: 'PCOS', icon: 'spark',
    plain: 'A hormone condition that can cause irregular periods, acne, extra hair growth and weight gain. Insulin resistance often sits underneath it.',
    helps: [
      { text: 'Strength training + walking', ev: 'strong' },
      { text: 'Losing 5–10% of weight if overweight — often restores periods', ev: 'strong' },
      { text: 'Protein at every meal', ev: 'moderate' },
    ],
    limit: ['Sweet drinks', 'Crash diets', '“PCOS cure” teas'],
    doctor: ['No periods for 3 months', 'Trying to conceive', 'Sudden hair growth or voice changes'],
  },
  {
    id: 'fatty-liver', name: 'Fatty liver', icon: 'drop',
    plain: 'Fat builds up in the liver, often with belly fat and insulin resistance. It’s common, usually silent, and reversible early on.',
    helps: [
      { text: 'Losing 7–10% of body weight', ev: 'strong' },
      { text: 'Cutting sugary drinks', ev: 'strong' },
      { text: 'Coffee, without sugar', ev: 'moderate' },
    ],
    limit: ['Alcohol', 'Fructose-heavy drinks and juices', 'Liver “detox” herbs'],
    doctor: ['Yellow eyes or skin', 'Swollen belly or legs', 'Rising liver enzymes on repeat tests'],
  },
  {
    id: 'anaemia', name: 'Anaemia', icon: 'drop',
    plain: 'You have too little haemoglobin to carry oxygen, so you feel tired and breathless. Iron deficiency is the most common cause in India.',
    range: { label: 'Haemoglobin (adult women)', unit: 'g/dL', min: 6, max: 16, sample: 10.8, zones: [ { upTo: 8, label: 'Severe', tone: 'bad' }, { upTo: 12, label: 'Low', tone: 'moderate' }, { upTo: 16, label: 'Normal', tone: 'good' } ] },
    helps: [
      { text: 'Iron foods + vitamin C at the same meal (lemon on dal, amla)', ev: 'strong' },
      { text: 'Iron tablets if prescribed', ev: 'strong' },
    ],
    limit: ['Tea or coffee within an hour of iron-rich meals'],
    doctor: ['Hb below 8', 'Breathless at rest, chest pain', 'Black stools'],
  },
  {
    id: 'kidney-stones', name: 'Kidney stones', icon: 'drop',
    plain: 'Hard crystals form in the kidney, usually when urine is too concentrated.',
    helps: [ { text: 'Drink enough to pass 2.5 L of urine a day', ev: 'strong' }, { text: 'Normal (not low) calcium intake', ev: 'moderate' } ],
    limit: ['Salt', 'Large amounts of spinach & beetroot if you form oxalate stones', 'Cola drinks'],
    doctor: ['Severe flank pain', 'Fever with pain', 'Blood in urine'],
  },
  {
    id: 'gout', name: 'Gout', icon: 'zap',
    plain: 'Uric acid crystals settle in a joint — often the big toe — causing sudden, very painful swelling.',
    range: { label: 'Uric acid', unit: 'mg/dL', min: 2, max: 12, sample: 7.4, zones: [ { upTo: 6, label: 'Target', tone: 'good' }, { upTo: 7, label: 'Borderline', tone: 'moderate' }, { upTo: 12, label: 'High', tone: 'bad' } ] },
    helps: [ { text: 'Losing weight slowly', ev: 'moderate' }, { text: 'Plenty of water', ev: 'moderate' } ],
    limit: ['Beer and alcohol', 'Organ meats & seafood', 'Sugary drinks'],
    doctor: ['Hot, swollen joint with fever', 'More than one attack a year'],
  },
  {
    id: 'pregnancy', name: 'Pregnancy', icon: 'heart',
    plain: 'Your needs for iron, folate, protein and calcium go up. Some foods and supplements become unsafe.',
    helps: [ { text: 'Folic acid before and in early pregnancy', ev: 'strong' }, { text: 'Iron & calcium tablets as prescribed', ev: 'strong' } ],
    limit: ['Herbal teas & slimming products', 'Unpasteurised milk and cheese', 'Raw papaya in large amounts'],
    doctor: ['Bleeding, severe pain or headache', 'Swelling of face and hands', 'Reduced baby movements'],
  },
  {
    id: 'kids', name: 'Kids', icon: 'baby',
    plain: 'Children need protein, iron and calcium to grow — and far less sugar than they usually get.',
    helps: [ { text: 'Milk, curd, eggs, dal daily', ev: 'strong' }, { text: '1 hour of active play', ev: 'strong' } ],
    limit: ['“Health” drinks with added sugar', 'Juices & soft drinks', 'Screen-time snacking'],
    doctor: ['Not gaining weight', 'Always tired or pale'],
  },
  {
    id: 'elderly', name: 'Elderly', icon: 'user',
    plain: 'Muscle and bone loss speed up after 60, and appetite drops. Protein and staying active matter more than ever.',
    helps: [ { text: 'Protein at every meal', ev: 'strong' }, { text: 'Balance & strength exercises', ev: 'strong' }, { text: 'Vitamin D check', ev: 'moderate' } ],
    limit: ['Long periods of sitting', 'Skipping meals'],
    doctor: ['Unplanned weight loss', 'Falls', 'Confusion or memory changes'],
  },
];

/* ------------------------------------------------------------ meal plan --- */
export const mealPlan: Record<string, MealItem[]> = {
  veg: [
    { slot: 'Breakfast', time: '8:00', dish: '2 moong dal chillas + mint chutney + 1 katori curd', portions: [{ kind: 'palm', label: '2 chillas' }, { kind: 'katori', label: '1 katori curd' }], protein: 20, fibre: 6 },
    { slot: 'Lunch', time: '13:00', dish: '2 rotis, 1 katori rajma, 1 katori sabzi, salad', portions: [{ kind: 'palm', label: '2 rotis' }, { kind: 'katori', label: '1 katori rajma' }, { kind: 'fist', label: 'salad' }], protein: 18, fibre: 12 },
    { slot: 'Snack', time: '17:00', dish: 'Roasted chana + 1 guava + chai (less sugar)', portions: [{ kind: 'cupped', label: '1 handful chana' }, { kind: 'piece', label: '1 guava' }], protein: 8, fibre: 8 },
    { slot: 'Dinner', time: '20:00', dish: 'Paneer bhurji, 1 roti, palak dal', portions: [{ kind: 'palm', label: 'paneer, palm-size' }, { kind: 'katori', label: '1 katori dal' }], protein: 22, fibre: 7 },
  ],
  nonveg: [
    { slot: 'Breakfast', time: '8:00', dish: '2-egg omelette with onion & tomato, 1 toast', portions: [{ kind: 'piece', label: '2 eggs' }, { kind: 'palm', label: '1 toast' }], protein: 16, fibre: 3 },
    { slot: 'Lunch', time: '13:00', dish: 'Rice, chicken curry, cucumber raita, sabzi', portions: [{ kind: 'fist', label: '1 fist rice' }, { kind: 'palm', label: 'chicken, palm-size' }, { kind: 'katori', label: 'raita' }], protein: 32, fibre: 7 },
    { slot: 'Snack', time: '17:00', dish: 'Sprouts chaat + buttermilk', portions: [{ kind: 'katori', label: '1 katori sprouts' }, { kind: 'glass', label: '1 glass' }], protein: 10, fibre: 6 },
    { slot: 'Dinner', time: '20:00', dish: 'Fish curry, 1 roti, stir-fried beans', portions: [{ kind: 'palm', label: 'fish, palm-size' }, { kind: 'palm', label: '1 roti' }], protein: 26, fibre: 6 },
  ],
  vegan: [
    { slot: 'Breakfast', time: '8:00', dish: 'Vegetable poha with peanuts + soy milk', portions: [{ kind: 'katori', label: '1 katori poha' }, { kind: 'glass', label: 'soy milk' }], protein: 15, fibre: 5 },
    { slot: 'Lunch', time: '13:00', dish: 'Brown rice, chole, sabzi, salad', portions: [{ kind: 'fist', label: '1 fist rice' }, { kind: 'katori', label: '1 katori chole' }], protein: 17, fibre: 13 },
    { slot: 'Snack', time: '17:00', dish: 'Roasted peanuts + 1 orange', portions: [{ kind: 'cupped', label: '1 handful' }, { kind: 'piece', label: '1 orange' }], protein: 8, fibre: 5 },
    { slot: 'Dinner', time: '20:00', dish: 'Tofu-capsicum stir fry, 2 rotis, dal', portions: [{ kind: 'palm', label: 'tofu, palm-size' }, { kind: 'katori', label: 'dal' }], protein: 24, fibre: 8 },
  ],
  jain: [
    { slot: 'Breakfast', time: '8:00', dish: 'Besan chilla (no onion) + curd', portions: [{ kind: 'palm', label: '2 chillas' }, { kind: 'katori', label: 'curd' }], protein: 17, fibre: 5 },
    { slot: 'Lunch', time: '13:00', dish: '2 rotis, moong dal, lauki sabzi, kachumber (no onion)', portions: [{ kind: 'palm', label: '2 rotis' }, { kind: 'katori', label: 'dal' }], protein: 16, fibre: 10 },
    { slot: 'Snack', time: '17:00', dish: 'Roasted makhana + 1 apple', portions: [{ kind: 'cupped', label: '2 handfuls' }, { kind: 'piece', label: '1 apple' }], protein: 5, fibre: 5 },
    { slot: 'Dinner', time: '19:00', dish: 'Paneer-capsicum sabzi, 1 roti, kadhi (before sunset)', portions: [{ kind: 'palm', label: 'paneer' }, { kind: 'katori', label: 'kadhi' }], protein: 21, fibre: 5 },
  ],
  egg: [
    { slot: 'Breakfast', time: '8:00', dish: '2 boiled eggs + vegetable upma', portions: [{ kind: 'piece', label: '2 eggs' }, { kind: 'katori', label: 'upma' }], protein: 17, fibre: 4 },
    { slot: 'Lunch', time: '13:00', dish: '2 rotis, egg curry, sabzi, salad', portions: [{ kind: 'palm', label: '2 rotis' }, { kind: 'katori', label: 'egg curry' }], protein: 22, fibre: 8 },
    { slot: 'Snack', time: '17:00', dish: 'Sprouts chaat + buttermilk', portions: [{ kind: 'katori', label: 'sprouts' }, { kind: 'glass', label: 'buttermilk' }], protein: 10, fibre: 6 },
    { slot: 'Dinner', time: '20:00', dish: 'Masoor dal, rice, palak paneer', portions: [{ kind: 'fist', label: 'rice' }, { kind: 'katori', label: 'dal' }], protein: 20, fibre: 8 },
  ],
};

/* -------------------------------------------------------------- compare --- */
export const comparePairs: ComparePair[] = [
  {
    id: 'whey-vs-soy', a: 'Whey protein', b: 'Soy protein isolate', unit: 'per 30 g scoop',
    rows: [
      { label: 'Calories', a: '115', b: '110', better: 'tie' },
      { label: 'Protein', a: '25 g', b: '25 g', better: 'tie' },
      { label: 'Leucine (muscle trigger)', a: '2.7 g', b: '2.0 g', better: 'a' },
      { label: 'Sugar', a: '1 g', b: '0.5 g', better: 'tie' },
      { label: 'Fibre', a: '0 g', b: '1 g', better: 'b' },
      { label: 'Fat type', a: 'Milk fat (little)', b: 'Plant fat (little)', better: 'tie' },
      { label: 'Price / 25 g protein', a: '₹80', b: '₹55', better: 'b' },
      { label: 'Key nutrient', a: 'Calcium', b: 'Isoflavones', better: 'tie' },
    ],
    picks: {
      'Weight loss': { pick: 'tie', why: 'Both fine — portion and what you eat it with matter more. Protein keeps you full either way.' },
      Muscle: { pick: 'a', why: 'Whey edges ahead: more leucine and faster digestion. The gap is small if you eat enough total protein.' },
      Diabetes: { pick: 'tie', why: 'Both barely move blood sugar. Pick the unflavoured, unsweetened version of either.' },
      Kids: { pick: 'tie', why: 'Most kids don’t need either — milk, dal, eggs and paneer are better. Ask a paediatrician first.' },
      Budget: { pick: 'b', why: 'Soy gives the same protein for about ₹25 less per serving. Even cheaper: soya chunks.' },
    },
  },
  {
    id: 'brown-vs-white-rice', a: 'Brown rice', b: 'White rice', unit: 'per 1 katori cooked (150 g)',
    rows: [
      { label: 'Calories', a: '165', b: '195', better: 'a' },
      { label: 'Protein', a: '3.8 g', b: '3.6 g', better: 'tie' },
      { label: 'Fibre', a: '2.7 g', b: '0.6 g', better: 'a' },
      { label: 'Sugar', a: '0.4 g', b: '0.1 g', better: 'tie' },
      { label: 'Glycaemic index', a: '≈ 55–65', b: '≈ 70–75', better: 'a' },
      { label: 'Price / kg', a: '₹110', b: '₹60', better: 'b' },
      { label: 'Key nutrient', a: 'Magnesium', b: '—', better: 'a' },
    ],
    picks: {
      'Weight loss': { pick: 'tie', why: 'Both fine — portion and what you eat it with matter more. One fist of rice plus dal and sabzi works either way.' },
      Muscle: { pick: 'tie', why: 'Neither is a protein source. Pair either with dal, curd or chicken.' },
      Diabetes: { pick: 'a', why: 'Brown rice raises sugar a little more slowly. Even better: half rice, half vegetables.' },
      Kids: { pick: 'b', why: 'White rice is easier to digest for small kids; add dal and ghee for nutrition.' },
      Budget: { pick: 'b', why: 'White rice costs about half. Add a bowl of dal and you’re covered.' },
    },
  },
  {
    id: 'ragi-vs-wheat', a: 'Ragi flour', b: 'Wheat atta', unit: 'per 100 g flour',
    rows: [
      { label: 'Calories', a: '320', b: '340', better: 'tie' },
      { label: 'Protein', a: '7 g', b: '12 g', better: 'b' },
      { label: 'Fibre', a: '11 g', b: '11 g', better: 'tie' },
      { label: 'Calcium', a: '364 mg', b: '30 mg', better: 'a' },
      { label: 'Iron', a: '4.6 mg', b: '4 mg', better: 'tie' },
      { label: 'Gluten', a: 'None', b: 'Yes', better: 'a' },
      { label: 'Price / kg', a: '₹70', b: '₹50', better: 'b' },
    ],
    picks: {
      'Weight loss': { pick: 'tie', why: 'Both fine — portion and what you eat it with matter more.' },
      Muscle: { pick: 'b', why: 'Wheat has noticeably more protein per roti.' },
      Diabetes: { pick: 'tie', why: 'Similar effect when eaten as thick rotis. Avoid thin ragi malt.' },
      Kids: { pick: 'a', why: 'Ragi’s calcium is a big plus for growing bones. Ragi porridge is a classic first food.' },
      Budget: { pick: 'b', why: 'Wheat atta is cheaper. Mixing 1 part ragi to 3 parts wheat is a good middle path.' },
    },
  },
];
