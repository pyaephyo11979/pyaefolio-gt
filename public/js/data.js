// =========================================================================
// 1. PORTFOLIO DATA (GROUNDED IN PYAEFOLIO.NETLIFY.APP & RESUME-SE.PDF)
// =========================================================================
const SUPERCARS = [
  {
    id: 0,
    name: "APEX GT-R",
    codename: "MERN Full-Stack Spec",
    bodyColor: 0xef4444,
    accentColor: 0xffb703,
    neonHex: "#ef4444",
    maxSpeed: 1.95,      // internal units -> ~355 km/h display
    accel: 0.032,
    handling: 0.046,
    displayMaxKmh: 355
  },
  {
    id: 1,
    name: "CYBER VALKYRIE",
    codename: "Distributed Backend Spec",
    bodyColor: 0x06b6d4,
    accentColor: 0x38bdf8,
    neonHex: "#06b6d4",
    maxSpeed: 2.10,      // ~382 km/h display
    accel: 0.036,
    handling: 0.043,
    displayMaxKmh: 382
  },
  {
    id: 2,
    name: "SOLIS P1 GT",
    codename: "Cross-Platform Flutter Spec",
    bodyColor: 0xf59e0b,
    accentColor: 0xfde047,
    neonHex: "#f59e0b",
    maxSpeed: 2.02,      // ~368 km/h display
    accel: 0.034,
    handling: 0.051,
    displayMaxKmh: 368
  }
];

const TRACK_ZONES = [
  {
    t: 0.0,
    sector: "SECTOR 1",
    tag: "CHECKPOINT 01 // START GRID",
    title: "Pyae Phyo Hlaing — Junior Full Stack Developer",
    subtitle: "Yangon, Myanmar • Web / Backend / Mobile",
    desc: "Computer Science student (B.Comp.Sc, 2019–2027) building web and mobile applications with React, Node.js, Express, MongoDB and Flutter — from backend APIs to user-facing experiences. Drive along the circuit or click any Pit-Stop to explore!",
    badges: ["React & Redux", "Node.js & Express", "Laravel", "Flutter", "Java Spring Boot"],
    linkText: "Visit pyaefolio.netlify.app ↗",
    linkUrl: "https://pyaefolio.netlify.app/",
    tabTarget: "overview",
    archColor: 0xef4444
  },
  {
    t: 0.14,
    sector: "SECTOR 1",
    tag: "CHECKPOINT 02 // TEAM TELEMETRY",
    title: "Tech Breeze Limited (Backend Developer Intern)",
    subtitle: "April 2025 – Present • E-Commerce Backend Architecture",
    desc: "Developed backend services for e-commerce using Laravel, designed database schemas, and built API endpoints.",
    badges: ["PHP Laravel", "Database Schema Design", "RESTful APIs", "E-Commerce Backend"],
    linkText: "Tech Breeze Website ↗",
    linkUrl: "https://www.tech-breeze.com.mm",
    tabTarget: "overview",
    archColor: 0xf97316
  },
  {
    t: 0.28,
    sector: "SECTOR 2",
    tag: "CHECKPOINT 03 // R&D PADDOCK",
    title: "Brainwave Data Co., Ltd. & UCS Education",
    subtitle: "Intern Software Engineer (Apr–Jul 2026) & B.Comp.Sc",
    desc: "Participated in software development projects at Brainwave Data Co., Ltd., enhancing skills in teamwork and programming, while completing a Bachelor of Computing in Computer Science at UCS Sittwe & Pathein (2019–2027).",
    badges: ["Agile Teamwork", "Software Engineering", "UCS Sittwe & Pathein", "Algorithms"],
    linkText: "Brainwave Website ↗",
    linkUrl: "https://www.bdata.com.mm",
    tabTarget: "overview",
    archColor: 0x06b6d4
  },
  {
    t: 0.42,
    sector: "SECTOR 2",
    tag: "CHECKPOINT 04 // FLAGSHIP FULL-STACK",
    title: "CareerHub — Work Searching Platform",
    subtitle: "Full-Stack Job Search Platform • React, Node.js, Express, MongoDB",
    desc: "Connects job seekers with employers through real-time job listings, role-based user management, and instant search filters. Deployed live on Netlify with open-source code on GitHub.",
    badges: ["ReactJS", "Node.js", "Express", "MongoDB", "Redux"],
    linkText: "Launch CareerHub Live ↗",
    linkUrl: "https://car33rhub.netlify.app",
    tabTarget: "projects",
    archColor: 0x10b981
  },
  {
    t: 0.56,
    sector: "SECTOR 3",
    tag: "CHECKPOINT 05 // DISTRIBUTED SYSTEMS",
    title: "Voting System & Travel Relax",
    subtitle: "Java RMI + Spring Boot + React & JavaEE Travel Booking",
    desc: "Interactive Voting System with Java RMI backend logic, a Spring Boot API bridge, and real-time React results displays — plus Travel Relax for full-stack agency booking.",
    badges: ["Java RMI", "Spring Boot", "React", "JavaEE / JSP", "MySQL"],
    linkText: "Voting System GitHub ↗",
    linkUrl: "https://github.com/pyaephyo11979",
    tabTarget: "projects",
    archColor: 0xa855f7
  },
  {
    t: 0.72,
    sector: "SECTOR 3",
    tag: "CHECKPOINT 06 // MOBILE & API ECOSYSTEM",
    title: "Open Path Mobile App, Backend API & CareerCraft",
    subtitle: "Flutter Cross-Platform Mobile + Prisma / PostgreSQL / JWT APIs",
    desc: "Engineered the Open Path Mobile Application in Flutter/Dart paired with the Open Path Backend API (Express, Prisma ORM, PostgreSQL, Firebase FCM) and CareerCraft JWT REST API.",
    badges: ["Flutter & Dart", "Prisma ORM", "PostgreSQL", "Firebase FCM", "JWT Auth"],
    linkText: "Explore All 8 Projects ↗",
    linkUrl: "https://pyaefolio.netlify.app/",
    tabTarget: "projects",
    archColor: 0xf59e0b
  },
  {
    t: 0.86,
    sector: "SECTOR 4",
    tag: "CHECKPOINT 07 // DYNO & PIT RADIO",
    title: "Full-Stack Dyno Skills & Pit Wall Contact",
    subtitle: "pyarephyoehlaing16@gmail.com • +95 9757524978 • Yangon",
    desc: "Ready to collaborate on full-stack web, backend API, or Flutter mobile engineering projects. Open the Pit Radio channel to send a message or inspect the complete technical dyno chart.",
    badges: ["TypeScript & ES6+", "Tailwind & Material UI", "Git & Postman", "Yangon, Myanmar"],
    linkText: "Open Pit Radio Comms",
    linkUrl: "#contact",
    tabTarget: "contact",
    archColor: 0xec4899
  }
];

const PORTFOLIO_PROJECTS = [
  {
    title: "CareerHub (Work Searching Platform)",
    category: "fullstack",
    badge: "Flagship Full-Stack",
    tech: ["React", "Node.js", "Express", "MongoDB", "Redux"],
    desc: "A full-featured job search platform that connects job seekers with employers, featuring job listings, user management, and search filtering.",
    liveUrl: "https://car33rhub.netlify.app",
    repoUrl: "https://github.com/pyaephyo11979/CareerHub",
    warpT: 0.42
  },
  {
    title: "Online Voting System",
    category: "fullstack",
    badge: "Distributed System",
    tech: ["React", "Java RMI", "Java Spring Boot", "MySQL"],
    desc: "A distributed interactive voting system with Java RMI backend logic, a Java Spring Boot API bridge, and real-time results display in ReactJS.",
    liveUrl: "https://pyaefolio.netlify.app/",
    repoUrl: "https://github.com/pyaephyo11979/Voting-System",
    warpT: 0.56
  },
  {
    title: "Open Path Mobile Application",
    category: "mobile",
    badge: "Mobile App",
    tech: ["Flutter", "Dart", "Mobile UI/UX", "Cross-Platform"],
    desc: "A cross-platform mobile application built with Flutter that enables users to seamlessly access the Open Path platform on mobile devices.",
    liveUrl: "https://pyaefolio.netlify.app/",
    repoUrl: "https://github.com/pyaephyo11979/open_path",
    warpT: 0.72
  },
  {
    title: "Open Path Backend API",
    category: "backend",
    badge: "Production API",
    tech: ["Node.js", "Express", "Prisma ORM", "PostgreSQL", "JWT", "Firebase FCM"],
    desc: "Robust backend API providing secure endpoints for the Open Path platform with JWT authentication, authorization, data validation, and push notifications.",
    liveUrl: "https://pyaefolio.netlify.app/",
    repoUrl: "https://github.com/pyaephyo11979/openpath_backend'",
    warpT: 0.72
  },
  {
    title: "Travel Relax (Travel Agency Website)",
    category: "fullstack",
    badge: "Enterprise Web",
    tech: ["JavaEE", "JSP", "Servlet", "Spring Boot", "MySQL", "Bootstrap"],
    desc: "Full-stack travel agency web platform featuring user authentication, tour package booking workflows, and integrated payment processing.",
    liveUrl: "https://pyaefolio.netlify.app/",
    repoUrl: "https://github.com/pyaephyo11979/TravelAgencyProjecct",
    warpT: 0.56
  },
  {
    title: "CareerCraft (Backend API)",
    category: "backend",
    badge: "REST API",
    tech: ["Node.js", "Express", "MongoDB", "JWT", "Middleware"],
    desc: "Complete backend REST API architecture featuring token-based authentication, role authorization, custom middleware, and strict schema validation.",
    liveUrl: "https://pyaefolio.netlify.app/",
    repoUrl: "https://github.com/pyaephyo11979/workSearchingProgramme/tree/main/backend",
    warpT: 0.72
  },
  {
    title: "Weather Application",
    category: "frontend",
    badge: "Data Visualization",
    tech: ["React", "REST API Integration", "Geolocation", "CSS3"],
    desc: "Location-aware weather forecasting application delivering real-time meteorological telemetry and responsive visual forecast cards.",
    liveUrl: "https://pyaefolio.netlify.app/",
    repoUrl: "https://github.com/pyaephyo11979/WeatherApp",
    warpT: 0.42
  },
  {
    title: "Readers' Choice",
    category: "frontend",
    badge: "Frontend Library",
    tech: ["React", "Responsive Design", "API Integration", "Tailwind CSS"],
    desc: "Frontend online digital library engineered with a clean, modern reading interface, fast book discovery, and adaptive layout across devices.",
    liveUrl: "https://pyaefolio.netlify.app/",
    repoUrl: "https://github.com/pyaephyo11979/RC",
    warpT: 0.42
  }
];

const SKILL_CATEGORIES = [
  {
    title: "Frontend Aerodynamics",
    rpm: "9,400 RPM",
    color: "from-red-500 to-orange-500",
    items: ["React & Redux", "JavaScript (ES6+)", "TypeScript", "HTML5 & CSS3", "Tailwind CSS", "Material UI", "Responsive UI/UX Design"]
  },
  {
    title: "Backend Powertrain",
    rpm: "9,800 RPM",
    color: "from-cyan-400 to-blue-500",
    items: ["Node.js & Express.js", "PHP Laravel", "Java (RMI & Spring Boot)", "RESTful APIs", "Authentication & JWT", "Middleware & Error Handling"]
  },
  {
    title: "Database & Telemetry Storage",
    rpm: "9,200 RPM",
    color: "from-amber-400 to-yellow-500",
    items: ["MongoDB & Mongoose ODM", "PostgreSQL & MySQL", "Prisma ORM", "Database Schema Design", "Indexing & Aggregation", "CRUD Optimization"]
  },
  {
    title: "Mobile & Cross-Platform Chassis",
    rpm: "9,000 RPM",
    color: "from-emerald-400 to-teal-500",
    items: ["Flutter", "Dart", "Mobile UI/UX Design", "Cross-Platform Development", "Firebase FCM Integration"]
  },
  {
    title: "Pit-Lane Dev Tools & Workflow",
    rpm: "9,500 RPM",
    color: "from-purple-400 to-pink-500",
    items: ["Git & GitHub", "VS Code", "npm / yarn", "Webpack & Babel", "ESLint", "Postman API Testing"]
  },
  {
    title: "Race Strategy & Engineering",
    rpm: "9,600 RPM",
    color: "from-rose-500 to-red-600",
    items: ["System Architecture", "Problem Solving & Debugging", "Project Management", "Cross-Browser Compatibility", "Performance Optimization"]
  }
];

