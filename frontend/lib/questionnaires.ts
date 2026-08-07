export type Question = {
  id: string
  question: string
  question_te?: string
  question_hi?: string
  options: string[]
  options_te?: string[]
  options_hi?: string[]
  type: 'single' | 'multi'
}

export type Questionnaire = {
  symptom: string
  icon: string
  label: string
  label_te?: string
  label_hi?: string
  questions: Question[]
}

export const questionnaires: Record<string, Questionnaire> = {
  cold: {
    symptom: 'cold',
    icon: '🤧',
    label: 'Cold / Blocked Nose',
    label_te: 'జలుబు / ముక్కు మూసుకోవడం',
    label_hi: 'सर्दी / बंद नाक',
    questions: [
      {
        id: 'duration',
        question: 'How many days have you had these symptoms?',
        question_te: 'ఎన్ని రోజులుగా ఈ లక్షణాలు ఉన్నాయి?',
        question_hi: 'कितने दिनों से ये लक्षण हैं?',
        options: ['Less than 1 day', '2-3 days', '4-7 days', 'More than a week'],
        type: 'single'
      },
      {
        id: 'fever',
        question: 'Do you have fever?',
        question_te: 'జ్వరం ఉందా?',
        question_hi: 'क्या बुखार है?',
        options: ['No', 'Mild', 'High (above 38°C)'],
        type: 'single'
      },
      {
        id: 'symptoms',
        question: 'Which symptoms do you have? (Select all)',
        question_te: 'ఏ లక్షణాలు ఉన్నాయి?',
        question_hi: 'कौन से लक्षण हैं?',
        options: ['Runny nose', 'Blocked nose', 'Sneezing', 'Sore throat', 'Cough', 'Body aches'],
        type: 'multi'
      },
      {
        id: 'age',
        question: 'What is your age group?',
        question_te: 'మీ వయస్సు ఎంత?',
        question_hi: 'आपकी उम्र क्या है?',
        options: ['Child (< 12)', 'Teen (12-18)', 'Adult (19-60)', 'Elderly (> 60)'],
        type: 'single'
      },
    ]
  },
  headache: {
    symptom: 'headache',
    icon: '🤕',
    label: 'Headache',
    label_te: 'తలనొప్పి',
    label_hi: 'सिरदर्द',
    questions: [
      {
        id: 'duration',
        question: 'How long have you had the headache?',
        question_te: 'ఎంత సేపటి నుండి తలనొప్పి ఉంది?',
        question_hi: 'सिरदर्द कब से है?',
        options: ['Less than 1 hour', 'Few hours', '1 day', 'Several days'],
        type: 'single'
      },
      {
        id: 'severity',
        question: 'How severe is the headache?',
        question_te: 'తలనొప్పి తీవ్రత ఎంత?',
        question_hi: 'सिरदर्द कितना गंभीर है?',
        options: ['Mild (can ignore)', 'Moderate (annoying)', 'Severe (unbearable)'],
        type: 'single'
      },
      {
        id: 'location',
        question: 'Where is the pain?',
        question_te: 'నొప్పి ఎక్కడ ఉంది?',
        question_hi: 'दर्द कहाँ है?',
        options: ['Forehead', 'Back of head', 'One side', 'All over', 'Around eyes'],
        type: 'single'
      },
      {
        id: 'triggers',
        question: 'What might have caused it?',
        question_te: 'కారణం ఏమిటి?',
        question_hi: 'क्या कारण हो सकता है?',
        options: ['Stress', 'Lack of sleep', 'Dehydration', 'Bright screen', 'Loud noise', 'Not sure'],
        type: 'multi'
      },
      {
        id: 'warning',
        question: 'Any of these? (Important!)',
        question_te: 'ఇవి ఏవైనా ఉన్నాయా?',
        question_hi: 'क्या इनमें से कोई है?',
        options: ['Vision changes', 'Vomiting', 'Confusion', 'Head injury', 'None of these'],
        type: 'multi'
      },
    ]
  },
  cough: {
    symptom: 'cough',
    icon: '😷',
    label: 'Cough',
    label_te: 'దగ్గు',
    label_hi: 'खांसी',
    questions: [
      {
        id: 'type',
        question: 'What type of cough?',
        options: ['Dry cough', 'Wet cough (with phlegm)', 'Cough with blood'],
        type: 'single'
      },
      {
        id: 'duration',
        question: 'How many days?',
        options: ['1-3 days', '4-7 days', '1-2 weeks', 'More than 3 weeks'],
        type: 'single'
      },
      {
        id: 'when',
        question: 'When is it worse?',
        options: ['Morning', 'Night', 'After eating', 'Cold weather', 'All day'],
        type: 'multi'
      },
      {
        id: 'other',
        question: 'Other symptoms?',
        options: ['Fever', 'Chest pain', 'Shortness of breath', 'Body ache', 'None'],
        type: 'multi'
      },
    ]
  },
  fever: {
    symptom: 'fever',
    icon: '🌡️',
    label: 'Fever',
    label_te: 'జ్వరం',
    label_hi: 'बुखार',
    questions: [
      {
        id: 'temperature',
        question: 'How high is the fever?',
        options: ['Mild (< 38°C)', 'Moderate (38-39°C)', 'High (39-40°C)', 'Very high (> 40°C)'],
        type: 'single'
      },
      {
        id: 'duration',
        question: 'How long?',
        options: ['Few hours', '1 day', '2-3 days', 'More than 3 days'],
        type: 'single'
      },
      {
        id: 'symptoms',
        question: 'Other symptoms?',
        options: ['Chills', 'Sweating', 'Body ache', 'Headache', 'Nausea', 'Rash'],
        type: 'multi'
      },
      {
        id: 'age',
        question: 'Age group?',
        options: ['Infant (< 2)', 'Child (2-12)', 'Teen/Adult', 'Elderly (> 60)'],
        type: 'single'
      },
    ]
  },
  stomach: {
    symptom: 'stomach',
    icon: '🤢',
    label: 'Stomach Issues',
    label_te: 'కడుపు సమస్యలు',
    label_hi: 'पेट की समस्या',
    questions: [
      {
        id: 'type',
        question: 'What is the main problem?',
        options: ['Pain', 'Nausea', 'Vomiting', 'Diarrhea', 'Bloating', 'Constipation'],
        type: 'multi'
      },
      {
        id: 'duration',
        question: 'How long?',
        options: ['Few hours', '1 day', '2-3 days', 'More than a week'],
        type: 'single'
      },
      {
        id: 'trigger',
        question: 'What might have caused it?',
        options: ['New food', 'Overeating', 'Spicy food', 'Stress', 'Water change', 'Not sure'],
        type: 'multi'
      },
      {
        id: 'severity',
        question: 'How severe?',
        options: ['Mild', 'Moderate', 'Severe (unbearable)'],
        type: 'single'
      },
    ]
  },
}

export function buildDetailedQuery(
  symptomKey: string, 
  answers: Record<string, string | string[]>,
  language: string = 'en'
): string {
  const q = questionnaires[symptomKey]
  if (!q) return ''

  const langLabel = language === 'te' ? q.label_te : language === 'hi' ? q.label_hi : q.label

  let query = `I have ${langLabel || q.label}.\n\nHere are more details:\n`

  q.questions.forEach(question => {
    const answer = answers[question.id]
    if (!answer) return

    const questionText = language === 'te' ? question.question_te : language === 'hi' ? question.question_hi : question.question
    
    if (Array.isArray(answer)) {
      query += `\n- ${questionText || question.question} ${answer.join(', ')}`
    } else {
      query += `\n- ${questionText || question.question} ${answer}`
    }
  })

  query += '\n\nPlease give me personalized natural remedies based on this information.'
  return query
}