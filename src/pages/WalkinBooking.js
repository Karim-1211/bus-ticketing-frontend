import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaBus, FaCashRegister, FaChair, FaUser, FaPhone } from 'react-icons/fa';
import API from '../services/api';

const WalkinBooking = () => {
  const [schedules, setSchedules] = useState([]);
  const [seats, setSeats] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get('/api/schedules/').then(res => setSchedules(res.data));
  }, []);

  const handleSelectSchedule = async (schedule) => {
    setSelectedSchedule(schedule);
    setSelectedSeat(null);
    const res = await API.get(`/api/bookings/seats/${schedule.id}`);
    setSeats(res.data);
  };

  const resetForm = () => {
    setSelectedSchedule(null);
    setSelectedSeat(null);
    setSeats([]);
    setPassengerName('');
    setPassengerPhone('');
  };

  const handleBook = async () => {
    if (!selectedSeat) return toast.error('Please select a seat!');
    if (!passengerName.trim()) return toast.error('Passenger name is required!');
    if (!passengerPhone.trim()) return toast.error('Passenger phone number is required!');

    setLoading(true);
    try {
      const res = await API.post(
        `/api/bookings/walkin?schedule_id=${selectedSchedule.id}&seat_id=${selectedSeat.id}&passenger_name=${encodeURIComponent(passengerName)}&passenger_phone=${encodeURIComponent(passengerPhone)}`
      );
      toast.success(`Walk-in booking confirmed! Ticket: ${res.data.ticket_number} (Cash)`);
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Booking failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-2 mb-6">
          <FaCashRegister /> Walk-in Booking (Counter)
        </h1>
        <p className="text-gray-500 mb-6">
          For passengers buying a ticket in person. Payment is recorded as{' '}
          <span className="font-bold text-secondary">cash</span> automatically.
        </p>

        {/* Schedule Selection */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-primary mb-4">🗓️ Select a Schedule</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schedules.map(s => (
              <div key={s.id}
                onClick={() => handleSelectSchedule(s)}
                className={`border-2 rounded-xl p-4 cursor-pointer transition hover:shadow-md ${selectedSchedule?.id === s.id ? 'border-primary bg-green-50' : 'border-gray-200 hover:border-primary'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <FaBus className="text-primary" />
                  <span className="font-bold text-gray-800">Schedule #{s.id}</span>
                </div>
                <p className="text-sm text-gray-500">Bus ID: {s.bus_id}</p>
                <p className="text-sm text-gray-500">Route ID: {s.route_id}</p>
                <p className="text-sm text-green-600 font-semibold">🕐 {new Date(s.departure_time).toLocaleString()}</p>
              </div>
            ))}
            {schedules.length === 0 && <p className="text-gray-400">No schedules available.</p>}
          </div>
        </div>

        {/* Seat Selection */}
        {selectedSchedule && (
          <div className="bg-white rounded-2xl shadow p-6 mb-6">
            <h2 className="text-xl font-bold text-primary mb-4">💺 Select a Seat</h2>
            <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-3">
              {seats.map(seat => (
                <button key={seat.id}
                  disabled={seat.is_booked}
                  onClick={() => setSelectedSeat(seat)}
                  className={`p-3 rounded-lg text-sm font-bold transition flex flex-col items-center gap-1
                    ${seat.is_booked ? 'bg-gray-200 text-gray-400 cursor-not-allowed' :
                      selectedSeat?.id === seat.id ? 'bg-primary text-white scale-110 shadow-lg' :
                      'bg-green-100 text-primary hover:bg-primary hover:text-white'}`}>
                  <FaChair />
                  {seat.seat_number}
                </button>
              ))}
            </div>
            <div className="flex gap-4 mt-4 text-sm">
              <span className="flex items-center gap-1"><span className="w-4 h-4 bg-green-100 rounded inline-block"></span> Available</span>
              <span className="flex items-center gap-1"><span className="w-4 h-4 bg-primary rounded inline-block"></span> Selected</span>
              <span className="flex items-center gap-1"><span className="w-4 h-4 bg-gray-200 rounded inline-block"></span> Booked</span>
            </div>
          </div>
        )}

        {/* Passenger Details + Confirm */}
        {selectedSeat && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-bold text-primary mb-4">📋 Passenger Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-green-50 p-4 rounded-xl">
                <p className="text-sm text-gray-500">Schedule</p>
                <p className="font-bold text-primary">#{selectedSchedule.id}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-xl">
                <p className="text-sm text-gray-500">Seat Number</p>
                <p className="font-bold text-primary">{selectedSeat.seat_number}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-sm font-semibold text-gray-600 flex items-center gap-1 mb-1"><FaUser /> Passenger Name</label>
                <input
                  type="text"
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  placeholder="e.g. Karim Ahmed"
                  className="w-full border-2 border-gray-200 focus:border-primary rounded-xl p-3 outline-none transition"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 flex items-center gap-1 mb-1"><FaPhone /> Passenger Phone</label>
                <input
                  type="text"
                  value={passengerPhone}
                  onChange={(e) => setPassengerPhone(e.target.value)}
                  placeholder="e.g. 01712345678"
                  className="w-full border-2 border-gray-200 focus:border-primary rounded-xl p-3 outline-none transition"
                />
              </div>
            </div>

            <button onClick={handleBook} disabled={loading}
              className="w-full bg-secondary hover:bg-red-700 text-white font-bold py-3 rounded-xl transition transform hover:scale-105">
              {loading ? 'Processing...' : '✅ Confirm Booking & Take Cash Payment'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalkinBooking;