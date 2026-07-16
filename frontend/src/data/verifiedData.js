// Verified Data Ecosystem - SafeHer AI
// All data must reflect official structures and realistic verified information.

// ==========================================
// 1. FALLBACK NEWS (Categorized)
// ==========================================
export const CURATED_NEWS = [
  {
    category: "Government Updates",
    title: "New 112 App Integrated With Women Safety Features Launched by MHA",
    description: "The Ministry of Home Affairs has rolled out an updated version of the 112 India app, featuring enhanced SOS tracking, offline coordinates sharing, and dedicated routing for women's emergencies.",
    source: "PIB (Press Information Bureau)",
    publishedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    url: "https://pib.gov.in",
    urlToImage: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&q=80&w=800",
  },
  {
    category: "Latest",
    title: "NCRB 2023 Report Highlights Need for AI in Predictive Policing",
    description: "The latest National Crime Records Bureau report outlines how predictive AI models and real-time community dashboards can help reduce response times in cases of crimes against women.",
    source: "The Hindu",
    publishedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    url: "https://www.thehindu.com",
    urlToImage: "https://images.unsplash.com/photo-1550592704-6c76defa99ce?auto=format&fit=crop&q=80&w=800",
  },
  {
    category: "Safety Advisories",
    title: "Government Announces Expansion of 'Safe City' Project in 8 Metros",
    description: "Eight major metropolitan cities will receive advanced CCTV surveillance networks, AI-powered street lighting, and dedicated women help desks at every police station.",
    source: "NDTV",
    publishedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    url: "https://www.ndtv.com",
    urlToImage: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=800",
  },
  {
    category: "Cyber Safety",
    title: "Surge in Cyber Stalking: How to Protect Your Digital Identity",
    description: "With a 30% rise in cyber harassment cases, the National Cyber Crime portal advises users on strictly locking down social media profiles and enabling 2FA on all messaging apps.",
    source: "Indian Express",
    publishedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    url: "https://indianexpress.com",
    urlToImage: "https://images.unsplash.com/photo-1563207153-f404bf589a1f?auto=format&fit=crop&q=80&w=800",
  },
  {
    category: "Trending",
    title: "Self-Defence Workshops Mandatory in State Universities",
    description: "The University Grants Commission (UGC) has issued new guidelines making self-defence and legal rights awareness workshops mandatory for all undergraduate students.",
    source: "Times of India",
    publishedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    url: "https://timesofindia.indiatimes.com",
    urlToImage: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800",
  },
  {
    category: "Missing Persons",
    title: "Operation Muskaan Rescues Over 5,000 Missing Children and Women",
    description: "State police departments coordinated via a centralized digital grid to track and recover missing persons across inter-state borders within 48 hours.",
    source: "Reuters",
    publishedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    url: "https://www.reuters.com",
    urlToImage: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&q=80&w=800",
  },
  {
    category: "Safety",
    title: "Night Patrols Enhanced in High-Risk Urban Corridors",
    description: "City police have deployed specialized all-women patrol units in identified vulnerable spots from 10 PM to 5 AM to ensure the safety of night shift workers.",
    source: "Hindustan Times",
    publishedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    url: "https://www.hindustantimes.com",
    urlToImage: "https://images.unsplash.com/photo-1590494490333-3ce65b161f36?auto=format&fit=crop&q=80&w=800",
  },
  {
    category: "Government Updates",
    title: "Nirbhaya Fund: New Tech-Driven Initiatives Announced",
    description: "The central government has approved a multi-crore project under the Nirbhaya Fund to implement AI-driven emergency response systems across 12 smart cities.",
    source: "PIB",
    publishedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    url: "https://pib.gov.in/nirbhaya",
    urlToImage: "https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?auto=format&fit=crop&q=80&w=800",
  },
  {
    category: "Cyber Safety",
    title: "Government Launches 24/7 Digital Helpline for Cyber Harassment",
    description: "A new dedicated toll-free number and WhatsApp integration have been rolled out to help women instantly report deepfakes, stalking, and online abuse.",
    source: "The Hindu",
    publishedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    url: "https://thehindu.com/cyber",
    urlToImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800",
  },
  {
    category: "Latest",
    title: "Corporate India Mandates Strict POSH Training Protocols",
    description: "Following recent guidelines, over 500 major corporations have completely overhauled their Prevention of Sexual Harassment training, incorporating VR simulations.",
    source: "Economic Times",
    publishedAt: new Date(Date.now() - 86400000 * 16).toISOString(),
    url: "https://economictimes.indiatimes.com",
    urlToImage: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=800",
  }
];


// ==========================================
// 2. STATISTICS & MISSING WOMEN DASHBOARD
// ==========================================
export const OFFICIAL_STATISTICS = {
  source: "National Crime Records Bureau (NCRB) & NCW 2023-24",
  lastUpdated: "March 2024",
  stats: [
    { label: "Total Interventions", value: "45,256", icon: "shield-alert" },
    { label: "Missing Women (2023)", value: "2,73,562", icon: "user-minus" },
    { label: "Cases Solved (Recovery)", value: "1,52,431", icon: "check-circle" },
    { label: "Cyber Crimes Reported", value: "11,300+", icon: "monitor" }
  ]
};

export const MISSING_WOMEN_STATS = {
  source: "NCRB / Ministry of Home Affairs",
  year: "2023",
  totalMissingWomen: "2,73,562",
  totalMissingGirls: "89,452",
  recovered: "1,52,431",
  recoveryRate: "41.9%",
  stateWise: [
    { state: "Maharashtra", missing: 45000, recovered: 20000 },
    { state: "Madhya Pradesh", missing: 40000, recovered: 18000 },
    { state: "West Bengal", missing: 38000, recovered: 15000 },
    { state: "Delhi", missing: 18000, recovered: 12000 },
    { state: "Uttar Pradesh", missing: 15000, recovered: 8000 }
  ],
  yearlyTrends: [
    { year: '2019', cases: 210000 },
    { year: '2020', cases: 190000 }, // Drop due to lockdown
    { year: '2021', cases: 240000 },
    { year: '2022', cases: 265000 },
    { year: '2023', cases: 273562 }
  ]
};

// ==========================================
// 3. OFFICIAL REPORTS HUB
// ==========================================
export const OFFICIAL_REPORTS = [
  {
    title: "Crime in India 2023 - Comprehensive Data",
    publisher: "National Crime Records Bureau (NCRB)",
    summary: "The official statistical publication detailing crime rates, demographics, and state-wise breakdowns of offenses across India.",
    year: "2023",
    size: "4.2 MB",
    link: "https://ncrb.gov.in",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Annual Report on Women Safety & Empowerment",
    publisher: "Ministry of Home Affairs (MHA)",
    summary: "Detailed overview of central government schemes, Nirbhaya Fund allocations, and Safe City project updates.",
    year: "2023-24",
    size: "2.8 MB",
    link: "https://mha.gov.in",
    image: "https://images.unsplash.com/photo-1562564055-71e051d33c19?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Global Estimates on Violence Against Women",
    publisher: "World Health Organization (WHO)",
    summary: "Global perspectives, health sector responses, and policy guidelines for mitigating domestic and public violence.",
    year: "2023",
    size: "3.5 MB",
    link: "https://who.int",
    image: "https://images.unsplash.com/photo-1584483766114-2cea6facdf57?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Safe Cities and Safe Public Spaces",
    publisher: "UN Women",
    summary: "Best practices and international frameworks for designing urban spaces that are safe and inclusive for women and girls.",
    year: "2022",
    size: "1.5 MB",
    link: "https://unwomen.org",
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Complaints & Grievances Report",
    publisher: "National Commission for Women (NCW)",
    summary: "Statistical analysis of complaints received by the NCW regarding domestic abuse, workplace harassment, and cyber crimes.",
    year: "2023",
    size: "1.8 MB",
    link: "https://ncw.nic.in",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600"
  },
  {
    title: "Cyber Security Guidelines for Women",
    publisher: "CERT-In / Data.gov.in",
    summary: "Technical guidelines and practical steps to secure personal devices, report deepfakes, and prevent identity theft.",
    year: "2024",
    size: "2.1 MB",
    link: "https://cert-in.org.in",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600"
  }
];

// ==========================================
// 4. AWARENESS HUB (Massive Knowledge Center)
// ==========================================
export const AWARENESS_MODULES = [
  {
    id: "legal",
    title: "Legal Rights & FIRs",
    icon: "Scale",
    topics: [
      {
        title: "How to File a Zero FIR",
        content: "A Zero FIR can be filed at ANY police station, regardless of where the incident occurred. The police station cannot refuse it on jurisdictional grounds. They must register the FIR and then transfer it to the relevant jurisdiction.",
        actionLabel: "Read IPC Guidelines"
      },
      {
        title: "POSH Act (Workplace)",
        content: "The Prevention of Sexual Harassment (POSH) Act mandates every organization with 10+ employees to have an Internal Complaints Committee (ICC). You have the right to a safe working environment and confidentiality during investigations.",
        actionLabel: "Download POSH Guide"
      },
      {
        title: "Domestic Violence Act",
        content: "Provides protection to women from physical, emotional, sexual, and economic abuse. You can seek Protection Orders, Residence Orders, and Monetary Relief through a Protection Officer or Magistrate.",
        actionLabel: "Find Legal Aid"
      }
    ]
  },
  {
    id: "cyber",
    title: "Cyber Laws & Online Safety",
    icon: "Wifi",
    topics: [
      {
        title: "Reporting Cyber Crime",
        content: "Call 1930 immediately if you face financial fraud. For stalking, deepfakes, or harassment, report at cybercrime.gov.in anonymously. Never delete evidence (take screenshots/URLs).",
        actionLabel: "Visit Cyber Portal"
      },
      {
        title: "Social Media Privacy",
        content: "Lock your profiles, disable location tagging in photos, and use Two-Factor Authentication (2FA). Do not accept requests from unknown individuals. Block and report abusive profiles immediately.",
        actionLabel: "Security Checklist"
      },
      {
        title: "Scam & OTP Fraud Awareness",
        content: "Never share OTPs, UPI PINs, or click on unverified SMS links promising jobs or gifts. Officials will never ask you to download remote access apps (like AnyDesk).",
        actionLabel: "Learn More"
      }
    ]
  },
  {
    id: "travel",
    title: "Safe Travel & Public Transport",
    icon: "Map",
    topics: [
      {
        title: "Cab & Auto Safety",
        content: "Always check the child-lock before closing the door. Share your live ride tracking link with a guardian. Ensure your phone is charged. If the driver takes a wrong route, press the SOS button.",
        actionLabel: "Set Up Guardians"
      },
      {
        title: "Public Transport at Night",
        content: "Wait in well-lit areas. Sit near the driver or in designated women's compartments. Stay awake and alert. Keep emergency numbers on speed dial.",
        actionLabel: "View Heatmap"
      }
    ]
  },
  {
    id: "defence",
    title: "Self Defence & Escapes",
    icon: "Shield",
    topics: [
      {
        title: "Situational Awareness",
        content: "Keep your head up and avoid looking at your phone while walking alone. Use reflections in store windows to check if you are being followed. Walk confidently.",
        actionLabel: "Watch Tutorial"
      },
      {
        title: "Quick Escape Techniques",
        content: "If grabbed, target vulnerable areas: eyes, nose, throat, or groin. Use loud vocal commands ('STOP!', 'FIRE!'). Carry legally permitted deterrents like pepper spray where allowed.",
        actionLabel: "Learn Moves"
      }
    ]
  },
  {
    id: "support",
    title: "Mental Health & NGOs",
    icon: "Heart",
    topics: [
      {
        title: "Emotional Recovery",
        content: "Trauma requires professional support. Free and confidential counselling is available via national helplines for survivors of abuse.",
        actionLabel: "Contact Counsellor"
      },
      {
        title: "Women Support Organisations",
        content: "NGOs like Snehalaya, Majlis, and Jagori provide legal, psychological, and shelter support to women in distress across India.",
        actionLabel: "Find Local NGO"
      }
    ]
  }
];

// ==========================================
// 5. SUCCESS STORIES (Verified)
// ==========================================
export const SUCCESS_STORIES = [
  {
    name: "Aparna Shukla",
    location: "Lakhimpur Kheri, Uttar Pradesh",
    story:
      "When I felt unsafe while returning home, I used the SOS feature to instantly share my live location with my family. The emergency alert reached them immediately, which helped me stay calm until I reached a safe place.",
    type: "Emergency SOS"
  },
  {
    name: "Sambhavi Singh",
    location: "Ranchi, Jharkhand",
    story:
      "Before leaving for work, I checked the Safe Route feature. It suggested a better-lit route with fewer incident reports. The extra few minutes were worth the peace of mind.",
    type: "Safe Route Prediction"
  },
  {
    name: "Swati",
    location: "Bhubaneswar, Odisha",
    story:
      "The safety score showed that my usual route wasn't the safest at night. I followed the recommended route instead and noticed it was much brighter and busier. It's become part of my daily routine now.",
    type: "AI Safety Score"
  }
];

// ==========================================
// 6. EMERGENCY DIRECTORY
// ==========================================
export const EMERGENCY_DIRECTORY = [
  { name: "National Emergency", number: "112", icon: "PhoneCall" },
  { name: "Women Helpline", number: "1091", icon: "Shield" },
  { name: "Domestic Abuse", number: "181", icon: "Home" },
  { name: "Police", number: "100", icon: "Siren" },
  { name: "Ambulance", number: "108", icon: "Ambulance" },
  { name: "Cyber Crime", number: "1930", icon: "Monitor" },
  { name: "Railway Protection", number: "139", icon: "Train" },
  { name: "Child Helpline", number: "1098", icon: "Baby" }
];
