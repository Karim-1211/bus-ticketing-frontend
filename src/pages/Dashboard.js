import React, { useState, useEffect } from 'react';
import { FaBus, FaRoute, FaTicketAlt, FaMoneyBillWave, FaMapMarkerAlt, FaChair, FaArrowRight } from 'react-icons/fa';
import { GiSteeringWheel } from 'react-icons/gi';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const ROWS = ['A','B','C','D','E','F','G','H','I','J'];

const Dashboard = () => {
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [report, setReport] = useState({});
  const [selectedBus, setSelectedBus] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [seats, setSeats] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState(null); // single seat object, not an array
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const name = localStorage.getItem('name');
  const navigate = useNavigate();

  const defaultImages = [
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&q=80',
    'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=1200&q=80',
    'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=1200&q=80',
    'https://images.unsplash.com/photo-1601933470096-0e34634ffcde?w=1200&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
  ];

  const handleBookClick = () => {
    if (token) {
      navigate('/book');
    } else {
      navigate('/register');
    }
  };

  const handleProceedToPayment = () => {
    if (!selectedSeat || !selectedSchedule) {
      navigate('/book');
      return;
    }
    navigate(`/book?schedule_id=${selectedSchedule.id}&seat_id=${selectedSeat.id}`);
  };

  useEffect(() => {
    API.get('/api/buses/').then(res => setBuses(res.data)).catch(() => {});
    API.get('/api/routes/').then(res => setRoutes(res.data)).catch(() => {});
    API.get('/api/schedules/').then(res => setSchedules(res.data)).catch(() => {});
    if (role === 'admin') {
      API.get('/api/reports/daily').then(res => setReport(res.data)).catch(() => {});
    }
  }, [role]);

  useEffect(() => {
    if (buses.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % buses.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [buses]);

  const handleBusClick = async (bus) => {
    if (selectedBus?.id === bus.id) {
      setSelectedBus(null);
      setSeats([]);
      setSelectedSeat(null);
      return;
    }
    setSelectedBus(bus);
    setSeats([]);
    setSelectedSeat(null);
    setLoadingSeats(true);
    const busSchedules = schedules.filter(s => s.bus_id === bus.id);
    if (busSchedules.length > 0) {
      const schedule = busSchedules[0];
      setSelectedSchedule(schedule);
      try {
        const res = await API.get(`/api/bookings/seats/${schedule.id}`);
        setSeats(res.data);
      } catch (e) {}
    }
    setLoadingSeats(false);
  };

  // Single-select: clicking the same seat again deselects it, clicking a different seat replaces the old one
  const toggleSeat = (seat) => {
    if (seat.is_booked) return;
    setSelectedSeat(prev => (prev?.id === seat.id ? null : seat));
  };

  const getRoute = (routeId) => routes.find(r => r.id === routeId);
  const currentBus = buses[currentSlide];
  const availableCount = seats.filter(s => !s.is_booked).length;
  const bookedCount = seats.filter(s => s.is_booked).length;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HERO SLIDER */}
      <div className="relative w-full overflow-hidden" style={{ height: '420px' }}>
        {buses.map((bus, i) => (
          <div key={bus.id} className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: i === currentSlide ? 1 : 0, zIndex: i === currentSlide ? 1 : 0 }}>
            <img src={bus.image_url || defaultImages[i % defaultImages.length]}
              alt={bus.bus_name} className="w-full h-full object-cover" />
            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.1) 100%)' }} />
          </div>
        ))}
        {currentBus && (
          <div className="absolute inset-0 flex items-center px-16" style={{ zIndex: 10 }}>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest"
                  style={{ background: '#F42A41' }}>🇧🇩 ICT BD Bus Services</span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${currentBus.bus_type === 'AC' ? 'bg-blue-500 text-white' : 'bg-gray-600 text-white'}`}>
                  {currentBus.bus_type}
                </span>
              </div>
              <h1 className="text-white font-extrabold mb-2"
                style={{ fontSize: '3.5rem', lineHeight: 1.1, textShadow: '2px 2px 8px rgba(0,0,0,0.5)' }}>
                {currentBus.bus_name}
              </h1>
              <p className="text-gray-200 text-xl mb-1">#{currentBus.bus_number} · {currentBus.total_seats} Seats</p>
              {schedules.filter(s => s.bus_id === currentBus.id).slice(0, 1).map(s => {
                const route = getRoute(s.route_id);
                return route ? (
                  <p key={s.id} className="text-green-300 text-lg font-semibold mb-4">
                    📍 {route.origin} → {route.destination} · <span className="text-yellow-300">৳{route.base_fare}</span>
                  </p>
                ) : null;
              })}
              <button onClick={handleBookClick}
                className="flex items-center gap-2 text-white font-bold px-8 py-3 rounded-full text-lg transition-all"
                style={{ background: 'linear-gradient(135deg,#F42A41,#c0152a)', boxShadow: '0 4px 20px rgba(244,42,65,0.5)' }}>
                Book Now <FaArrowRight />
              </button>
            </div>
          </div>
        )}
        <div className="absolute bottom-6 left-16 flex gap-2" style={{ zIndex: 10 }}>
          {buses.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)}
              className="transition-all duration-300 rounded-full"
              style={{ width: i === currentSlide ? '2rem' : '0.5rem', height: '0.5rem', background: i === currentSlide ? '#F42A41' : 'rgba(255,255,255,0.4)' }} />
          ))}
        </div>
        <div className="absolute bottom-6 right-8 text-white/40 text-sm font-mono" style={{ zIndex: 10 }}>
          {String(currentSlide + 1).padStart(2, '0')} / {String(buses.length).padStart(2, '0')}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Welcome */}
        <div className="flex items-center justify-between mb-8">
          <div>
            {token ? (
              <>
                <h1 className="text-3xl font-bold text-gray-800">Welcome back, <span className="text-primary">{name}</span>! 👋</h1>
                <p className="text-gray-400 mt-1 text-sm">Real-time bus ticketing overview</p>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-gray-800">Welcome to <span className="text-primary">ICT BD Bus Services</span> 👋</h1>
                <p className="text-gray-400 mt-1 text-sm">Browse buses, check live seat availability, and book your ticket online</p>
              </>
            )}
          </div>
          <button onClick={handleBookClick}
            className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-green-800 transition flex items-center gap-2">
            <FaTicketAlt /> Book a Ticket
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Buses', value: buses.length, icon: <FaBus />, bg: 'bg-green-50', border: 'border-primary', text: 'text-primary' },
            { label: 'Total Routes', value: routes.length, icon: <FaRoute />, bg: 'bg-red-50', border: 'border-secondary', text: 'text-secondary' },
            ...(role === 'admin' ? [
              { label: "Today's Bookings", value: report.total_bookings || 0, icon: <FaTicketAlt />, bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-500' },
              { label: "Today's Revenue", value: `৳${report.total_revenue || 0}`, icon: <FaMoneyBillWave />, bg: 'bg-yellow-50', border: 'border-yellow-500', text: 'text-yellow-500' },
            ] : [])
          ].map((stat, i) => (
            <div key={i} className={`bg-white rounded-2xl p-5 border-l-4 ${stat.border} shadow-sm hover:shadow-md transition`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs uppercase font-semibold tracking-wide">{stat.label}</p>
                  <p className={`text-3xl font-extrabold mt-1 ${stat.text}`}>{stat.value}</p>
                </div>
                <div className={`${stat.bg} p-3 rounded-xl text-xl ${stat.text}`}>{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Bus Cards */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold text-gray-800">🚌 Available Buses</h2>
          <p className="text-sm text-gray-400">Click any bus to view live seat map</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {buses.map((bus, i) => {
            const busRoute = schedules
              .filter(s => s.bus_id === bus.id)
              .map(s => getRoute(s.route_id))
              .filter(Boolean)[0];
            const isSelected = selectedBus?.id === bus.id;
            return (
              <div key={bus.id} onClick={() => handleBusClick(bus)}
                className={`bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${isSelected ? 'ring-4 ring-primary shadow-2xl -translate-y-2' : 'shadow-md'}`}>
                <div className="relative h-48 overflow-hidden">
                  <img src={bus.image_url || defaultImages[i % defaultImages.length]}
                    alt={bus.bus_name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                  <div className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)' }} />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${bus.bus_type === 'AC' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-white'}`}>
                      {bus.bus_type}
                    </span>
                    {isSelected && (
                      <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">Selected ✓</span>
                    )}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white font-extrabold text-xl">{bus.bus_name}</p>
                    <p className="text-gray-300 text-xs">#{bus.bus_number}</p>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <FaChair className="text-primary" />
                      <span>{bus.total_seats} Seats</span>
                    </div>
                    <span className={`text-sm font-bold ${isSelected ? 'text-primary' : 'text-gray-400'}`}>
                      {isSelected ? '▲ Hide Map' : '▼ View Seats'}
                    </span>
                  </div>
                  {busRoute && (
                    <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
                      <FaMapMarkerAlt className="text-secondary flex-shrink-0" />
                      <span className="font-medium">{busRoute.origin}</span>
                      <span className="mx-1">→</span>
                      <span className="font-medium">{busRoute.destination}</span>
                      <span className="ml-auto text-primary font-bold">৳{busRoute.base_fare}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* SEAT MAP */}
        {selectedBus && (
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  💺 {selectedBus.bus_name} — Live Seat Map
                </h2>
                {selectedSchedule && (
                  <p className="text-gray-400 text-sm mt-1">
                    Schedule #{selectedSchedule.id} · Departure: {new Date(selectedSchedule.departure_time).toLocaleString()}
                  </p>
                )}
              </div>
              <button
                onClick={() => { setSelectedBus(null); setSeats([]); setSelectedSeat(null); }}
                className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold text-lg transition">
                ✕
              </button>
            </div>

            {/* Legend */}
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
                Selected ({selectedSeat ? 1 : 0})
              </div>
            </div>

            {loadingSeats ? (
              <div className="text-center py-16 text-gray-400">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p>Loading seats...</p>
              </div>
            ) : seats.length === 0 ? (
              <div className="text-center py-16 text-gray-300">
                <FaBus className="text-6xl mx-auto mb-4" />
                <p className="text-lg font-medium">No schedule assigned to this bus yet.</p>
              </div>
            ) : (
              <>
                {/* Dark bus body */}
                <div className="rounded-3xl p-6 mx-auto" style={{ background: '#1a1a2e', maxWidth: '420px' }}>
                  <div className="text-center mb-3">
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', fontWeight: 600 }}>FRONT</span>
                  </div>

                  {/* Driver row */}
                  <div className="flex items-center gap-2 mb-3 pb-3"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    <span style={{ width: '20px' }}></span>
                    <div className="flex gap-2">
                      <div className="flex flex-col items-center justify-center rounded-xl"
                        style={{ width: '48px', height: '48px', background: 'rgba(234,179,8,0.15)', border: '1.5px solid rgba(234,179,8,0.4)' }}>
                        <GiSteeringWheel style={{ fontSize: '22px', color: '#eab308' }} />
                      </div>
                    </div>
                    <div className="flex-1 flex justify-center">
                      <div style={{ width: '1px', height: '48px', background: 'rgba(255,255,255,0.07)' }}></div>
                    </div>
                    <div className="flex gap-2">
                      <div className="rounded-xl"
                        style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.03)', border: '1.5px dashed rgba(255,255,255,0.1)' }}>
                      </div>
                    </div>
                  </div>

                  {/* Seat rows */}
                  <div className="flex flex-col gap-2">
                    {ROWS.slice(0, Math.ceil(seats.length / 4)).map((rowLetter, rowIndex) => {
                      const rowSeats = seats.slice(rowIndex * 4, rowIndex * 4 + 4);
                      return (
                        <div key={rowLetter} className="flex items-center gap-2">
                          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', width: '20px', textAlign: 'right', fontWeight: 600 }}>
                            {rowLetter}
                          </span>
                          <div className="flex gap-2">
                            {rowSeats.slice(0, 2).map((seat) => {
                              const isBooked = seat.is_booked;
                              const isChosen = selectedSeat?.id === seat.id;
                              let bg, border, iconColor, textColor;
                              if (isBooked) {
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
                                <div key={seat.id}
                                  onClick={() => toggleSeat(seat)}
                                  className="flex flex-col items-center justify-center rounded-xl transition-transform hover:scale-110"
                                  style={{ width: '48px', height: '48px', background: bg, border: `1.5px solid ${border}`, cursor: isBooked ? 'not-allowed' : 'pointer' }}>
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
                            {rowSeats.slice(2, 4).map((seat) => {
                              const isBooked = seat.is_booked;
                              const isChosen = selectedSeat?.id === seat.id;
                              let bg, border, iconColor, textColor;
                              if (isBooked) {
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
                                <div key={seat.id}
                                  onClick={() => toggleSeat(seat)}
                                  className="flex flex-col items-center justify-center rounded-xl transition-transform hover:scale-110"
                                  style={{ width: '48px', height: '48px', background: bg, border: `1.5px solid ${border}`, cursor: isBooked ? 'not-allowed' : 'pointer' }}>
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

                {/* Selected seat info */}
                {selectedSeat && (
                  <div className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
                    <FaTicketAlt className="text-blue-500" />
                    <span className="text-sm text-blue-700 font-medium">
                      Selected seat: <strong>{selectedSeat.seat_number}</strong>
                    </span>
                    <button onClick={() => setSelectedSeat(null)}
                      className="ml-auto text-xs text-gray-400 hover:text-gray-600 underline">
                      Clear
                    </button>
                  </div>
                )}

                <div className="mt-4 flex justify-end">
                  <button onClick={handleProceedToPayment}
                    className="flex items-center gap-2 text-white font-bold px-8 py-3 rounded-xl transition transform hover:scale-105"
                    style={{ background: 'linear-gradient(135deg,#F42A41,#c0152a)', boxShadow: '0 4px 14px rgba(244,42,65,0.35)' }}>
                    <FaTicketAlt />
                    {selectedSeat ? 'Proceed to Payment →' : 'Book This Bus'}
                    <FaArrowRight />
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;