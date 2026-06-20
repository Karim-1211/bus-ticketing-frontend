import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaHistory, FaTimesCircle } from 'react-icons/fa';
import API from '../services/api';

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);

  const fetchBookings = () => {
    API.get('/api/bookings/history').then(res => setBookings(res.data));
  };
  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking? You will receive a refund.')) return;
    try {
      await API.put(`/api/bookings/cancel/${id}`);
      toast.success('Booking cancelled! Refund processed.');
      fetchBookings();
    } catch (err) {
      toast.error('Error cancelling booking!');
    }
  };

  return (
    <div className="min-h-screen bg-light p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-2 mb-6">
          <FaHistory /> My Booking History
        </h1>

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-primary text-white">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Ticket No.</th>
                <th className="px-4 py-3 text-left">Schedule ID</th>
                <th className="px-4 py-3 text-left">Seat ID</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Payment</th>
                <th className="px-4 py-3 text-left">Booked At</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b, i) => (
                <tr key={b.id} className="border-b hover:bg-green-50 transition">
                  <td className="px-4 py-3">{i + 1}</td>
                  <td className="px-4 py-3 font-bold">{b.ticket_number || '—'}</td>
                  <td className="px-4 py-3">{b.schedule_id}</td>
                  <td className="px-4 py-3">{b.seat_id}</td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${b.status === 'confirmed' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {b.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold uppercase">{b.payment_method || '—'}</div>
                    <div className={`text-xs ${b.payment_status === 'refunded' ? 'text-secondary' : 'text-gray-400'}`}>
                      {b.payment_status || ''}
                    </div>
                  </td>
                  <td className="px-4 py-3">{new Date(b.booked_at).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    {b.status === 'confirmed' && (
                      <button onClick={() => handleCancel(b.id)}
                        className="bg-secondary hover:bg-red-700 text-white px-3 py-1 rounded-lg flex items-center gap-1 transition">
                        <FaTimesCircle /> Cancel
                      </button>
                    )}
                    {b.status === 'cancelled' && <span className="text-gray-400">Done</span>}
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr><td colSpan="8" className="text-center py-8 text-gray-400">No bookings found!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BookingHistory;