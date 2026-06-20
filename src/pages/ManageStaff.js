import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaUserTie, FaUserPlus, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import API from '../services/api';

const ManageStaff = () => {
  const [employees, setEmployees] = useState([]);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchEmployees = async () => {
    try {
      const res = await API.get('/api/employees/');
      setEmployees(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) return toast.error('Name, email and password are required!');
    setLoading(true);
    try {
      await API.post(
        `/api/employees/?full_name=${encodeURIComponent(fullName)}&email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}&password=${encodeURIComponent(password)}`
      );
      toast.success('Staff account created!');
      setFullName(''); setEmail(''); setPhone(''); setPassword('');
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create staff account');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (emp) => {
    try {
      await API.put(`/api/employees/${emp.id}?is_active=${!emp.is_active}`);
      toast.success(`${emp.full_name} ${emp.is_active ? 'deactivated' : 'reactivated'}`);
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Update failed');
    }
  };

  return (
    <div className="min-h-screen bg-light p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-2 mb-6">
          <FaUserTie /> Manage Staff
        </h1>

        {/* Add Staff Form */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
            <FaUserPlus /> Add New Staff
          </h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name" className="border-2 border-gray-200 focus:border-primary rounded-xl p-3 outline-none transition" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Email" className="border-2 border-gray-200 focus:border-primary rounded-xl p-3 outline-none transition" />
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone" className="border-2 border-gray-200 focus:border-primary rounded-xl p-3 outline-none transition" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Password" className="border-2 border-gray-200 focus:border-primary rounded-xl p-3 outline-none transition" />
            <button type="submit" disabled={loading}
              className="md:col-span-4 bg-primary hover:bg-green-800 text-white font-bold py-3 rounded-xl transition">
              {loading ? 'Creating...' : '+ Create Staff Account'}
            </button>
          </form>
        </div>

        {/* Staff List */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold text-primary mb-4">Current Staff</h2>
          <div className="space-y-3">
            {employees.map(emp => (
              <div key={emp.id}
                className="flex items-center justify-between border-2 border-gray-100 rounded-xl p-4">
                <div>
                  <p className="font-bold text-gray-800">{emp.full_name}</p>
                  <p className="text-sm text-gray-500">{emp.email} {emp.phone && `· ${emp.phone}`}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${emp.is_active ? 'bg-green-50 text-primary' : 'bg-red-50 text-secondary'}`}>
                    {emp.is_active ? 'Active' : 'Deactivated'}
                  </span>
                  <button onClick={() => handleToggleActive(emp)}
                    className="text-2xl text-primary hover:scale-110 transition" title="Toggle active status">
                    {emp.is_active ? <FaToggleOn /> : <FaToggleOff className="text-gray-400" />}
                  </button>
                </div>
              </div>
            ))}
            {employees.length === 0 && <p className="text-gray-400">No staff accounts yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageStaff;