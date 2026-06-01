import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.data.token);
      setUser(res.data.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Side - Brand / Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative flex-col justify-center items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-slate-900 z-0"></div>
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        <div className="relative z-10 text-center px-12">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl mx-auto mb-8 shadow-lg shadow-emerald-500/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">Welcome back to Antigravity</h1>
          <p className="text-slate-400 text-lg">The intelligent B2B WhatsApp Chatbot Platform.</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 animate-fade-in">
        <div className="w-full max-w-md">
          <div className="text-center mb-10 lg:hidden">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Antigravity</h1>
          </div>
          
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Sign In</h2>
          <p className="text-slate-500 mb-8">Enter your details to access your dashboard.</p>
          
          <form className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100" onSubmit={submit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input 
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" 
                  placeholder="name@company.com" 
                  type="email" 
                  value={email} 
                  required
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input 
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" 
                  placeholder="••••••••" 
                  type="password" 
                  value={password} 
                  required
                  onChange={(e) => setPassword(e.target.value)} 
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {error}
              </div>
            )}

            <button 
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl px-4 py-3 mt-6 transition-all shadow-md hover:shadow-lg disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Sign In'}
            </button>
            
            <p className="text-center text-sm text-slate-500 mt-6">
              Don't have an account? <Link to="/register" className="font-semibold text-emerald-600 hover:text-emerald-500 transition-colors">Create one</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
