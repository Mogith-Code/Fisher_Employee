import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Anchor, Eye, EyeOff } from 'lucide-react'
import logoImg from '../assets/Images/KDTlogo.png'

// High-fidelity vector illustration of the Wellagama Harbor fishing boat
const BoatIllustration = () => (
  <div className="relative w-full max-w-[380px] aspect-square mx-auto flex items-center justify-center my-6 lg:my-10 select-none">
    <svg 
      viewBox="0 0 400 360" 
      className="w-full h-full drop-shadow-[0_15px_30px_rgba(3,44,56,0.35)]" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Glowing Moon/Sun */}
      <circle cx="330" cy="85" r="16" fill="#fef08a" opacity="0.9" className="animate-pulse" style={{ animationDuration: '6s' }} />
      <circle cx="330" cy="85" r="26" stroke="#fef08a" strokeWidth="1" strokeDasharray="4 4" opacity="0.35" />
      
      {/* Circular Masked Sea backdrop */}
      <mask id="sea-mask">
        <ellipse cx="200" cy="200" rx="170" ry="95" fill="#ffffff" />
      </mask>
      
      <g mask="url(#sea-mask)">
        {/* Deep sea base */}
        <ellipse cx="200" cy="205" rx="170" ry="95" fill="#043242" />
        
        {/* Wave Layer 1 (Back) */}
        <path 
          d="M 15 200 Q 100 170, 200 200 T 385 200 L 385 320 L 15 320 Z" 
          fill="#06485d" 
          opacity="0.8" 
        />
        
        {/* Wave Layer 2 (Middle) */}
        <path 
          d="M 15 215 Q 110 240, 205 215 T 385 215 L 385 320 L 15 320 Z" 
          fill="#085770" 
          opacity="0.9" 
        />

        {/* Wave Layer 3 (Front) */}
        <path 
          d="M 15 235 Q 95 210, 195 235 T 385 235 L 385 320 L 15 320 Z" 
          fill="#0b6987" 
        />
      </g>
      
      {/* Fishing Boat Group */}
      <g transform="translate(130, 95)" className="animate-bounce" style={{ animationDuration: '4.5s', animationTimingFunction: 'ease-in-out' }}>
        {/* Left/Rear sail (Grey-blue) */}
        <path d="M 46 50 L 72 8 L 72 50 Z" fill="#cbd5e1" opacity="0.95" />
        
        {/* Main sail (Teal-green) */}
        <path d="M 75 50 L 75 2 Q 95 20, 114 36 Z" fill="#2dd4bf" />
        
        {/* Mast */}
        <line x1="73.5" y1="5" x2="73.5" y2="53" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" />
        
        {/* Cabin */}
        <rect x="42" y="53" width="62" height="25" rx="3" fill="#e2e8f0" />
        {/* Cabin windows */}
        <rect x="50" y="59" width="18" height="13" rx="1.5" fill="#64748b" />
        <rect x="74" y="59" width="20" height="13" rx="1.5" fill="#64748b" />
        
        {/* Hull */}
        <path d="M 28 77 L 118 77 C 128 77, 134 77, 128 86 C 118 97, 85 97, 72 97 C 32 97, 22 87, 28 77 Z" fill="#ffffff" />
        {/* Sky blue accent stripe on hull */}
        <path d="M 27.5 77.5 H 122.5" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
      </g>
      
      {/* Floating Fish */}
      {/* Green Fish (Left) */}
      <g transform="translate(75, 195) scale(0.95)" className="animate-pulse" style={{ animationDuration: '3s' }}>
        {/* Body */}
        <path d="M 12 10 C 25 1, 36 15, 45 10 C 40 18, 25 21, 12 10" fill="#2dd4bf" />
        {/* Tail */}
        <path d="M 12 10 L 2 5 L 5 10 L 2 15 Z" fill="#2dd4bf" />
        {/* Eye */}
        <circle cx="36" cy="9.5" r="1.5" fill="#042f2e" />
        <circle cx="37" cy="8.5" r="0.5" fill="#ffffff" />
      </g>
      
      {/* Orange Fish (Right) */}
      <g transform="translate(285, 202) scale(0.95)" className="animate-pulse" style={{ animationDuration: '3.5s' }}>
        {/* Body */}
        <path d="M 33 10 C 20 1, 9 15, 0 10 C 5 18, 20 21, 33 10" fill="#f97316" />
        {/* Tail */}
        <path d="M 33 10 L 43 5 L 40 10 L 43 15 Z" fill="#f97316" />
        {/* Eye */}
        <circle cx="9" cy="9.5" r="1.5" fill="#431407" />
        <circle cx="8" cy="8.5" r="0.5" fill="#ffffff" />
      </g>
      
      {/* Bubbles */}
      <circle cx="105" cy="172" r="3" stroke="#ffffff" strokeWidth="0.75" opacity="0.6" fill="none" />
      <circle cx="94" cy="182" r="2" stroke="#ffffff" strokeWidth="0.75" opacity="0.4" fill="none" />
      <circle cx="114" cy="185" r="1.5" stroke="#ffffff" strokeWidth="0.75" opacity="0.5" fill="none" />
      
      <circle cx="310" cy="180" r="2" stroke="#ffffff" strokeWidth="0.75" opacity="0.6" fill="none" />
      <circle cx="322" cy="192" r="3.5" stroke="#ffffff" strokeWidth="0.75" opacity="0.4" fill="none" />
    </svg>
  </div>
)

export default function Landing({ onLoginSuccess }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@fisheries.lk')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleLogin = (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    // Simulate login verification
    setTimeout(() => {
      if (!email) {
        setError('Please enter your email address.')
        setIsSubmitting(false)
        return
      }
      if (!password) {
        setError('Please enter your password.')
        setIsSubmitting(false)
        return
      }
      
      setSuccess(true)
      setIsSubmitting(false)
      if (onLoginSuccess) {
        onLoginSuccess({ email, rememberMe })
      }
      setTimeout(() => navigate('/dashboard'), 500)
    }, 1200)
  }

  return (
    <main className="min-h-screen w-full flex flex-col lg:flex-row overflow-x-hidden font-sans bg-brand-ivory">
      {/* Left Pane (Teal/Ocean Theme Branding) */}
      <section className="lg:w-[48%] xl:w-[44%] bg-brand-teal-bg text-white p-8 lg:p-12 xl:p-16 flex flex-col justify-between relative overflow-hidden text-left">
        {/* Soft decorative background glow */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-brand-teal-light opacity-20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-teal-500 opacity-10 blur-[100px] pointer-events-none" />

        {/* Brand Header */}
        <div className="flex items-center gap-2 relative z-10">
          <img src={logoImg} alt="KDT Sea Food" className="h-16 lg:h-20 w-auto object-contain drop-shadow-md" />
          <div className="border-l border-slate-700/50 pl-4 py-1">
            <p className="text-[10px] tracking-[0.2em] font-bold text-teal-400/90 uppercase">
              Fisheries
            </p>
            <h2 className="text-lg font-bold tracking-tight text-slate-100 font-display">
              Management System
            </h2>
          </div>
        </div>

        {/* Vector Illustration */}
        <div className="relative z-10 my-4">
          <BoatIllustration />
        </div>

        {/* Content & Statistics */}
        <div className="relative z-10 space-y-8 lg:space-y-12">
          <div className="space-y-4">
            <h1 className="text-3xl lg:text-4xl xl:text-4.5xl font-extrabold tracking-tight leading-tight text-white font-display">
              Manage your fleet,<br />track every catch.
            </h1>
            <p className="text-sm lg:text-base text-slate-300/95 leading-relaxed font-light max-w-md">
              Employees, daily catch records, expenses, pricing and weekly settlement invoices — all in one place.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-700/40">
            <div>
              <p className="text-2xl lg:text-3xl font-extrabold text-white font-display">6</p>
              <p className="text-xs text-teal-400/80 font-medium mt-1">Fishermen</p>
            </div>
            <div>
              <p className="text-2xl lg:text-3xl font-extrabold text-white font-display">7</p>
              <p className="text-xs text-teal-400/80 font-medium mt-1">Fish Varieties</p>
            </div>
            <div>
              <p className="text-2xl lg:text-3xl font-extrabold text-white font-display">1,756 kg</p>
              <p className="text-xs text-teal-400/80 font-medium mt-1">This Week</p>
            </div>
          </div>
        </div>
      </section>

      {/* Right Pane (Ivory Theme Sign-In Card) */}
      <section className="flex-1 bg-brand-ivory px-6 py-12 lg:px-16 xl:px-24 flex flex-col justify-between items-center lg:items-stretch min-h-[600px] lg:min-h-screen text-left">
        <div className="w-full max-w-[420px] mx-auto my-auto space-y-8">
          
          {/* Card Header */}
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-3xl lg:text-3.5xl font-bold tracking-tight text-brand-dark font-display">
              Welcome back
            </h2>
            <p className="text-sm text-brand-gray">
              Sign in to your admin account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg animate-shake">
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-3 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg animate-fade-in">
                Sign in successful! Redirecting to dashboard...
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label 
                htmlFor="email" 
                className="text-xs font-semibold text-brand-dark/85 tracking-wide block"
              >
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@fisheries.lk"
                  className="w-full bg-white text-brand-dark text-sm rounded-xl border border-input-border px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal transition-all-custom shadow-xs"
                  disabled={isSubmitting || success}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label 
                htmlFor="password" 
                className="text-xs font-semibold text-brand-dark/85 tracking-wide block"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-white text-brand-dark text-sm rounded-xl border border-input-border pl-4 pr-11 py-3.5 focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal transition-all-custom shadow-xs"
                  disabled={isSubmitting || success}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-teal p-1 rounded-md transition-colors"
                  tabIndex="-1"
                >
                  {showPassword ? (
                    <EyeOff className="w-4.5 h-4.5" />
                  ) : (
                    <Eye className="w-4.5 h-4.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs lg:text-sm pt-1">
              <label className="flex items-center gap-2 cursor-pointer group select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only"
                  disabled={isSubmitting || success}
                />
                <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all-custom ${
                  rememberMe 
                    ? 'bg-brand-teal border-brand-teal text-white' 
                    : 'border-slate-300 bg-white group-hover:border-brand-teal'
                }`}>
                  {rememberMe && <span className="text-[10px] leading-none">✓</span>}
                </div>
                <span className="text-xs text-brand-gray font-medium group-hover:text-brand-dark transition-colors">
                  Remember me
                </span>
              </label>
              <a 
                href="#forgot" 
                className="text-xs font-semibold text-brand-teal hover:text-brand-teal-light hover:underline transition-colors"
                onClick={(e) => {
                  e.preventDefault()
                  alert('Reset password instructions will be sent to your email.')
                }}
              >
                Forgot password?
              </a>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isSubmitting || success}
              className="w-full bg-brand-teal text-white text-sm font-semibold py-3.5 px-6 rounded-xl hover:bg-brand-teal-light active:bg-brand-teal-dark shadow-md hover:shadow-lg active:scale-[0.99] transition-all-custom cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="w-full max-w-[420px] mx-auto text-center mt-12 lg:mt-0">
          <p className="text-[10.5px] tracking-wide text-brand-gray/80">
            © 2026 Fisheries Management System · Karaitheevu, Kalamunai
          </p>
        </div>
      </section>
    </main>
  )
}
