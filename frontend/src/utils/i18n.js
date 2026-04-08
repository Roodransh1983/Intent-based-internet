const translations = {
  en: {
    app_title: 'IntentNet',
    login_title: 'Welcome Back',
    register_title: 'Create Account',
    email: 'Email',
    password: 'Password',
    name: 'Name',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    goals: 'Goals',
    tasks: 'Tasks',
    progress: 'Progress',
    goal_input: 'What do you want to achieve?',
    goal_placeholder: 'I want to learn web development in 3 months...',
    create_goal: 'Create Goal',
    your_goals: 'Your Goals',
    select_goal: 'Select Goal',
    overall_progress: 'Overall Progress',
    total_goals: 'Total Goals',
    total_tasks: 'Total Tasks',
    completed: 'Completed',
    rate: 'Rate',
    loading: 'Loading...',
    offline: 'Offline',
    online: 'Online',
    voice_input: '🎤 Voice Input',
    switch_hindi: 'हिंदी',
    switch_english: 'English'
  },
  hi: {
    app_title: 'इंटेंटनेट',
    login_title: 'वापस स्वागत है',
    register_title: 'खाता बनाएं',
    email: 'ईमेल',
    password: 'पासवर्ड',
    name: 'नाम',
    login: 'लॉगिन',
    register: 'रजिस्टर',
    logout: 'लॉगआउट',
    goals: 'लक्ष्य',
    tasks: 'कार्य',
    progress: 'प्रगति',
    goal_input: 'आप क्या हासिल करना चाहते हैं?',
    goal_placeholder: 'मैं 3 महीने में वेब विकास सीखना चाहता हूं...',
    create_goal: 'लक्ष्य बनाएं',
    your_goals: 'आपके लक्ष्य',
    select_goal: 'लक्ष्य चुनें',
    overall_progress: 'कुल प्रगति',
    total_goals: 'कुल लक्ष्य',
    total_tasks: 'कुल कार्य',
    completed: 'पूर्ण',
    rate: 'दर',
    loading: 'लोड हो रहा है...',
    offline: 'ऑफ़लाइन',
    online: 'ऑनलाइन',
    voice_input: '🎤 वॉइस इनपुट',
    switch_hindi: 'हिंदी',
    switch_english: 'English'
  }
};

let currentLang = localStorage.getItem('lang') || 'en';

export function setLanguage(lang) {
  if (translations[lang]) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
  }
}

export function getLanguage() {
  return currentLang;
}

export function t(key) {
  return translations[currentLang]?.[key] || translations.en[key] || key;
}

export function getAvailableLanguages() {
  return Object.keys(translations);
}
