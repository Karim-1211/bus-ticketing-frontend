import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaBus } from 'react-icons/fa';
import API from '../services/api';

const Register = () => {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post(`/api/auth/register?full_name=${form.full_name}&email=${form.email}&phone=${form.phone}&password=${form.password}&role=customer`);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-dark flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="bg-primary p-4 rounded-full">
              <FaBus className="text-white text-4xl" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-primary">Create Account</h1>
          <p className="text-gray-500 mt-1">Join ICT BD Bus Services</p>
        </div>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
            <input name="full_name" type="text" onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter your full name" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
            <input name="email" type="email" onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter your email" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
            <input name="phone" type="text" onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="01XXXXXXXXX" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input name="password" type="password" onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Create a password" required />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-secondary hover:bg-red-700 text-white font-bold py-3 rounded-lg transition duration-300 transform hover:scale-105">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-gray-500">Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;