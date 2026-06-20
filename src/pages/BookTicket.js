import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaBus, FaTicketAlt, FaChair } from 'react-icons/fa';
import { useSearchParams } from 'react-router-dom';
import API from '../services/api';

const PAYMENT_METHODS = [
  { key: 'card', label: '💳 Card', color: 'border-blue-300 bg-blue-50 text-blue-700' },
  { key: 'bkash', label: '📱 bKash', color: 'border-pink-300 bg-pink-50 text-pink-700' },
  { key: 'nagad', label: '🔶 Nagad', color: 'border-orange-300 bg-orange-50 text-orange-700' },
];

const BookTicket = () => {
  const [searchParams] = useSearchParams();
  const preScheduleId = searchParams.get('schedule_id');
  const preSeatId = searchParams.get('seat_id');

  const [schedules, setSchedules] = useState([]);
  const [seats, setSeats] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [confirmedTicket, setConfirmedTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    API.get('/api/schedules/').then(res => {
      setSchedules(res.data);
      // If coming from dashboard with pre-selected schedule
      if (preScheduleId) {
        const found = res.data.find(s => s.id === parseInt(preScheduleId));
        if (found) {
          setSelectedSchedule(found);
          API.get(`/api/bookings/seats/${found.id}`).then(seatRes => {
            setSeats(seatRes.data);
            if (preSeatId) {
              const foundSeat = seatRes.data.find(s => s.id === parseInt(preSeatId));
              if (foundSeat) setSelectedSeat(foundSeat);
            }
          });
        }
      }
    });
    API.get('/api/buses/').then(res => setBuses(res.data));
    API.get('/api/routes/').then(res => setRoutes(res.data));
  }, [preScheduleId, preSeatId]);

  const getBusName = (busId) => buses.find(b => b.id === busId)?.bus_name || `Bus #${busId}`;
  const getRoute = (routeId) => routes.find(r => r.id === routeId);

  const handleSelectSchedule = async (schedule) => {
    setSelectedSchedule(schedule);
    setSelectedSeat(null);
    const res = await API.get(`/api/bookings/seats/${schedule.id}`);
    setSeats(res.data);
  };

  const resetAll = () => {
    setSelectedSchedule(null);
    setSelectedSeat(null);
    setSeats([]);
    setPaymentMethod('card');
    setConfirmedTicket(null);
  };

  const handleBook = async () => {
    if (!selectedSeat) return toast.error('Please select a seat!');
    setLoading(true);
    try {
      const res = await API.post(
        `/api/bookings/?schedule_id=${selectedSchedule.id}&seat_id=${selectedSeat.id}&payment_method=${paymentMethod}`
      );
      toast.success(`Booking confirmed! Ticket: ${res.data.ticket_number}`);
      setConfirmedTicket(res.data);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Booking failed!');
    } finally {
      setLoading(false);
    }
  };

  const route = selectedSchedule ? getRoute(selectedSchedule.route_id) : null;
  const busName = selectedSchedule ? getBusName(selectedSchedule.bus_id) : null;

  return (
    <div className="min-h-screen bg-light p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-2 mb-6">
          <FaTicketAlt /> Book a Ticket
        </h1>

        {/* E-Ticket Confirmation */}
        {confirmedTicket && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border-4 border-dashed border-primary">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl">✅</span>
              </div>
              <p className="text-secondary font-bold text-sm uppercase tracking-widest">Booking Confirmed</p>
              <h2 className="text-3xl font-extrabold text-primary mt-1">E-Ticket</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Ticket Number</p>
                <p className="font-extrabold text-primary text-xl tracking-widest">{confirmedTicket.ticket_number}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Passenger</p>
                <p className="font-bold text-gray-800">{confirmedTicket.passenger_name}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Seat Number</p>
                <p className="font-bold text-gray-800">{confirmedTicket.seat_number}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Payment Method</p>
                <p className="font-bold text-gray-800 uppercase">{confirmedTicket.payment_method}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Departure</p>
                <p className="font-bold text-gray-800">{new Date(confirmedTicket.departure_time).toLocaleString()}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Fare Paid</p>
                <p className="font-extrabold text-secondary text-2xl">৳{confirmedTicket.fare}</p>
              </div>
            </div>
            <button onClick={resetAll}
              className="w-full bg-primary hover:bg-green-800 text-white font-bold py-3 rounded-xl transition">
              🎫 Book Another Ticket
            </button>
          </div>
        )}

        {!confirmedTicket && (
          <>
            {/* If coming from dashboard with pre-selection — show only payment */}
            {preScheduleId && selectedSchedule && selectedSeat ? (
              <div className="space-y-6">
                {/* Trip Summary Card */}
                <div className="bg-white rounded-2xl shadow p-6">
                  <h2 className="text-xl font-bold text-primary mb-4">🚌 Your Trip</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-green-50 p-4 rounded-xl">
                      <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Bus</p>
                      <p className="font-bold text-primary">{busName}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl">
                      <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Seat</p>
                      <p className="font-bold text-primary">{selectedSeat.seat_number}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl">
                      <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Route</p>
                      <p className="font-bold text-primary">{route ? `${route.origin} → ${route.destination}` : '-'}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-xl">
                      <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Fare</p>
                      <p className="font-bold text-secondary text-lg">৳{route?.base_fare}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl col-span-2">
                      <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Departure</p>
                      <p className="font-bold text-primary">{new Date(selectedSchedule.departure_time).toLocaleString()}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl col-span-2">
                      <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Arrival</p>
                      <p className="font-bold text-primary">{new Date(selectedSchedule.arrival_time).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-2xl shadow p-6">
                  <h2 className="text-xl font-bold text-primary mb-4">💳 Select Payment Method</h2>
                  <div className="grid grid-cols-3 gap-4">
                    {PAYMENT_METHODS.map(pm => (
                      <button key={pm.key} onClick={() => setPaymentMethod(pm.key)}
                        className={`border-2 rounded-xl p-4 font-bold text-lg transition ${pm.color} ${paymentMethod === pm.key ? 'scale-105 shadow-md ring-2 ring-primary' : 'hover:scale-105'}`}>
                        {pm.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Confirm Button */}
                <button onClick={handleBook} disabled={loading}
                  className="w-full text-white font-bold py-4 rounded-xl transition transform hover:scale-105 text-lg"
                  style={{ background: 'linear-gradient(135deg,#F42A41,#c0152a)', boxShadow: '0 4px 14px rgba(244,42,65,0.35)' }}>
                  {loading ? 'Processing...' : `✅ Confirm & Pay via ${paymentMethod.toUpperCase()}`}
                </button>
              </div>
            ) : (
              <>
                {/* Normal full booking flow */}
                <div className="bg-white rounded-2xl shadow p-6 mb-6">
                  <h2 className="text-xl font-bold text-primary mb-4">🗓️ Select a Schedule</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {schedules.map(s => {
                      const r = getRoute(s.route_id);
                      return (
                        <div key={s.id} onClick={() => handleSelectSchedule(s)}
                          className={`border-2 rounded-xl p-4 cursor-pointer transition hover:shadow-md ${selectedSchedule?.id === s.id ? 'border-primary bg-green-50' : 'border-gray-200 hover:border-primary'}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <FaBus className="text-primary" />
                            <span className="font-bold text-gray-800">{getBusName(s.bus_id)}</span>
                          </div>
                          {r && <p className="text-sm font-semibold text-gray-600">📍 {r.origin} → {r.destination}</p>}
                          {r && <p className="text-sm text-secondary font-bold">৳{r.base_fare}</p>}
                          <p className="text-sm text-green-600 font-semibold mt-1">🕐 {new Date(s.departure_time).toLocaleString()}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {selectedSchedule && (
                  <div className="bg-white rounded-2xl shadow p-6 mb-6">
                    <h2 className="text-xl font-bold text-primary mb-4">💺 Select a Seat</h2>
                    <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-3">
                      {seats.map(seat => (
                        <button key={seat.id} disabled={seat.is_booked}
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
                  </div>
                )}

                {selectedSeat && (
                  <div className="bg-white rounded-2xl shadow p-6 mb-6">
                    <h2 className="text-xl font-bold text-primary mb-4">💳 Select Payment Method</h2>
                    <div className="grid grid-cols-3 gap-4">
                      {PAYMENT_METHODS.map(pm => (
                        <button key={pm.key} onClick={() => setPaymentMethod(pm.key)}
                          className={`border-2 rounded-xl p-4 font-bold transition ${pm.color} ${paymentMethod === pm.key ? 'scale-105 shadow-md ring-2 ring-primary' : ''}`}>
                          {pm.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedSeat && (
                  <div className="bg-white rounded-2xl shadow p-6">
                    <h2 className="text-xl font-bold text-primary mb-4">📋 Booking Summary</h2>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-green-50 p-4 rounded-xl">
                        <p className="text-sm text-gray-500">Bus</p>
                        <p className="font-bold text-primary">{busName}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-xl">
                        <p className="text-sm text-gray-500">Seat</p>
                        <p className="font-bold text-primary">{selectedSeat.seat_number}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-xl">
                        <p className="text-sm text-gray-500">Departure</p>
                        <p className="font-bold text-primary">{new Date(selectedSchedule.departure_time).toLocaleString()}</p>
                      </div>
                      <div className="bg-red-50 p-4 rounded-xl">
                        <p className="text-sm text-gray-500">Fare</p>
                        <p className="font-bold text-secondary">৳{route?.base_fare}</p>
                      </div>
                    </div>
                    <button onClick={handleBook} disabled={loading}
                      className="w-full bg-secondary hover:bg-red-700 text-white font-bold py-3 rounded-xl transition transform hover:scale-105">
                      {loading ? 'Processing...' : `✅ Confirm & Pay via ${paymentMethod.toUpperCase()}`}
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BookTicket;