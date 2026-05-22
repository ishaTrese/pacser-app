import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { Gamepad2, BookOpen, PenLine, Trophy, Eye, Target, Shield, Star, MapPin, Phone, Mail, ShoppingCart } from 'lucide-react'

// ─── COMPANY DETAILS ──────────────────────────────────────────────────────────
const COMPANY = {
  name: "Community's Holistic and Qualitative Institute Inc. (CHQ Institute)",
  partner: 'Insignia Review Center',
  description:
    "PACSER is powered by the <strong>Community's Holistic and Qualitative Institute Inc. (CHQ Institute)</strong> and <strong>Insignia Review Center</strong> — institutions dedicated to helping Filipinos pass the Civil Service Exam and build meaningful careers in public service.",
  vision:
    'To become a leading and trusted online review institute that empowers aspiring civil servants with the knowledge, skills, and confidence needed to successfully pass the Civil Service Examination and serve the nation with excellence and integrity.',
  mission:
    'CHQ Institute Inc. is committed to providing comprehensive, accessible, and high-quality online review programs tailored for Civil Service Examination takers — equipping learners with effective strategies, updated materials, and real exam simulations, supporting students through guidance and motivation, and promoting discipline, competence, and a strong sense of public service among future government professionals.',
  address: '[Company Address Placeholder]',
  contact: '[Contact Number Placeholder]',
  email: '[Company Email Placeholder]',
}

const FEATURES = [
  {
    icon: <Gamepad2 size={32} className="text-purple-400" />,
    title: 'Gamified Learning',
    desc: 'Earn XP, maintain streaks, and level up as you study. Learning has never been this engaging.',
  },
  {
    icon: <BookOpen size={32} className="text-green-400" />,
    title: 'Structured Tracks',
    desc: 'Follow guided study tracks aligned with the official Civil Service Exam coverage.',
  },
  {
    icon: <PenLine size={32} className="text-orange-400" />,
    title: 'Practice Tests',
    desc: 'Take timed quizzes per topic and get instant feedback to sharpen your skills.',
  },
  {
    icon: <Trophy size={32} className="text-yellow-500" />,
    title: 'Leaderboards',
    desc: 'Compete with other reviewees and see where you rank nationally.',
  },
]

const TESTIMONIALS = [
  {
    initials: 'MS',
    name: 'Maria Santos',
    role: 'Professional CSE Passer',
    level: 42,
    quote:
      'I passed the Professional CSE on my first try! The gamified approach made studying fun, and the practice tests were very similar to the actual exam. The XP system kept me motivated daily.',
  },
  {
    initials: 'JD',
    name: 'Juan dela Cruz',
    role: 'Sub-Professional CSE Passer',
    level: 38,
    quote:
      'PACSER made reviewing feel like a game. I looked forward to studying every day just to keep my streak going. Highly recommend to anyone preparing for the CSE.',
  },
  {
    initials: 'AR',
    name: 'Anne Reyes',
    role: 'Professional CSE Passer',
    level: 55,
    quote:
      'The structured tracks and detailed explanations helped me understand topics I always struggled with. I felt fully prepared on exam day.',
  },
]

export default function Home() {
  const { user, saveUserClass } = useAuth()
  const navigate = useNavigate()

  const handleCategory = (className) => {
    if (saveUserClass) saveUserClass(className);
    if (user) {
      navigate('/dashboard')
    } else {
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section 
        className="relative h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center px-4 overflow-hidden"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 30H0V0h30v30z' fill='none'/%3E%3Cpath d='M30 1H0V0h30v1zM1 30V0H0v30h1z' fill='%23ffffff' fill-opacity='0.03'/%3E%3C/svg%3E\")" }}
      >
        {/* Floating Background Icons */}
        <div className="absolute top-[15%] left-[25%] opacity-[0.03] text-blue-600 -rotate-12"><Trophy size={100} /></div>
        <div className="absolute bottom-[15%] right-[25%] opacity-[0.03] text-blue-600 rotate-12"><Shield size={120} /></div>
        <div className="absolute top-[40%] right-[35%] opacity-[0.03] text-blue-600 rotate-45"><Star size={60} /></div>

        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full py-8">
          <span className="inline-block mt-8 mb-4 px-4 py-1.5 rounded-full border border-blue-600/50 bg-blue-600/10 text-blue-600 text-xs font-bold tracking-widest uppercase">
            Gamified CSE Reviewer
          </span>

          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight max-w-3xl mb-4">
            Level Up Your{' '}
            <span className="text-blue-600">Civil Service Exam</span>{' '}
            Preparation
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-xl mb-6">
            Master the CSE with gamified learning, comprehensive study tracks, and
            practice tests built for Filipino reviewees.
          </p>

          <p className="text-slate-900 font-semibold text-base mb-4">Choose Your Category</p>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-4xl justify-center">
            {/* Professional Card */}
            <button
              onClick={() => handleCategory('Professional')}
              className="group flex-1 bg-gradient-to-b from-[#111827] to-[#0b0f17] border-2 border-blue-600 text-slate-900 p-6 rounded-3xl hover:-translate-y-1 hover:scale-105 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all duration-300 flex flex-col items-center gap-2 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {/* Default View */}
              <div className="flex flex-col items-center group-hover:opacity-0 group-hover:-translate-y-4 transition-all duration-300 w-full">
                <Shield size={48} className="text-blue-600 mb-4" />
                <span className="font-extrabold text-2xl text-blue-600 mb-2">Professional</span>
                <span className="text-slate-400 text-sm font-medium">For advanced roles & supervisory</span>
                <span className="mt-6 px-6 py-2 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 animate-pulse">
                  Select Class
                </span>
              </div>

              {/* Hover Details View */}
              <div className="absolute inset-0 flex flex-col justify-center items-start p-8 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 bg-[#0b0f17]/95 backdrop-blur-sm text-left">
                <span className="font-extrabold text-xl text-blue-500 mb-3 border-b border-blue-900 pb-2 w-full">Professional Coverage:</span>
                <ul className="text-slate-300 text-xs space-y-2 font-medium">
                  <li>• Vocabulary & Grammar</li>
                  <li>• Paragraph Organization & Reading Comp.</li>
                  <li>• Analogy & Logic</li>
                  <li>• Numerical Reasoning</li>
                  <li>• Gen. Info (Constitution, Code of Conduct)</li>
                </ul>
                <span className="mt-4 px-6 py-2 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest text-center w-full">
                  Click to Select
                </span>
              </div>
            </button>

            {/* Sub-Professional Card */}
            <button
              onClick={() => handleCategory('Sub-Professional')}
              className="group flex-1 bg-gradient-to-b from-[#111827] to-[#0b0f17] border-2 border-slate-700 hover:border-blue-600/70 text-slate-900 p-6 rounded-3xl hover:-translate-y-1 hover:scale-105 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all duration-300 flex flex-col items-center gap-2 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-slate-800/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {/* Default View */}
              <div className="flex flex-col items-center group-hover:opacity-0 group-hover:-translate-y-4 transition-all duration-300 w-full">
                <Target size={48} className="text-slate-500 group-hover:text-blue-600 mb-4" />
                <span className="font-extrabold text-2xl text-slate-300 group-hover:text-blue-500 transition-colors mb-2">Sub-Professional</span>
                <span className="text-slate-500 text-sm font-medium group-hover:text-slate-400 transition-colors">For clerical, trades & crafts</span>
                <span className="mt-6 px-6 py-2 rounded-full bg-slate-800 text-slate-400 group-hover:bg-blue-600 group-hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">
                  Select Class
                </span>
              </div>

              {/* Hover Details View */}
              <div className="absolute inset-0 flex flex-col justify-center items-start p-8 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 bg-[#0b0f17]/95 backdrop-blur-sm text-left">
                <span className="font-extrabold text-xl text-blue-500 mb-3 border-b border-blue-900 pb-2 w-full">Sub-Professional Coverage:</span>
                <ul className="text-slate-300 text-xs space-y-2 font-medium">
                  <li>• Vocabulary & Grammar</li>
                  <li>• Paragraph Organization & Reading Comp.</li>
                  <li>• Spelling</li>
                  <li>• Clerical Operations</li>
                  <li>• Numerical Reasoning & Gen. Info</li>
                </ul>
                <span className="mt-4 px-6 py-2 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest text-center w-full">
                  Click to Select
                </span>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* ── RECOMMENDED REVIEWER (REVENUE FIRST) ────────────────── */}
      <section className="bg-blue-600 py-12 px-4 relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-white opacity-5 rounded-full blur-3xl"></div>
        
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="flex-1 text-center md:text-left">
            <span className="inline-block px-3 py-1 bg-yellow-500 text-white text-xs font-black uppercase tracking-widest rounded-full mb-4 shadow-sm">
              Highly Recommended
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
              Get the Official <br/>CHQ Civil Service Reviewer
            </h2>
            <p className="text-blue-50 text-base mb-8 max-w-lg mx-auto md:mx-0 opacity-90">
              Boost your chances of passing with our comprehensive, physical review book containing thousands of updated practice questions, test-taking strategies, and complete answer keys.
            </p>
            <a 
              href="https://shopee.ph/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-xl font-black text-lg hover:bg-slate-50 transition-all shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(0,0,0,0.2)]"
            >
              <ShoppingCart size={24} /> Buy Now on Shopee
            </a>
          </div>
          <div className="flex-1 flex justify-center relative">
            <div className="relative group">
              <div className="absolute inset-0 bg-white opacity-20 blur-2xl rounded-full group-hover:opacity-30 transition-opacity"></div>
              <img 
                src="https://cf.shopee.ph/file/0c950aab0ba405fba73b64ab5585b5db" 
                alt="CHQ Civil Service Reviewer Book" 
                className="w-64 md:w-80 h-auto object-cover rounded-md shadow-2xl relative z-10 rotate-3 group-hover:rotate-0 transition-transform duration-500 border-4 border-white/10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY PACSER ───────────────────────────────────────────── */}
      <section className="bg-slate-50 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-blue-600 text-xs font-bold tracking-widest uppercase mb-2">
            Why PACSER
          </p>
          <h2 className="text-center text-3xl sm:text-4xl font-extrabold text-slate-900 mb-10">
            Everything You Need to Pass
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-white border border-slate-200 shadow-sm rounded-2xl p-7 flex flex-col gap-4 hover:border hover:border-blue-200 transition"
              >
                {f.icon}
                <h3 className="font-bold text-slate-900 text-lg">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT US ─────────────────────────────────────────────── */}
      <section className="bg-white border border-slate-200 shadow-sm py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-blue-600 text-xs font-bold tracking-widest uppercase mb-2">
            About Us
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-6">
            Your Partner in <span className="text-blue-600">CSE Success</span>
          </h2>
          <p
            className="text-slate-300 text-base leading-relaxed mb-8"
            dangerouslySetInnerHTML={{ __html: COMPANY.description }}
          />

          {/* Vision + Mission */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8 text-left">
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Eye size={22} className="text-blue-600 shrink-0" />
                <h3 className="font-bold text-slate-900 text-base">Our Vision</h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">{COMPANY.vision}</p>
            </div>
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Target size={22} className="text-blue-600 shrink-0" />
                <h3 className="font-bold text-slate-900 text-base">Our Mission</h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">{COMPANY.mission}</p>
            </div>
          </div>

          {/* Contact placeholders */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-slate-500 mt-12">
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 flex flex-col items-center gap-4 text-center border border-transparent hover:border-blue-200 transition-colors">
              <div className="w-14 h-14 rounded-full bg-blue-600/10 flex items-center justify-center">
                <MapPin size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-slate-900 font-bold text-base mb-1">Address</p>
                <p className="text-slate-400">{COMPANY.address}</p>
              </div>
            </div>
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 flex flex-col items-center gap-4 text-center border border-transparent hover:border-blue-200 transition-colors">
              <div className="w-14 h-14 rounded-full bg-blue-600/10 flex items-center justify-center">
                <Phone size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-slate-900 font-bold text-base mb-1">Contact</p>
                <p className="text-slate-400">{COMPANY.contact}</p>
              </div>
            </div>
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 flex flex-col items-center gap-4 text-center border border-transparent hover:border-blue-200 transition-colors">
              <div className="w-14 h-14 rounded-full bg-blue-600/10 flex items-center justify-center">
                <Mail size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-slate-900 font-bold text-base mb-1">Email</p>
                <p className="text-slate-400">{COMPANY.email}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SUCCESS STORIES ──────────────────────────────────────── */}
      <section className="bg-slate-50 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-blue-600 text-xs font-bold tracking-widest uppercase mb-2">
            Success Stories
          </p>
          <h2 className="text-center text-3xl sm:text-4xl font-extrabold text-slate-900 mb-10">
            Hear from Our <span className="text-blue-600">Passers</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="flex flex-col gap-4 max-w-sm mx-auto">
                {/* Dialogue Box */}
                <div className="relative bg-white border border-slate-200 shadow-sm rounded-xl p-4 shadow-xl border border-slate-700/50">
                  <div className="absolute -bottom-2 left-8 w-4 h-4 bg-white border border-slate-200 shadow-sm rotate-45 border-b border-r border-slate-700/50"></div>
                  <p className="text-slate-300 text-xs italic leading-relaxed relative z-10">"{t.quote}"</p>
                </div>
                
                {/* Player Stats */}
                <div className="flex items-center gap-3 pl-2">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full border-2 border-[#b0902a] bg-slate-50 flex items-center justify-center text-[#b0902a] font-bold text-sm shrink-0">
                      {t.initials}
                    </div>
                    <div className="absolute -top-1 -right-2 bg-[#b0902a] text-slate-900 text-[8px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-[#0b0f17] shadow-md">
                      {t.level}
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-xs">{t.name}</p>
                    <p className="text-blue-600 text-[10px] font-semibold">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <Footer />
    </div>
  )
}





