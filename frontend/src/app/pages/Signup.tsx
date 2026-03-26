import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Eye, EyeOff, Check, Package, Warehouse, TrendingUp } from 'lucide-react';
import { useStore } from '../store/useStore';

export function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    organization: '',
    plan: 'free' as 'free' | 'pro',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  
  const { signup, logout } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    const id = window.setTimeout(() => setAnimateIn(true), 40);
    return () => window.clearTimeout(id);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!agreedToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    setLoading(true);

    const success = await signup(formData);
    if (success) {
      // Signup should not auto-login. Clear any auth state and send to login page.
      logout();
      return;
    } else {
      setError('Email already exists');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F5F1EB' }}>
      {/* Left Side - Form (reverse of login) */}
      <div
        className={`flex-1 lg:w-1/2 flex items-center justify-center p-8 overflow-y-auto transition-all duration-700 ease-out ${
          animateIn ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
        }`}
      >
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl text-gray-800 mb-2">Create your account</h2>
              <p className="text-gray-600">Start managing your inventory today</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* User Information */}
              <div>
                <h3 className="text-lg text-gray-800 mb-4">User Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C89B5A] focus:border-transparent"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C89B5A] focus:border-transparent"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C89B5A] focus:border-transparent"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C89B5A] focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {/* Organization */}
              <div>
                <h3 className="text-lg text-gray-800 mb-4">Organization Details</h3>
                <label className="block text-sm text-gray-700 mb-2">Organization Name</label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#C89B5A] focus:border-transparent"
                  placeholder="Rahul Store"
                  required
                />
              </div>

              {/* Plan Selection */}
              <div>
                <h3 className="text-lg text-gray-800 mb-4">Select Plan</h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* Free Plan */}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, plan: 'free' })}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      formData.plan === 'free'
                        ? 'border-[#C89B5A] bg-[#C89B5A]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg text-gray-800">Free</h4>
                      {formData.plan === 'free' && <Check size={20} style={{ color: '#C89B5A' }} />}
                    </div>
                    <p className="text-2xl text-gray-800 mb-3">₹0<span className="text-sm text-gray-500">/month</span></p>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Up to 10 products</li>
                      <li>• Basic dashboard</li>
                      <li>• Single warehouse</li>
                    </ul>
                  </button>

                  {/* Pro Plan */}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, plan: 'pro' })}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      formData.plan === 'pro'
                        ? 'border-[#C89B5A] bg-[#C89B5A]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg text-gray-800">Pro</h4>
                      {formData.plan === 'pro' && <Check size={20} style={{ color: '#C89B5A' }} />}
                    </div>
                    <p className="text-2xl text-gray-800 mb-3">₹499<span className="text-sm text-gray-500">/month</span></p>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Unlimited products</li>
                      <li>• Analytics dashboard</li>
                      <li>• Multi-warehouse</li>
                      <li>• Bulk import/export</li>
                    </ul>
                  </button>
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-4 h-4 mt-1 rounded border-gray-300 text-[#C89B5A] focus:ring-[#C89B5A]"
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
                  I agree to Terms & Conditions
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg text-white transition-colors disabled:opacity-50"
                style={{ backgroundColor: '#C89B5A' }}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            {/* Login Link */}
            <p className="text-center text-sm text-gray-600 mt-6">
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#C89B5A' }} className="hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Branding */}
      <div
        className={`hidden lg:flex lg:w-1/2 relative overflow-hidden transition-all duration-700 ease-out ${
          animateIn ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
        }`}
        style={{ backgroundColor: '#1E1E1E' }}
      >
        <div className="flex items-center justify-center w-full p-12">
          <div className="max-w-md text-white">
            <h1 className="text-4xl mb-4">Inventory Hub</h1>
            <p className="text-xl text-gray-300">Manage your inventory smarter</p>
            <p className="text-gray-400 mt-4">Start managing your inventory today</p>
            <div className="mt-8 bg-white/10 border border-white/20 rounded-2xl p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-[#F3E8D9]">
                  <Package className="w-5 h-5" />
                  <span className="text-sm">Real-time Tracking</span>
                </div>
                <div className="relative">
                  <span className="absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-75 animate-ping"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400"></span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <Warehouse className="w-5 h-5 mx-auto mb-1 text-[#C89B5A]" />
                  <p className="text-xs text-gray-300">Smart Storage</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <Package className="w-5 h-5 mx-auto mb-1 text-[#C89B5A]" />
                  <p className="text-xs text-gray-300">Quick Add</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <TrendingUp className="w-5 h-5 mx-auto mb-1 text-[#C89B5A]" />
                  <p className="text-xs text-gray-300">Growth Ready</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
