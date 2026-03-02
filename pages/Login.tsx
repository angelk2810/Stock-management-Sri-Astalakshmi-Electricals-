
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Zap, 
  AlertCircle, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Smartphone, 
  Loader2,
  ChevronRight,
  ShieldCheck,
  Package,
  LayoutDashboard,
  Key
} from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'The email or password you entered is incorrect.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: LayoutDashboard, title: 'Smart Inventory Control', desc: 'Real-time oversight of all assets' },
    { icon: Package, title: '5,000+ Products Managed', desc: 'Scaled for large electrical catalogs' },
    { icon: Zap, title: 'Real-time Stock Accuracy', desc: 'Zero-latency inventory updates' },
    { icon: ShieldCheck, title: 'Secure Role-Based Access', desc: 'Enterprise-grade permission controls' },
  ];

  return (
    <div className="min-h-screen flex bg-[#020617] font-sans selection:bg-cyan-500/30 overflow-hidden">
      {/* Left Side: Brand & Visuals (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden border-r border-white/5">
        {/* Abstract Background Patterns */}
        <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-cyan-600/10 blur-[120px] rounded-full" />
        
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        {/* Brand Section */}
        <div className="relative z-10 animate-in fade-in slide-in-from-left-8 duration-700">
          <div className="flex items-center gap-4 mb-12">
            <div className="p-3 bg-gradient-to-br from-cyan-400 to-indigo-600 rounded-2xl shadow-[0_0_30px_rgba(34,211,238,0.2)]">
              <Zap className="w-8 h-8 text-white fill-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">
                Sri Astalakshmi
              </h2>
              <p className="text-xs font-bold text-cyan-400 uppercase tracking-[0.3em] -mt-1">
                Electricals
              </p>
            </div>
          </div>

          <div className="max-w-md">
            <h1 className="text-5xl font-extrabold text-white leading-tight mb-6">
              Precision Stock <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
                Management System
              </span>
            </h1>
            <p className="text-slate-400 text-lg font-medium leading-relaxed">
              Industrial-grade inventory tracking tailored for high-volume electrical distribution and warehousing.
            </p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="relative z-10 grid grid-cols-2 gap-4 mt-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
          {features.map((f, i) => (
            <div key={i} className="p-5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-colors group">
              <f.icon className="w-6 h-6 text-cyan-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-white text-sm font-bold mb-1">{f.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        {/* Mobile Background Elements */}
        <div className="lg:hidden absolute top-[-10%] right-[-10%] w-[100%] h-[100%] bg-indigo-600/5 blur-[120px] rounded-full" />
        
        <div className="w-full max-w-md relative z-10 animate-in zoom-in duration-500">
          {/* Mobile Header (Hidden on Desktop) */}
          <div className="lg:hidden text-center mb-10">
            <div className="inline-flex p-3 bg-white/5 border border-white/10 rounded-2xl mb-4">
              <Zap className="w-8 h-8 text-cyan-400" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Sri Astalakshmi Electricals</h1>
            <p className="text-slate-500 text-sm mt-1">Precision Stock Management</p>
          </div>

          {/* Login Card */}
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl overflow-hidden relative">
            {/* Subtle Inner Glow */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-400/10 blur-2xl rounded-full -mr-8 -mt-8" />
            
            <div className="relative z-10">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">System Login</h2>
                <p className="text-slate-400 text-sm font-medium">Please enter your credentials to proceed.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="font-medium">{error}</p>
                  </div>
                )}

                {/* Email Field with Floating Label behavior simulation */}
                <div className="space-y-1.5 group">
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-800/40 border border-slate-700 text-white rounded-2xl outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all placeholder:text-slate-600 font-medium peer"
                      placeholder="Email Address"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5 group">
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-4 bg-slate-800/40 border border-slate-700 text-white rounded-2xl outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all placeholder:text-slate-600 font-medium"
                      placeholder="Password"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between px-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                      className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-cyan-500/50 transition-all"
                    />
                    <span className="text-xs font-bold text-slate-400 group-hover:text-slate-300 transition-colors">Remember me</span>
                  </label>
                  <button 
                    type="button"
                    className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                    onClick={() => alert('Please contact system administrator.')}
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Submit Button */}
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-cyan-500/10 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3 relative overflow-hidden group mt-4"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Sign into Dashboard</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                  {/* Subtle shimmer effect on hover */}
                  <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                </button>

                {/* Secondary Login Options */}
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <button 
                    type="button"
                    className="py-3 px-4 rounded-xl border border-white/5 bg-white/[0.02] text-slate-400 font-bold text-xs hover:bg-white/5 hover:text-white transition-all flex items-center justify-center gap-2"
                    onClick={() => alert('OTP login coming soon!')}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    OTP Login
                  </button>
                  <button 
                    type="button"
                    className="py-3 px-4 rounded-xl border border-white/5 bg-white/[0.02] text-slate-400 font-bold text-xs hover:bg-white/5 hover:text-white transition-all flex items-center justify-center gap-2"
                    onClick={() => alert('Admin PIN required')}
                  >
                    <Key className="w-3.5 h-3.5" />
                    Admin PIN
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          <div className="text-center mt-10">
            <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.25em]">
              &copy; {new Date().getFullYear()} Sri Astalakshmi Electricals &bull; v2.4.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
