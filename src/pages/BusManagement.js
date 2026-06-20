import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaBus, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import API from '../services/api';

const BusManagement = () => {
  const [buses, setBuses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editBus, setEditBus] = useState(null);
  const [form, setForm] = useState({ bus_number: '', bus_name: '', bus_type: 'AC', total_seats: '', image_url: '' });

  const fetchBuses = () => API.get('/api/buses/').then(res => setBuses(res.data));
  useEffect(() => { fetchBuses(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editBus) {
        await API.put(`/api/buses/${editBus.id}?bus_name=${form.bus_name}&bus_type=${form.bus_type}&total_seats=${form.total_seats}&image_url=${form.image_url}`);
        toast.success('Bus updated!');
      } else {
        await API.post(`/api/buses/?bus_number=${form.bus_number}&bus_name=${form.bus_name}&bus_type=${form.bus_type}&total_seats=${form.total_seats}&image_url=${form.image_url}`);
        toast.success('Bus added!');
      }
      fetchBuses();
      setShowForm(false);
      setEditBus(null);
      setForm({ bus_number: '', bus_name: '', bus_type: 'AC', total_seats: '', image_url: '' });
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error!');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this bus?')) return;
    try {
      await API.delete(`/api/buses/${id}`);
      toast.success('Bus deleted!');
      fetchBuses();
    } catch (err) {
      toast.error('Error deleting bus!');
    }
  };

  const handleEdit = (bus) => {
    setEditBus(bus);
    setForm({ bus_number: bus.bus_number, bus_name: bus.bus_name, bus_type: bus.bus_type, total_seats: bus.total_seats, image_url: bus.image_url || '' });
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-light p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary flex items-center gap-2"><FaBus /> Bus Management</h1>
          <button onClick={() => { setShowForm(!showForm); setEditBus(null); setForm({ bus_number: '', bus_name: '', bus_type: 'AC', total_seats: '', image_url: '' }); }}
            className="bg-primary hover:bg-green-800 text-white px-5 py-2 rounded-lg flex items-center gap-2 transition transform hover:scale-105">
            <FaPlus /> Add Bus
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl shadow p-6 mb-6">
            <h2 className="text-xl font-bold text-primary mb-4">{editBus ? 'Edit Bus' : 'Add New Bus'}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Bus Number</label>
                <input name="bus_number" value={form.bus_number} onChange={handleChange} disabled={!!editBus}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. BD-1234" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Bus Name</label>
                <input name="bus_name" value={form.bus_name} onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. Green Line Express" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Bus Type</label>
                <select name="bus_type" value={form.bus_type} onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="AC">AC</option>
                  <option value="Non-AC">Non-AC</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Total Seats</label>
                <input name="total_seats" type="number" value={form.total_seats} onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. 40" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Bus Image URL</label>
                <input name="image_url" value={form.image_url} onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://example.com/bus.jpg" />
              </div>
              <div className="md:col-span-2 flex gap-3">
                <button type="submit" className="bg-primary hover:bg-green-800 text-white px-6 py-2 rounded-lg transition">
                  {editBus ? 'Update Bus' : 'Add Bus'}
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
                <th className="px-4 py-3 text-left">Bus Number</th>
                <th className="px-4 py-3 text-left">Bus Name</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Seats</th>
                <th className="px-4 py-3 text-left">Image</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {buses.map((bus, i) => (
                <tr key={bus.id} className="border-b hover:bg-green-50 transition">
                  <td className="px-4 py-3">{i + 1}</td>
                  <td className="px-4 py-3 font-semibold">{bus.bus_number}</td>
                  <td className="px-4 py-3">{bus.bus_name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${bus.bus_type === 'AC' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                      {bus.bus_type}
                    </span>
                  </td>
                  <td className="px-4 py-3">{bus.total_seats}</td>
                  <td className="px-4 py-3">
                    {bus.image_url ? <img src={bus.image_url} alt="bus" className="h-10 w-16 object-cover rounded" /> : <span className="text-gray-400">No image</span>}
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => handleEdit(bus)} className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-lg flex items-center gap-1 transition">
                      <FaEdit /> Edit
                    </button>
                    <button onClick={() => handleDelete(bus.id)} className="bg-secondary hover:bg-red-700 text-white px-3 py-1 rounded-lg flex items-center gap-1 transition">
                      <FaTrash /> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {buses.length === 0 && (
                <tr><td colSpan="7" className="text-center py-8 text-gray-400">No buses found. Add your first bus!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BusManagement;