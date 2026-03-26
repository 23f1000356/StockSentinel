import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Eye, EyeOff, Package, Warehouse, TrendingUp } from 'lucide-react';
import { useStore } from '../store/useStore';
import api from '../api/axios';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  
  const { login } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    const id = window.setTimeout(() => setAnimateIn(true), 40);
    return () => window.clearTimeout(id);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await login(email, password);
    if (success) {
      try {
        const me = await api.get('/auth/me');
        const role = String(me.data?.user?.role ?? '').toUpperCase();
        const emailVal = String(me.data?.user?.email ?? '').toLowerCase();
        if (role === 'ADMIN' && emailVal === 'admin@gmail.com') navigate('/admin');
        else navigate('/user');
      } catch {
        navigate('/user');
      }
    } else {
      setError('Invalid email or password');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F5F1EB' }}>
      {/* Left Side - Branding */}
      <div
        className={`hidden lg:flex lg:w-1/2 relative overflow-hidden transition-all duration-700 ease-out ${
          animateIn ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
        }`}
        style={{ backgroundColor: '#1E1E1E' }}
      >
        <div className="flex items-center justify-center w-full p-12">
          <div className="max-w-md text-white">
            <h1 className="text-4xl mb-4">Inventory Hub</h1>
            <p className="text-xl text-gray-300">Manage your inventory smarter and faster</p>
            <div className="mt-8 bg-white/10 border border-white/20 rounded-2xl p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-[#F3E8D9]">
                  <Package className="w-5 h-5" />
                  <span className="text-sm">Live Inventory</span>
                </div>
                <div className="relative">
                  <span className="absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-75 animate-ping"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400"></span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <Warehouse className="w-5 h-5 mx-auto mb-1 text-[#C89B5A]" />
                  <p className="text-xs text-gray-300">Warehouses</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <Package className="w-5 h-5 mx-auto mb-1 text-[#C89B5A]" />
                  <p className="text-xs text-gray-300">Products</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <TrendingUp className="w-5 h-5 mx-auto mb-1 text-[#C89B5A]" />
                  <p className="text-xs text-gray-300">Analytics</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div
        className={`flex-1 flex items-center justify-center p-8 transition-all duration-700 ease-out ${
          animateIn ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
        }`}
      >
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl text-gray-800 mb-2">Welcome Back 👋</h2>
              <p className="text-gray-600">Log in to your account</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C89B5A] focus:border-transparent"
                  placeholder="you@example.com"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm text-gray-700">Password</label>
                  <a href="#" className="text-sm" style={{ color: '#C89B5A' }}>
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C89B5A] focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 rounded border-gray-300 text-[#C89B5A] focus:ring-[#C89B5A]"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg text-white transition-colors disabled:opacity-50"
                style={{ backgroundColor: '#C89B5A' }}
              >
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </form>

            {/* Signup Link */}
            <p className="text-center text-sm text-gray-600 mt-6">
              Don't have an account?{' '}
              <Link to="/signup" style={{ color: '#C89B5A' }} className="hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
