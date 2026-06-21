import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaBus, FaCashRegister, FaChair, FaUser, FaPhone } from 'react-icons/fa';
import { GiSteeringWheel } from 'react-icons/gi';
import API from '../services/api';

const ROWS = ['A','B','C','D','E','F','G','H','I','J'];

const BUS_IMAGES = {
  'green line': 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400',
  'nabil': 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400',
  'hanif': 'https://grabcad.com/screenshots/pics/3674e8fab755506f746655413dc96f8c/large.jpg',
  'shyamoli': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-Iy1K-TS6GStzEE0IWS-ZVImAnWN_lzr355SMH1UUbMGFwHHkpoHQcmfU',
  'flix bus': 'https://bus-news.com/wp-content/uploads/sites/4/2023/03/Neoplan-5-scaled.jpg',
  'blablacar': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXa9Z-Ie1XfGOGnIoHdQ1TdA50pG0-IwDC3YvJ4IkbuQ&s=10',
};

const getBusImage = (bus) => {
  if (!bus) return null;
  const key = bus.bus_name?.toLowerCase().trim();
  return BUS_IMAGES[key] || bus.image_url || null;
};

const WalkinBooking = () => {
  const [schedules, setSchedules] = useState([]);
  const [seats, setSeats] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [confirmedTickets, setConfirmedTickets] = useState([]);

  useEffect(() => {
    API.get('/api/schedules/').then(res => setSchedules(res.data));
    API.get('/api/buses/').then(res => setBuses(res.data));
    API.get('/api/routes/').then(res => setRoutes(res.data));
  }, []);

  const getBusName = (busId) => buses.find(b => b.id === busId)?.bus_name || `Bus #${busId}`;
  const getBus = (busId) => buses.find(b => b.id === busId);
  const getRoute = (routeId) => routes.find(r => r.id === routeId);

  const handleSelectSchedule = async (schedule) => {
    setSelectedSchedule(schedule);
    setSelectedSeats([]);
    setLoadingSeats(true);
    try {
      const res = await API.get(`/api/bookings/seats/${schedule.id}`);
      setSeats(res.data);
    } catch (e) {}
    setLoadingSeats(false);
  };

  const toggleSeat = (seat) => {
    if (seat.is_booked) return;
    setSelectedSeats(prev => {
      const exists = prev.find(s => s.id === seat.id);
      if (exists) return prev.filter(s => s.id !== seat.id);
      return [...prev, seat];
    });
  };

  const isSeatSelected = (seatId) => selectedSeats.some(s => s.id === seatId);

  const resetForm = () => {
    setSelectedSchedule(null);
    setSelectedSeats([]);
    setSeats([]);
    setPassengerName('');
    setPassengerPhone('');
    setConfirmedTickets([]);
  };

  const handleBook = async () => {
    if (selectedSeats.length === 0) return toast.error('Please select at least one seat!');
    if (!passengerName.trim()) return toast.error('Passenger name is required!');
    if (!passengerPhone.trim()) return toast.error('Passenger phone is required!');

    setLoading(true);
    const results = [];
    try {
      for (const seat of selectedSeats) {
        const res = await API.post(
          `/api/bookings/walkin?schedule_id=${selectedSchedule.id}&seat_id=${seat.id}&passenger_name=${encodeURIComponent(passengerName)}&passenger_phone=${encodeURIComponent(passengerPhone)}`
        );
        results.push(res.data);
      }
      toast.success(`${results.length} seat(s) booked successfully! Cash payment recorded.`);
      setConfirmedTickets(results);
    } catch (err) {
      if (results.length > 0) setConfirmedTickets(results);
      toast.error(err.response?.data?.detail || 'Booking failed!');
    } finally {
      setLoading(false);
    }
  };

  const route = selectedSchedule ? getRoute(selectedSchedule.route_id) : null;
  const busName = selectedSchedule ? getBusName(selectedSchedule.bus_id) : null;
  const availableCount = seats.filter(s => !s.is_booked).length;
  const bookedCount = seats.filter(s => s.is_booked).length;
  const totalFare = route ? route.base_fare * selectedSeats.length : 0;
  const totalFarePaid = confirmedTickets.reduce((sum, t) => sum + Number(t.fare || 0), 0);

  return (
    <div className="min-h-screen bg-light p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-2 mb-2">
          <FaCashRegister /> Walk-in Booking (Counter)
        </h1>
        <p className="text-gray-500 mb-6">
          For passengers buying a ticket in person. Payment is recorded as{' '}
          <span className="font-bold text-secondary">cash</span> automatically.
        </p>

        {/* Confirmed Tickets */}
        {confirmedTickets.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border-4 border-dashed border-primary">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl">✅</span>
              </div>
              <p className="text-secondary font-bold text-sm uppercase tracking-widest">Walk-in Booking Confirmed</p>
              <h2 className="text-3xl font-extrabold text-primary mt-1">
                {confirmedTickets.length > 1 ? `${confirmedTickets.length} E-Tickets` : 'E-Ticket'}
              </h2>
            </div>
            <div className="space-y-3 mb-6">
              {confirmedTickets.map(t => (
                <div key={t.ticket_number} className="flex items-center justify-between bg-green-50 p-4 rounded-xl border border-green-100">
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold">Ticket</p>
                    <p className="font-extrabold text-primary tracking-widest">{t.ticket_number}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold">Seat</p>
                    <p className="font-bold text-gray-800">{t.seat_number}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold">Passenger</p>
                    <p className="font-bold text-gray-800">{t.passenger_name || passengerName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold">Payment</p>
                    <p className="font-bold text-secondary uppercase">CASH</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-red-50 p-4 rounded-xl border border-red-100 mb-4">
              <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Total Cash Collected ({confirmedTickets.length} seat{confirmedTickets.length > 1 ? 's' : ''})</p>
              <p className="font-extrabold text-secondary text-2xl">৳{totalFarePaid}</p>
            </div>
            <button onClick={resetForm}
              className="w-full bg-primary hover:bg-green-800 text-white font-bold py-3 rounded-xl transition">
              🎫 New Walk-in Booking
            </button>
          </div>
        )}

        {confirmedTickets.length === 0 && (
          <>
            {/* Schedule Selection */}
            <div className="bg-white rounded-2xl shadow p-6 mb-6">
              <h2 className="text-xl font-bold text-primary mb-4">🗓️ Select a Schedule</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {schedules.map(s => {
                  const r = getRoute(s.route_id);
                  const bus = getBus(s.bus_id);
                  const imgUrl = getBusImage(bus);
                  const isSelected = selectedSchedule?.id === s.id;
                  return (
                    <div key={s.id} onClick={() => handleSelectSchedule(s)}
                      className={`border-2 rounded-xl overflow-hidden cursor-pointer transition hover:shadow-md ${isSelected ? 'border-primary' : 'border-gray-200 hover:border-primary'}`}>
                      <div className="relative h-28 bg-gray-100">
                        {imgUrl && (
                          <img src={imgUrl} alt={bus?.bus_name || 'Bus'}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.display = 'none'; }} />
                        )}
                        {!imgUrl && (
                          <div className="w-full h-full flex items-center justify-center">
                            <FaBus className="text-gray-300 text-3xl" />
                          </div>
                        )}
                        {bus?.bus_type && (
                          <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full ${bus.bus_type === 'AC' ? 'bg-blue-500 text-white' : 'bg-gray-600 text-white'}`}>
                            {bus.bus_type}
                          </span>
                        )}
                        {isSelected && (
                          <span className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            Selected
                          </span>
                        )}
                      </div>
                      <div className={`p-4 ${isSelected ? 'bg-green-50' : ''}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <FaBus className="text-primary" />
                          <span className="font-bold text-gray-800">{getBusName(s.bus_id)}</span>
                        </div>
                        {r && <p className="text-sm font-semibold text-gray-600">📍 {r.origin} → {r.destination}</p>}
                        {r && <p className="text-sm text-secondary font-bold">৳{r.base_fare}</p>}
                        <p className="text-sm text-green-600 font-semibold mt-1">🕐 {new Date(s.departure_time).toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
                {schedules.length === 0 && <p className="text-gray-400">No schedules available.</p>}
              </div>
            </div>

            {/* Live Seat Map */}
            {selectedSchedule && (
              <div className="bg-white rounded-3xl shadow-xl p-6 mb-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-1">💺 Live Seat Map</h2>
                <p className="text-gray-400 text-sm mb-4">
                  {busName} · Departure: {new Date(selectedSchedule.departure_time).toLocaleString()}
                </p>
                <div className="flex gap-3 mb-6 flex-wrap">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                    style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#15803d' }}>
                    <div className="w-3 h-3 rounded-sm bg-green-500"></div>
                    Available ({availableCount})
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#b91c1c' }}>
                    <div className="w-3 h-3 rounded-sm bg-red-500"></div>
                    Booked ({bookedCount})
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                    style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#1d4ed8' }}>
                    <div className="w-3 h-3 rounded-sm bg-blue-500"></div>
                    Selected ({selectedSeats.length})
                  </div>
                </div>

                {loadingSeats ? (
                  <div className="text-center py-16 text-gray-400">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p>Loading seats...</p>
                  </div>
                ) : (
                  <div className="rounded-3xl p-6 mx-auto" style={{ background: '#1a1a2e', maxWidth: '420px' }}>
                    <div className="text-center mb-3">
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', fontWeight: 600 }}>FRONT</span>
                    </div>
                    <div className="flex items-center gap-2 mb-3 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      <span style={{ width: '20px' }}></span>
                      <div className="flex flex-col items-center justify-center rounded-xl"
                        style={{ width: '48px', height: '48px', background: 'rgba(234,179,8,0.15)', border: '1.5px solid rgba(234,179,8,0.4)' }}>
                        <GiSteeringWheel style={{ fontSize: '22px', color: '#eab308' }} />
                      </div>
                      <div className="flex-1 flex justify-center">
                        <div style={{ width: '1px', height: '48px', background: 'rgba(255,255,255,0.07)' }}></div>
                      </div>
                      <div className="rounded-xl"
                        style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.03)', border: '1.5px dashed rgba(255,255,255,0.1)' }}>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {ROWS.slice(0, Math.ceil(seats.length / 4)).map((rowLetter, rowIndex) => {
                        const rowSeats = seats.slice(rowIndex * 4, rowIndex * 4 + 4);
                        return (
                          <div key={rowLetter} className="flex items-center gap-2">
                            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', width: '20px', textAlign: 'right', fontWeight: 600 }}>
                              {rowLetter}
                            </span>
                            <div className="flex gap-2">
                              {rowSeats.slice(0, 2).map(seat => {
                                const isChosen = isSeatSelected(seat.id);
                                let bg, border, iconColor, textColor;
                                if (seat.is_booked) {
                                  bg = 'rgba(239,68,68,0.12)'; border = 'rgba(239,68,68,0.3)';
                                  iconColor = '#ef4444'; textColor = 'rgba(239,68,68,0.7)';
                                } else if (isChosen) {
                                  bg = 'rgba(59,130,246,0.2)'; border = 'rgba(59,130,246,0.5)';
                                  iconColor = '#60a5fa'; textColor = '#93c5fd';
                                } else {
                                  bg = 'rgba(34,197,94,0.12)'; border = 'rgba(34,197,94,0.35)';
                                  iconColor = '#22c55e'; textColor = 'rgba(255,255,255,0.6)';
                                }
                                return (
                                  <div key={seat.id} onClick={() => toggleSeat(seat)}
                                    className="flex flex-col items-center justify-center rounded-xl transition-transform hover:scale-110"
                                    style={{ width: '48px', height: '48px', background: bg, border: `1.5px solid ${border}`, cursor: seat.is_booked ? 'not-allowed' : 'pointer' }}>
                                    <FaChair style={{ fontSize: '17px', color: iconColor }} />
                                    <span style={{ fontSize: '9px', fontWeight: 600, color: textColor, lineHeight: 1 }}>{seat.seat_number}</span>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="flex-1 flex justify-center">
                              <div style={{ width: '1px', height: '48px', background: 'rgba(255,255,255,0.07)' }}></div>
                            </div>
                            <div className="flex gap-2">
                              {rowSeats.slice(2, 4).map(seat => {
                                const isChosen = isSeatSelected(seat.id);
                                let bg, border, iconColor, textColor;
                                if (seat.is_booked) {
                                  bg = 'rgba(239,68,68,0.12)'; border = 'rgba(239,68,68,0.3)';
                                  iconColor = '#ef4444'; textColor = 'rgba(239,68,68,0.7)';
                                } else if (isChosen) {
                                  bg = 'rgba(59,130,246,0.2)'; border = 'rgba(59,130,246,0.5)';
                                  iconColor = '#60a5fa'; textColor = '#93c5fd';
                                } else {
                                  bg = 'rgba(34,197,94,0.12)'; border = 'rgba(34,197,94,0.35)';
                                  iconColor = '#22c55e'; textColor = 'rgba(255,255,255,0.6)';
                                }
                                return (
                                  <div key={seat.id} onClick={() => toggleSeat(seat)}
                                    className="flex flex-col items-center justify-center rounded-xl transition-transform hover:scale-110"
                                    style={{ width: '48px', height: '48px', background: bg, border: `1.5px solid ${border}`, cursor: seat.is_booked ? 'not-allowed' : 'pointer' }}>
                                    <FaChair style={{ fontSize: '17px', color: iconColor }} />
                                    <span style={{ fontSize: '9px', fontWeight: 600, color: textColor, lineHeight: 1 }}>{seat.seat_number}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="text-center mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', fontWeight: 600 }}>REAR</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Passenger Details */}
            {selectedSeats.length > 0 && (
              <div className="bg-white rounded-2xl shadow p-6 mb-6">
                <h2 className="text-xl font-bold text-primary mb-4">👤 Passenger Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600 flex items-center gap-1 mb-2">
                      <FaUser /> Passenger Name
                    </label>
                    <input type="text" value={passengerName}
                      onChange={(e) => setPassengerName(e.target.value)}
                      placeholder="e.g. Karim Ahmed"
                      className="w-full border-2 border-gray-200 focus:border-primary rounded-xl p-3 outline-none transition" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 flex items-center gap-1 mb-2">
                      <FaPhone /> Passenger Phone
                    </label>
                    <input type="text" value={passengerPhone}
                      onChange={(e) => setPassengerPhone(e.target.value)}
                      placeholder="e.g. 01712345678"
                      className="w-full border-2 border-gray-200 focus:border-primary rounded-xl p-3 outline-none transition" />
                  </div>
                </div>
              </div>
            )}

            {/* Booking Summary */}
            {selectedSeats.length > 0 && (
              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-xl font-bold text-primary mb-4">📋 Booking Summary</h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-green-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500">Bus</p>
                    <p className="font-bold text-primary">{busName}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500">Seat{selectedSeats.length > 1 ? 's' : ''}</p>
                    <p className="font-bold text-primary">{selectedSeats.map(s => s.seat_number).join(', ')}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500">Route</p>
                    <p className="font-bold text-primary">{route ? `${route.origin} → ${route.destination}` : '-'}</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500">Total Cash</p>
                    <p className="font-bold text-secondary text-lg">৳{totalFare}</p>
                  </div>
                </div>
                <button onClick={handleBook} disabled={loading}
                  className="w-full text-white font-bold py-4 rounded-xl transition transform hover:scale-105 text-lg"
                  style={{ background: 'linear-gradient(135deg,#F42A41,#c0152a)', boxShadow: '0 4px 14px rgba(244,42,65,0.35)' }}>
                  {loading ? 'Processing...' : `✅ Confirm & Collect Cash (${selectedSeats.length} seat${selectedSeats.length > 1 ? 's' : ''})`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WalkinBooking;