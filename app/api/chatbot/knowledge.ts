/**
 * Knowledge base for Leo AI.
 *
 * Sources (merged, both trusted):
 *   1. The portfolio website's own content (contact section, projects,
 *      publications, certifications, about).
 *   2. Leo's resume "LEO_JOSEPH_PERUMPULLY" (2026 version) — extracted
 *      facts, dates and terminology preserved verbatim.
 *
 * Entries are retrieved per-question by the chatbot route and injected
 * into the system instruction as known facts.
 */

export interface KnowledgeEntry {
  id: string;
  /** Topic tags used for retrieval matching. */
  topics: string[];
  text: string;
}

export const CORE_FACTS: KnowledgeEntry = {
  id: "core",
  topics: ["*"],
  text: `Leo Joseph Perumpully. Computer Science graduate (B.Tech Honours, specialization in Artificial Intelligence, Karunya Institute of Technology and Sciences, CGPA 7.92, Dec 2021 – Jul 2025). Currently a Full-Stack Developer at Al-Nassim Golden Group in Kuwait City (since 08/03/2026). Strong in machine learning, data science, computer vision, generative AI and full-stack development. Passionate about applying intelligent, data-driven approaches to real-world problems and pursuing advanced research in AI and Data Science.`,
};

export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    id: "job-alnassim",
    topics: ["work", "job", "company", "current", "now", "employment", "al-nassim", "alnassim", "nassim", "kuwait", "role", "working", "e-commerce", "ecommerce", "pim"],
    text: `Current job — Full-Stack Developer at Al-Nassim Golden Group, Kuwait City, Kuwait, since 08/03/2026 (March 2026) – present. Responsibilities: developing and maintaining a scalable e-commerce platform using modern full-stack web technologies; performing data analysis and product information management (PIM) to improve inventory accuracy and business insights; building AI-assisted tools to automate product categorization, content generation and workflow optimisation; collaborating with stakeholders to enhance website performance, user experience and operational efficiency. Also building an AI-powered product management system with barcode/ND scanning, product entry, Excel automation, image management and Supabase integration.`,
  },
  {
    id: "job-qbtech",
    topics: ["qb", "qbtech", "qb tech", "previous", "kerala", "react", "node", "postgresql", "face recognition", "attendance"],
    text: `Previous job — Full-Stack Developer with AI & Machine Learning assistance at QB Tech Solutions, Kerala, India (01/06/2025 – 24/01/2026). Developed enterprise web applications using React.js, Node.js and PostgreSQL, including a role-based task management platform; assisted AI/computer-vision solutions including face recognition, ID card detection, and intelligent attendance & access management systems; built AI-powered chatbot solutions; contributed across the full software development lifecycle (design, implementation, testing, deployment, technical support).`,
  },
  {
    id: "job-workcohol",
    topics: ["workcohol", "intern", "internship", "chennai", "quiz", "education platform"],
    text: `Internship — AI Intern at Workcohol Solutions Pvt. Ltd., Chennai, India (05/01/2025 – 15/03/2025). Developed an AI-powered educational platform using Flask and Google Generative AI; implemented intelligent document processing that generated question papers from user-uploaded study materials; built AI modules for automated answer key generation, response evaluation, feedback on incorrect answers and personalised revision notes; leveraged prompt engineering for context-aware educational assistance.`,
  },
  {
    id: "job-blk",
    topics: ["british", "blk", "kuwait internship", "2024", "hardware", "networking"],
    text: `Internship — AI & Web Development Intern at British Link Kuwait (BLK), Kuwait City (21/05/2024 – 04/07/2024). Developed a custom generative AI chatbot to automate company queries and improve internal information access; assisted in website development, updates and maintenance; provided networking and hardware support; gained hands-on experience integrating AI solutions into real-world business workflows.`,
  },
  {
    id: "education",
    topics: ["study", "studied", "degree", "education", "university", "college", "btech", "b.tech", "karunya", "cgpa", "grade", "tamil nadu", "coimbatore", "specialization", "where"],
    text: `Education — B.Tech (Honours) in Computer Science and Engineering, specialization in Artificial Intelligence, Karunya Institute of Technology and Sciences, Coimbatore, Tamil Nadu, India (13/12/2021 – 15/07/2025). Field of study: software and applications development and analysis. Final grade: 7.92 CGPA (EQF level 6). Earlier: Higher Secondary (CBSE, 86.4%) at Good Shepherd Public School and Junior College, Kerala (2019–2021); Secondary (CBSE, 83%) at United Indian School, Kuwait (2018–2019).`,
  },
  {
    id: "project-aquanutri",
    topics: ["aquanutri", "derma", "dermatology", "skin", "fish", "nutri", "deficiency", "diet", "recommender", "2024", "mobile"],
    text: `Project AQUANUTRI — AI-Based Nutritional Deficiency Detection & Fish Recommendation System (01/01/2024 – 08/04/2024), https://leo861-aquanutri.hf.space/. Deep-learning model for skin-based nutritional deficiency detection (fine-tuned ResNet50 on DermNet detecting markers of iron, B12, vitamin D, zinc deficits); image data processed for health-condition classification; personalized dietary recommendations mapping detected deficiencies to nutrient-rich fish using integrated datasets; supports terrace aquaculture. (The website presents the dermatology and fish-recommender parts as two related 2024 projects; the resume merges them under AQUANUTRI.)`,
  },
  {
    id: "project-quiz",
    topics: ["quiz", "mcq", "generator", "edtech", "gemini", "flash", "exam"],
    text: `Project AI Quiz Generator (04/01/2025 – 13/03/2025), https://leojoseph975-smart-quiz.hf.space/. AI-powered web app generating context-aware MCQs from user text/uploads (PDF, DOCX, TXT); integrated Google Generative AI (Gemini 2.0 Flash) for automated question creation with adjustable difficulty and counts; Flask backend deployed for real-time use; produces options, correct answers, explanations, timers, scores, analytics, downloadable PDF reports and study notes.`,
  },
  {
    id: "project-cardio",
    topics: ["heart", "cardio", "ecg", "phonocardiography", "yamnet", "autoencoder", "2025", "cardiovascular"],
    text: `Project Heart Condition Analyzer (CardioAI) (16/02/2025 – 09/05/2025), https://leo861-coeur.hf.space/. Multimodal system fusing ECG signals, heart sounds (phonocardiography) and clinical data for cardiovascular risk prediction; convolutional autoencoder for unsupervised ECG anomaly detection; deep learning + transfer learning (YAMNet embeddings) classifying stenosis, regurgitation and valve disorders; MFCC/spectrogram features; deployed with real-time dashboards and an AI chatbot for patient guidance.`,
  },
  {
    id: "project-asthma",
    topics: ["asthma", "breathe", "respiratory", "monitoring", "2026", "alert", "environmental"],
    text: `Project Asthma Monitoring System (10/01/2026 – 02/02/2026), https://leo861-breathe.hf.space/. AI model for asthma risk prediction; processed respiratory and environmental data streams; implemented a real-time alert system for early intervention.`,
  },
  {
    id: "project-mentalhealth",
    topics: ["mental", "health", "chatbot", "emotion", "ema", "emi", "nlp", "bi-lstm", "sms"],
    text: `Project Mental Health Chatbot (2024). Secure, empathetic AI companion using emotion recognition: NLP with ICD-10 symptom keywords for sentiment/intent/distress detection; EMA check-ins monitoring mood; EMI coping strategies and escalation to professionals when risk rises; Librosa + Bi-LSTM vocal-tone analysis; offline SMS support, text-to-speech and haptic feedback for accessibility.`,
  },
  {
    id: "project-foodsenti",
    topics: ["food", "sentiment", "amazon", "review", "nlp", "tf-idf", "logistic"],
    text: `Project Food Sentiment Analysis (2023). NLP/ML pipeline classifying Amazon food reviews (binary sentiment) with TF-IDF + n-grams and Logistic Regression; authenticity evaluation labelling reviews "Authentic" vs "Fake or Biased"; conditional improvement suggestions for negative authentic reviews.`,
  },
  {
    id: "publications",
    topics: ["publication", "paper", "journal", "research", "provincia", "bentham", "conference"],
    text: `Publications — "Aquanutri: A Mobile Platform for Skin-Based Deficiency Detection and Nutrient-Rich Fish Recommendation", by Leo Joseph, Dr. M. Rajeswari and Steffi Joseph, Provincia Journal Vol. 24 No. 01 (2025). A second paper was submitted to Bentham Science Publishers, and a third research work is ongoing. Conference: presented AQUANUTRI at the SERB-sponsored international conference AGAIQCSD-2024 (New Delhi, 01–03/10/2024).`,
  },
  {
    id: "awards",
    topics: ["award", "honour", "prize", "presenter", "finalist", "startup", "achievement", "win"],
    text: `Honours & awards — Best Presenter Award at the SERB-sponsored international conference AGAIQCSD-2024 (Erode Sengunthar Engineering College, 03/10/2024) for the AQUANUTRI terrace fish-cultivation paper; Top 10 Finalist (Kerala–Tamil Nadu region) at the SSN iFound Startup Challenge (SSN College of Engineering, 28/02/2025) for personalized dietary recommendations via a data-driven decision support system.`,
  },
  {
    id: "certifications",
    topics: ["certification", "certificate", "azure", "aws", "microsoft", "cisco", "google", "meta", "ibm", "coursera", "credly", "badge"],
    text: `Certifications — Microsoft Certified: Azure Fundamentals (06/11/2024); AWS Knowledge: Cloud Essentials Training Badge (30/06/2024); Microsoft Certified: Security, Compliance & Identity Fundamentals (16/02/2024); Microsoft Certified: Azure AI Fundamentals (28/11/2022); Meta Android Developer professional certificate (Coursera, 22/10/2024 — Kotlin, Android Studio, API integration, testing/deployment); Cisco Ethical Hacker (02/10/2024); Google Data Analytics specialization (Coursera, 21/02/2024 — SQL, spreadsheets, Tableau); Google Cybersecurity specialization (Coursera, 19/02/2024 — Linux, Python, SIEM); IBM Getting Started with Enterprise-grade AI (26/10/2023); Google Cloud Computing Foundations: Infrastructure (18/09/2023) and Data, ML & AI in Google Cloud (18/09/2023).`,
  },
  {
    id: "skills",
    topics: ["skill", "skills", "tech", "technology", "stack", "programming", "language", "languages", "python", "sql", "react", "tools", "english", "ielts", "malayalam", "fluent", "proficiency"],
    text: `Technical skills — Python (95%), SQL (90%), HTML5 (90%), CSS3 (85%), JavaScript (80%), Java (85%), React (75%), Flask (80%), PostgreSQL (85%), Machine Learning (80%), Generative AI (75%), Prompt Engineering (90%). Also worked with Node.js, Supabase, TensorFlow, scikit-learn, NLTK, Librosa, Tableau, Kotlin/Android. Language skills: English C1–C2 (IELTS 7.5), Malayalam native; the website also lists Hindi and Tamil as spoken languages (not on the formal resume).`,
  },
  {
    id: "personal",
    topics: ["personal", "about", "who", "hobby", "hobbies", "interest", "age", "birthday", "born", "nationality", "phone", "email", "contact", "linkedin", "github", "website", "freelance", "address"],
    text: `Personal — Leo Joseph Perumpully, born 18/06/2003 in Kerala, India; Indian nationality; based at Perumpully House, Chalakudy, Thrissur, Kerala 680307. Phone (+965) 66235398; email leojoseph975@gmail.com; portfolio website https://leojoseph975-leo-joseph.hf.space/; GitHub github.com/leojoseph27; LinkedIn linkedin.com/in/leo-joseph-351aba232 (the resume lists linkedin.com/in/leo-joseph-perumpully — two URLs for the same profile). Available for freelance work. Hobbies: drawing, painting and arts, basketball, swimming, crafting, watching movies and series.`,
  },
  {
    id: "about-summary",
    topics: ["summary", "about", "passion", "goal", "research", "vision", "interest"],
    text: `About — Computer Science graduate with a strong foundation in machine learning, data science, computer vision and generative AI, complemented by research and full-stack development experience. Passionate about applying intelligent, data-driven approaches to solve real-world problems while pursuing advanced research in Artificial Intelligence and Data Science. Areas of interest: AI & ML, Data Science & Analytics, Generative AI & NLP, Healthcare AI systems, Computer Vision, Research & Innovation, Environmental Technology & Sustainability.`,
  },
];

/**
 * Retrieve the most relevant knowledge entries for a query.
 * Token-overlap scoring with topic tags — lightweight semantic-ish
 * retrieval appropriate for a knowledge base of this size.
 */
/** Singularise simple plurals so "certificates" matches "certificate". */
function stem(word: string): string {
  return word
    .replace(/ies$/, "y")
    .replace(/(sses|shes|ches|xes)$/, (m) => m.slice(0, -2))
    .replace(/s$/, "");
}

export function retrieveKnowledge(query: string, limit = 4): KnowledgeEntry[] {
  const rawTokens = query
    .toLowerCase()
    .replace(/[^a-z0-9.+#\- ]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
  const tokens = new Set(rawTokens.map(stem));

  const scored = KNOWLEDGE_BASE.map((entry) => {
    let score = 0;
    for (const topic of entry.topics) {
      const t = stem(topic);
      if (tokens.has(t)) {
        score += 3;
      } else if (topic.includes(" ") && query.toLowerCase().includes(topic)) {
        score += 3;
      } else {
        for (const q of tokens) {
          if (
            q.length > 3 &&
            (t.startsWith(q) || q.startsWith(t))
          ) {
            score += 1;
          }
        }
      }
    }
    for (const q of tokens) {
      if (entry.text.toLowerCase().includes(q)) score += 0.5;
    }
    return { entry, score };
  })
    .filter((s) => s.score > 1)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.entry);

  return scored;
}
