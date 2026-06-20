import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaPlus, FaTrash } from 'react-icons/fa';
import API from '../services/api';

const ScheduleManagement = () => {
  const [schedules, setSchedules] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ bus_id: '', route_id: '', departure_time: '', arrival_time: '' });

  const fetchAll = () => {
    API.get('/api/schedules/').then(res => setSchedules(res.data));
    API.get('/api/buses/').then(res => setBuses(res.data));
    API.get('/api/routes/').then(res => setRoutes(res.data));
  };
  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/api/schedules/?bus_id=${form.bus_id}&route_id=${form.route_id}&departure_time=${form.departure_time}&arrival_time=${form.arrival_time}`);
      toast.success('Schedule created with seats!');
      fetchAll();
      setShowForm(false);
      setForm({ bus_id: '', route_id: '', departure_time: '', arrival_time: '' });
    } catch (err) {
      toast.error('Error creating schedule!');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this schedule?')) return;
    try {
      await API.delete(`/api/schedules/${id}`);
      toast.success('Schedule deleted!');
      fetchAll();
    } catch (err) {
      toast.error('Error deleting schedule!');
    }
  };

  return (
    <div className="min-h-screen bg-light p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary flex items-center gap-2"><FaCalendarAlt /> Schedule Management</h1>
          <button onClick={() => setShowForm(!showForm)}
            className="bg-primary hover:bg-green-800 text-white px-5 py-2 rounded-lg flex items-center gap-2 transition transform hover:scale-105">
            <FaPlus /> Add Schedule
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl shadow p-6 mb-6">
            <h2 className="text-xl font-bold text-primary mb-4">Create New Schedule</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Select Bus</label>
                <select name="bus_id" value={form.bus_id} onChange={(e) => setForm({ ...form, bus_id: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" required>
                  <option value="">-- Select Bus --</option>
                  {buses.map(b => <option key={b.id} value={b.id}>{b.bus_name} ({b.bus_number})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Select Route</label>
                <select name="route_id" value={form.route_id} onChange={(e) => setForm({ ...form, route_id: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" required>
                  <option value="">-- Select Route --</option>
                  {routes.map(r => <option key={r.id} value={r.id}>{r.origin} → {r.destination}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Departure Time</label>
                <input type="datetime-local" value={form.departure_time} onChange={(e) => setForm({ ...form, departure_time: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Arrival Time</label>
                <input type="datetime-local" value={form.arrival_time} onChange={(e) => setForm({ ...form, arrival_time: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" required />
              </div>
              <div className="md:col-span-2 flex gap-3">
                <button type="submit" className="bg-primary hover:bg-green-800 text-white px-6 py-2 rounded-lg transition">Create Schedule</button>
                <button type="button" onClick={() => setShowForm(false)} className="bg-gray-300 hover:bg-gray-400 px-6 py-2 rounded-lg transition">Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-primary text-white">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Bus ID</th>
                <th className="px-4 py-3 text-left">Route ID</th>
                <th className="px-4 py-3 text-left">Departure</th>
                <th className="px-4 py-3 text-left">Arrival</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((s, i) => (
                <tr key={s.id} className="border-b hover:bg-green-50 transition">
                  <td className="px-4 py-3">{i + 1}</td>
                  <td className="px-4 py-3">{s.bus_id}</td>
                  <td className="px-4 py-3">{s.route_id}</td>
                  <td className="px-4 py-3">{new Date(s.departure_time).toLocaleString()}</td>
                  <td className="px-4 py-3">{new Date(s.arrival_time).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(s.id)} className="bg-secondary hover:bg-red-700 text-white px-3 py-1 rounded-lg flex items-center gap-1 transition">
                      <FaTrash /> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {schedules.length === 0 && (
                <tr><td colSpan="6" className="text-center py-8 text-gray-400">No schedules found!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ScheduleManagement;