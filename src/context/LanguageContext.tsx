import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'ta' | 'hi';

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  en: {
    // Navigation & Menu
    dashboard: 'Dashboard',
    myPosts: 'My Posts',
    matches: 'Matches',
    notifications: 'Notifications',
    settings: 'Settings',
    logout: 'Logout',
    
    // Dashboard
    todayImpact: "Today's Impact",
    weeklyImpact: 'Weekly Impact Trend',
    mealsDistributed: 'Meals Distributed',
    co2Prevented: 'CO₂ Prevented (kg)',
    waterSaved: 'Water Saved (L)',
    emergencyAlerts: 'Emergency Alerts',
    thisMonth: 'This Month',
    mealsSaved: 'meals saved',
    foodDiverted: 'food diverted',
    co2Prevented2: 'CO₂ prevented',
    
    // Food Cards
    quantity: 'Quantity',
    expiry: 'Expiry',
    distance: 'Distance',
    freshness: 'Freshness',
    requestFood: 'Request This Food',
    availableFood: "Today's Available Food",
    recommendedForYou: 'Recommended for you',
    seeAll: 'See all',
    
    // Search & Filter
    search: 'Search',
    searchFood: 'Search for surplus food...',
    groceries: 'Groceries',
    meals: 'Meals',
    bakedGoods: 'Baked Goods',
    listView: 'List View',
    mapView: 'Map View',
    
    // Settings
    userDetails: 'User Details',
    darkMode: 'Dark Mode',
    language: 'Language',
    english: 'English',
    tamil: 'Tamil',
    hindi: 'Hindi',
    email: 'Email',
    phone: 'Phone',
    location: 'Location',
    role: 'Role',
    
    // Features (for hamburger menu)
    oneClickPosting: 'One-Click Surplus Posting',
    smartMatching: 'Smart NGO Matching',
    foodSafety: 'Food Safety Timer',
    photoVerification: 'Photo Verification (AI)',
    demandAware: 'Demand-Aware Redistribution',
    falsePrevention: 'False Surplus Prevention',
    heatmap: 'Live Food Rescue Heatmap',
    impactMeter: 'Carbon & Climate Impact',
    emergencyMode: 'Emergency Hunger Mode',
    accessibility: 'Settings & Accessibility',
    
    // Buttons
    enable: 'Enable',
    disable: 'Disable',
    save: 'Save',
    cancel: 'Cancel',
    
    // Messages
    welcomeBack: 'Welcome back!',
    goodMorning: 'Good Morning',
    letsSaveFood: "Let's save some yummy food...",
    urgentNeed: 'Urgent: 50+ people need meals NOW',
    locationAway: 'away',
    respondNow: 'Respond Now',
  },
  ta: {
    // Navigation & Menu
    dashboard: 'டாஷ்போர்டு',
    myPosts: 'என் பதிப்புகள்',
    matches: 'பொருந்தும் இடங்கள்',
    notifications: 'அறிவிப்புகள்',
    settings: 'அமைப்புகள்',
    logout: 'வெளியே வாருங்கள்',
    
    // Dashboard
    todayImpact: 'இன்றைய தாக்கம்',
    weeklyImpact: 'வாரவாரி தாக்கம் போக்கு',
    mealsDistributed: 'விநியோகிக்கப்பட்ட உணவு',
    co2Prevented: 'தடுக்கப்பட்ட CO₂ (கிகி)',
    waterSaved: 'சேமிக்கப்பட்ட நீர் (எல்)',
    emergencyAlerts: 'அவசர எச்சரிக்கைகள்',
    thisMonth: 'இந்த மாதம்',
    mealsSaved: 'உணவு சேமிக்கப்பட்டது',
    foodDiverted: 'நியமிக்கப்பட்ட உணவு',
    co2Prevented2: 'தடுக்கப்பட்ட CO₂',
    
    // Food Cards
    quantity: 'அளவு',
    expiry: 'முடிவதற்கான நேரம்',
    distance: 'தூரம்',
    freshness: 'புதுமை',
    requestFood: 'இந்த உணவைக் கோருங்கள்',
    availableFood: 'இன்றைய கிடைக்கும் உணவு',
    recommendedForYou: 'உங்களுக்கான பரிந்துரைப்பு',
    seeAll: 'அனைத்தையும் பார்க்கவும்',
    
    // Search & Filter
    search: 'தேடுங்கள்',
    searchFood: 'உதிரி உணவைத் தேடுங்கள்...',
    groceries: 'கடை பொருட்கள்',
    meals: 'உணவு',
    bakedGoods: 'சுட்ட பொருட்கள்',
    listView: 'பட்டியல் பார்வை',
    mapView: 'வரைபட பார்வை',
    
    // Settings
    userDetails: 'பயனர் விவரங்கள்',
    darkMode: 'இருண்ட முறை',
    language: 'மொழி',
    english: 'ஆங்கிலம்',
    tamil: 'தமிழ்',
    hindi: 'இந்தி',
    email: 'மின்னஞ்சல்',
    phone: 'தொலைபேசி',
    location: 'இடம்',
    role: 'பங்கு',
    
    // Features (for hamburger menu)
    oneClickPosting: 'ஒரு கிளிக் உணவு பதிவு',
    smartMatching: 'ஸ்மார்ட் NGO பொருந்துதல்',
    foodSafety: 'உணவு பாதுகாப்பு டைமர்',
    photoVerification: 'ফটো சत்যাপन (AI)',
    demandAware: 'கோரிக்கை-விழிப்பு விநியோகம்',
    falsePrevention: 'பொய்யான தடயம் தடுப்பு',
    heatmap: 'உயிந்த உணவு மீட்டெடுப்பு வரைபட',
    impactMeter: 'கார்பன் & தட்ப வெப்பநிலை தாக்கம்',
    emergencyMode: 'அவசர பசி முறை',
    accessibility: 'அமைப்புகள் & அ accessibility',
    
    // Buttons
    enable: 'இயக்கவும்',
    disable: 'முடக்கவும்',
    save: 'சேமிக்கவும்',
    cancel: 'ரத்து செய்யவும்',
    
    // Messages
    welcomeBack: 'திரும்பி வந்ததற்கு நன்றி!',
    goodMorning: 'காலை வணக்கம்',
    letsSaveFood: 'சுவையான உணவைக் காப்போம்...',
    urgentNeed: 'அவசரம்: 50+ பேருக்கு இப்போது உணவு தேவை',
    locationAway: 'தொலைவில்',
    respondNow: 'இப்போது பதிலளிக்கவும்',
  },
  hi: {
    // Navigation & Menu
    dashboard: 'डैशबोर्ड',
    myPosts: 'मेरी पोस्ट्स',
    matches: 'मैच्स',
    notifications: 'सूचनाएं',
    settings: 'सेटिंग्स',
    logout: 'लॉग आउट',
    
    // Dashboard
    todayImpact: 'आज का प्रभाव',
    weeklyImpact: 'साप्ताहिक प्रभाव ट्रेंड',
    mealsDistributed: 'वितरित भोजन',
    co2Prevented: 'रोका गया CO₂ (किग्रा)',
    waterSaved: 'बचाया गया पानी (एल)',
    emergencyAlerts: 'आपातकालीन सतर्कताएं',
    thisMonth: 'इस महीने',
    mealsSaved: 'भोजन बचाया गया',
    foodDiverted: 'भोजन हटाया गया',
    co2Prevented2: 'CO₂ रोका गया',
    
    // Food Cards
    quantity: 'मात्रा',
    expiry: 'एक्सपायरी',
    distance: 'दूरी',
    freshness: 'ताजापन',
    requestFood: 'इस भोजन का अनुरोध करें',
    availableFood: 'आज का उपलब्ध भोजन',
    recommendedForYou: 'आपके लिए अनुशंसित',
    seeAll: 'सभी देखें',
    
    // Search & Filter
    search: 'खोज',
    searchFood: 'अतिरिक्त भोजन खोजें...',
    groceries: 'किराना सामान',
    meals: 'भोजन',
    bakedGoods: 'बेक किए हुए सामान',
    listView: 'सूची दृश्य',
    mapView: 'मानचित्र दृश्य',
    
    // Settings
    userDetails: 'उपयोगकर्ता विवरण',
    darkMode: 'डार्क मोड',
    language: 'भाषा',
    english: 'अंग्रेजी',
    tamil: 'तमिल',
    hindi: 'हिंदी',
    email: 'ईमेल',
    phone: 'फोन',
    location: 'स्थान',
    role: 'भूमिका',
    
    // Features (for hamburger menu)
    oneClickPosting: 'वन-क्लिक सरप्लस पोस्टिंग',
    smartMatching: 'स्मार्ट NGO मिलान',
    foodSafety: 'खाद्य सुरक्षा टाइमर',
    photoVerification: 'फोटो सत्यापन (AI)',
    demandAware: 'मांग-जागरूक पुनर्वितरण',
    falsePrevention: 'गलत अधिशेष रोकथाम',
    heatmap: 'लाइव खाद्य बचाव हीटमैप',
    impactMeter: 'कार्बन और जलवायु प्रभाव',
    emergencyMode: 'आपातकालीन भूख मोड',
    accessibility: 'सेटिंग्स और पहुंच',
    
    // Buttons
    enable: 'सक्षम करें',
    disable: 'अक्षम करें',
    save: 'सहेजें',
    cancel: 'रद्द करें',
    
    // Messages
    welcomeBack: 'वापसी पर स्वागत है!',
    goodMorning: 'शुभ प्रभात',
    letsSaveFood: 'चलिए कुछ स्वादिष्ट खाना बचाते हैं...',
    urgentNeed: 'अत्यावश्यक: 50+ लोगों को अभी भोजन की जरूरत है',
    locationAway: 'दूर',
    respondNow: 'अभी जवाब दें',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
