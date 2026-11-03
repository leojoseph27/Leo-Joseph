'use client';

import React, { useRef } from "react";
import { InteractiveRobotSpline } from "@/components/ui/interactive-3d-robot";
import { AnimatedFolder } from "@/components/ui/3d-folder";
import { FocusRail, type FocusRailItem } from "@/components/ui/focus-rail";
import { Contact2 } from "@/components/ui/contact-2";
import { useOnScreen } from "@/components/ui/use-on-screen";
import { SCENE_PUBLICATIONS } from "@/lib/assets";

const portfolioData = [
  {
    title: "Research",
    projects: [
      { id: "4", image: "/publications/publi1.png", title: "Published in: Provincia Journal" },
      { id: "5", image: "/publications/publi3.png", title: "Submitted to: Bentham Science Publishers" },
      { id: "6", image: "/publications/publi2.png", title: "Research: Undergoing" },
    ],
  },
];

const PROJECT_ITEMS: FocusRailItem[] = [
  {
    id: 1,
    title: "Data-Driven Dermatology",
    description:
      "AI-powered tool that detects dermatological conditions and nutrient deficiencies from skin features, delivering personalized health reports.",
    meta: "2024 • Healthcare AI",
    imageSrc: "/projects/derma.png",
    readMoreContent: [
      {
        title: "Working",
        items: [
          "Captures user-provided skin images via a mobile interface to screen nutritional deficiencies.",
          "Preprocesses inputs with resizing, normalization, and noise reduction for reliable inference.",
          "Uses a fine-tuned ResNet50 trained on DermNet to spot markers tied to iron, B12, vitamin D, and zinc deficits.",
          "Outputs severity levels, confidence scores, and highlighted regions in real time.",
          "Maps detected deficiencies to personalized dietary suggestions using integrated nutrient datasets.",
          "Stores historical analyses so users can monitor progress on a visual health timeline.",
        ],
      },
      {
        title: "Technologies & Methods",
        items: [
          "ResNet50-based deep learning pipeline trained on DermNet dermatology sets.",
          "Image preprocessing: resizing, normalization, augmentation, and denoising.",
          "CNN feature extraction to catch discoloration, pigmentation, dryness, rashes, and other signals.",
          "Mobile-first flow with a Flask API for uploads and inference orchestration.",
          "pandas-driven nutrient mapping that powers tailored recommendations.",
          "Visualization overlays for severity/confidence plus encrypted storage and session control.",
          "Performance tuning through transfer learning and iterative validation cycles.",
        ],
      },
      {
        title: "Conclusion",
        items: [
          "Data-Driven Dermatology delivers rapid, AI-backed deficiency detection through skin analysis.",
          "Combines CNN precision with mobile accessibility for proactive insights and guidance.",
          "Supports preventive wellness via personalized recommendations and longitudinal tracking.",
        ],
      },
    ],
  },
  {
    id: 2,
    title: "Mental Health Chatbot",
    description:
      "Secure, empathetic AI companion that uses emotion recognition to provide personalized mental health support.",
    meta: "2024 • Mental Health",
    imageSrc: "/projects/mentalhealth.png",
    readMoreContent: [
      {
        title: "Working",
        items: [
          "Collects user input through text, voice, or SMS to capture emotional state and indicators in real time.",
          "Uses NLP with ICD-10 symptom keywords to detect sentiment, intent, distress cues, and psychological patterns.",
          "Employs EMA check-ins to monitor mood fluctuations and gather longitudinal data.",
          "Delivers EMI coping strategies, grounding exercises, or escalates to professionals when risk rises.",
          "Analyzes vocal tone with Librosa features and Bi-LSTM models to detect stress or anxiety.",
          "Provides offline SMS support, text-to-speech, and haptic feedback for rural and visually impaired accessibility.",
        ],
      },
      {
        title: "Technologies & Methods",
        items: [
          "NLTK pipelines for tokenization, sentiment detection, intent classification, and keyword extraction.",
          "TensorFlow/Bi-LSTM models for vocal frequency analysis and healing sound response prediction.",
          "ICD-10 mapping for structured mental-health symptom understanding and risk categorization.",
          "Google Speech-to-Text, gTTS, and haptic modules for multimodal interaction.",
          "EMA/EMI methodologies underpinning continuous tracking and timely interventions.",
          "Flask or cloud APIs to orchestrate conversations, emergency triggers, and wearable integrations for vitals.",
        ],
      },
      {
        title: "Conclusion",
        items: [
          "Provides inclusive, empathetic psychological support powered by multimodal AI.",
          "Combines NLP, EMA, and voice analytics for early detection and intervention.",
          "Delivers accessible care across diverse communities, including rural and visually impaired users.",
        ],
      },
    ],
  },
  {
    id: 3,
    title: "Fish Recommender System",
    description:
      "Maps user-specific deficiencies to a nutrient database, filtering by habitat and location for sustainable fish-based dietary suggestions.",
    meta: "2024 • Recommender System",
    imageSrc: "/projects/fish.png",
    readMoreContent: [
      {
        title: "Working",
        items: [
          "Analyzes dermatology-module deficiencies and maps them to nutrients like omega-3, B12, iodine, iron, and calcium.",
          "Reads structured fish databases containing species, habitat types, and micronutrient densities.",
          "Filters suggestions using region, water type (fresh, brackish, marine), and availability inputs.",
          "Generates personalized fish options aligned with dietary gaps and environmental suitability.",
          "Provides extra insights: nutrient benefits, preparation ideas, and suggested consumption frequency.",
          "Supports terrace aquaculture by surfacing fish suitable for small-scale home cultivation.",
        ],
      },
      {
        title: "Technologies & Methods",
        items: [
          "CSV-based nutrient database listing fish species, micronutrients, habitats, and health benefits.",
          "pandas-powered filtering for nutrient matching and environmental constraint handling.",
          "Integrates outputs from the AI dermatology model to tailor nutrient requirements dynamically.",
          "Rule-based logic aligns user location, water type, and availability with relevant fish varieties.",
          "Flask APIs deliver real-time recommendations to the mobile experience.",
          "Includes sustainability profiling for terrace aquaculture plus optimized, secure data queries.",
        ],
      },
      {
        title: "Conclusion",
        items: [
          "Delivers personalized, nutrient-rich fish suggestions rooted in individual deficiencies and context.",
          "Merges nutrition intelligence with sustainable aquaculture support for eco-friendly choices.",
          "Helps users improve health through accessible, data-backed dietary planning.",
        ],
      },
    ],
  },
  {
    id: 4,
    title: "AI Quiz Generator",
    description:
      "Automatically creates context-aware MCQs and answers from user-provided content files or topics using generative AI.",
    meta: "2025 • EdTech",
    imageSrc: "/projects/mcq.png",
    readMoreContent: [
      {
        title: "Working",
        items: [
          "Accepts user input via direct text or uploads (PDF, DOCX, TXT) to source learning material.",
          "Parses and preprocesses content to build clean, structured context for question generation.",
          "Uses Gemini 2.0 Flash to create context-aware MCQs with adjustable difficulty and question counts.",
          "Generates options, correct answers, and explanations for every question to reinforce learning.",
          "Hosts quizzes with timers, progress tracking, bookmarking, and real-time validation.",
          "Delivers instant scores, analytics, downloadable PDF reports, and autogenerated study notes.",
        ],
      },
      {
        title: "Technologies & Methods",
        items: [
          "Python, Flask, and Werkzeug for routing, sessions, file processing, and secure storage.",
          "Gemini 2.0 Flash with prompt engineering for NLP-driven MCQ generation.",
          "pdfplumber, python-docx, and text parsers for multi-format extraction.",
          "FPDF to build downloadable reports and supplemental study materials.",
          "Responsive UI built with HTML5, CSS3, JavaScript, and Font Awesome themes.",
          "Structured quiz logic covering scoring, difficulty scaling, validation, and cleanup routines.",
        ],
      },
      {
        title: "Conclusion",
        items: [
          "Automates quiz creation through NLP and flexible content ingestion.",
          "Provides customizable quizzes, analytics, and reporting for efficient learning.",
          "Reduces educator workload while delivering engaging assessment experiences.",
        ],
      },
    ],
  },
  {
    id: 5,
    title: "Heart Condition Analyzer",
    description:
      "AI-integrated system that fuses ECG, heart sounds, and clinical data to detect cardiovascular anomalies and assess risk.",
    meta: "2025 • Cardio AI",
    imageSrc: "/projects/cardioai.png",
    readMoreContent: [
      {
        title: "Working",
        items: [
          "Collects multimodal cardiovascular data including patient-reported metrics, ECG signals, and phonocardiography audio.",
          "Preprocesses streams with filtering, artifact removal, segmentation, and MFCC/wavelet feature extraction.",
          "Uses a convolutional autoencoder to model normal ECG patterns and flag anomalies with reconstruction error.",
          "Applies deep learning and transfer learning (YAMNet embeddings) to heart sounds to classify stenosis, regurgitation, and valve disorders.",
          "Deploys an integrated cloud service with real-time dashboards, visualization, and an AI chatbot for patient guidance.",
        ],
      },
      {
        title: "Technologies & Methods",
        items: [
          "Python stack: TensorFlow, PyTorch, scikit-learn, and signal-processing libraries.",
          "Convolutional autoencoders for unsupervised ECG anomaly detection.",
          "CNN/RNN hybrids for phonocardiography disease classification with transfer learning via YAMNet.",
          "MFCCs, spectrograms, PCA, and time-frequency features feed the models.",
          "Flask/Django deployment on AWS/GCP with secure REST APIs, logging, dashboards, and a TensorFlow/NLTK chatbot.",
        ],
      },
      {
        title: "Conclusion",
        items: [
          "CardioAI unifies ECG anomaly detection, acoustic diagnostics, and clinical data interpretation for comprehensive care.",
          "Enables early diagnosis, informed decision-making, and scalable real-time monitoring.",
          "Drives better patient outcomes through an AI-guided cardiovascular workflow.",
        ],
      },
    ],
  },
  {
    id: 6,
    title: "Food Sentiment Analysis",
    description:
      "NLP and machine learning pipeline that classifies Amazon food reviews with high accuracy using TF-IDF and n-grams.",
    meta: "2023 • NLP",
    imageSrc: "/projects/foodsenti.png",
    readMoreContent: [
      {
        title: "Working (Full Detailed Process)",
        items: [
          "Input: User-provided food product review in plain text.",
          "Sentiment Classification: The system performs a binary classification (Positive or Negative).",
          "Model Used: Trained Machine Learning Model (Logistic Regression with TF-IDF + n-grams) is used for sentiment analysis.",
          "Authenticity Evaluation: The review is labeled as \"Authentic (Human)\" or \"Fake or Biased\" based on linguistic pattern analysis.",
          "Conditional Prompting: A prompt is issued for improvement suggestions (e.g., \"What could make this product better?\") if the review is both Negative AND Authentic (Human).",
          "Goal: Enables real-time sentiment understanding, trust assessment, and constructive feedback collection within a user-friendly flow.",
        ],
      },
      {
        title: "Technologies & Methods",
        items: [
          "NLP: tokenization, lemmatization, stopword removal, POS tagging, and n-gram extraction.",
          "Features: Bag-of-Words, TF-IDF with n-grams, helpfulness ratios, punctuation counts.",
          "Models: Logistic Regression (primary), SVM, and Dummy Classifier baseline.",
          "Libraries: scikit-learn, NLTK, pandas, numpy, matplotlib, and seaborn.",
          "Evaluation: accuracy, classification reports, confusion matrices, and baselines.",
          "Data handling: dropped neutral reviews, undersampled helpfulness labels, binned upvote percentages.",
          "Exploration: word clouds, score vs. helpfulness heatmaps, per-user review mining.",
        ],
      },
      {
        title: "Conclusion",
        items: [
          "Classical NLP and ML classify sentiment accurately when tuned.",
          "TF-IDF with n-grams outperforms simpler feature sets.",
          "Helpfulness prediction needs richer context and behavioral data.",
        ],
      },
    ],
  },
];

export function CursorbotSection() {
  const ROBOT_SCENE_URL = SCENE_PUBLICATIONS;

  // The second Spline scene is a multi-MB download — only mount it when
  // the reader actually approaches this section, so it never competes
  // with the hero for bandwidth during initial load.
  const robotWrapRef = useRef<HTMLDivElement>(null);
  const robotNear = useOnScreen(robotWrapRef, {
    rootMargin: "600px 0px",
    once: true,
  });

  return (
    <section
      id="publications"
      className="w-full shrink-0 bg-black py-8 md:py-10 px-4 md:px-6 overflow-hidden"
    >
      {/* Publications block is desktop-only: on phones the section goes
          straight from Certifications to Projects. */}
      <h2 className="section-title mb-6 text-center w-full max-w-7xl mx-auto scroll-mt-24 hidden md:block">
        My <span className="text-purple-400">Publications</span>
      </h2>
      <div className="w-full max-w-7xl mx-auto hidden md:flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12">
        {/* 3D robot on the left */}
        <div
          ref={robotWrapRef}
          className="relative w-full lg:w-1/2 aspect-[4/5] md:aspect-[16/10] md:max-h-[70vh] overflow-hidden rounded-2xl bg-black shrink-0"
        >
          {robotNear ? (
            <InteractiveRobotSpline
              scene={ROBOT_SCENE_URL}
              className="absolute inset-0 z-0"
            />
          ) : (
            <div className="absolute inset-0 z-0 flex items-center justify-center">
              <span className="loader" aria-hidden />
            </div>
          )}
          {/* Edge gradient to blend container into section background */}
          <div
            className="pointer-events-none absolute inset-0 z-10 rounded-2xl"
            style={{
              boxShadow: "inset 0 0 80px 40px rgba(0,0,0,0.6)",
            }}
          />
          {/* Overlay to hide Spline watermark */}
          <div className="pointer-events-none absolute bottom-4 right-4 w-24 h-8 bg-black rounded-sm transform scale-150 origin-bottom-right z-20" />
        </div>

        {/* My Publications – right side: folder components */}
        <div className="w-full lg:w-1/2 flex flex-col gap-[2.025rem] lg:mt-[10vh]">
          <div className="flex flex-wrap gap-6 items-center justify-center lg:justify-start">
            {portfolioData.map((folder) => (
              <AnimatedFolder
                key={folder.title}
                title={folder.title}
                projects={folder.projects}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Projects – FocusRail carousel under My Publications */}
      <div id="projects" className="w-full max-w-7xl mx-auto mt-16 md:mt-20 scroll-mt-24">
        <h2 className="section-title mb-6 text-center">
          My <span className="text-purple-400">Projects</span>
        </h2>
        <div
          className="rounded-2xl overflow-hidden border border-white/10 bg-black"
          style={{ boxShadow: "inset 0 0 60px 20px rgba(0,0,0,0.4)" }}
        >
          <FocusRail
            items={PROJECT_ITEMS}
            autoPlay={false}
            loop={true}
            className="border-0"
          />
        </div>
      </div>

      {/* Contact – from contact project, under My Projects */}
      <div id="contact" className="w-full max-w-7xl mx-auto mt-16 md:mt-20 scroll-mt-24">
        <Contact2 />
      </div>
    </section>
  );
}

