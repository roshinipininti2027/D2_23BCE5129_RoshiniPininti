"use client"

import { createContext, useState, useContext, useEffect } from "react"

const LanguageContext = createContext()

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
    dashboard: "Dashboard",
    farms: "Farms",
    schedules: "Schedules",
    advisory: "Advisory",
    activities: "Activities",
    login: "Login",
    register: "Register",
    logout: "Logout",
    welcome: "Welcome",

    // Dashboard
    welcomeBack: "Welcome back",
    totalFarms: "Total Farms",
    cropSchedules: "Crop Schedules",
    activeCrops: "Active Crops",
    totalActivities: "Total Activities",
    recentCropSchedules: "Recent Crop Schedules",
    recentAdvisories: "Recent Advisories",
    quickActions: "Quick Actions",
    createNewFarm: "Create New Farm",
    scheduleCrop: "Schedule Crop",
    logActivity: "Log Activity",
    viewAll: "View All",
    noCropSchedules: "No crop schedules yet.",
    createFirstSchedule: "Create your first schedule",
    noAdvisories: "No advisories available.",

    // Forms
    name: "Name",
    fullName: "Full Name",
    email: "Email",
    password: "Password",
    phone: "Phone Number",
    location: "Location",
    useCurrentLocation: "Use Current Location",
    detectingLocation: "Detecting location...",
    locationDetected: "Location detected successfully",
    locationError: "Unable to detect location",
    farmingExperience: "Farming Experience (years)",
    farmName: "Farm Name",
    area: "Area (acres)",
    soilType: "Soil Type",
    irrigationType: "Irrigation Type",
    cropName: "Crop Name",
    variety: "Variety",
    plantingDate: "Planting Date",
    expectedHarvestDate: "Expected Harvest Date",
    notes: "Notes",
    description: "Description",
    cost: "Cost",
    date: "Date",
    activityType: "Activity Type",

    // Password validation
    passwordRequirements: "Password Requirements:",
    minLength: "At least 8 characters",
    uppercase: "One uppercase letter",
    lowercase: "One lowercase letter",
    number: "One number",
    specialChar: "One special character",
    passwordStrength: "Password Strength:",
    weak: "Weak",
    medium: "Medium",
    strong: "Strong",

    // Buttons
    submit: "Submit",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    update: "Update",
    loading: "Loading...",
    creating: "Creating...",
    updating: "Updating...",
    deleting: "Deleting...",

    // Status
    planned: "Planned",
    planted: "Planted",
    growing: "Growing",
    harvested: "Harvested",
    failed: "Failed",

    // Priority
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical",

    // Messages
    loginSuccessful: "Login successful!",
    registrationSuccessful: "Registration successful!",
    farmCreated: "Farm created successfully!",
    scheduleCreated: "Crop schedule created successfully!",
    activityLogged: "Activity logged successfully!",
    confirmDelete: "Are you sure you want to delete this",
    noDataFound: "No data found",

    // Language
    selectLanguage: "Select Language",
    language: "Language",
  },
  hi: {
    // Navigation
    dashboard: "डैशबोर्ड",
    farms: "खेत",
    schedules: "कार्यक्रम",
    advisory: "सलाह",
    activities: "गतिविधियां",
    login: "लॉगिन",
    register: "पंजीकरण",
    logout: "लॉगआउट",
    welcome: "स्वागत",

    // Dashboard
    welcomeBack: "वापसी पर स्वागत",
    totalFarms: "कुल खेत",
    cropSchedules: "फसल कार्यक्रम",
    activeCrops: "सक्रिय फसलें",
    totalActivities: "कुल गतिविधियां",
    recentCropSchedules: "हाल की फसल कार्यक्रम",
    recentAdvisories: "हाल की सलाह",
    quickActions: "त्वरित कार्य",
    createNewFarm: "नया खेत बनाएं",
    scheduleCrop: "फसल का कार्यक्रम",
    logActivity: "गतिविधि दर्ज करें",
    viewAll: "सभी देखें",
    noCropSchedules: "अभी तक कोई फसल कार्यक्रम नहीं।",
    createFirstSchedule: "अपना पहला कार्यक्रम बनाएं",
    noAdvisories: "कोई सलाह उपलब्ध नहीं।",

    // Forms
    name: "नाम",
    fullName: "पूरा नाम",
    email: "ईमेल",
    password: "पासवर्ड",
    phone: "फोन नंबर",
    location: "स्थान",
    useCurrentLocation: "वर्तमान स्थान का उपयोग करें",
    detectingLocation: "स्थान का पता लगाया जा रहा है...",
    locationDetected: "स्थान सफलतापूर्वक मिल गया",
    locationError: "स्थान का पता नहीं लगा सका",
    farmingExperience: "कृषि अनुभव (वर्ष)",
    farmName: "खेत का नाम",
    area: "क्षेत्रफल (एकड़)",
    soilType: "मिट्टी का प्रकार",
    irrigationType: "सिंचाई का प्रकार",
    cropName: "फसल का नाम",
    variety: "किस्म",
    plantingDate: "बुआई की तारीख",
    expectedHarvestDate: "अपेक्षित कटाई की तारीख",
    notes: "टिप्पणियां",
    description: "विवरण",
    cost: "लागत",
    date: "तारीख",
    activityType: "गतिविधि का प्रकार",

    // Password validation
    passwordRequirements: "पासवर्ड आवश्यकताएं:",
    minLength: "कम से कम 8 अक्षर",
    uppercase: "एक बड़ा अक्षर",
    lowercase: "एक छोटा अक्षर",
    number: "एक संख्या",
    specialChar: "एक विशेष चिह्न",
    passwordStrength: "पासवर्ड की मजबूती:",
    weak: "कमजोर",
    medium: "मध्यम",
    strong: "मजबूत",

    // Buttons
    submit: "जमा करें",
    cancel: "रद्द करें",
    save: "सहेजें",
    delete: "हटाएं",
    edit: "संपादित करें",
    create: "बनाएं",
    update: "अपडेट करें",
    loading: "लोड हो रहा है...",
    creating: "बना रहे हैं...",
    updating: "अपडेट कर रहे हैं...",
    deleting: "हटा रहे हैं...",

    // Status
    planned: "नियोजित",
    planted: "बोया गया",
    growing: "बढ़ रहा है",
    harvested: "कटाई की गई",
    failed: "असफल",

    // Priority
    low: "कम",
    medium: "मध्यम",
    high: "उच्च",
    critical: "गंभीर",

    // Messages
    loginSuccessful: "लॉगिन सफल!",
    registrationSuccessful: "पंजीकरण सफल!",
    farmCreated: "खेत सफलतापूर्वक बनाया गया!",
    scheduleCreated: "फसल कार्यक्रम सफलतापूर्वक बनाया गया!",
    activityLogged: "गतिविधि सफलतापूर्वक दर्ज की गई!",
    confirmDelete: "क्या आप वाकई इसे हटाना चाहते हैं",
    noDataFound: "कोई डेटा नहीं मिला",

    // Language
    selectLanguage: "भाषा चुनें",
    language: "भाषा",
  },
  ta: {
    // Navigation
    dashboard: "டாஷ்போர்டு",
    farms: "பண்ணைகள்",
    schedules: "அட்டவணைகள்",
    advisory: "ஆலோசனை",
    activities: "செயல்பாடுகள்",
    login: "உள்நுழைவு",
    register: "பதிவு",
    logout: "வெளியேறு",
    welcome: "வரவேற்கிறோம்",

    // Dashboard
    welcomeBack: "மீண்டும் வரவேற்கிறோம்",
    totalFarms: "மொத்த பண்ணைகள்",
    cropSchedules: "பயிர் அட்டவணைகள்",
    activeCrops: "செயலில் உள்ள பயிர்கள்",
    totalActivities: "மொத்த செயல்பாடுகள்",
    recentCropSchedules: "சமீபத்திய பயிர் அட்டவணைகள்",
    recentAdvisories: "சமீபத்திய ஆலோசனைகள்",
    quickActions: "விரைவு செயல்கள்",
    createNewFarm: "புதிய பண்ணை உருவாக்கு",
    scheduleCrop: "பயிர் அட்டவணை",
    logActivity: "செயல்பாட்டை பதிவு செய்",
    viewAll: "அனைத்தையும் பார்",
    noCropSchedules: "இன்னும் பயிர் அட்டவணைகள் இல்லை.",
    createFirstSchedule: "உங்கள் முதல் அட்டவணையை உருவாக்கவும்",
    noAdvisories: "ஆலோசனைகள் கிடைக்கவில்லை.",

    // Forms
    name: "பெயர்",
    fullName: "முழு பெயர்",
    email: "மின்னஞ்சல்",
    password: "கடவுச்சொல்",
    phone: "தொலைபேசி எண்",
    location: "இடம்",
    useCurrentLocation: "தற்போதைய இடத்தைப் பயன்படுத்து",
    detectingLocation: "இடம் கண்டறியப்படுகிறது...",
    locationDetected: "இடம் வெற்றிகரமாக கண்டறியப்பட்டது",
    locationError: "இடத்தைக் கண்டறிய முடியவில்லை",
    farmingExperience: "விவசாய அனுபவம் (ஆண்டுகள்)",
    farmName: "பண்ணை பெயர்",
    area: "பரப்பளவு (ஏக்கர்)",
    soilType: "மண் வகை",
    irrigationType: "நீர்ப்பாசன வகை",
    cropName: "பயிர் பெயர்",
    variety: "வகை",
    plantingDate: "நடவு தேதி",
    expectedHarvestDate: "எதிர்பார்க்கப்படும் அறுவடை தேதி",
    notes: "குறிப்புகள்",
    description: "விளக்கம்",
    cost: "செலவு",
    date: "தேதி",
    activityType: "செயல்பாட்டு வகை",

    // Password validation
    passwordRequirements: "கடவுச்சொல் தேவைகள்:",
    minLength: "குறைந்தது 8 எழுத்துக்கள்",
    uppercase: "ஒரு பெரிய எழுத்து",
    lowercase: "ஒரு சிறிய எழுத்து",
    number: "ஒரு எண்",
    specialChar: "ஒரு சிறப்பு எழுத்து",
    passwordStrength: "கடவுச்சொல் வலிமை:",
    weak: "பலவீனமான",
    medium: "நடுத்தர",
    strong: "வலுவான",

    // Buttons
    submit: "சமர்ப்பிக்கவும்",
    cancel: "ரத்து செய்",
    save: "சேமி",
    delete: "நீக்கு",
    edit: "திருத்து",
    create: "உருவாக்கு",
    update: "புதுப்பிக்கவும்",
    loading: "ஏற்றுகிறது...",
    creating: "உருவாக்குகிறது...",
    updating: "புதுப்பிக்கிறது...",
    deleting: "நீக்குகிறது...",

    // Status
    planned: "திட்டமிடப்பட்ட",
    planted: "நடப்பட்ட",
    growing: "வளர்ந்து கொண்டிருக்கும்",
    harvested: "அறுவடை செய்யப்பட்ட",
    failed: "தோல்வியுற்ற",

    // Priority
    low: "குறைவான",
    medium: "நடுத்தர",
    high: "உயர்ந்த",
    critical: "முக்கியமான",

    // Messages
    loginSuccessful: "உள்நுழைவு வெற்றிகரமாக!",
    registrationSuccessful: "பதிவு வெற்றிகரமாக!",
    farmCreated: "பண்ணை வெற்றிகரமாக உருவாக்கப்பட்டது!",
    scheduleCreated: "பயிர் அட்டவணை வெற்றிகரமாக உருவாக்கப்பட்டது!",
    activityLogged: "செயல்பாடு வெற்றிகரமாக பதிவு செய்யப்பட்டது!",
    confirmDelete: "நீங்கள் உண்மையில் இதை நீக்க விரும்புகிறீர்களா",
    noDataFound: "தரவு கிடைக்கவில்லை",

    // Language
    selectLanguage: "மொழியைத் தேர்ந்தெடுக்கவும்",
    language: "மொழி",
  },
  te: {
    // Navigation
    dashboard: "డాష్‌బోర్డ్",
    farms: "వ్యవసాయ క్షేత్రాలు",
    schedules: "షెడ్యూల్స్",
    advisory: "సలహా",
    activities: "కార్యకలాపాలు",
    login: "లాగిన్",
    register: "నమోదు",
    logout: "లాగ్అవుట్",
    welcome: "స్వాగతం",

    // Dashboard
    welcomeBack: "తిరిగి స్వాగతం",
    totalFarms: "మొత్తం వ్యవసాయ క్షేత్రాలు",
    cropSchedules: "పంట షెడ్యూల్స్",
    activeCrops: "క్రియాశీల పంటలు",
    totalActivities: "మొత్తం కార్యకలాపాలు",
    recentCropSchedules: "ఇటీవలి పంట షెడ్యూల్స్",
    recentAdvisories: "ఇటీవలి సలహాలు",
    quickActions: "త్వరిత చర్యలు",
    createNewFarm: "కొత్త వ్యవసాయ క్షేత్రం సృష్టించండి",
    scheduleCrop: "పంట షెడ్యూల్",
    logActivity: "కార్యకలాపం నమోదు చేయండి",
    viewAll: "అన్నీ చూడండి",
    noCropSchedules: "ఇంకా పంట షెడ్యూల్స్ లేవు.",
    createFirstSchedule: "మీ మొదటి షెడ్యూల్ సృష్టించండి",
    noAdvisories: "సలహాలు అందుబాటులో లేవు.",

    // Forms
    name: "పేరు",
    fullName: "పూర్తి పేరు",
    email: "ఇమెయిల్",
    password: "పాస్‌వర్డ్",
    phone: "ఫోన్ నంబర్",
    location: "స్థానం",
    useCurrentLocation: "ప్రస్తుత స్థానాన్ని ఉపయోగించండి",
    detectingLocation: "స్థానం గుర్తించబడుతోంది...",
    locationDetected: "స్థానం విజయవంతంగా గుర్తించబడింది",
    locationError: "స్థానాన్ని గుర్తించలేకపోయింది",
    farmingExperience: "వ్యవసాయ అనుభవం (సంవత్సరాలు)",
    farmName: "వ్యవసాయ క్షేత్రం పేరు",
    area: "వైశాల్యం (ఎకరాలు)",
    soilType: "మట్టి రకం",
    irrigationType: "నీటిపారుదల రకం",
    cropName: "పంట పేరు",
    variety: "రకం",
    plantingDate: "నాటిన తేదీ",
    expectedHarvestDate: "ఆశించిన కోత తేదీ",
    notes: "గమనికలు",
    description: "వివరణ",
    cost: "ఖర్చు",
    date: "తేదీ",
    activityType: "కార్యకలాప రకం",

    // Password validation
    passwordRequirements: "పాస్‌వర్డ్ అవసరాలు:",
    minLength: "కనీసం 8 అక్షరాలు",
    uppercase: "ఒక పెద్ద అక్షరం",
    lowercase: "ఒక చిన్న అక్షరం",
    number: "ఒక సంఖ్య",
    specialChar: "ఒక ప్రత్యేక అక్షరం",
    passwordStrength: "పాస్‌వర్డ్ బలం:",
    weak: "బలహీనమైన",
    medium: "మధ్యస్థ",
    strong: "బలమైన",

    // Buttons
    submit: "సమర్పించండి",
    cancel: "రద్దు చేయండి",
    save: "సేవ్ చేయండి",
    delete: "తొలగించండి",
    edit: "సవరించండి",
    create: "సృష్టించండి",
    update: "అప్‌డేట్ చేయండి",
    loading: "లోడ్ అవుతోంది...",
    creating: "సృష్టిస్తోంది...",
    updating: "అప్‌డేట్ చేస్తోంది...",
    deleting: "తొలగిస్తోంది...",

    // Status
    planned: "ప్రణాళికాబద్ధమైన",
    planted: "నాటిన",
    growing: "పెరుగుతున్న",
    harvested: "కోసిన",
    failed: "విఫలమైన",

    // Priority
    low: "తక్కువ",
    medium: "మధ్యస్థ",
    high: "అధిక",
    critical: "క్లిష్టమైన",

    // Messages
    loginSuccessful: "లాగిన్ విజయవంతం!",
    registrationSuccessful: "నమోదు విజయవంతం!",
    farmCreated: "వ్యవసాయ క్షేత్రం విజయవంతంగా సృష్టించబడింది!",
    scheduleCreated: "పంట షెడ్యూల్ విజయవంతంగా సృష్టించబడింది!",
    activityLogged: "కార్యకలాపం విజయవంతంగా నమోదు చేయబడింది!",
    confirmDelete: "మీరు దీన్ని నిజంగా తొలగించాలనుకుంటున్నారా",
    noDataFound: "డేటా కనుగొనబడలేదు",

    // Language
    selectLanguage: "భాషను ఎంచుకోండి",
    language: "భాష",
  },
  ml: {
    // Navigation
    dashboard: "ഡാഷ്‌ബോർഡ്",
    farms: "കൃഷിയിടങ്ങൾ",
    schedules: "ഷെഡ്യൂളുകൾ",
    advisory: "ഉപദേശം",
    activities: "പ്രവർത്തനങ്ങൾ",
    login: "ലോഗിൻ",
    register: "രജിസ്റ്റർ",
    logout: "ലോഗൗട്ട്",
    welcome: "സ്വാഗതം",

    // Dashboard
    welcomeBack: "തിരികെ സ്വാഗതം",
    totalFarms: "മൊത്തം കൃഷിയിടങ്ങൾ",
    cropSchedules: "വിള ഷെഡ്യൂളുകൾ",
    activeCrops: "സജീവ വിളകൾ",
    totalActivities: "മൊത്തം പ്രവർത്തനങ്ങൾ",
    recentCropSchedules: "സമീപകാല വിള ഷെഡ്യൂളുകൾ",
    recentAdvisories: "സമീപകാല ഉപദേശങ്ങൾ",
    quickActions: "വേഗത്തിലുള്ള പ്രവർത്തനങ്ങൾ",
    createNewFarm: "പുതിയ കൃഷിയിടം സൃഷ്ടിക്കുക",
    scheduleCrop: "വിള ഷെഡ്യൂൾ",
    logActivity: "പ്രവർത്തനം രേഖപ്പെടുത്തുക",
    viewAll: "എല്ലാം കാണുക",
    noCropSchedules: "ഇതുവരെ വിള ഷെഡ്യൂളുകൾ ഇല്ല.",
    createFirstSchedule: "നിങ്ങളുടെ ആദ്യ ഷെഡ്യൂൾ സൃഷ്ടിക്കുക",
    noAdvisories: "ഉപദേശങ്ങൾ ലഭ്യമല്ല.",

    // Forms
    name: "പേര്",
    fullName: "പൂർണ്ണ നാമം",
    email: "ഇമെയിൽ",
    password: "പാസ്‌വേഡ്",
    phone: "ഫോൺ നമ്പർ",
    location: "സ്ഥലം",
    useCurrentLocation: "നിലവിലെ സ്ഥലം ഉപയോഗിക്കുക",
    detectingLocation: "സ്ഥലം കണ്ടെത്തുന്നു...",
    locationDetected: "സ്ഥലം വിജയകരമായി കണ്ടെത്തി",
    locationError: "സ്ഥലം കണ്ടെത്താൻ കഴിഞ്ഞില്ല",
    farmingExperience: "കൃഷി അനുഭവം (വർഷങ്ങൾ)",
    farmName: "കൃഷിയിടത്തിന്റെ പേര്",
    area: "വിസ്തീർണ്ണം (ഏക്കർ)",
    soilType: "മണ്ണിന്റെ തരം",
    irrigationType: "ജലസേചന തരം",
    cropName: "വിളയുടെ പേര്",
    variety: "ഇനം",
    plantingDate: "നടീൽ തീയതി",
    expectedHarvestDate: "പ്രതീക്ഷിക്കുന്ന വിളവെടുപ്പ് തീയതി",
    notes: "കുറിപ്പുകൾ",
    description: "വിവരണം",
    cost: "ചെലവ്",
    date: "തീയതി",
    activityType: "പ്രവർത്തന തരം",

    // Password validation
    passwordRequirements: "പാസ്‌വേഡ് ആവശ്യകതകൾ:",
    minLength: "കുറഞ്ഞത് 8 അക്ഷരങ്ങൾ",
    uppercase: "ഒരു വലിയ അക്ഷരം",
    lowercase: "ഒരു ചെറിയ അക്ഷരം",
    number: "ഒരു സംഖ്യ",
    specialChar: "ഒരു പ്രത്യേക അക്ഷരം",
    passwordStrength: "പാസ്‌വേഡ് ശക്തി:",
    weak: "ദുർബലമായ",
    medium: "ഇടത്തരം",
    strong: "ശക്തമായ",

    // Buttons
    submit: "സമർപ്പിക്കുക",
    cancel: "റദ്ദാക്കുക",
    save: "സേവ് ചെയ്യുക",
    delete: "ഇല്ലാതാക്കുക",
    edit: "എഡിറ്റ് ചെയ്യുക",
    create: "സൃഷ്ടിക്കുക",
    update: "അപ്‌ഡേറ്റ് ചെയ്യുക",
    loading: "ലോഡ് ചെയ്യുന്നു...",
    creating: "സൃഷ്ടിക്കുന്നു...",
    updating: "അപ്‌ഡേറ്റ് ചെയ്യുന്നു...",
    deleting: "ഇല്ലാതാക്കുന്നു...",

    // Status
    planned: "ആസൂത്രണം ചെയ്ത",
    planted: "നട്ട",
    growing: "വളരുന്ന",
    harvested: "വിളവെടുത്ത",
    failed: "പരാജയപ്പെട്ട",

    // Priority
    low: "കുറഞ്ഞ",
    medium: "ഇടത്തരം",
    high: "ഉയർന്ന",
    critical: "നിർണായക",

    // Messages
    loginSuccessful: "ലോഗിൻ വിജയകരം!",
    registrationSuccessful: "രജിസ്ട്രേഷൻ വിജയകരം!",
    farmCreated: "കൃഷിയിടം വിജയകരമായി സൃഷ്ടിച്ചു!",
    scheduleCreated: "വിള ഷെഡ്യൂൾ വിജയകരമായി സൃഷ്ടിച്ചു!",
    activityLogged: "പ്രവർത്തനം വിജയകരമായി രേഖപ്പെടുത്തി!",
    confirmDelete: "നിങ്ങൾ ഇത് ശരിക്കും ഇല്ലാതാക്കാൻ ആഗ്രഹിക്കുന്നുണ്ടോ",
    noDataFound: "ഡാറ്റ കണ്ടെത്തിയില്ല",

    // Language
    selectLanguage: "ഭാഷ തിരഞ്ഞെടുക്കുക",
    language: "ഭാഷ",
  },
  kn: {
    // Navigation
    dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    farms: "ಕೃಷಿ ಭೂಮಿಗಳು",
    schedules: "ವೇಳಾಪಟ್ಟಿಗಳು",
    advisory: "ಸಲಹೆ",
    activities: "ಚಟುವಟಿಕೆಗಳು",
    login: "ಲಾಗಿನ್",
    register: "ನೋಂದಣಿ",
    logout: "ಲಾಗ್‌ಔಟ್",
    welcome: "ಸ್ವಾಗತ",

    // Dashboard
    welcomeBack: "ಮತ್ತೆ ಸ್ವಾಗತ",
    totalFarms: "ಒಟ್ಟು ಕೃಷಿ ಭೂಮಿಗಳು",
    cropSchedules: "ಬೆಳೆ ವೇಳಾಪಟ್ಟಿಗಳು",
    activeCrops: "ಸಕ್ರಿಯ ಬೆಳೆಗಳು",
    totalActivities: "ಒಟ್ಟು ಚಟುವಟಿಕೆಗಳು",
    recentCropSchedules: "ಇತ್ತೀಚಿನ ಬೆಳೆ ವೇಳಾಪಟ್ಟಿಗಳು",
    recentAdvisories: "ಇತ್ತೀಚಿನ ಸಲಹೆಗಳು",
    quickActions: "ತ್ವರಿತ ಕ್ರಿಯೆಗಳು",
    createNewFarm: "ಹೊಸ ಕೃಷಿ ಭೂಮಿ ರಚಿಸಿ",
    scheduleCrop: "ಬೆಳೆ ವೇಳಾಪಟ್ಟಿ",
    logActivity: "ಚಟುವಟಿಕೆ ದಾಖಲಿಸಿ",
    viewAll: "ಎಲ್ಲವನ್ನೂ ನೋಡಿ",
    noCropSchedules: "ಇನ್ನೂ ಬೆಳೆ ವೇಳಾಪಟ್ಟಿಗಳಿಲ್ಲ.",
    createFirstSchedule: "ನಿಮ್ಮ ಮೊದಲ ವೇಳಾಪಟ್ಟಿ ರಚಿಸಿ",
    noAdvisories: "ಸಲಹೆಗಳು ಲಭ್ಯವಿಲ್ಲ.",

    // Forms
    name: "ಹೆಸರು",
    fullName: "ಪೂರ್ಣ ಹೆಸರು",
    email: "ಇಮೇಲ್",
    password: "ಪಾಸ್‌ವರ್ಡ್",
    phone: "ಫೋನ್ ಸಂಖ್ಯೆ",
    location: "ಸ್ಥಳ",
    useCurrentLocation: "ಪ್ರಸ್ತುತ ಸ್ಥಳವನ್ನು ಬಳಸಿ",
    detectingLocation: "ಸ್ಥಳವನ್ನು ಪತ್ತೆ ಮಾಡಲಾಗುತ್ತಿದೆ...",
    locationDetected: "ಸ್ಥಳವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಪತ್ತೆ ಮಾಡಲಾಗಿದೆ",
    locationError: "ಸ್ಥಳವನ್ನು ಪತ್ತೆ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ",
    farmingExperience: "ಕೃಷಿ ಅನುಭವ (ವರ್ಷಗಳು)",
    farmName: "ಕೃಷಿ ಭೂಮಿಯ ಹೆಸರು",
    area: "ವಿಸ್ತೀರ್ಣ (ಎಕರೆ)",
    soilType: "ಮಣ್ಣಿನ ಪ್ರಕಾರ",
    irrigationType: "ನೀರಾವರಿ ಪ್ರಕಾರ",
    cropName: "ಬೆಳೆಯ ಹೆಸರು",
    variety: "ಪ್ರಭೇದ",
    plantingDate: "ನೆಟ್ಟ ದಿನಾಂಕ",
    expectedHarvestDate: "ನಿರೀಕ್ಷಿತ ಸುಗ್ಗಿ ದಿನಾಂಕ",
    notes: "ಟಿಪ್ಪಣಿಗಳು",
    description: "ವಿವರಣೆ",
    cost: "ವೆಚ್ಚ",
    date: "ದಿನಾಂಕ",
    activityType: "ಚಟುವಟಿಕೆ ಪ್ರಕಾರ",

    // Password validation
    passwordRequirements: "ಪಾಸ್‌ವರ್ಡ್ ಅವಶ್ಯಕತೆಗಳು:",
    minLength: "ಕನಿಷ್ಠ 8 ಅಕ್ಷರಗಳು",
    uppercase: "ಒಂದು ದೊಡ್ಡ ಅಕ್ಷರ",
    lowercase: "ಒಂದು ಚಿಕ್ಕ ಅಕ್ಷರ",
    number: "ಒಂದು ಸಂಖ್ಯೆ",
    specialChar: "ಒಂದು ವಿಶೇಷ ಅಕ್ಷರ",
    passwordStrength: "ಪಾಸ್‌ವರ್ಡ್ ಬಲ:",
    weak: "ದುರ್ಬಲ",
    medium: "ಮಧ್ಯಮ",
    strong: "ಬಲವಾದ",

    // Buttons
    submit: "ಸಲ್ಲಿಸಿ",
    cancel: "ರದ್ದುಮಾಡಿ",
    save: "ಉಳಿಸಿ",
    delete: "ಅಳಿಸಿ",
    edit: "ಸಂಪಾದಿಸಿ",
    create: "ರಚಿಸಿ",
    update: "ನವೀಕರಿಸಿ",
    loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    creating: "ರಚಿಸಲಾಗುತ್ತಿದೆ...",
    updating: "ನವೀಕರಿಸಲಾಗುತ್ತಿದೆ...",
    deleting: "ಅಳಿಸಲಾಗುತ್ತಿದೆ...",

    // Status
    planned: "ಯೋಜಿತ",
    planted: "ನೆಟ್ಟ",
    growing: "ಬೆಳೆಯುತ್ತಿರುವ",
    harvested: "ಸುಗ್ಗಿ ಮಾಡಿದ",
    failed: "ವಿಫಲವಾದ",

    // Priority
    low: "ಕಡಿಮೆ",
    medium: "ಮಧ್ಯಮ",
    high: "ಹೆಚ್ಚು",
    critical: "ನಿರ್ಣಾಯಕ",

    // Messages
    loginSuccessful: "ಲಾಗಿನ್ ಯಶಸ್ವಿ!",
    registrationSuccessful: "ನೋಂದಣಿ ಯಶಸ್ವಿ!",
    farmCreated: "ಕೃಷಿ ಭೂಮಿ ಯಶಸ್ವಿಯಾಗಿ ರಚಿಸಲಾಗಿದೆ!",
    scheduleCreated: "ಬೆಳೆ ವೇಳಾಪಟ್ಟಿ ಯಶಸ್ವಿಯಾಗಿ ರಚಿಸಲಾಗಿದೆ!",
    activityLogged: "ಚಟುವಟಿಕೆ ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಿಸಲಾಗಿದೆ!",
    confirmDelete: "ನೀವು ನಿಜವಾಗಿಯೂ ಇದನ್ನು ಅಳಿಸಲು ಬಯಸುವಿರಾ",
    noDataFound: "ಡೇಟಾ ಕಂಡುಬಂದಿಲ್ಲ",

    // Language
    selectLanguage: "ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ",
    language: "ಭಾಷೆ",
  },
  gu: {
    // Navigation
    dashboard: "ડેશબોર્ડ",
    farms: "ખેતરો",
    schedules: "સમયપત્રક",
    advisory: "સલાહ",
    activities: "પ્રવૃત્તિઓ",
    login: "લોગિન",
    register: "નોંધણી",
    logout: "લોગઆઉટ",
    welcome: "સ્વાગત",

    // Dashboard
    welcomeBack: "પાછા સ્વાગત",
    totalFarms: "કુલ ખેતરો",
    cropSchedules: "પાક સમયપત્રક",
    activeCrops: "સક્રિય પાકો",
    totalActivities: "કુલ પ્રવૃત્તિઓ",
    recentCropSchedules: "તાજેતરના પાક સમયપત્રક",
    recentAdvisories: "તાજેતરની સલાહ",
    quickActions: "ઝડપી ક્રિયાઓ",
    createNewFarm: "નવું ખેતર બનાવો",
    scheduleCrop: "પાક સમયપત્રક",
    logActivity: "પ્રવૃત્તિ નોંધો",
    viewAll: "બધું જુઓ",
    noCropSchedules: "હજુ સુધી કોઈ પાક સમયપત્રક નથી.",
    createFirstSchedule: "તમારું પ્રથમ સમયપત્રક બનાવો",
    noAdvisories: "કોઈ સલાહ ઉપલબ્ધ નથી.",

    // Forms
    name: "નામ",
    fullName: "પૂરું નામ",
    email: "ઈમેઈલ",
    password: "પાસવર્ડ",
    phone: "ફોન નંબર",
    location: "સ્થાન",
    useCurrentLocation: "વર્તમાન સ્થાન વાપરો",
    detectingLocation: "સ્થાન શોધી રહ્યા છીએ...",
    locationDetected: "સ્થાન સફળતાપૂર્વક શોધાયું",
    locationError: "સ્થાન શોધી શકાયું નથી",
    farmingExperience: "ખેતીનો અનુભવ (વર્ષો)",
    farmName: "ખેતરનું નામ",
    area: "વિસ્તાર (એકર)",
    soilType: "માટીનો પ્રકાર",
    irrigationType: "સિંચાઈનો પ્રકાર",
    cropName: "પાકનું નામ",
    variety: "જાત",
    plantingDate: "વાવણીની તારીખ",
    expectedHarvestDate: "અપેક્ષિત કાપણીની તારીખ",
    notes: "નોંધો",
    description: "વર્ણન",
    cost: "ખર્ચ",
    date: "તારીખ",
    activityType: "પ્રવૃત્તિનો પ્રકાર",

    // Password validation
    passwordRequirements: "પાસવર્ડની આવશ્યકતાઓ:",
    minLength: "ઓછામાં ઓછા 8 અક્ષરો",
    uppercase: "એક મોટો અક્ષર",
    lowercase: "એક નાનો અક્ષર",
    number: "એક નંબર",
    specialChar: "એક વિશેષ અક્ષર",
    passwordStrength: "પાસવર્ડની મજબૂતાઈ:",
    weak: "નબળો",
    medium: "મધ્યમ",
    strong: "મજબૂત",

    // Buttons
    submit: "સબમિટ કરો",
    cancel: "રદ કરો",
    save: "સેવ કરો",
    delete: "ડિલીટ કરો",
    edit: "એડિટ કરો",
    create: "બનાવો",
    update: "અપડેટ કરો",
    loading: "લોડ થઈ રહ્યું છે...",
    creating: "બનાવી રહ્યા છીએ...",
    updating: "અપડેટ કરી રહ્યા છીએ...",
    deleting: "ડિલીટ કરી રહ્યા છીએ...",

    // Status
    planned: "આયોજિત",
    planted: "વાવેલું",
    growing: "વધી રહ્યું છે",
    harvested: "કાપણી કરેલ",
    failed: "નિષ્ફળ",

    // Priority
    low: "ઓછું",
    medium: "મધ્યમ",
    high: "વધારે",
    critical: "ગંભીર",

    // Messages
    loginSuccessful: "લોગિન સફળ!",
    registrationSuccessful: "નોંધણી સફળ!",
    farmCreated: "ખેતર સફળતાપૂર્વક બનાવાયું!",
    scheduleCreated: "પાક સમયપત્રક સફળતાપૂર્વક બનાવાયું!",
    activityLogged: "પ્રવૃત્તિ સફળતાપૂર્વક નોંધાઈ!",
    confirmDelete: "શું તમે ખરેખર આને ડિલીટ કરવા માંગો છો",
    noDataFound: "કોઈ ડેટા મળ્યો નથી",

    // Language
    selectLanguage: "ભાષા પસંદ કરો",
    language: "ભાષા",
  },
  pa: {
    // Navigation
    dashboard: "ਡੈਸ਼ਬੋਰਡ",
    farms: "ਖੇਤ",
    schedules: "ਸਮਾਂ-ਸਾਰਣੀ",
    advisory: "ਸਲਾਹ",
    activities: "ਗਤੀਵਿਧੀਆਂ",
    login: "ਲਾਗਇਨ",
    register: "ਰਜਿਸਟਰ",
    logout: "ਲਾਗਆਉਟ",
    welcome: "ਸਵਾਗਤ",

    // Dashboard
    welcomeBack: "ਵਾਪਸ ਸਵਾਗਤ",
    totalFarms: "ਕੁੱਲ ਖੇਤ",
    cropSchedules: "ਫਸਲ ਸਮਾਂ-ਸਾਰਣੀ",
    activeCrops: "ਸਰਗਰਮ ਫਸਲਾਂ",
    totalActivities: "ਕੁੱਲ ਗਤੀਵਿਧੀਆਂ",
    recentCropSchedules: "ਹਾਲ ਦੀਆਂ ਫਸਲ ਸਮਾਂ-ਸਾਰਣੀਆਂ",
    recentAdvisories: "ਹਾਲ ਦੀਆਂ ਸਲਾਹਾਂ",
    quickActions: "ਤੇਜ਼ ਕਾਰਵਾਈਆਂ",
    createNewFarm: "ਨਵਾਂ ਖੇਤ ਬਣਾਓ",
    scheduleCrop: "ਫਸਲ ਸਮਾਂ-ਸਾਰਣੀ",
    logActivity: "ਗਤੀਵਿਧੀ ਦਰਜ ਕਰੋ",
    viewAll: "ਸਭ ਵੇਖੋ",
    noCropSchedules: "ਅਜੇ ਤੱਕ ਕੋਈ ਫਸਲ ਸਮਾਂ-ਸਾਰਣੀ ਨਹੀਂ।",
    createFirstSchedule: "ਆਪਣੀ ਪਹਿਲੀ ਸਮਾਂ-ਸਾਰਣੀ ਬਣਾਓ",
    noAdvisories: "ਕੋਈ ਸਲਾਹ ਉਪਲਬਧ ਨਹੀਂ।",

    // Forms
    name: "ਨਾਮ",
    fullName: "ਪੂਰਾ ਨਾਮ",
    email: "ਈਮੇਲ",
    password: "ਪਾਸਵਰਡ",
    phone: "ਫੋਨ ਨੰਬਰ",
    location: "ਸਥਾਨ",
    useCurrentLocation: "ਮੌਜੂਦਾ ਸਥਾਨ ਵਰਤੋ",
    detectingLocation: "ਸਥਾਨ ਦਾ ਪਤਾ ਲਗਾਇਆ ਜਾ ਰਿਹਾ ਹੈ...",
    locationDetected: "ਸਥਾਨ ਸਫਲਤਾਪੂਰਵਕ ਮਿਲ ਗਿਆ",
    locationError: "ਸਥਾਨ ਦਾ ਪਤਾ ਨਹੀਂ ਲਗਾਇਆ ਜਾ ਸਕਿਆ",
    farmingExperience: "ਖੇਤੀ ਦਾ ਤਜਰਬਾ (ਸਾਲ)",
    farmName: "ਖੇਤ ਦਾ ਨਾਮ",
    area: "ਖੇਤਰ (ਏਕੜ)",
    soilType: "ਮਿੱਟੀ ਦੀ ਕਿਸਮ",
    irrigationType: "ਸਿੰਚਾਈ ਦੀ ਕਿਸਮ",
    cropName: "ਫਸਲ ਦਾ ਨਾਮ",
    variety: "ਕਿਸਮ",
    plantingDate: "ਬੀਜਣ ਦੀ ਤਾਰੀਖ",
    expectedHarvestDate: "ਉਮੀਦ ਕੀਤੀ ਵਾਢੀ ਦੀ ਤਾਰੀਖ",
    notes: "ਨੋਟਸ",
    description: "ਵਰਣਨ",
    cost: "ਲਾਗਤ",
    date: "ਤਾਰੀਖ",
    activityType: "ਗਤੀਵਿਧੀ ਦੀ ਕਿਸਮ",

    // Password validation
    passwordRequirements: "ਪਾਸਵਰਡ ਦੀਆਂ ਲੋੜਾਂ:",
    minLength: "ਘੱਟੋ ਘੱਟ 8 ਅੱਖਰ",
    uppercase: "ਇੱਕ ਵੱਡਾ ਅੱਖਰ",
    lowercase: "ਇੱਕ ਛੋਟਾ ਅੱਖਰ",
    number: "ਇੱਕ ਨੰਬਰ",
    specialChar: "ਇੱਕ ਵਿਸ਼ੇਸ਼ ਅੱਖਰ",
    passwordStrength: "ਪਾਸਵਰਡ ਦੀ ਮਜ਼ਬੂਤੀ:",
    weak: "ਕਮਜ਼ੋਰ",
    medium: "ਮੱਧਮ",
    strong: "ਮਜ਼ਬੂਤ",

    // Buttons
    submit: "ਜਮ੍ਹਾਂ ਕਰੋ",
    cancel: "ਰੱਦ ਕਰੋ",
    save: "ਸੇਵ ਕਰੋ",
    delete: "ਮਿਟਾਓ",
    edit: "ਸੰਪਾਦਨ ਕਰੋ",
    create: "ਬਣਾਓ",
    update: "ਅੱਪਡੇਟ ਕਰੋ",
    loading: "ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...",
    creating: "ਬਣਾਇਆ ਜਾ ਰਿਹਾ ਹੈ...",
    updating: "ਅੱਪਡੇਟ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...",
    deleting: "ਮਿਟਾਇਆ ਜਾ ਰਿਹਾ ਹੈ...",

    // Status
    planned: "ਯੋਜਨਾਬੱਧ",
    planted: "ਬੀਜਿਆ ਗਿਆ",
    growing: "ਵਧ ਰਿਹਾ ਹੈ",
    harvested: "ਵਾਢੀ ਕੀਤੀ ਗਈ",
    failed: "ਅਸਫਲ",

    // Priority
    low: "ਘੱਟ",
    medium: "ਮੱਧਮ",
    high: "ਉੱਚ",
    critical: "ਗੰਭੀਰ",

    // Messages
    loginSuccessful: "ਲਾਗਇਨ ਸਫਲ!",
    registrationSuccessful: "ਰਜਿਸਟਰੇਸ਼ਨ ਸਫਲ!",
    farmCreated: "ਖੇਤ ਸਫਲਤਾਪੂਰਵਕ ਬਣਾਇਆ ਗਿਆ!",
    scheduleCreated: "ਫਸਲ ਸਮਾਂ-ਸਾਰਣੀ ਸਫਲਤਾਪੂਰਵਕ ਬਣਾਈ ਗਈ!",
    activityLogged: "ਗਤੀਵਿਧੀ ਸਫਲਤਾਪੂਰਵਕ ਦਰਜ ਕੀਤੀ ਗਈ!",
    confirmDelete: "ਕੀ ਤੁਸੀਂ ਸੱਚਮੁੱਚ ਇਸਨੂੰ ਮਿਟਾਉਣਾ ਚਾਹੁੰਦੇ ਹੋ",
    noDataFound: "ਕੋਈ ਡੇਟਾ ਨਹੀਂ ਮਿਲਿਆ",

    // Language
    selectLanguage: "ਭਾਸ਼ਾ ਚੁਣੋ",
    language: "ਭਾਸ਼ਾ",
  },
}

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState("en")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("agribuddy-language")
    if (savedLanguage && translations[savedLanguage]) {
      setCurrentLanguage(savedLanguage)
    }
  }, [])

  const changeLanguage = (language) => {
    setCurrentLanguage(language)
    localStorage.setItem("agribuddy-language", language)
  }

  const t = (key) => {
    return translations[currentLanguage][key] || translations.en[key] || key
  }

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    availableLanguages: [
      { code: "en", name: "English", flag: "🇮🇳" },
      { code: "hi", name: "हिंदी", flag: "🇮🇳" },
      { code: "ta", name: "தமிழ்", flag: "🇮🇳" },
      { code: "te", name: "తెలుగు", flag: "🇮🇳" },
      { code: "ml", name: "മലയാളം", flag: "🇮🇳" },
      { code: "kn", name: "ಕನ್ನಡ", flag: "🇮🇳" },
      { code: "gu", name: "ગુજરાતી", flag: "🇮🇳" },
      { code: "pa", name: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
    ],
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
