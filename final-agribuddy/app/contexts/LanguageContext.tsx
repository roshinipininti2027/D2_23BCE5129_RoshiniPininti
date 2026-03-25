"use client"

import { Assistant } from "next/font/google"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface LanguageContextType {
  language: string
  setLanguage: (lang: string) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

const translations = {
  en: {
    // Navigation
    home: "Home",
    dashboard: "Dashboard",
    farms: "Farms",
    cropSchedules: "Crop Schedules",
    advisory: "Advisory",
    activities: "Activities",
    weather: "Weather",
    analytics: "Analytics",
    profile: "Profile",
    logout: "Logout",
    login: "Login",
    register: "Register",

    // Hero Section
    heroTitle: "Smart Farming for",
    heroTitleHighlight: "Better Harvest",
    heroDescription: "Revolutionize your farming with AI-powered crop scheduling, real-time weather alerts, and data-driven agricultural insights.",
    getStarted: "Get Started",
    freeToStart: "Free to Start",
    realTimeData: "Real-time Data",
    expertSupport: "Expert Support",

    // Features
    realTimeWeather: "Real-time Weather",
    realTimeWeatherDesc: "Get accurate weather forecasts and alerts for better crop planning and protection.",
    smartCropCalendar: "Smart Crop Calendar",
    smartCropCalendarDesc: "Personalized calendar with crop stages, recommended practices, and resource inputs.",
    cropDiary: "Crop Diary",
    cropDiaryDesc: "Digital logbook to track all farming activities from sowing to harvesting.",
    localizedRecommendations: "Localized Recommendations",
    localizedRecommendationsDesc: "Crop suggestions based on your location, soil type, and seasonal patterns.",
    analyticsReports: "Analytics & Reports",
    analyticsReportsDesc: "Visualizations and insights for yield trends, input efficiency, and planning.",
    multiLanguageSupport: "Multi-language Support",
    multiLanguageSupportDesc: "Available in 9 Indian languages for better accessibility.",

    // Stats
    happyFarmers: "Happy Farmers",
    cropsManaged: "Crops Managed",
    accuracyRate: "Accuracy Rate",
    weatherMonitoring: "Weather Monitoring",

    // Dashboard
    cropDashboard: "Crop Dashboard",
    realTimeMonitoring: "Real-time Monitoring",
    activeCrops: "Active Crops",
    healthScore: "Health Score",
    weatherAlert: "Rain expected tomorrow",

    // CTA
    whyChooseAgriBuddy: "Why Choose AgriBuddy?",
    whyChooseDesc: "Comprehensive farming solution with cutting-edge technology and local expertise.",
    readyToStart: "Ready to Transform Your Farming?",
    readyToStartDesc: "Join thousands of farmers who are already using AgriBuddy to increase their yield and reduce costs.",
    startFarming: "Start Smart Farming",

    // Footer
    footerDescription: "Empowering farmers with smart technology for sustainable agriculture.",
    features: "Features",
    weatherIntegration: "Weather Integration",
    cropCalendar: "Crop Calendar",
    soilAnalysis: "Soil Analysis",
    analytics: "Analytics",
    support: "Support",
    helpCenter: "Help Center",
    documentation: "Documentation",
    community: "Community",
    contact: "Contact",
    allRightsReserved: "All rights reserved.",

    // Forms
    name: "Name",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    phone: "Phone Number",
    location: "Location",
    role: "Role",
    farmer: "Farmer",
    expert: "Agricultural Expert",
    farmingExperience: "Farming Experience (Years)",
    expertise: "Expertise Areas",
    certification: "Certification Number",
    welcomeBack: "Welcome Back",
    signInToContinue: "Sign in to continue to your account",
    createAccount: "Create Account",
    joinAgriBuddy: "Join AgriBuddy community",
    alreadyHaveAccount: "Already have an account?",
    dontHaveAccount: "Don't have an account?",
    signUp: "Sign Up",
    signIn: "Sign In",

    // Weather
    temperature: "Temperature",
    humidity: "Humidity",
    windSpeed: "Wind Speed",
    rainfall: "Rainfall",
    forecast: "Forecast",
    alerts: "Alerts",

    // Crops
    cropName: "Crop Name",
    variety: "Variety",
    plantingDate: "Planting Date",
    harvestDate: "Harvest Date",
    area: "Area (Acres)",
    status: "Status",
    notes: "Notes",

    // Common
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    add: "Add",
    view: "View",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    warning: "Warning",
    info: "Info",
    welcome: "Welcome",
    loginSuccessful: "Login Successful",
    Notifications: "Notifications",
    aiAssistant:"AI Assistant",
    askExpert:"Ask Expert",
    myFarms:"My Farms",
    totalFarms:"Total Farms",
    totalArea:"Total Area",
    currentWeather:"Current Weather",
    yieldTrend:"Yield Trend",
    cropDistribution:"Crop Distribution",
    recentActivities:"Recent Activities",
  },
  hi: {
  // Navigation
  home: "होम",
  dashboard: "डैशबोर्ड",
  farms: "खेत",
  cropSchedules: "फसल समय सारणी",
  advisory: "सलाह",
  activities: "गतिविधियाँ",
  weather: "मौसम",
  analytics: "विश्लेषण",
  profile: "प्रोफ़ाइल",
  logout: "लॉगआउट",
  login: "लॉगिन",
  register: "रजिस्टर",

  // Hero Section
  heroTitle: "स्मार्ट खेती के लिए",
  heroTitleHighlight: "बेहतर फसल",
  heroDescription: "एआई-संचालित फसल शेड्यूलिंग, रीयल-टाइम मौसम अलर्ट और डेटा-आधारित कृषि अंतर्दृष्टि के साथ अपनी खेती को बदलें।",
  getStarted: "शुरू करें",
  freeToStart: "मुफ़्त में शुरू करें",
  realTimeData: "रीयल-टाइम डेटा",
  expertSupport: "विशेषज्ञ सहायता",

  // Features
  realTimeWeather: "रीयल-टाइम मौसम",
  realTimeWeatherDesc: "बेहतर फसल योजना और सुरक्षा के लिए सटीक मौसम पूर्वानुमान और अलर्ट प्राप्त करें।",
  smartCropCalendar: "स्मार्ट फसल कैलेंडर",
  smartCropCalendarDesc: "फसल चरणों, अनुशंसित प्रथाओं और संसाधन इनपुट के साथ व्यक्तिगत कैलेंडर।",
  cropDiary: "फसल डायरी",
  cropDiaryDesc: "बुवाई से कटाई तक सभी कृषि गतिविधियों को ट्रैक करने के लिए डिजिटल लॉगबुक।",
  localizedRecommendations: "स्थानीयकृत सिफारिशें",
  localizedRecommendationsDesc: "आपके स्थान, मिट्टी के प्रकार और मौसमी पैटर्न के आधार पर फसल सुझाव।",
  analyticsReports: "विश्लेषण और रिपोर्ट",
  analyticsReportsDesc: "उपज रुझान, इनपुट दक्षता और योजना के लिए विज़ुअलाइज़ेशन और अंतर्दृष्टि।",
  multiLanguageSupport: "बहुभाषी समर्थन",
  multiLanguageSupportDesc: "बेहतर पहुंच के लिए 9 भारतीय भाषाओं में उपलब्ध।",

  // Stats
  happyFarmers: "खुश किसान",
  cropsManaged: "प्रबंधित फसलें",
  accuracyRate: "सटीकता दर",
  weatherMonitoring: "मौसम निगरानी",

  // Dashboard
  cropDashboard: "फसल डैशबोर्ड",
  realTimeMonitoring: "रीयल-टाइम निगरानी",
  activeCrops: "सक्रिय फसलें",
  healthScore: "स्वास्थ्य स्कोर",
  weatherAlert: "कल वर्षा की संभावना",

  // CTA
  whyChooseAgriBuddy: "कृषि मित्र क्यों चुनें?",
  whyChooseDesc: "स्थानीय विशेषज्ञता और अत्याधुनिक तकनीक के साथ व्यापक खेती समाधान।",
  readyToStart: "क्या आप अपनी खेती बदलने के लिए तैयार हैं?",
  readyToStartDesc: "हजारों किसानों से जुड़ें जो पहले से ही एग्रीबडी का उपयोग कर रहे हैं।",
  startFarming: "स्मार्ट खेती शुरू करें",

  // Footer
  footerDescription: "सतत कृषि के लिए स्मार्ट तकनीक के साथ किसानों को सशक्त बनाना।",
  features: "विशेषताएं",
  weatherIntegration: "मौसम एकीकरण",
  cropCalendar: "फसल कैलेंडर",
  soilAnalysis: "मिट्टी विश्लेषण",
  analytics: "विश्लेषण",
  support: "सहायता",
  helpCenter: "सहायता केंद्र",
  documentation: "दस्तावेज़",
  community: "समुदाय",
  contact: "संपर्क",
  allRightsReserved: "सभी अधिकार सुरक्षित।",

  // Forms
  name: "नाम",
  email: "ईमेल",
  password: "पासवर्ड",
  confirmPassword: "पासवर्ड की पुष्टि करें",
  phone: "फोन नंबर",
  location: "स्थान",
  role: "भूमिका",
  farmer: "किसान",
  expert: "कृषि विशेषज्ञ",
  farmingExperience: "खेती का अनुभव (वर्ष)",
  expertise: "विशेषज्ञता क्षेत्र",
  certification: "प्रमाणन संख्या",
  welcomeBack: "वापसी पर स्वागत है",
  signInToContinue: "अपने खाते में जारी रखने के लिए साइन इन करें",
  createAccount: "खाता बनाएं",
  joinAgriBuddy: "एग्रीबडी समुदाय से जुड़ें",
  alreadyHaveAccount: "पहले से खाता है?",
  dontHaveAccount: "खाता नहीं है?",
  signUp: "साइन अप करें",
  signIn: "साइन इन करें",

  // Weather
  temperature: "तापमान",
  humidity: "आर्द्रता",
  windSpeed: "पवन गति",
  rainfall: "वर्षा",
  forecast: "पूर्वानुमान",
  alerts: "अलर्ट",

  // Crops
  cropName: "फसल का नाम",
  variety: "किस्म",
  plantingDate: "बुवाई की तिथि",
  harvestDate: "कटाई की तिथि",
  area: "क्षेत्र (एकड़)",
  status: "स्थिति",
  notes: "टिप्पणियाँ",

  // Common
  save: "सहेजें",
  cancel: "रद्द करें",
  edit: "संपादित करें",
  delete: "हटाएं",
  add: "जोड़ें",
  view: "देखें",
  loading: "लोड हो रहा है...",
  error: "त्रुटि",
  success: "सफलता",
  warning: "चेतावनी",
  info: "जानकारी",
  welcome: "स्वागत है",
  loginSuccessful: "लॉगिन सफल",
  Notifications: "सूचनाएँ",
  aiAssistant: "एआई सहायक",
  askExpert: "विशेषज्ञ से पूछें",
  myFarms: "मेरे खेत",
  totalFarms: "कुल खेत",
  totalArea: "कुल क्षेत्र",
  currentWeather: "वर्तमान मौसम",
  yieldTrend: "उपज प्रवृत्ति",
  cropDistribution: "फसल वितरण",
  recentActivities: "हाल की गतिविधियाँ",
},

  // Add more languages (Bengali, Tamil, Telugu, Marathi, Gujarati, Punjabi, Kannada)
  bn: {
  // Navigation
  home: "হোম",
  dashboard: "ড্যাশবোর্ড",
  farms: "খামার",
  cropSchedules: "ফসল সময়সূচি",
  advisory: "পরামর্শ",
  activities: "কার্যক্রম",
  weather: "আবহাওয়া",
  analytics: "বিশ্লেষণ",
  profile: "প্রোফাইল",
  logout: "লগআউট",
  login: "লগইন",
  register: "রেজিস্টার",

  // Hero Section
  heroTitle: "স্মার্ট চাষের জন্য",
  heroTitleHighlight: "ভালো ফলন",
  heroDescription: "এআই-চালিত ফসল পরিকল্পনা, রিয়েল-টাইম আবহাওয়ার সতর্কতা এবং ডেটা-ভিত্তিক কৃষি জ্ঞানের মাধ্যমে আপনার কৃষিকে রূপান্তর করুন।",
  getStarted: "শুরু করুন",
  freeToStart: "ফ্রি শুরু করুন",
  realTimeData: "রিয়েল-টাইম তথ্য",
  expertSupport: "বিশেষজ্ঞ সহায়তা",

  // Features
  realTimeWeather: "রিয়েল-টাইম আবহাওয়া",
  realTimeWeatherDesc: "ভালো ফসল পরিকল্পনা ও সুরক্ষার জন্য সঠিক আবহাওয়ার পূর্বাভাস এবং সতর্কতা।",
  smartCropCalendar: "স্মার্ট ফসল ক্যালেন্ডার",
  smartCropCalendarDesc: "ফসলের ধাপ, প্রস্তাবিত পদ্ধতি এবং সম্পদের ইনপুট সহ ব্যক্তিগত ক্যালেন্ডার।",
  cropDiary: "ফসল ডায়েরি",
  cropDiaryDesc: "বপন থেকে ফসল কাটা পর্যন্ত সমস্ত কার্যক্রম ট্র্যাক করার জন্য ডিজিটাল লগবুক।",
  localizedRecommendations: "স্থানীয় সুপারিশ",
  localizedRecommendationsDesc: "আপনার এলাকা, মাটির ধরন এবং মৌসুমি ধরণ অনুযায়ী ফসলের প্রস্তাবনা।",
  analyticsReports: "বিশ্লেষণ ও প্রতিবেদন",
  analyticsReportsDesc: "ফসলের প্রবণতা, দক্ষতা এবং পরিকল্পনার জন্য তথ্য।",
  multiLanguageSupport: "বহুভাষী সহায়তা",
  multiLanguageSupportDesc: "৯টি ভারতীয় ভাষায় উপলব্ধ।",

  // Stats
  happyFarmers: "খুশি কৃষক",
  cropsManaged: "পরিচালিত ফসল",
  accuracyRate: "সঠিকতার হার",
  weatherMonitoring: "আবহাওয়া পর্যবেক্ষণ",

  // Dashboard
  cropDashboard: "ফসল ড্যাশবোর্ড",
  realTimeMonitoring: "রিয়েল-টাইম পর্যবেক্ষণ",
  activeCrops: "সক্রিয় ফসল",
  healthScore: "স্বাস্থ্য সূচক",
  weatherAlert: "আগামীকাল বৃষ্টির সম্ভাবনা",

  // CTA
  whyChooseAgriBuddy: "কেন এগ্রিবাডি বেছে নেবেন?",
  whyChooseDesc: "স্থানীয় অভিজ্ঞতা ও আধুনিক প্রযুক্তির সঙ্গে সম্পূর্ণ চাষ সমাধান।",
  readyToStart: "আপনি কি আপনার কৃষিকে পরিবর্তন করতে প্রস্তুত?",
  readyToStartDesc: "হাজার হাজার কৃষক ইতিমধ্যেই এগ্রিবাডি ব্যবহার করছেন।",
  startFarming: "স্মার্ট চাষ শুরু করুন",

  // Footer
  footerDescription: "স্মার্ট প্রযুক্তির মাধ্যমে টেকসই কৃষির জন্য কৃষকদের ক্ষমতায়ন।",
  features: "বৈশিষ্ট্য",
  weatherIntegration: "আবহাওয়া একীকরণ",
  cropCalendar: "ফসল ক্যালেন্ডার",
  soilAnalysis: "মাটির বিশ্লেষণ",
  analytics: "বিশ্লেষণ",
  support: "সহায়তা",
  helpCenter: "সহায়তা কেন্দ্র",
  documentation: "ডকুমেন্টেশন",
  community: "কমিউনিটি",
  contact: "যোগাযোগ",
  allRightsReserved: "সর্বস্বত্ব সংরক্ষিত।",

  // Forms
  name: "নাম",
  email: "ইমেইল",
  password: "পাসওয়ার্ড",
  confirmPassword: "পাসওয়ার্ড নিশ্চিত করুন",
  phone: "ফোন নম্বর",
  location: "অবস্থান",
  role: "ভূমিকা",
  farmer: "কৃষক",
  expert: "কৃষি বিশেষজ্ঞ",
  farmingExperience: "চাষের অভিজ্ঞতা (বছর)",
  expertise: "দক্ষতার ক্ষেত্র",
  certification: "সার্টিফিকেট নম্বর",
  welcomeBack: "ফিরে আসার জন্য স্বাগতম",
  signInToContinue: "চালিয়ে যেতে সাইন ইন করুন",
  createAccount: "অ্যাকাউন্ট তৈরি করুন",
  joinAgriBuddy: "এগ্রিবাডি কমিউনিটিতে যোগ দিন",
  alreadyHaveAccount: "ইতিমধ্যেই অ্যাকাউন্ট আছে?",
  dontHaveAccount: "অ্যাকাউন্ট নেই?",
  signUp: "সাইন আপ করুন",
  signIn: "সাইন ইন করুন",

  // Weather
  temperature: "তাপমাত্রা",
  humidity: "আর্দ্রতা",
  windSpeed: "বাতাসের গতি",
  rainfall: "বৃষ্টিপাত",
  forecast: "পূর্বাভাস",
  alerts: "সতর্কতা",

  // Crops
  cropName: "ফসলের নাম",
  variety: "প্রজাতি",
  plantingDate: "বপনের তারিখ",
  harvestDate: "ফসল কাটার তারিখ",
  area: "এলাকা (একর)",
  status: "অবস্থা",
  notes: "নোট",

  // Common
  save: "সংরক্ষণ করুন",
  cancel: "বাতিল করুন",
  edit: "সম্পাদনা করুন",
  delete: "মুছুন",
  add: "যোগ করুন",
  view: "দেখুন",
  loading: "লোড হচ্ছে...",
  error: "ত্রুটি",
  success: "সাফল্য",
  warning: "সতর্কতা",
  info: "তথ্য",
  welcome: "স্বাগতম",
  loginSuccessful: "লগইন সফল",
  Notifications: "বিজ্ঞপ্তি",
  aiAssistant: "এআই সহকারী",
  askExpert: "বিশেষজ্ঞকে জিজ্ঞাসা করুন",
  myFarms: "আমার খামার",
  totalFarms: "মোট খামার",
  totalArea: "মোট এলাকা",
  currentWeather: "বর্তমান আবহাওয়া",
  yieldTrend: "ফসলের প্রবণতা",
  cropDistribution: "ফসল বণ্টন",
  recentActivities: "সাম্প্রতিক কার্যক্রম",
},

  ta: {
    // Navigation
    home: "முகப்பு",
    dashboard: "டாஷ்போர்டு",
    farms: "பண்ணைகள்",
    cropSchedules: "பயிர் அட்டவணைகள்",
    advisory: "ஆலோசனை",
    activities: "செயல்பாடுகள்",
    weather: "வானிலை",
    analytics: "ஆய்வுகள்",
    profile: "சுயவிவரம்",
    logout: "வெளியேறு",
    login: "உள்நுழை",
    register: "பதிவு செய்யவும்",

    // Hero Section
    heroTitle: "செயல்முறை விவசாயம்",
    heroTitleHighlight: "மேம்பட்ட அறுவடைக்கு",
    heroDescription: "AI அடிப்படையிலான பயிர் அட்டவணை, நேரடி வானிலை எச்சரிக்கை மற்றும் தரவு சார்ந்த வேளாண் நுண்ணறிவுகளுடன் உங்கள் விவசாயத்தை மாற்றியமைக்கவும்.",
    getStarted: "தொடங்கு",
    freeToStart: "இலவசமாக தொடங்கு",
    realTimeData: "நேரடி தரவு",
    expertSupport: "நிபுணர் உதவி",

    // Features
    realTimeWeather: "நேரடி வானிலை",
    realTimeWeatherDesc: "பயிர் திட்டமிடல் மற்றும் பாதுகாப்புக்காக துல்லியமான வானிலை முன்னறிவிப்பு மற்றும் எச்சரிக்கைகளைப் பெறுங்கள்.",
    smartCropCalendar: "ஸ்மார்ட் பயிர் அட்டவணை",
    smartCropCalendarDesc: "பயிர் நிலைகள், பரிந்துரைக்கப்பட்ட நடைமுறைகள் மற்றும் வளங்களுடன் தனிப்பயன் அட்டவணை.",
    cropDiary: "பயிர் டையரி",
    cropDiaryDesc: "விதைப்பு முதல் அறுவடை வரை அனைத்து விவசாய செயல்பாடுகளையும் பதிவு செய்யும் டிஜிட்டல் புத்தகம்.",
    localizedRecommendations: "உள்ளூர்மயமான பரிந்துரைகள்",
    localizedRecommendationsDesc: "உங்கள் இடம், நில வகை மற்றும் பருவ மாதிரிகளின் அடிப்படையில் பயிர் பரிந்துரைகள்.",
    analyticsReports: "ஆய்வுகள் மற்றும் அறிக்கைகள்",
    analyticsReportsDesc: "மகசூல் போக்குகள், உள்ளீடு திறன் மற்றும் திட்டமிடலுக்கான காட்சிப்படுத்தல்கள் மற்றும் நுண்ணறிவுகள்.",
    multiLanguageSupport: "பல மொழி ஆதரவு",
    multiLanguageSupportDesc: "சிறந்த அணுகலுக்காக 9 இந்திய மொழிகளில் கிடைக்கிறது.",

    // Stats
    happyFarmers: "மகிழ்ச்சியான விவசாயிகள்",
    cropsManaged: "மேற்பார்வையிடப்பட்ட பயிர்கள்",
    accuracyRate: "துல்லிய விகிதம்",
    weatherMonitoring: "வானிலை கண்காணிப்பு",

    // Dashboard
    cropDashboard: "பயிர் டாஷ்போர்டு",
    realTimeMonitoring: "நேரடி கண்காணிப்பு",
    activeCrops: "செயலில் உள்ள பயிர்கள்",
    healthScore: "ஆரோக்கிய மதிப்பெண்",
    weatherAlert: "நாளை மழை வரும் என எதிர்பார்க்கப்படுகிறது",

    // CTA
    whyChooseAgriBuddy: "ஏன் AgriBuddy?",
    whyChooseDesc: "உயர் தொழில்நுட்பமும் உள்ளூர் நிபுணத்துவமும் கொண்ட விரிவான விவசாய தீர்வு.",
    readyToStart: "உங்கள் விவசாயத்தை மாற்றத் தயாரா?",
    readyToStartDesc: "ஏற்கனவே AgriBuddy-யைப் பயன்படுத்தி மகசூலை அதிகரித்து செலவுகளை குறைக்கும் ஆயிரக்கணக்கான விவசாயிகளில் சேருங்கள்.",
    startFarming: "ஸ்மார்ட் விவசாயத்தை தொடங்கவும்",

    // Footer
    footerDescription: "நிலைத்திருக்கக்கூடிய வேளாண்மைக்காக நுண்ணறிவு தொழில்நுட்பத்துடன் விவசாயிகளை அதிகாரப்படுத்துகிறது.",
    features: "அம்சங்கள்",
    weatherIntegration: "வானிலை ஒருங்கிணைப்பு",
    cropCalendar: "பயிர் அட்டவணை",
    soilAnalysis: "மண் பகுப்பாய்வு",
    analytics: "ஆய்வுகள்",
    support: "ஆதரவு",
    helpCenter: "உதவி மையம்",
    documentation: "ஆவணங்கள்",
    community: "சமூகத்துடன்",
    contact: "தொடர்பு",
    allRightsReserved: "அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.",

    // Forms
    name: "பெயர்",
    email: "மின்னஞ்சல்",
    password: "கடவுச்சொல்",
    confirmPassword: "கடவுச்சொல்லை உறுதிப்படுத்தவும்",
    phone: "தொலைபேசி எண்",
    location: "இடம்",
    role: "பங்கு",
    farmer: "விவசாயி",
    expert: "வேளாண் நிபுணர்",
    farmingExperience: "விவசாய அனுபவம் (ஆண்டுகள்)",
    expertise: "நிபுணத்துவம்",
    certification: "சான்றிதழ் எண்",
    welcomeBack: "மீண்டும் வரவேற்கிறோம்",
    signInToContinue: "உங்கள் கணக்கில் உள்நுழையவும்",
    createAccount: "கணக்கை உருவாக்கவும்",
    joinAgriBuddy: "AgriBuddy சமூகத்தில் சேரவும்",
    alreadyHaveAccount: "ஏற்கனவே கணக்கு உள்ளதா?",
    dontHaveAccount: "கணக்கு இல்லையா?",
    signUp: "பதிவு செய்யவும்",
    signIn: "உள்நுழையவும்",

    // Weather
    temperature: "வெப்பநிலை",
    humidity: "ஈரப்பதம்",
    windSpeed: "காற்றின் வேகம்",
    rainfall: "மழை",
    forecast: "முன்னறிவிப்பு",
    alerts: "எச்சரிக்கைகள்",

    // Crops
    cropName: "பயிர் பெயர்",
    variety: "வகை",
    plantingDate: "நடவு தேதி",
    harvestDate: "அறுவடை தேதி",
    area: "பரப்பளவு (ஏக்கர்)",
    status: "நிலை",
    notes: "குறிப்புகள்",

    // Common
    save: "சேமிக்கவும்",
    cancel: "ரத்து",
    edit: "திருத்து",
    delete: "அழி",
    add: "சேர்",
    view: "காண்க",
    loading: "ஏற்றப்படுகிறது...",
    error: "பிழை",
    success: "வெற்றி",
    warning: "எச்சரிக்கை",
    info: "தகவல்",
    welcome: "வரவேற்பு",
    loginSuccessful: "உள்நுழைவு வெற்றிகரமாக முடிந்தது",
    Notifications: "அறிவிப்புகள்",
    aiAssistant: "AI உதவியாளர்",
    askExpert: "நிபுணரிடம் கேளுங்கள்",
    myFarms: "எனது பண்ணைகள்",
    totalFarms: "மொத்த பண்ணைகள்",
    totalArea: "மொத்த பரப்பளவு",
    currentWeather: "தற்போதைய வானிலை",
    yieldTrend: "மகசூல் போக்கு",
    cropDistribution: "பயிர் பகிர்வு",
    recentActivities: "சமீபத்திய செயல்பாடுகள்"
},
te: {
    // Navigation
    home: "హోమ్",
    dashboard: "డాష్‌బోర్డు",
    farms: "ఫారాలు",
    cropSchedules: "పంట షెడ్యూల్లు",
    advisory: "సలహా",
    activities: "కార్యకలాపాలు",
    weather: "వాతావరణం",
    analytics: "విశ్లేషణలు",
    profile: "ప్రొఫైల్",
    logout: "లాగ్ అవుట్",
    login: "లాగిన్",
    register: "రిజిస్టర్",

    // Hero Section
    heroTitle: "స్మార్ట్ వ్యవసాయం",
    heroTitleHighlight: "మెరుగైన పంట కోసం",
    heroDescription: "AI ఆధారిత పంట షెడ్యూలింగ్, రియల్-టైమ్ వాతావరణ హెచ్చరికలు మరియు డేటా ఆధారిత వ్యవసాయ సమాచారంతో మీ వ్యవసాయాన్ని మార్చండి.",
    getStarted: "ప్రారంభించండి",
    freeToStart: "ఉచితంగా ప్రారంభించండి",
    realTimeData: "రియల్-టైమ్ డేటా",
    expertSupport: "నిపుణుల మద్దతు",

    // Features
    realTimeWeather: "రియల్-టైమ్ వాతావరణం",
    realTimeWeatherDesc: "పంటల ప్రణాళిక మరియు రక్షణ కోసం ఖచ్చితమైన వాతావరణ అంచనాలు మరియు హెచ్చరికలు పొందండి.",
    smartCropCalendar: "స్మార్ట్ పంట క్యాలెండర్",
    smartCropCalendarDesc: "పంట దశలు, సిఫార్సు చేసిన పద్ధతులు మరియు వనరులతో వ్యక్తిగత క్యాలెండర్.",
    cropDiary: "పంట డైరీ",
    cropDiaryDesc: "విత్తనాల నుండి కోత వరకు వ్యవసాయ కార్యకలాపాలను నమోదు చేసే డిజిటల్ పుస్తకం.",
    localizedRecommendations: "స్థానిక సిఫార్సులు",
    localizedRecommendationsDesc: "మీ ప్రదేశం, మట్టి రకం మరియు సీజనల్ నమూనాల ఆధారంగా పంట సిఫార్సులు.",
    analyticsReports: "విశ్లేషణలు & నివేదికలు",
    analyticsReportsDesc: "మొత్తం ధోరణులు, ఇన్‌పుట్ సామర్థ్యం మరియు ప్రణాళిక కోసం విశ్లేషణలు.",
    multiLanguageSupport: "బహుభాషా మద్దతు",
    multiLanguageSupportDesc: "మెరుగైన ప్రాప్యత కోసం 9 భారతీయ భాషల్లో అందుబాటులో ఉంది.",

    // Stats
    happyFarmers: "సంతోషకరమైన రైతులు",
    cropsManaged: "నిర్వహించిన పంటలు",
    accuracyRate: "ఖచ్చితత్వ రేటు",
    weatherMonitoring: "వాతావరణ పర్యవేక్షణ",

    // Dashboard
    cropDashboard: "పంట డాష్‌బోర్డు",
    realTimeMonitoring: "రియల్-టైమ్ మానిటరింగ్",
    activeCrops: "సక్రియ పంటలు",
    healthScore: "ఆరోగ్య స్కోరు",
    weatherAlert: "రేపు వర్షం పడే అవకాశం ఉంది",

    // CTA
    whyChooseAgriBuddy: "ఎందుకు AgriBuddy?",
    whyChooseDesc: "అధునాతన సాంకేతికత మరియు స్థానిక నిపుణుల పరిజ్ఞానంతో సమగ్ర వ్యవసాయ పరిష్కారం.",
    readyToStart: "మీ వ్యవసాయాన్ని మార్చడానికి సిద్ధమా?",
    readyToStartDesc: "AgriBuddy ఉపయోగించి దిగుబడిని పెంచి ఖర్చులను తగ్గిస్తున్న వేలాది మంది రైతులతో చేరండి.",
    startFarming: "స్మార్ట్ వ్యవసాయం ప్రారంభించండి",

    // Footer
    footerDescription: "సుస్థిరమైన వ్యవసాయం కోసం స్మార్ట్ టెక్నాలజీతో రైతులను శక్తివంతం చేయడం.",
    features: "ఫీచర్లు",
    weatherIntegration: "వాతావరణ ఇంటిగ్రేషన్",
    cropCalendar: "పంట క్యాలెండర్",
    soilAnalysis: "మట్టి విశ్లేషణ",
    analytics: "విశ్లేషణలు",
    support: "మద్దతు",
    helpCenter: "హెల్ప్ సెంటర్",
    documentation: "డాక్యుమెంటేషన్",
    community: "సమాజం",
    contact: "సంప్రదించండి",
    allRightsReserved: "అన్ని హక్కులు కలదు.",

    // Forms
    name: "పేరు",
    email: "ఈమెయిల్",
    password: "పాస్‌వర్డ్",
    confirmPassword: "పాస్‌వర్డ్‌ను ధృవీకరించండి",
    phone: "ఫోన్ నంబర్",
    location: "ప్రదేశం",
    role: "పాత్ర",
    farmer: "రైతు",
    expert: "వ్యవసాయ నిపుణుడు",
    farmingExperience: "వ్యవసాయ అనుభవం (సంవత్సరాలు)",
    expertise: "నైపుణ్యాలు",
    certification: "సర్టిఫికేట్ నంబర్",
    welcomeBack: "మళ్ళీ స్వాగతం",
    signInToContinue: "మీ ఖాతాలోకి లాగిన్ అవ్వండి",
    createAccount: "ఖాతా సృష్టించండి",
    joinAgriBuddy: "AgriBuddy కమ్యూనిటీలో చేరండి",
    alreadyHaveAccount: "ఇప్పటికే ఖాతా ఉందా?",
    dontHaveAccount: "ఖాతా లేదా?",
    signUp: "రిజిస్టర్ చేయండి",
    signIn: "లాగిన్ అవ్వండి",

    // Weather
    temperature: "ఉష్ణోగ్రత",
    humidity: "తేమ",
    windSpeed: "గాలి వేగం",
    rainfall: "వర్షపాతం",
    forecast: "అంచనా",
    alerts: "హెచ్చరికలు",

    // Crops
    cropName: "పంట పేరు",
    variety: "వైవిధ్యం",
    plantingDate: "విత్తన తేదీ",
    harvestDate: "కోత తేదీ",
    area: "ప్రాంతం (ఎకరాలు)",
    status: "స్థితి",
    notes: "గమనికలు",

    // Common
    save: "సేవ్ చేయండి",
    cancel: "రద్దు",
    edit: "సవరించండి",
    delete: "తొలగించండి",
    add: "జోడించండి",
    view: "చూడండి",
    loading: "లోడ్ అవుతోంది...",
    error: "లోపం",
    success: "విజయం",
    warning: "హెచ్చరిక",
    info: "సమాచారం",
    welcome: "స్వాగతం",
    loginSuccessful: "లాగిన్ విజయవంతమైంది",
    Notifications: "నోటిఫికేషన్లు",
    aiAssistant: "AI సహాయకుడు",
    askExpert: "నిపుణుడిని అడగండి",
    myFarms: "నా ఫారాలు",
    totalFarms: "మొత్తం ఫారాలు",
    totalArea: "మొత్తం విస్తీర్ణం",
    currentWeather: "ప్రస్తుత వాతావరణం",
    yieldTrend: "దిగుబడి ధోరణి",
    cropDistribution: "పంట పంపిణీ",
    recentActivities: "ఇటీవలి కార్యకలాపాలు"
},
mr: {
    // Navigation
    home: "मुख्यपृष्ठ",
    dashboard: "डॅशबोर्ड",
    farms: "शेती",
    cropSchedules: "पिकांचे वेळापत्रक",
    advisory: "सल्ला",
    activities: "क्रियाकलाप",
    weather: "हवामान",
    analytics: "विश्लेषण",
    profile: "प्रोफाइल",
    logout: "लॉगआऊट",
    login: "लॉगिन",
    register: "नोंदणी",

    // Hero Section
    heroTitle: "स्मार्ट शेती",
    heroTitleHighlight: "उत्तम पिकासाठी",
    heroDescription: "एआय-आधारित पिकांचे वेळापत्रक, रिअल-टाइम हवामान चेतावणी आणि डेटा-आधारित कृषी माहितीच्या साहाय्याने आपली शेती बदला.",
    getStarted: "सुरू करा",
    freeToStart: "मोफत सुरू करा",
    realTimeData: "रिअल-टाइम डेटा",
    expertSupport: "तज्ज्ञांचे सहाय्य",

    // Features
    realTimeWeather: "रिअल-टाइम हवामान",
    realTimeWeatherDesc: "पिकांची योजना आणि संरक्षणासाठी अचूक हवामान अंदाज आणि चेतावणी मिळवा.",
    smartCropCalendar: "स्मार्ट पिक कॅलेंडर",
    smartCropCalendarDesc: "पिकांच्या टप्प्यांसह, शिफारस केलेल्या पद्धती आणि साधनांसह वैयक्तिक कॅलेंडर.",
    cropDiary: "पिक डायरी",
    cropDiaryDesc: "पेरणीपासून कापणीपर्यंत सर्व शेती क्रियाकलाप नोंदविण्यासाठी डिजिटल वही.",
    localizedRecommendations: "स्थानिक शिफारसी",
    localizedRecommendationsDesc: "आपल्या ठिकाण, मातीचा प्रकार आणि हंगामी नमुन्यांवर आधारित पिकांच्या शिफारसी.",
    analyticsReports: "विश्लेषण व अहवाल",
    analyticsReportsDesc: "उत्पन्नाच्या प्रवृत्ती, इनपुट कार्यक्षमता आणि नियोजनासाठी दृश्य व विश्लेषण.",
    multiLanguageSupport: "बहुभाषिक समर्थन",
    multiLanguageSupportDesc: "सुलभ वापरासाठी ९ भारतीय भाषांमध्ये उपलब्ध.",

    // Stats
    happyFarmers: "आनंदी शेतकरी",
    cropsManaged: "व्यवस्थापित पिके",
    accuracyRate: "अचूकता दर",
    weatherMonitoring: "हवामान निरीक्षण",

    // Dashboard
    cropDashboard: "पिक डॅशबोर्ड",
    realTimeMonitoring: "रिअल-टाइम निरीक्षण",
    activeCrops: "सक्रिय पिके",
    healthScore: "आरोग्य गुण",
    weatherAlert: "उद्या पावसाची शक्यता आहे",

    // CTA
    whyChooseAgriBuddy: "AgriBuddy का निवडावे?",
    whyChooseDesc: "प्रगत तंत्रज्ञान आणि स्थानिक तज्ज्ञतेसह व्यापक शेती समाधान.",
    readyToStart: "तुमची शेती बदलण्यासाठी तयार आहात का?",
    readyToStartDesc: "AgriBuddy वापरून उत्पादन वाढवणारे आणि खर्च कमी करणारे हजारो शेतकरी सामील व्हा.",
    startFarming: "स्मार्ट शेती सुरू करा",

    // Footer
    footerDescription: "शाश्वत शेतीसाठी स्मार्ट तंत्रज्ञानाने शेतकऱ्यांना सक्षम करणे.",
    features: "वैशिष्ट्ये",
    weatherIntegration: "हवामान एकत्रीकरण",
    cropCalendar: "पिक कॅलेंडर",
    soilAnalysis: "माती विश्लेषण",
    analytics: "विश्लेषण",
    support: "सहाय्य",
    helpCenter: "मदत केंद्र",
    documentation: "दस्तऐवजीकरण",
    community: "समुदाय",
    contact: "संपर्क",
    allRightsReserved: "सर्व हक्क राखीव.",

    // Forms
    name: "नाव",
    email: "ईमेल",
    password: "संकेतशब्द",
    confirmPassword: "संकेतशब्दाची पुष्टी करा",
    phone: "फोन क्रमांक",
    location: "स्थान",
    role: "भूमिका",
    farmer: "शेतकरी",
    expert: "कृषी तज्ज्ञ",
    farmingExperience: "शेतीचा अनुभव (वर्षे)",
    expertise: "तज्ज्ञता क्षेत्रे",
    certification: "प्रमाणपत्र क्रमांक",
    welcomeBack: "पुन्हा स्वागत आहे",
    signInToContinue: "तुमच्या खात्यात लॉगिन करा",
    createAccount: "खाते तयार करा",
    joinAgriBuddy: "AgriBuddy समुदायात सामील व्हा",
    alreadyHaveAccount: "आधीपासून खाते आहे?",
    dontHaveAccount: "खाते नाही?",
    signUp: "नोंदणी करा",
    signIn: "लॉगिन करा",

    // Weather
    temperature: "तापमान",
    humidity: "आर्द्रता",
    windSpeed: "वाऱ्याचा वेग",
    rainfall: "पर्जन्य",
    forecast: "अंदाज",
    alerts: "चेतावणी",

    // Crops
    cropName: "पिकाचे नाव",
    variety: "प्रकार",
    plantingDate: "पेरणीची तारीख",
    harvestDate: "कापणीची तारीख",
    area: "क्षेत्रफळ (एकर)",
    status: "स्थिती",
    notes: "नोंदी",

    // Common
    save: "जतन करा",
    cancel: "रद्द करा",
    edit: "संपादित करा",
    delete: "हटवा",
    add: "जोडा",
    view: "पहा",
    loading: "लोड होत आहे...",
    error: "त्रुटी",
    success: "यशस्वी",
    warning: "चेतावणी",
    info: "माहिती",
    welcome: "स्वागत आहे",
    loginSuccessful: "लॉगिन यशस्वी",
    Notifications: "सूचना",
    aiAssistant: "एआय सहाय्यक",
    askExpert: "तज्ज्ञांना विचारा",
    myFarms: "माझी शेती",
    totalFarms: "एकूण शेती",
    totalArea: "एकूण क्षेत्रफळ",
    currentWeather: "सध्याचे हवामान",
    yieldTrend: "उत्पन्नाची प्रवृत्ती",
    cropDistribution: "पिकांचे वितरण",
    recentActivities: "अलीकडील क्रियाकलाप"
},
// Punjabi (pa)
pa: {
    // Navigation
    home: "ਮੁੱਖ ਪੰਨਾ",
    dashboard: "ਡੈਸ਼ਬੋਰਡ",
    farms: "ਖੇਤੀ",
    cropSchedules: "ਫਸਲਾਂ ਦਾ ਸਮਾਂ-ਸਾਰਣੀ",
    advisory: "ਸਲਾਹ",
    activities: "ਗਤੀਵਿਧੀਆਂ",
    weather: "ਮੌਸਮ",
    analytics: "ਵਿਸ਼ਲੇਸ਼ਣ",
    profile: "ਪ੍ਰੋਫਾਈਲ",
    logout: "ਲਾਗਆਊਟ",
    login: "ਲਾਗਇਨ",
    register: "ਰਜਿਸਟਰ",

    // Hero Section
    heroTitle: "ਸਮਾਰਟ ਖੇਤੀ",
    heroTitleHighlight: "ਬਿਹਤਰ ਫਸਲਾਂ ਲਈ",
    heroDescription: "ਏ.ਆਈ.-ਅਧਾਰਿਤ ਫਸਲ ਸ਼ਿਡਿਊਲਿੰਗ, ਰੀਅਲ-ਟਾਈਮ ਮੌਸਮੀ ਚੇਤਾਵਨੀਆਂ ਅਤੇ ਡੇਟਾ-ਅਧਾਰਿਤ ਖੇਤੀਬਾੜੀ ਜਾਣਕਾਰੀ ਨਾਲ ਆਪਣੀ ਖੇਤੀ ਨੂੰ ਬਦਲੋ।",
    getStarted: "ਸ਼ੁਰੂ ਕਰੋ",
    freeToStart: "ਮੁਫ਼ਤ ਸ਼ੁਰੂ ਕਰੋ",
    realTimeData: "ਰੀਅਲ-ਟਾਈਮ ਡੇਟਾ",
    expertSupport: "ਮਾਹਰਾਂ ਦਾ ਸਹਾਰਾ",

    // Features
    realTimeWeather: "ਰੀਅਲ-ਟਾਈਮ ਮੌਸਮ",
    realTimeWeatherDesc: "ਫਸਲਾਂ ਦੀ ਯੋਜਨਾ ਅਤੇ ਸੁਰੱਖਿਆ ਲਈ ਸਟੀਕ ਮੌਸਮ ਪੂਰਵ-ਅਨੁਮਾਨ ਅਤੇ ਚੇਤਾਵਨੀਆਂ ਪ੍ਰਾਪਤ ਕਰੋ।",
    smartCropCalendar: "ਸਮਾਰਟ ਫਸਲ ਕੈਲੰਡਰ",
    smartCropCalendarDesc: "ਫਸਲ ਪੜਾਅ, ਸਿਫਾਰਸ਼ੀ ਅਭਿਆਸਾਂ ਅਤੇ ਸਾਧਨਾਂ ਦੇ ਨਾਲ ਵਿਅਕਤੀਗਤ ਕੈਲੰਡਰ।",
    cropDiary: "ਫਸਲ ਡਾਇਰੀ",
    cropDiaryDesc: "ਬੀਜਣ ਤੋਂ ਵਾਢੀ ਤੱਕ ਸਾਰੀਆਂ ਖੇਤੀ ਗਤੀਵਿਧੀਆਂ ਰਿਕਾਰਡ ਕਰਨ ਲਈ ਡਿਜੀਟਲ ਲਾਗਬੁੱਕ।",
    localizedRecommendations: "ਸਥਾਨਕ ਸਿਫਾਰਸ਼ਾਂ",
    localizedRecommendationsDesc: "ਤੁਹਾਡੀ ਸਥਿਤੀ, ਮਿੱਟੀ ਦੀ ਕਿਸਮ ਅਤੇ ਮੌਸਮੀ ਪੈਟਰਨ ਦੇ ਅਧਾਰ 'ਤੇ ਫਸਲਾਂ ਦੀ ਸਿਫਾਰਸ਼।",
    analyticsReports: "ਵਿਸ਼ਲੇਸ਼ਣ ਅਤੇ ਰਿਪੋਰਟਾਂ",
    analyticsReportsDesc: "ਉਪਜ ਦੇ ਰੁਝਾਨ, ਇਨਪੁਟ ਕੁਸ਼ਲਤਾ ਅਤੇ ਯੋਜਨਾ ਲਈ ਦ੍ਰਿਸ਼ਟੀਗਤ ਵਿਸ਼ਲੇਸ਼ਣ।",
    multiLanguageSupport: "ਬਹੁ-ਭਾਸ਼ਾ ਸਮਰਥਨ",
    multiLanguageSupportDesc: "ਆਸਾਨ ਵਰਤੋਂ ਲਈ 9 ਭਾਰਤੀ ਭਾਸ਼ਾਵਾਂ ਵਿੱਚ ਉਪਲਬਧ।",

    // Stats
    happyFarmers: "ਖੁਸ਼ ਕਿਸਾਨ",
    cropsManaged: "ਪ੍ਰਬੰਧਿਤ ਫਸਲਾਂ",
    accuracyRate: "ਸਟੀਕਤਾ ਦਰ",
    weatherMonitoring: "ਮੌਸਮ ਨਿਗਰਾਨੀ",

    // Dashboard
    cropDashboard: "ਫਸਲ ਡੈਸ਼ਬੋਰਡ",
    realTimeMonitoring: "ਰੀਅਲ-ਟਾਈਮ ਨਿਗਰਾਨੀ",
    activeCrops: "ਸਰਗਰਮ ਫਸਲਾਂ",
    healthScore: "ਸਿਹਤ ਸਕੋਰ",
    weatherAlert: "ਕੱਲ੍ਹ ਬਾਰਿਸ਼ ਦੀ ਸੰਭਾਵਨਾ ਹੈ",

    // CTA
    whyChooseAgriBuddy: "AgriBuddy ਕਿਉਂ ਚੁਣੋ?",
    whyChooseDesc: "ਐਡਵਾਂਸਡ ਤਕਨੀਕ ਅਤੇ ਸਥਾਨਕ ਮਾਹਰਤਾ ਦੇ ਨਾਲ ਵਿਆਪਕ ਖੇਤੀ ਹੱਲ।",
    readyToStart: "ਕੀ ਤੁਸੀਂ ਆਪਣੀ ਖੇਤੀ ਨੂੰ ਬਦਲਣ ਲਈ ਤਿਆਰ ਹੋ?",
    readyToStartDesc: "ਹਜ਼ਾਰਾਂ ਕਿਸਾਨਾਂ ਨਾਲ ਜੁੜੋ ਜੋ AgriBuddy ਨਾਲ ਉਤਪਾਦਕਤਾ ਵਧਾ ਰਹੇ ਹਨ ਅਤੇ ਲਾਗਤ ਘਟਾ ਰਹੇ ਹਨ।",
    startFarming: "ਸਮਾਰਟ ਖੇਤੀ ਸ਼ੁਰੂ ਕਰੋ",

    // Footer
    footerDescription: "ਟਿਕਾਊ ਖੇਤੀ ਲਈ ਸਮਾਰਟ ਤਕਨੀਕ ਨਾਲ ਕਿਸਾਨਾਂ ਨੂੰ ਸਸ਼ਕਤ ਬਣਾਉਣਾ।",
    features: "ਵਿਸ਼ੇਸ਼ਤਾਵਾਂ",
    weatherIntegration: "ਮੌਸਮ ਏਕੀਕਰਣ",
    cropCalendar: "ਫਸਲ ਕੈਲੰਡਰ",
    soilAnalysis: "ਮਿੱਟੀ ਵਿਸ਼ਲੇਸ਼ਣ",
    analytics: "ਵਿਸ਼ਲੇਸ਼ਣ",
    support: "ਸਹਾਇਤਾ",
    helpCenter: "ਸਹਾਇਤਾ ਕੇਂਦਰ",
    documentation: "ਦਸਤਾਵੇਜ਼ੀਕਰਣ",
    community: "ਭਾਈਚਾਰਾ",
    contact: "ਸੰਪਰਕ",
    allRightsReserved: "ਸਾਰੇ ਹੱਕ ਰਾਖਵੇਂ।",

    // Forms
    name: "ਨਾਮ",
    email: "ਈਮੇਲ",
    password: "ਪਾਸਵਰਡ",
    confirmPassword: "ਪਾਸਵਰਡ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ",
    phone: "ਫੋਨ ਨੰਬਰ",
    location: "ਸਥਾਨ",
    role: "ਭੂਮਿਕਾ",
    farmer: "ਕਿਸਾਨ",
    expert: "ਖੇਤੀ ਮਾਹਰ",
    farmingExperience: "ਖੇਤੀ ਦਾ ਤਜਰਬਾ (ਸਾਲ)",
    expertise: "ਮਾਹਰਤਾ ਖੇਤਰ",
    certification: "ਪ੍ਰਮਾਣ-ਪੱਤਰ ਨੰਬਰ",
    welcomeBack: "ਵਾਪਸ ਜੀ ਆਇਆਂ ਨੂੰ",
    signInToContinue: "ਆਪਣੇ ਖਾਤੇ ਵਿੱਚ ਲਾਗਇਨ ਕਰੋ",
    createAccount: "ਖਾਤਾ ਬਣਾਓ",
    joinAgriBuddy: "AgriBuddy ਕਮਿਊਨਿਟੀ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋਵੋ",
    alreadyHaveAccount: "ਪਹਿਲਾਂ ਤੋਂ ਖਾਤਾ ਹੈ?",
    dontHaveAccount: "ਖਾਤਾ ਨਹੀਂ ਹੈ?",
    signUp: "ਸਾਇਨ ਅਪ",
    signIn: "ਸਾਇਨ ਇਨ",

    // Weather
    temperature: "ਤਾਪਮਾਨ",
    humidity: "ਨਮੀ",
    windSpeed: "ਹਵਾ ਦੀ ਰਫਤਾਰ",
    rainfall: "ਬਾਰਿਸ਼",
    forecast: "ਪੂਰਵ-ਅਨੁਮਾਨ",
    alerts: "ਚੇਤਾਵਨੀਆਂ",

    // Crops
    cropName: "ਫਸਲ ਦਾ ਨਾਮ",
    variety: "ਕਿਸਮ",
    plantingDate: "ਬੀਜਣ ਦੀ ਤਾਰੀਖ",
    harvestDate: "ਵਾਢੀ ਦੀ ਤਾਰੀਖ",
    area: "ਖੇਤਰਫਲ (ਏਕੜ)",
    status: "ਸਥਿਤੀ",
    notes: "ਨੋਟਸ",

    // Common
    save: "ਸੇਵ ਕਰੋ",
    cancel: "ਰੱਦ ਕਰੋ",
    edit: "ਸੰਪਾਦਿਤ ਕਰੋ",
    delete: "ਹਟਾਓ",
    add: "ਜੋੜੋ",
    view: "ਦੇਖੋ",
    loading: "ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...",
    error: "ਗਲਤੀ",
    success: "ਸਫਲ",
    warning: "ਚੇਤਾਵਨੀ",
    info: "ਜਾਣਕਾਰੀ",
    welcome: "ਜੀ ਆਇਆਂ ਨੂੰ",
    loginSuccessful: "ਲਾਗਇਨ ਸਫਲ",
    Notifications: "ਸੂਚਨਾਵਾਂ",
    aiAssistant: "ਏ.ਆਈ. ਸਹਾਇਕ",
    askExpert: "ਮਾਹਰ ਨੂੰ ਪੁੱਛੋ",
    myFarms: "ਮੇਰੇ ਖੇਤ",
    totalFarms: "ਕੁੱਲ ਖੇਤ",
    totalArea: "ਕੁੱਲ ਖੇਤਰਫਲ",
    currentWeather: "ਮੌਜੂਦਾ ਮੌਸਮ",
    yieldTrend: "ਉਪਜ ਦਾ ਰੁਝਾਨ",
    cropDistribution: "ਫਸਲਾਂ ਦਾ ਵੰਡ",
    recentActivities: "ਹਾਲ ਦੀਆਂ ਗਤੀਵਿਧੀਆਂ"
},

// Kannada (kn)
kn: {
    // Navigation
    home: "ಮುಖ್ಯ ಪುಟ",
    dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    farms: "ಕೃಷಿ",
    cropSchedules: "ಬೆಳೆ ವೇಳಾಪಟ್ಟಿ",
    advisory: "ಸಲಹೆ",
    activities: "ಚಟುವಟಿಕೆಗಳು",
    weather: "ಹವಾಮಾನ",
    analytics: "ವಿಶ್ಲೇಷಣೆ",
    profile: "ಪ್ರೊಫೈಲ್",
    logout: "ಲಾಗ್‌ಔಟ್",
    login: "ಲಾಗಿನ್",
    register: "ನೋಂದಣಿ",

    // Hero Section
    heroTitle: "ಸ್ಮಾರ್ಟ್ ಕೃಷಿ",
    heroTitleHighlight: "ಉತ್ತಮ ಬೆಳೆಗಳಿಗಾಗಿ",
    heroDescription: "ಎಐ-ಆಧಾರಿತ ಬೆಳೆ ವೇಳಾಪಟ್ಟಿ, ರಿಯಲ್-ಟೈಮ್ ಹವಾಮಾನ ಎಚ್ಚರಿಕೆಗಳು ಮತ್ತು ಡೇಟಾ-ಚಾಲಿತ ಕೃಷಿ ಮಾಹಿತಿಯೊಂದಿಗೆ ನಿಮ್ಮ ಕೃಷಿಯನ್ನು ಪರಿವರ್ತಿಸಿ.",
    getStarted: "ಪ್ರಾರಂಭಿಸಿ",
    freeToStart: "ಉಚಿತವಾಗಿ ಪ್ರಾರಂಭಿಸಿ",
    realTimeData: "ರಿಯಲ್-ಟೈಮ್ ಡೇಟಾ",
    expertSupport: "ತಜ್ಞರ ಬೆಂಬಲ",

    // Features
    realTimeWeather: "ರಿಯಲ್-ಟೈಮ್ ಹವಾಮಾನ",
    realTimeWeatherDesc: "ಬೆಳೆ ಯೋಜನೆ ಮತ್ತು ರಕ್ಷಣೆಗಾಗಿ ನಿಖರ ಹವಾಮಾನ ಮುನ್ನೋಟ ಮತ್ತು ಎಚ್ಚರಿಕೆಗಳನ್ನು ಪಡೆಯಿರಿ.",
    smartCropCalendar: "ಸ್ಮಾರ್ಟ್ ಬೆಳೆ ಕ್ಯಾಲೆಂಡರ್",
    smartCropCalendarDesc: "ಬೆಳೆ ಹಂತಗಳು, ಸಿಫಾರಸು ಮಾಡಲಾದ ಅಭ್ಯಾಸಗಳು ಮತ್ತು ಪರಿಕರಗಳೊಂದಿಗೆ ವೈಯಕ್ತಿಕ ಕ್ಯಾಲೆಂಡರ್.",
    cropDiary: "ಬೆಳೆ ಡೈರಿ",
    cropDiaryDesc: "ಬಿತ್ತನೆಯಿಂದ ಕೊಯ್ಲಿನವರೆಗೆ ಎಲ್ಲಾ ಕೃಷಿ ಚಟುವಟಿಕೆಗಳನ್ನು ದಾಖಲಿಸಲು ಡಿಜಿಟಲ್ ಲಾಗ್‌ಬುಕ್.",
    localizedRecommendations: "ಸ್ಥಳೀಯ ಶಿಫಾರಸುಗಳು",
    localizedRecommendationsDesc: "ನಿಮ್ಮ ಸ್ಥಳ, ಮಣ್ಣಿನ ಪ್ರಕಾರ ಮತ್ತು ಋತುಮಾನದ ಮಾದರಿಗಳ ಆಧಾರದ ಮೇಲೆ ಬೆಳೆ ಶಿಫಾರಸುಗಳು.",
    analyticsReports: "ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ವರದಿಗಳು",
    analyticsReportsDesc: "ಇಳುವರಿ ಪ್ರವೃತ್ತಿ, ಇನ್‌ಪುಟ್ ದಕ್ಷತೆ ಮತ್ತು ಯೋಜನೆಗಾಗಿ ದೃಶ್ಯ ವಿಶ್ಲೇಷಣೆ.",
    multiLanguageSupport: "ಬಹು-ಭಾಷಾ ಬೆಂಬಲ",
    multiLanguageSupportDesc: "ಸುಲಭ ಬಳಕೆಗಾಗಿ 9 ಭಾರತೀಯ ಭಾಷೆಗಳಲ್ಲಿ ಲಭ್ಯ.",

    // Stats
    happyFarmers: "ಸಂತೋಷದ ರೈತರು",
    cropsManaged: "ನಿರ್ವಹಿಸಲಾದ ಬೆಳೆಗಳು",
    accuracyRate: "ನಿಖರತೆಯ ದರ",
    weatherMonitoring: "ಹವಾಮಾನ ಮೇಲ್ವಿಚಾರಣೆ",

    // Dashboard
    cropDashboard: "ಬೆಳೆ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    realTimeMonitoring: "ರಿಯಲ್-ಟೈಮ್ ಮೇಲ್ವಿಚಾರಣೆ",
    activeCrops: "ಸಕ್ರಿಯ ಬೆಳೆಗಳು",
    healthScore: "ಆರೋಗ್ಯ ಅಂಕ",
    weatherAlert: "ನಾಳೆ ಮಳೆಯ ಸಾಧ್ಯತೆ ಇದೆ",

    // CTA
    whyChooseAgriBuddy: "AgriBuddy ಅನ್ನು ಏಕೆ ಆಯ್ಕೆ ಮಾಡಬೇಕು?",
    whyChooseDesc: "ಅಡ್ವಾನ್ಸ್ಡ್ ತಂತ್ರಜ್ಞಾನ ಮತ್ತು ಸ್ಥಳೀಯ ಪರಿಣತಿಯೊಂದಿಗೆ ಸಮಗ್ರ ಕೃಷಿ ಪರಿಹಾರಗಳು.",
    readyToStart: "ನಿಮ್ಮ ಕೃಷಿಯನ್ನು ಪರಿವರ್ತಿಸಲು ಸಿದ್ಧರಿದ್ದೀರಾ?",
    readyToStartDesc: "AgriBuddy ಯೊಂದಿಗೆ ಉತ್ಪಾದಕತೆ ಹೆಚ್ಚಿಸುವ ಮತ್ತು ವೆಚ್ಚವನ್ನು ಕಡಿಮೆ ಮಾಡುವ ಸಾವಿರಾರು ರೈತರೊಂದಿಗೆ ಸೇರಿಕೊಳ್ಳಿ.",
    startFarming: "ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಪ್ರಾರಂಭಿಸಿ",

    // Footer
    footerDescription: "ಸುಸ್ಥಿರ ಕೃಷಿಗಾಗಿ ಸ್ಮಾರ್ಟ್ ತಂತ್ರಜ್ಞಾನದೊಂದಿಗೆ ರೈತರನ್ನು ಸಬಲೀಕರಿಸುವುದು.",
    features: "ವೈಶಿಷ್ಟ್ಯಗಳು",
    weatherIntegration: "ಹವಾಮಾನ ಏಕೀಕರಣ",
    cropCalendar: "ಬೆಳೆ ಕ್ಯಾಲೆಂಡರ್",
    soilAnalysis: "ಮಣ್ಣಿನ ವಿಶ್ಲೇಷಣೆ",
    analytics: "ವಿಶ್ಲೇಷಣೆ",
    support: "ಬೆಂಬಲ",
    helpCenter: "ಸಹಾಯ ಕೇಂದ್ರ",
    documentation: "ದಾಖಲೀಕರಣ",
    community: "ಸಮುದಾಯ",
    contact: "ಸಂಪರ್ಕ",
    allRightsReserved: "ಎಲ್ಲಾ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.",

    // Forms
    name: "ಹೆಸರು",
    email: "ಇಮೇಲ್",
    password: "ಪಾಸ್‌ವರ್ಡ್",
    confirmPassword: "ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ",
    phone: "ಫೋನ್ ಸಂಖ್ಯೆ",
    location: "ಸ್ಥಳ",
    role: "ಪಾತ್ರ",
    farmer: "ರೈತ",
    expert: "ಕೃಷಿ ತಜ್ಞ",
    farmingExperience: "ಕೃಷಿ ಅನುಭವ (ವರ್ಷಗಳು)",
    expertise: "ಪರಿಣತಿ ಕ್ಷೇತ್ರಗಳು",
    certification: "ಪ್ರಮಾಣಪತ್ರ ಸಂಖ್ಯೆ",
    welcomeBack: "ಮತ್ತೆ ಸ್ವಾಗತ",
    signInToContinue: "ನಿಮ್ಮ ಖಾತೆಗೆ ಸೈನ್ ಇನ್ ಮಾಡಿ",
    createAccount: "ಖಾತೆ ರಚಿಸಿ",
    joinAgriBuddy: "AgriBuddy ಸಮುದಾಯಕ್ಕೆ ಸೇರಿ",
    alreadyHaveAccount: "ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?",
    dontHaveAccount: "ಖಾತೆ ಇಲ್ಲವೇ?",
    signUp: "ಸೈನ್ ಅಪ್",
    signIn: "ಸೈನ್ ಇನ್",

    // Weather
    temperature: "ತಾಪಮಾನ",
    humidity: "ಆರ್ದ್ರತೆ",
    windSpeed: "ಗಾಳಿಯ ವೇಗ",
    rainfall: "ಮಳೆ",
    forecast: "ಮುನ್ನೋಟ",
    alerts: "ಎಚ್ಚರಿಕೆಗಳು",

    // Crops
    cropName: "ಬೆಳೆಯ ಹೆಸರು",
    variety: "ಪ್ರಭೇದ",
    plantingDate: "ಬಿತ್ತನೆ ದಿನಾಂಕ",
    harvestDate: "ಕೊಯ್ಲು ದಿನಾಂಕ",
    area: "ಪ್ರದೇಶ (ಎಕರೆ)",
    status: "ಸ್ಥಿತಿ",
    notes: "ಟಿಪ್ಪಣಿಗಳು",

    // Common
    save: "ಉಳಿಸಿ",
    cancel: "ರದ್ದುಮಾಡಿ",
    edit: "ಸಂಪಾದಿಸಿ",
    delete: "ಅಳಿಸಿ",
    add: "ಸೇರಿಸಿ",
    view: "ವೀಕ್ಷಿಸಿ",
    loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    error: "ದೋಷ",
    success: "ಯಶಸ್ವಿ",
    warning: "ಎಚ್ಚರಿಕೆ",
    info: "ಮಾಹಿತಿ",
    welcome: "ಸ್ವಾಗತ",
    loginSuccessful: "ಲಾಗಿನ್ ಯಶಸ್ವಿ",
    Notifications: "ಅಧಿಸೂಚನೆಗಳು",
    aiAssistant: "ಎಐ ಸಹಾಯಕ",
    askExpert: "ತಜ್ಞರನ್ನು ಕೇಳಿ",
    myFarms: "ನನ್ನ ಕೃಷಿ",
    totalFarms: "ಒಟ್ಟು ಕೃಷಿ",
    totalArea: "ಒಟ್ಟು ಪ್ರದೇಶ",
    currentWeather: "ಪ್ರಸ್ತುತ ಹವಾಮಾನ",
    yieldTrend: "ಇಳುವರಿ ಪ್ರವೃತ್ತಿ",
    cropDistribution: "ಬೆಳೆ ವಿತರಣೆ",
    recentActivities: "ಇತ್ತೀಚಿನ ಚಟುವಟಿಕೆಗಳು"
},

// Gujarati (gu)
gu: {
    // Navigation
    home: "મુખ્ય પાનું",
    dashboard: "ડેશબોર્ડ",
    farms: "ખેતી",
    cropSchedules: "પાકની સમયપત્રક",
    advisory: "સલાહ",
    activities: "પ્રવૃત્તિઓ",
    weather: "હવામાન",
    analytics: "વિશ્લેષણ",
    profile: "પ્રોફાઇલ",
    logout: "લૉગઆઉટ",
    login: "લૉગિન",
    register: "નોંધણી",

    // Hero Section
    heroTitle: "સ્માર્ટ ખેતી",
    heroTitleHighlight: "શ્રેષ્ઠ પાક માટે",
    heroDescription: "AI-આધારિત પાક સમયપત્રક, રિયલ-ટાઇમ હવામાન ચેતવણીઓ અને ડેટા-સંચાલિત કૃષિ માહિતી સાથે તમારી ખેતીને પરિવર્તિત કરો.",
    getStarted: "શરૂ કરો",
    freeToStart: "મફતમાં શરૂ કરો",
    realTimeData: "રિયલ-ટાઇમ ડેટા",
    expertSupport: "નિષ્ણાતોનો સહારો",

    // Features
    realTimeWeather: "રિયલ-ટાઇમ હવામાન",
    realTimeWeatherDesc: "પાકની યોજના અને સુરક્ષા માટે સચોટ હવામાન પૂર્વાનુમાન અને ચેતવણીઓ મેળવો.",
    smartCropCalendar: "સ્માર્ટ પાક કેલેન્ડર",
    smartCropCalendarDesc: "પાકના તબક્કાઓ, ભલામણ કરાયેલી પદ્ધતિઓ અને સાધનો સાથે વ્યક્તિગત કેલેન્ડર.",
    cropDiary: "પાક ડાયરી",
    cropDiaryDesc: "વાવણીથી લણણી સુધીની બધી ખેતી પ્રવૃત્તિઓને નોંધવા માટે ડિજિટલ લોગબુક.",
    localizedRecommendations: "સ્થાનિક ભલામણો",
    localizedRecommendationsDesc: "તમારા સ્થાન, માટીના પ્રકાર અને મોસમી પેટર્નના આધારે પાકની ભલામણો.",
    analyticsReports: "વિશ્લેષણ અને રિપોર્ટ્સ",
    analyticsReportsDesc: "ઉત્પાદનના વલણો, ઇનપુટ કાર્યક્ષમતા અને આયોજન માટે દ્રશ્ય વિશ્લેષણ.",
    multiLanguageSupport: "બહુભાષી સહાયતા",
    multiLanguageSupportDesc: "સરળ ઉપયોગ માટે 9 ભારતીય ભાષાઓમાં ઉપલબ્ધ.",

    // Stats
    happyFarmers: "ખુશ ખેડૂતો",
    cropsManaged: "સંચાલિત પાકો",
    accuracyRate: "સચોટતા દર",
    weatherMonitoring: "હવામાન નિરીક્ષણ",

    // Dashboard
    cropDashboard: "પાક ડેશબોર્ડ",
    realTimeMonitoring: "રિયલ-ટાઇમ નિરીક્ષણ",
    activeCrops: "સક્રિય પાકો",
    healthScore: "સ્વાસ્થ્ય સ્કોર",
    weatherAlert: "કાલે વરસાદની સંભાવના છે",

    // CTA
    whyChooseAgriBuddy: "AgriBuddy કેમ પસંદ કરો?",
    whyChooseDesc: "અદ્યતન તકનીક અને સ્થાનિક નિષ્ણાતતા સાથે વ્યાપક ખેતી સમાધાન.",
    readyToStart: "શું તમે તમારી ખેતીને પરિવર્તિત કરવા માટે તૈયાર છો?",
    readyToStartDesc: "AgriBuddy સાથે ઉત્પાદકતા વધારતા અને ખર્ચ ઘટાડતા હજારો ખેડૂતો સાથે જોડાઓ.",
    startFarming: "સ્માર્ટ ખેતી શરૂ કરો",

    // Footer
    footerDescription: "ટકાઉ ખેતી માટે સ્માર્ટ તકનીક સાથે ખેડૂતોને સશક્ત બનાવવું.",
    features: "વિશેષતાઓ",
    weatherIntegration: "હવામાન એકીકરણ",
    cropCalendar: "પાક કેલેન્ડર",
    soilAnalysis: "માટી વિશ્લેષણ",
    analytics: "વિશ્લેષણ",
    support: "સહાયતા",
    helpCenter: "સહાયતા કેન્દ્ર",
    documentation: "દસ્તાવેજીકરણ",
    community: "સમુદાય",
    contact: "સંપર્ક",
    allRightsReserved: "બધા અધિકારો આરક્ષિત.",

    // Forms
    name: "નામ",
    email: "ઇમેઇલ",
    password: "પાસવર્ડ",
    confirmPassword: "પાસવર્ડની પુષ્ટિ કરો",
    phone: "ફોન નંબર",
    location: "સ્થાન",
    role: "ભૂમિકા",
    farmer: "ખેડૂત",
    expert: "કૃષિ નિષ્ણાત",
    farmingExperience: "ખેતીનો અનુભવ (વર્ષો)",
    expertise: "નિષ્ણાતતા ક્ષેત્રો",
    certification: "પ્રમાણપત્ર નંબર",
    welcomeBack: "પાછા સ્વાગત છે",
    signInToContinue: "તમારા એકાઉન્ટમાં સાઇન ઇન કરો",
    createAccount: "એકાઉન્ટ બનાવો",
    joinAgriBuddy: "AgriBuddy સમુદાયમાં જોડાઓ",
    alreadyHaveAccount: "પહેલેથી એકાઉન્ટ છે?",
    dontHaveAccount: "એકાઉન્ટ નથી?",
    signUp: "સાઇન અપ",
    signIn: "સાઇન ઇન",

    // Weather
    temperature: "તાપમાન",
    humidity: "ભેજ",
    windSpeed: "પવનની ગતિ",
    rainfall: "વરસાદ",
    forecast: "પૂર્વાનુમાન",
    alerts: "ચેતવણીઓ",

    // Crops
    cropName: "પાકનું નામ",
    variety: "પ્રકાર",
    plantingDate: "વાવણીની તારીખ",
    harvestDate: "લણણીની તારીખ",
    area: "વિસ્તાર (એકર)",
    status: "સ્થિતિ",
    notes: "નોંધો",

    // Common
    save: "સેવ કરો",
    cancel: "રદ કરો",
    edit: "સંપાદિત કરો",
    delete: "કાઢી નાખો",
    add: "ઉમેરો",
    view: "જુઓ",
    loading: "લોડ થઈ રહ્યું છે...",
    error: "ભૂલ",
    success: "સફળ",
    warning: "ચેતવણી",
    info: "માહિતી",
    welcome: "સ્વાગત છે",
    loginSuccessful: "લૉગિન સફળ",
    Notifications: "સૂચનાઓ",
    aiAssistant: "AI સહાયક",
    askExpert: "નિષ્ણાતને પૂછો",
    myFarms: "મારી ખેતી",
    totalFarms: "કુલ ખેતી",
    totalArea: "કુલ વિસ્તાર",
    currentWeather: "વર્તમાન હવામાન",
    yieldTrend: "ઉત્પાદનનો ટ્રેન્ડ",
    cropDistribution: "પાકનું વિતરણ",
    recentActivities: "તાજેતરની પ્રવૃત્તિઓ"
}
}

interface LanguageProviderProps {
  children: ReactNode
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguage] = useState("en")

  useEffect(() => {
    const savedLanguage = typeof window !== "undefined" ? localStorage.getItem("language") : null
    if (savedLanguage && translations[savedLanguage as keyof typeof translations]) {
      setLanguage(savedLanguage)
    }
  }, [])

  const changeLanguage = (lang: string) => {
    setLanguage(lang)
    if (typeof window !== "undefined") {
      localStorage.setItem("language", lang)
    }
  }

  const t = (key: string): string => {
    const currentTranslations = translations[language as keyof typeof translations] || translations.en
    return currentTranslations[key as keyof typeof currentTranslations] || key
  }

  const value = {
    language,
    setLanguage: changeLanguage,
    t,
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
