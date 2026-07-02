import { CertificationsSection } from "@/components/ui/certifications-section";
import { CursorbotSection } from "@/components/ui/cursorbot-section";
import { SplineSceneBasic } from "@/components/ui/demo";
import { Entropy } from "@/components/ui/entropy";
import { EtherealShadow } from "@/components/ui/etheral-shadow";
import { WavyBackground } from "@/components/ui/wavy-background";

export default function Home() {
  return (
    <main className="w-full">
      <header className="w-full sticky top-0 z-40 bg-black/80 backdrop-blur border-b border-white/10">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
          <a
            href="#home"
            className="text-[0.9rem] md:text-[1.05rem] font-semibold tracking-[0.35em] text-white uppercase"
          >
            LEO JOSEPH
          </a>
          <nav className="flex items-center gap-4 md:gap-6 text-[0.96rem] md:text-[1.05rem] text-neutral-300 capitalize">
            <a href="#home" className="hover:text-white transition-colors">
              Home
            </a>
            <a href="#about" className="hover:text-white transition-colors">
              About
            </a>
            <a
              href="#certifications"
              className="hidden sm:inline hover:text-white transition-colors"
            >
              Certifications
            </a>
            <a
              href="#publications"
              className="hidden sm:inline hover:text-white transition-colors"
            >
              Publications
            </a>
            <a
              href="#projects"
              className="hidden sm:inline hover:text-white transition-colors"
            >
              Projects
            </a>
            <a href="#contact" className="hover:text-white transition-colors">
              Contact
            </a>
          </nav>
        </div>
      </header>
      {/* Section 1: Robo hero - "Hi there" */}
      <section id="home" className="w-full h-screen bg-background overflow-hidden border-0 shrink-0">
        <SplineSceneBasic />
      </section>

      {/* Section 2: Entropy (left) + About from Elora (right) */}
      <section id="entropy" className="w-full shrink-0 bg-black">
        <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16 py-12 md:py-16 px-6 md:px-10 lg:px-16">
          <div className="flex-shrink-0">
            <Entropy className="rounded-lg" size={505} />
          </div>
          <div id="about" className="flex-1 min-w-0 text-white max-w-xl lg:max-w-none">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">My name is Leo Joseph.</h2>
            <p className="text-neutral-300 text-base md:text-lg leading-relaxed mb-6">
              I am a dedicated technologist with a <strong className="text-white">B.TECH (Honors) in Computer Science and Engineering</strong>
              {" "}(specialized in <strong className="text-white">Artificial Intelligence</strong>). Over the years, I&apos;ve developed a strong interest in
              building meaningful digital experiences, exploring AI-driven possibilities, and creating software that solves
              real-world problems. I enjoy learning continuously, experimenting with new technologies, and turning ideas into
              practical, well-crafted solutions. With a blend of creativity and technical expertise, I strive to grow as a
              developer who brings value, innovation, and clarity to every project I work on.
            </p>
            <div className="space-y-2 mb-6">
              <p className="text-neutral-300 text-base md:text-lg"><span className="text-neutral-500">age:</span> <span>22</span></p>
              <p className="text-neutral-300 text-base md:text-lg"><span className="text-neutral-500">gender:</span> <span>Male</span></p>
              <p className="text-neutral-300 text-base md:text-lg"><span className="text-neutral-500">language:</span> <span>English, Malayalam, Hindi, Tamil</span></p>
              <p className="text-neutral-300 text-base md:text-lg"><span className="text-neutral-500">work:</span> <span>Full-Stack developer</span></p>
              <p className="text-neutral-300 text-base md:text-lg"><span className="text-neutral-500">freelance:</span> <span>available</span></p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="/Resume.pdf"
                download="Leo-Joseph-CV.pdf"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-white/10 text-white hover:bg-white/20 transition-colors text-base font-medium"
              >
                download CV
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </a>
              <a
                href="/Resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-white/10 text-white hover:bg-white/20 transition-colors text-base font-medium"
              >
                view CV
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Waves with glass overlay - my skills */}
      <section id="waves" className="w-full shrink-0 relative">
        <WavyBackground
          backgroundFill="rgb(0 0 0)"
          waveOpacity={0.5}
          className="w-full flex items-center justify-center p-6 md:p-10"
        >
          <div
            className="w-full max-w-[75.26rem] rounded-2xl border border-white/15 bg-black/70 backdrop-blur-md shadow-xl p-6 md:p-8"
            style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
          >
            <h2 className="text-[1.89rem] md:text-[2.35rem] font-semibold text-white mb-6 md:mb-8 text-center">
              My <span className="text-purple-400">Skills</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0">
              <div className="space-y-0">
                {[
                  { name: "Python", pct: 95 },
                  { name: "SQL", pct: 90 },
                  { name: "HTML5", pct: 90 },
                  { name: "CSS3", pct: 85 },
                  { name: "JavaScript", pct: 80 },
                  { name: "Java", pct: 85 },
                ].map(({ name, pct }) => (
                  <div key={name} className="py-3">
                    <h3 className="flex justify-between text-white text-base md:text-lg font-normal pb-1">
                      {name} <span> {pct}% </span>
                    </h3>
                    <div className="w-full h-4 bg-[#222] rounded-full overflow-hidden">
                      <span
                        className="block h-full bg-purple-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-0">
                {[
                  { name: "React", pct: 75 },
                  { name: "Flask", pct: 80 },
                  { name: "PostgreSQL", pct: 85 },
                  { name: "Machine Learning", pct: 80 },
                  { name: "Generative AI", pct: 75 },
                  { name: "Prompt Engineering", pct: 90 },
                ].map(({ name, pct }) => (
                  <div key={name} className="py-3">
                    <h3 className="flex justify-between text-white text-base md:text-lg font-normal pb-1">
                      {name} <span> {pct}% </span>
                    </h3>
                    <div className="w-full h-4 bg-[#222] rounded-full overflow-hidden">
                      <span
                        className="block h-full bg-purple-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </WavyBackground>
      </section>

      {/* Section 4: Smokebg – overlaps bottom 25% of waves with blend gradient */}
      <section
        id="qualification"
        className="w-full shrink-0 relative min-h-[83vh] px-4 md:px-6 -mt-[21vh] pt-[21vh]"
      >
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            maskImage: "linear-gradient(to bottom, transparent 0%, black 30%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 30%)",
            maskSize: "100% 100%",
            WebkitMaskSize: "100% 100%",
          }}
        >
          <EtherealShadow
            color="rgba(128, 128, 128, 1)"
            animation={{ scale: 100, speed: 90 }}
            noise={{ opacity: 1, scale: 1.2 }}
            sizing="fill"
            className="w-full h-full"
          />
        </div>
        <div
          className="relative z-10 w-full max-w-[75.26rem] mx-auto rounded-2xl border border-white/15 bg-black/60 backdrop-blur-md shadow-xl p-6 md:p-10 my-12 md:my-16"
          style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
        >
          <h2 className="text-[2.17rem] md:text-[2.70rem] font-semibold text-white mb-8 text-center">
            My <span className="text-purple-400">Qualification</span>
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Education - purple vertical line like Elora .experience-item */}
            <div className="space-y-0">
              <div className="relative flex gap-4 border-l-2 border-purple-500 pl-5 ml-4 pb-8">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white absolute left-0 -translate-x-1/2 top-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
                </div>
                <div className="pl-2">
                  <span className="text-neutral-400 text-[1.01rem]">Dec 2021 – Jul 2025</span>
                  <h3 className="text-white font-semibold mt-1 text-[1.15rem]">B.TECH (Honors) In Computer Science and Engineering (Specialization in Artificial Intelligence)</h3>
                  <p className="text-neutral-300 text-[1.01rem] mt-2">
                    Karunya Institute of Technology and Sciences, Tamil Nadu, India<br />CGPA: 7.92
                  </p>
                </div>
              </div>
              <div className="relative flex gap-4 border-l-2 border-purple-500 pl-5 ml-4 pb-8">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white absolute left-0 -translate-x-1/2 top-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
                </div>
                <div className="pl-2">
                  <span className="text-neutral-400 text-[1.01rem]">Jun 2019 – Jul 2021</span>
                  <h3 className="text-white font-semibold mt-1 text-[1.15rem]">Higher Secondary Education</h3>
                  <p className="text-neutral-300 text-[1.01rem] mt-2">
                    Good Shepherd Public School and Junior College, Kerala, India<br />CBSE – 86.4%
                  </p>
                </div>
              </div>
              <div className="relative flex gap-4 border-l-2 border-purple-500 pl-5 ml-4 pb-8">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white absolute left-0 -translate-x-1/2 top-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
                </div>
                <div className="pl-2">
                  <span className="text-neutral-400 text-[1.01rem]">Jun 2018 – May 2019</span>
                  <h3 className="text-white font-semibold mt-1 text-[1.15rem]">Secondary Education</h3>
                  <p className="text-neutral-300 text-[1.01rem] mt-2">
                    United Indian School, Kuwait<br />CBSE – 83%
                  </p>
                </div>
              </div>
            </div>
            {/* Experience - purple vertical line like Elora .experience-item */}
            <div className="space-y-0">
              <div className="relative flex gap-4 border-l-2 border-purple-500 pl-5 ml-4 pb-8">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white absolute left-0 -translate-x-1/2 top-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <div className="pl-2">
                  <span className="text-neutral-400 text-[1.01rem]">March 2026 – Ongoing</span>
                  <h3 className="text-white font-semibold mt-1 text-[1.15rem]">Full Stack Developer – Al-Nassim Golden Group</h3>
                  <p className="text-neutral-300 text-[1.01rem] mt-2">
                    • Developing Al-Nassim&rsquo;s digital platform, including an e-commerce website, PIM system, and web applications for product and inventory management.<br />
                    • Building an AI-powered product management system with barcode/ND scanning, product entry, Excel automation, image management, and Supabase integration.
                  </p>
                </div>
              </div>
              <div className="relative flex gap-4 border-l-2 border-purple-500 pl-5 ml-4 pb-8">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white absolute left-0 -translate-x-1/2 top-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <div className="pl-2">
                  <span className="text-neutral-400 text-[1.01rem]">June 2025 – Jan 2026</span>
                  <h3 className="text-white font-semibold mt-1 text-[1.15rem]">Full Stack Developer with AI &amp; Machine Learning Assistance – QB Tech Solutions, Kerala</h3>
                  <p className="text-neutral-300 text-[1.01rem] mt-2">
                    • Developed React-based web apps with a PostgreSQL backend and built an AI chatbot using Node.js.<br />
                    • Deployed the company website and handled web development, technical support, and system issue resolution.
                  </p>
                </div>
              </div>
              <div className="relative flex gap-4 border-l-2 border-purple-500 pl-5 ml-4 pb-8">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white absolute left-0 -translate-x-1/2 top-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <div className="pl-2">
                  <span className="text-neutral-400 text-[1.01rem]">Jan – Mar 2025</span>
                  <h3 className="text-white font-semibold mt-1 text-[1.15rem]">AI Intern – Workcohol Solutions Pvt. Ltd., Chennai</h3>
                  <p className="text-neutral-300 text-[1.01rem] mt-2">
                    • Developed an AI Quiz Generator using Google GenAI and Flask.<br />
                    • Managed prompt engineering, model integration, and frontend logic.
                  </p>
                </div>
              </div>
              <div className="relative flex gap-4 border-l-2 border-purple-500 pl-5 ml-4 pb-8">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white absolute left-0 -translate-x-1/2 top-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <div className="pl-2">
                  <span className="text-neutral-400 text-[1.01rem]">May – Jul 2024</span>
                  <h3 className="text-white font-semibold mt-1 text-[1.15rem]">AI & Web Development Intern – British Link Kuwait (BLK), Kuwait</h3>
                  <p className="text-neutral-300 text-[1.01rem] mt-2">
                    • Built a custom generative AI chatbot for company QA processes.<br />
                    • Assisted with website updates and hardware maintenance tasks.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Certifications – separate section (not part of smokebg) */}
      <CertificationsSection />

      {/* Cursorbot – interactive 3D robot section, left-aligned under certifications */}
      <CursorbotSection />
    </main>
  );
}
