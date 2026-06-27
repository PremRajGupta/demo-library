import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import AppLogo from '../components/AppLogo';
import S from '../lib/strings';

export default function Login() {
  const [loginType, setLoginType] = useState<'student' | 'admin'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, studentLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (loginType === 'student') {
        await studentLogin(email.trim(), password);
        navigate('/student-portal');
      } else {
        await login(email.trim(), password);
        navigate('/dashboard');
      }
    } catch (err) {
      const message = (err as Error).message || 'An error occurred. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-slate-50 transition-colors duration-1000">
      
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center">
        <div className="absolute w-[80vw] max-w-[500px] h-[80vw] max-h-[500px] rounded-full bg-blue-400/10 blur-[100px] mix-blend-multiply -top-16 -left-16" />
        <div className="absolute w-[70vw] max-w-[400px] h-[70vw] max-h-[400px] rounded-full bg-purple-400/10 blur-[100px] mix-blend-multiply bottom-10 right-10" />
      </div>

      {/* Login Form Container */}
      <div className="flex-1 flex items-center justify-center w-full px-4 z-10 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-md relative"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100">
            <div className="flex flex-col items-center mb-8">
              <AppLogo size="xl" className="mb-4 justify-center" />
              <h1 className="text-2xl font-bold text-slate-900">{S.appName}</h1>
              <p className="text-sm text-slate-500 mt-1">Library Management System</p>
            </div>

            {/* Sliding Tab Toggle */}
            <div className="flex bg-slate-100 p-1.5 rounded-xl mb-8 relative">
              <motion.div
                className="absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)] bg-white rounded-lg shadow-sm"
                animate={{ x: loginType === 'student' ? '0%' : '100%' }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
              <button
                type="button"
                onClick={() => { setLoginType('student'); setError(''); }}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg z-10 transition-colors duration-200 relative text-center ${loginType === 'student' ? 'text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Student Portal
              </button>
              <button
                type="button"
                onClick={() => { setLoginType('admin'); setError(''); }}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg z-10 transition-colors duration-200 relative text-center ${loginType === 'admin' ? 'text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Admin Access
              </button>
            </div>

            {/* Demo Credentials Hint */}
            <div className="mb-6 p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                  </span>
                  Demo Credentials
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (loginType === 'admin') {
                      setEmail('demo@gmail.com');
                      setPassword('Prem@123');
                    } else {
                      setEmail('student@demo.com');
                      setPassword('Galaxy@1234');
                    }
                  }}
                  className="text-xs font-bold text-blue-700 hover:text-blue-800 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-blue-200 transition-all hover:shadow hover:-translate-y-0.5 active:translate-y-0"
                >
                  Auto Fill
                </button>
              </div>
              <div className="flex flex-col gap-1.5 text-sm">
                <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-blue-100">
                  <span className="text-slate-500 font-medium">Email</span>
                  <span className="text-slate-900 font-bold select-all">{loginType === 'admin' ? 'demo@gmail.com' : 'student@demo.com'}</span>
                </div>
                <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-blue-100">
                  <span className="text-slate-500 font-medium">Password</span>
                  <span className="text-slate-900 font-bold select-all">{loginType === 'admin' ? 'Prem@123' : 'Galaxy@1234'}</span>
                </div>
                {loginType === 'student' && (
                  <p className="text-[11px] text-slate-500 mt-0.5 italic text-center">Or any active student's credentials</p>
                )}
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-start gap-3"
              >
                <AlertCircle size={18} className="mt-0.5 flex-shrink-0 text-red-500" />
                <span className="leading-relaxed">{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  {loginType === 'student' ? 'Student Email' : 'Admin Email'}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={loginType === 'student' ? 'Galaxy@XXXX' : 'Enter your password'}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all pr-12 font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-8 shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-0.5 active:translate-y-0"
              >
                {loading ? 'Signing in...' : `Sign In as ${loginType === 'student' ? 'Student' : 'Admin'}`}
              </button>
            </form>

            <p className="text-center text-sm font-medium text-slate-500 mt-8">
              <Link to="/" className="text-blue-600 hover:text-blue-700 hover:underline transition-all">
                &larr; Back to Home
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
