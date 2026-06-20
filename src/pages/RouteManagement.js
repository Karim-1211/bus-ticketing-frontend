import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaRoute, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import API from '../services/api';

const RouteManagement = () => {
  const [routes, setRoutes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editRoute, setEditRoute] = useState(null);
  const [form, setForm] = useState({ origin: '', destination: '', distance_km: '', base_fare: '' });

  const fetchRoutes = () => API.get('/api/routes/').then(res => setRoutes(res.data));
  useEffect(() => { fetchRoutes(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editRoute) {
        await API.put(`/api/routes/${editRoute.id}?origin=${form.origin}&destination=${form.destination}&distance_km=${form.distance_km}&base_fare=${form.base_fare}`);
        toast.success('Route updated!');
      } else {
        await API.post(`/api/routes/?origin=${form.origin}&destination=${form.destination}&distance_km=${form.distance_km}&base_fare=${form.base_fare}`);
        toast.success('Route added!');
      }
      fetchRoutes();
      setShowForm(false);
      setEditRoute(null);
      setForm({ origin: '', destination: '', distance_km: '', base_fare: '' });
    } catch (err) {
      toast.error('Error saving route!');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this route?')) return;
    try {
      await API.delete(`/api/routes/${id}`);
      toast.success('Route deleted!');
      fetchRoutes();
    } catch (err) {
      toast.error('Error deleting route!');
    }
  };

  return (
    <div className="min-h-screen bg-light p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary flex items-center gap-2"><FaRoute /> Route Management</h1>
          <button onClick={() => { setShowForm(!showForm); setEditRoute(null); setForm({ origin: '', destination: '', distance_km: '', base_fare: '' }); }}
            className="bg-primary hover:bg-green-800 text-white px-5 py-2 rounded-lg flex items-center gap-2 transition transform hover:scale-105">
            <FaPlus /> Add Route
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl shadow p-6 mb-6">
            <h2 className="text-xl font-bold text-primary mb-4">{editRoute ? 'Edit Route' : 'Add New Route'}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Origin City</label>
                <input name="origin" value={form.origin} onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. Dhaka" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Destination City</label>
                <input name="destination" value={form.destination} onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. Chittagong" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Distance (km)</label>
                <input name="distance_km" type="number" value={form.distance_km} onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. 250" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Base Fare (৳)</label>
                <input name="base_fare" type="number" value={form.base_fare} onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. 500" required />
              </div>
              <div className="md:col-span-2 flex gap-3">
                <button type="submit" className="bg-primary hover:bg-green-800 text-white px-6 py-2 rounded-lg transition">
                  {editRoute ? 'Update Route' : 'Add Route'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="bg-gray-300 hover:bg-gray-400 px-6 py-2 rounded-lg transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-primary text-white">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Origin</th>
                <th className="px-4 py-3 text-left">Destination</th>
                <th className="px-4 py-3 text-left">Distance</th>
                <th className="px-4 py-3 text-left">Base Fare</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((route, i) => (
                <tr key={route.id} className="border-b hover:bg-green-50 transition">
                  <td className="px-4 py-3">{i + 1}</td>
                  <td className="px-4 py-3 font-semibold">{route.origin}</td>
                  <td className="px-4 py-3 font-semibold">{route.destination}</td>
                  <td className="px-4 py-3">{route.distance_km} km</td>
                  <td className="px-4 py-3 text-primary font-bold">৳{route.base_fare}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => { setEditRoute(route); setForm({ origin: route.origin, destination: route.destination, distance_km: route.distance_km, base_fare: route.base_fare }); setShowForm(true); }}
                      className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-lg flex items-center gap-1 transition">
                      <FaEdit /> Edit
                    </button>
                    <button onClick={() => handleDelete(route.id)}
                      className="bg-secondary hover:bg-red-700 text-white px-3 py-1 rounded-lg flex items-center gap-1 transition">
                      <FaTrash /> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {routes.length === 0 && (
                <tr><td colSpan="6" className="text-center py-8 text-gray-400">No routes found. Add your first route!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RouteManagement;