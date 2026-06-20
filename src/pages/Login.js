import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaBus, FaEye, FaEyeSlash } from 'react-icons/fa';
import API from '../services/api';

const QUICK_LOGINS = {
  admin: { email: 'admin@ictbd.com', password: 'admin123' },
  staff: { email: 'PUT_STAFF_EMAIL_HERE', password: 'PUT_STAFF_PASSWORD_HERE' },
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleQuickLogin = (e) => {
    const key = e.target.value;
    if (!key || !QUICK_LOGINS[key]) return;
    setEmail(QUICK_LOGINS[key].email);
    setPassword(QUICK_LOGINS[key].password);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);
      const res = await API.post('/api/auth/login', formData);
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('name', res.data.name);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Invalid email or password!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-dark flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="bg-gradient-to-br from-primary to-green-800 p-5 rounded-2xl shadow-lg">
              <FaBus className="text-white text-5xl" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-primary">ICT BD Bus Services</h1>
          <p className="text-gray-500 mt-1">Sign in to your account</p>
        </div>

        {/* Quick login — for testing only, remove before final submission */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Quick login (testing)</label>
          <select
            onChange={handleQuickLogin}
            defaultValue=""
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50"
          >
            <option value="">-- Select an account --</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
          </select>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition"
                tabIndex={-1}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-green-800 text-white font-bold py-3 rounded-lg transition duration-300 transform hover:scale-105"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-gray-500">Don't have an account?{' '}
            <Link to="/register" className="text-secondary font-semibold hover:underline">Register here</Link>
          </p>
        </div>
        <div className="mt-6 p-3 bg-green-50 rounded-lg text-center">
          <p className="text-xs text-gray-500">🇧🇩 Serving Bangladesh with pride</p>
        </div>
      </div>
    </div>
  );
};

export default Login;