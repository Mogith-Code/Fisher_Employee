import { useState } from 'react'
import Landing from './Pages/Landing'

function App() {
  const [user, setUser] = useState(null)

  const handleLoginSuccess = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    setUser(null)
  }

  if (!user) {
    return <Landing onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <div className="min-h-screen bg-brand-ivory flex flex-col justify-center items-center p-6 text-brand-dark font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-6 border border-slate-100 animate-fade-in">
        <div className="w-16 h-16 bg-teal-500/10 text-teal-600 rounded-full flex items-center justify-center mx-auto text-3xl">
          ⛵
        </div>
        <div className="space-y-2">
          <h2 className="text-2.5xl font-bold tracking-tight text-brand-dark font-display">Authenticated</h2>
          <p className="text-brand-gray text-sm">
            Welcome to KDT SEA FOOD Fisheries Management System dashboard.
          </p>
        </div>
        <div className="bg-brand-ivory p-4 rounded-xl text-left border border-slate-200/50">
          <p className="text-[10px] text-teal-600 font-bold uppercase tracking-wider">Active Session</p>
          <p className="text-sm font-semibold text-brand-dark mt-1">{user.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full bg-slate-800 text-white rounded-xl py-3.5 text-sm font-semibold hover:bg-slate-900 active:scale-[0.99] transition-all-custom shadow-md hover:shadow-lg cursor-pointer"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}

export default App
