// Detailed professional info for each technology in the TechStack section.
// Used to render a click-through detail modal.

export interface TechDetail {
  name: string;
  tagline: string;
  history: string;
  whatIsIt: string;
  pros: string[];
  cons: string[];
  bestFor: string[];
  category:
    | "Frontend"
    | "Backend"
    | "Database"
    | "CMS"
    | "Design"
    | "Mobile"
    | "Language";
}

export const techDetails: Record<string, TechDetail> = {
  React: {
    name: "React",
    category: "Frontend",
    tagline: "Component-based JavaScript library for building interactive UIs",
    history:
      "React ২০১৩ সালে Facebook (বর্তমানে Meta) তৈরি করে এবং open-source করে। Jordan Walke নামক একজন software engineer এটি প্রথম তৈরি করেন। আজ React বিশ্বের সবচেয়ে জনপ্রিয় frontend library — Facebook, Instagram, Netflix, Airbnb, WhatsApp Web সহ লক্ষ লক্ষ website এতে তৈরি।",
    whatIsIt:
      "React একটি JavaScript library যা reusable UI component তৈরি করতে ব্যবহার হয়। এটি Virtual DOM ব্যবহার করে দ্রুত render করে এবং Single Page Application (SPA) তৈরিতে industry standard হিসেবে স্বীকৃত। Hooks, Context, Server Components এর মতো আধুনিক feature এতে আছে।",
    pros: [
      "অত্যন্ত fast rendering — Virtual DOM ব্যবহার করায় UI smooth ও responsive",
      "Component-based architecture — code reusable, maintainable ও scalable",
      "বিশাল ecosystem ও community — যেকোনো সমস্যার সমাধান online পাওয়া যায়",
      "SEO-friendly করা সম্ভব Next.js বা SSR এর মাধ্যমে",
      "Mobile (React Native) ও desktop (Electron) এ same knowledge কাজে লাগে",
      "Meta, Netflix, Uber maintain করায় long-term support guaranteed",
    ],
    cons: [
      "JSX, state management ও hooks বুঝতে শুরুতে সময় লাগে",
      "শুধু React যথেষ্ট নয় — routing, form, state এর জন্য আলাদা library লাগে",
      "Frequent updates — best practice দ্রুত পরিবর্তন হয়",
      "Plain React এ ভালো SEO পেতে SSR/Next.js দরকার হয়",
    ],
    bestFor: [
      "Dynamic SaaS dashboard, admin panel",
      "E-commerce site যেখানে fast UX দরকার",
      "Real-time chat, social platform",
      "Custom web app ও startup MVP",
    ],
  },
  "Next.js": {
    name: "Next.js",
    category: "Frontend",
    tagline:
      "Production-grade React framework with SSR, SSG and full-stack features",
    history:
      "Next.js ২০১৬ সালে Vercel (পূর্বে Zeit) প্রকাশ করে। লক্ষ্য ছিল React এর সাথে server-side rendering, routing ও performance optimization out-of-the-box দেয়া। বর্তমানে Next.js 14/15 App Router সবচেয়ে আধুনিক React framework হিসেবে গণ্য।",
    whatIsIt:
      "Next.js একটি full-stack React framework যা SSR, SSG, ISR, API routes, image optimization এবং file-based routing একসাথে দেয়। SEO-friendly site, blog, e-commerce, ও enterprise app তৈরিতে industry standard।",
    pros: [
      "Built-in SEO — Google সহ সব search engine সহজে index করে",
      "Image, font ও script optimization automatic — page load দ্রুত",
      "Hybrid rendering (SSR + SSG + Client) — page অনুযায়ী best strategy",
      "API route built-in — আলাদা backend ছাড়াই full-stack app",
      "Vercel এ one-click deploy, global CDN ও edge function support",
      "TypeScript first-class support",
    ],
    cons: [
      "Plain React এর তুলনায় শেখার curve বেশি",
      "App Router (Next 13+) এ mental model নতুন",
      "Vercel এর বাইরে hosting cost বেশি হতে পারে",
      "Build time বড় site এ লম্বা",
    ],
    bestFor: [
      "SEO-critical marketing site, blog, news portal",
      "E-commerce store (Shopify Hydrogen, Medusa)",
      "Corporate website ও landing page",
      "Full-stack SaaS application",
    ],
  },
  "Node.js": {
    name: "Node.js",
    category: "Backend",
    tagline: "JavaScript runtime for fast, scalable server-side applications",
    history:
      "Node.js ২০০৯ সালে Ryan Dahl তৈরি করেন। Google এর V8 JavaScript engine এর উপর ভিত্তি করে তৈরি। প্রথমবারের মতো JavaScript browser এর বাইরে server-side এ চালানো সম্ভব হয়। Netflix, LinkedIn, PayPal, Uber এ ব্যবহৃত।",
    whatIsIt:
      "Node.js একটি open-source, cross-platform JavaScript runtime যা server-side application চালায়। Event-driven, non-blocking I/O model এর কারণে এটি অসংখ্য concurrent connection handle করতে পারে।",
    pros: [
      "V8 engine ও non-blocking I/O এর কারণে high performance",
      "Frontend ও backend — same language (JavaScript)",
      "NPM — বিশ্বের সবচেয়ে বড় package ecosystem",
      "Real-time application (chat, live dashboard, gaming) এর জন্য আদর্শ",
      "Microservice ও serverless architecture এ চমৎকার",
      "Massive community ও enterprise adoption",
    ],
    cons: [
      "CPU-intensive কাজে (video encoding, heavy computation) দুর্বল",
      "Single-threaded — careful না হলে event loop block",
      "Async error handling নতুনদের জন্য কঠিন",
      "NPM এ অনেক unmaintained বা insecure package",
    ],
    bestFor: [
      "REST API ও GraphQL backend",
      "Real-time chat, notification, live dashboard",
      "Microservice ও serverless function",
      "SSR application এর backend",
    ],
  },
  TypeScript: {
    name: "TypeScript",
    category: "Language",
    tagline: "Strongly-typed superset of JavaScript that scales",
    history:
      "TypeScript ২০১২ সালে Microsoft এর Anders Hejlsberg (C# এর creator) তৈরি করেন। JavaScript এর type safety সমস্যা সমাধানে বানানো। আজ large-scale JavaScript development এর de-facto standard।",
    whatIsIt:
      "TypeScript হলো JavaScript এর strongly-typed superset। সব JavaScript code TypeScript এ valid, কিন্তু এতে static type, interface, generics যোগ হয়েছে। Compile time এ bug ধরা যায়।",
    pros: [
      "Compile time এ bug ধরা — production এ যাওয়ার আগেই error fix",
      "IDE তে দুর্দান্ত autocomplete, refactoring ও navigation",
      "Large codebase এ maintainability বহু গুণ বাড়ে",
      "Self-documenting code — type দেখেই function এর behavior বোঝা যায়",
      "React, Next.js, Node, Angular সবখানে first-class support",
    ],
    cons: [
      "Setup ও type definition লেখা শুরুতে সময়সাপেক্ষ",
      "Compile step দরকার — pure JS এর চেয়ে build slow",
      "Third-party library এর সব type definition নাও থাকতে পারে",
      "Advanced type (generics, conditional type) শিখতে সময় লাগে",
    ],
    bestFor: [
      "Enterprise-grade web application",
      "Big team এ collaboration",
      "Long-term maintenance এর project",
      "Library ও SDK development",
    ],
  },
  WordPress: {
    name: "WordPress",
    category: "CMS",
    tagline:
      "World's most popular content management system — powers 43% of the web",
    history:
      "WordPress ২০০৩ সালে Matt Mullenweg ও Mike Little তৈরি করেন। শুরুতে শুধু blogging platform ছিল, এখন পৃথিবীর প্রায় ৪৩% website WordPress এ চলে। সম্পূর্ণ open-source ও বিনামূল্যে।",
    whatIsIt:
      "WordPress একটি PHP-based open-source CMS যা যেকোনো ধরনের website — blog, business site, e-commerce (WooCommerce), portfolio, news portal — সহজে বানাতে দেয়। হাজার হাজার theme ও plugin আছে।",
    pros: [
      "Non-technical user নিজেই content edit ও publish করতে পারে",
      "৫০,০০০+ free plugin ও ১০,০০০+ theme available",
      "SEO-friendly (Yoast, Rank Math plugin)",
      "WooCommerce দিয়ে full-featured e-commerce store",
      "Hosting cost কম — যেকোনো shared hosting এ চলে",
      "Bangladeshi developer সহজে পাওয়া যায়",
    ],
    cons: [
      "Custom complex feature এ slow ও heavy হয়ে যায়",
      "Plugin overload এ security ও performance issue",
      "Regular update না করলে hack এর ঝুঁকি",
      "Plugin abandon হলে dependency সমস্যা",
    ],
    bestFor: [
      "Blog, news site, magazine",
      "Small business website ও portfolio",
      "WooCommerce দিয়ে small/medium e-commerce",
      "Membership site ও LMS",
    ],
  },
  PHP: {
    name: "PHP",
    category: "Language",
    tagline: "Battle-tested server-side language powering most of the web",
    history:
      "PHP ১৯৯৪ সালে Rasmus Lerdorf তৈরি করেন। মূলত personal homepage এর জন্য বানানো। আজ web development এর সবচেয়ে widely-used server-side language গুলোর একটি। Facebook, Wikipedia, WordPress, Slack এ ব্যবহৃত। PHP 8+ এ JIT compiler ও modern syntax এসেছে।",
    whatIsIt:
      "PHP (Hypertext Preprocessor) একটি server-side scripting language যা মূলত web development এর জন্য তৈরি। MySQL/PostgreSQL এর সাথে সহজে কাজ করে, HTML এর সাথে mix করা যায়, প্রায় সব hosting এ default চলে।",
    pros: [
      "শেখা সহজ — beginner-friendly syntax",
      "প্রায় সব web hosting এ default install (সবচেয়ে সস্তা)",
      "Laravel, Symfony এর মতো mature framework আছে",
      "WordPress, Magento, Drupal — সব major CMS PHP তে",
      "Mature ecosystem, বিশাল community",
      "PHP 8+ এ performance অনেক উন্নত",
    ],
    cons: [
      "পুরোনো dynamically-typed nature — runtime error বেশি",
      "Modern frontend integration কিছুটা cumbersome",
      "Inconsistent function naming (legacy)",
      "Real-time application এ Node.js এর তুলনায় দুর্বল",
    ],
    bestFor: [
      "WordPress site, custom CMS",
      "Laravel দিয়ে enterprise web app",
      "E-commerce (Magento, WooCommerce)",
      "Quick MVP ও freelance project",
    ],
  },
  Laravel: {
    name: "Laravel",
    category: "Backend",
    tagline: "The PHP framework for web artisans — elegant, expressive, batteries-included",
    history:
      "Laravel ২০১১ সালে Taylor Otwell তৈরি করেন। CodeIgniter এর সীমাবদ্ধতা থেকে মুক্তি পেতে বানানো। আজ এটি বিশ্বের সবচেয়ে জনপ্রিয় PHP framework — modern PHP development এর standard।",
    whatIsIt:
      "Laravel একটি MVC (Model-View-Controller) PHP framework যা elegant syntax, powerful ORM (Eloquent), built-in authentication, queue, mail, caching এবং অসংখ্য feature out-of-the-box দেয়। Artisan CLI দিয়ে rapid development সম্ভব।",
    pros: [
      "Elegant syntax — code পড়তে ও লিখতে আরামদায়ক",
      "Eloquent ORM — database query অত্যন্ত সহজ",
      "Built-in authentication, authorization, queue, mail, cache",
      "Artisan CLI দিয়ে rapid code generation",
      "Laravel Forge, Vapor — deployment সহজ",
      "Massive ecosystem (Nova, Jetstream, Livewire, Filament)",
    ],
    cons: [
      "Heavy framework — small project এ overkill",
      "Learning curve PHP framework এর মধ্যে relatively বেশি",
      "Performance Node.js/Go এর চেয়ে slow",
      "Hosting এ PHP environment ভালোভাবে configure দরকার",
    ],
    bestFor: [
      "Enterprise PHP web application",
      "SaaS platform ও admin dashboard",
      "REST API ও multi-tenant app",
      "Custom e-commerce ও booking system",
    ],
  },
  MongoDB: {
    name: "MongoDB",
    category: "Database",
    tagline: "Document-based NoSQL database for modern flexible applications",
    history:
      "MongoDB ২০০৯ সালে 10gen (বর্তমানে MongoDB Inc.) তৈরি করে। NoSQL movement এর pioneer। নাম এসেছে 'humongous' শব্দ থেকে। বর্তমানে বিশ্বের সবচেয়ে জনপ্রিয় document database।",
    whatIsIt:
      "MongoDB একটি NoSQL document database যা JSON-like document (BSON) এ data store করে। Schema-flexible, horizontally scalable, এবং বড় unstructured data এর জন্য আদর্শ। MongoDB Atlas এর মাধ্যমে cloud-managed পাওয়া যায়।",
    pros: [
      "Schema-flexible — data structure পরিবর্তন সহজ",
      "JSON-like document — JavaScript/Node.js এর সাথে natural fit",
      "Horizontal scaling সহজ (sharding built-in)",
      "Aggregation pipeline দিয়ে complex query সম্ভব",
      "MongoDB Atlas — managed cloud, backup ও monitoring built-in",
      "Real-time analytics ও big data এ ভালো",
    ],
    cons: [
      "Complex relational query (JOIN) এ SQL এর তুলনায় দুর্বল",
      "ACID transaction relatively newer feature",
      "Storage size SQL এর চেয়ে বেশি",
      "Schemaless হওয়ায় data consistency নিজেই maintain করতে হয়",
    ],
    bestFor: [
      "Real-time analytics ও logging",
      "Content management ও catalog",
      "IoT এবং sensor data",
      "Rapid prototyping ও MVP",
    ],
  },
  MySQL: {
    name: "MySQL",
    category: "Database",
    tagline: "The world's most popular open-source relational database",
    history:
      "MySQL ১৯৯৫ সালে Michael Widenius ও David Axmark তৈরি করেন। নাম এসেছে Michael এর মেয়ের নাম 'My' থেকে। ২০১০ সালে Oracle অধিগ্রহণ করে। আজ এটি বিশ্বের সবচেয়ে widely deployed open-source database।",
    whatIsIt:
      "MySQL একটি relational database management system (RDBMS) যা SQL ব্যবহার করে structured data store ও query করে। Tables, rows, columns এবং relationships এর মাধ্যমে data organize করা হয়। WordPress, Facebook, Twitter, YouTube সবাই MySQL ব্যবহার করে।",
    pros: [
      "অত্যন্ত mature, stable ও battle-tested",
      "ACID-compliant — data integrity guaranteed",
      "SQL standard — অন্য database এ migration সহজ",
      "প্রায় সব hosting এ default available",
      "PHP, Node, Python, Java — সব language এ excellent driver",
      "Free ও open-source, enterprise support পাওয়া যায়",
    ],
    cons: [
      "Horizontal scaling তুলনামূলক কঠিন",
      "Unstructured/JSON data এ NoSQL এর চেয়ে slow",
      "PostgreSQL এর তুলনায় advanced feature কম",
      "Oracle ownership নিয়ে কিছু developer concern",
    ],
    bestFor: [
      "WordPress ও traditional CMS",
      "E-commerce platform",
      "Banking, ERP, CRM — যেখানে transaction integrity critical",
      "যেকোনো structured data application",
    ],
  },
  Figma: {
    name: "Figma",
    category: "Design",
    tagline: "Collaborative interface design tool that revolutionized UI/UX workflow",
    history:
      "Figma ২০১৬ সালে Dylan Field ও Evan Wallace launch করেন। Browser-based real-time collaborative design tool হিসেবে industry disrupt করে। ২০২২ সালে Adobe $20 billion এ acquire করতে চেয়েছিল (পরে cancel)। আজ designer দের #1 choice।",
    whatIsIt:
      "Figma একটি cloud-based vector design ও prototyping tool। UI/UX design, wireframe, prototype, design system — সব এক জায়গায়। Real-time এ একাধিক designer একসাথে কাজ করতে পারে, ঠিক Google Docs এর মতো।",
    pros: [
      "Real-time collaboration — designer + developer একসাথে কাজ করতে পারে",
      "Browser-based — install দরকার নেই, যেকোনো OS এ চলে",
      "Free tier অনেক generous",
      "Auto layout, component, variant — design system বানানো সহজ",
      "Developer handoff (CSS, dimension) built-in",
      "বিশাল plugin ecosystem ও community template",
    ],
    cons: [
      "Internet ছাড়া কাজ সীমিত",
      "Heavy file এ performance issue",
      "Advanced illustration এ Adobe Illustrator এর চেয়ে দুর্বল",
      "Adobe acquisition rumor এর কারণে কিছু uncertainty",
    ],
    bestFor: [
      "Website ও mobile app UI/UX design",
      "Design system ও component library",
      "Prototyping ও user testing",
      "Designer-developer collaboration",
    ],
  },
  Flutter: {
    name: "Flutter",
    category: "Mobile",
    tagline: "Google's UI toolkit for building cross-platform apps from a single codebase",
    history:
      "Flutter ২০১৭ সালে Google launch করে। Dart programming language ব্যবহার করে। লক্ষ্য — একই code দিয়ে iOS, Android, Web, Desktop সব platform এ native-quality app বানানো। BMW, Alibaba, Google Pay সবাই Flutter ব্যবহার করে।",
    whatIsIt:
      "Flutter একটি open-source UI framework যা Dart language ব্যবহার করে cross-platform native app বানায়। Skia rendering engine এর কারণে প্রতিটি pixel নিজে draw করে — তাই সব platform এ identical look ও performance।",
    pros: [
      "Single codebase → iOS + Android + Web + Desktop",
      "Native-level performance (60-120 FPS)",
      "Hot reload — code change instantly preview",
      "Beautiful built-in widgets (Material + Cupertino)",
      "Google backing ও growing community",
      "Development speed traditional native এর চেয়ে অনেক দ্রুত",
    ],
    cons: [
      "Dart language শিখতে হবে (popular নয়)",
      "App size native এর চেয়ে বড়",
      "Platform-specific API access এ native module দরকার হয়",
      "iOS এ Apple এর design guideline পুরোপুরি match করা কঠিন",
    ],
    bestFor: [
      "Cross-platform mobile app (startup, MVP)",
      "E-commerce ও content app",
      "Internal business tool",
      "যেখানে design consistency সব platform এ দরকার",
    ],
  },
  Python: {
    name: "Python",
    category: "Language",
    tagline: "Versatile, readable language — #1 for AI, data science and automation",
    history:
      "Python ১৯৯১ সালে Guido van Rossum তৈরি করেন। নাম এসেছে 'Monty Python' কমেডি group থেকে। Simplicity ও readability এর জন্য বিখ্যাত। আজ AI, machine learning, data science, automation এর #1 language।",
    whatIsIt:
      "Python একটি high-level, interpreted, general-purpose programming language। Clean syntax এবং বিশাল standard library এর কারণে beginner থেকে expert সবার পছন্দ। Web (Django, Flask, FastAPI), AI (TensorFlow, PyTorch), data science (Pandas, NumPy) — সব জায়গায় ব্যবহার হয়।",
    pros: [
      "অত্যন্ত readable ও beginner-friendly syntax",
      "AI/ML/Data Science এর জন্য #1 (TensorFlow, PyTorch, scikit-learn)",
      "Django ও FastAPI দিয়ে দ্রুত web backend",
      "Automation, scripting, scraping এ অসাধারণ",
      "বিশাল standard library — 'batteries included'",
      "Strong scientific ও research community",
    ],
    cons: [
      "Compiled language এর তুলনায় slow (interpreted)",
      "Mobile app development এ দুর্বল",
      "Global Interpreter Lock (GIL) — true multithreading সীমিত",
      "Frontend এ ব্যবহার নেই",
    ],
    bestFor: [
      "AI, machine learning, deep learning",
      "Data analysis ও visualization",
      "Web backend (Django, FastAPI)",
      "Automation, web scraping, scripting",
    ],
  },
};

// Slug ↔ name mapping for dedicated detail pages (/tech/:slug)
export const techSlugMap: Record<string, string> = {
  react: "React",
  nextjs: "Next.js",
  nodejs: "Node.js",
  typescript: "TypeScript",
  wordpress: "WordPress",
  php: "PHP",
  laravel: "Laravel",
  mongodb: "MongoDB",
  mysql: "MySQL",
  figma: "Figma",
  flutter: "Flutter",
  python: "Python",
};

export const techNameToSlug: Record<string, string> = Object.fromEntries(
  Object.entries(techSlugMap).map(([slug, name]) => [name, slug])
);

export const getTechBySlug = (slug: string): TechDetail | null => {
  const name = techSlugMap[slug.toLowerCase()];
  return name ? techDetails[name] ?? null : null;
};
