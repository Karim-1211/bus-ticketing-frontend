import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FaBus, FaTicketAlt, FaChartBar, FaSignOutAlt, FaRoute,
  FaCalendarAlt, FaHistory, FaSignInAlt, FaUserPlus,
  FaCashRegister, FaUserTie, FaBell, FaTachometerAlt
} from 'react-icons/fa';
import API from '../services/api';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const name = localStorage.getItem('name');
  const notifRef = useRef(null);

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [scrolled, setScrolled] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/api/notifications/');
      setNotifications(res.data);
    } catch (err) {}
  };

  useEffect(() => {
    if (token) fetchNotifications();
  }, [token]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAllRead = async () => {
    try {
      await API.put('/api/notifications/mark-all-read');
      fetchNotifications();
    } catch (err) {}
  };

  const handleMarkRead = async (id) => {
    try {
      await API.put(`/api/notifications/mark-read/${id}`);
      fetchNotifications();
    } catch (err) {}
  };

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const NLink = ({ to, icon, label }) => (
    <Link to={to} style={{
      display: 'flex', alignItems: 'center', gap: '5px',
      padding: '6px 10px', borderRadius: '8px',
      fontSize: '13px', fontWeight: 500,
      color: isActive(to) ? '#ffffff' : 'rgba(255,255,255,0.7)',
      background: isActive(to) ? 'rgba(255,255,255,0.15)' : 'transparent',
      textDecoration: 'none', whiteSpace: 'nowrap',
      transition: 'all 0.2s', borderBottom: isActive(to) ? '2px solid #F42A41' : '2px solid transparent',
    }}
    onMouseEnter={e => {
      if (!isActive(to)) {
        e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
        e.currentTarget.style.color = '#fff';
      }
    }}
    onMouseLeave={e => {
      if (!isActive(to)) {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
      }
    }}>
      <span style={{ fontSize: '12px', opacity: 0.9 }}>{icon}</span>
      {label}
    </Link>
  );

  return (
    <nav style={{
      background: 'linear-gradient(135deg, #004d3a 0%, #006A4E 100%)',
      boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.25)' : '0 2px 10px rgba(0,0,0,0.15)',
      position: 'sticky', top: 0, zIndex: 1000,
      transition: 'box-shadow 0.3s ease',
    }}>
      {/* Top accent line */}
      <div style={{ height: '3px', background: 'linear-gradient(90deg, #F42A41, #ff6b6b, #F42A41)' }} />

      <div style={{
        maxWidth: '1400px', margin: '0 auto',
        padding: '0 20px', height: '58px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: '12px',
      }}>

        {/* LOGO */}
        <Link to="/dashboard" style={{
          display: 'flex', alignItems: 'center',
          gap: '10px', textDecoration: 'none', flexShrink: 0,
        }}>
          <div style={{
            width: '34px', height: '34px',
            background: 'linear-gradient(135deg, #F42A41, #c0152a)',
            borderRadius: '9px', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(244,42,65,0.45)',
            flexShrink: 0,
          }}>
            <FaBus style={{ color: 'white', fontSize: '16px' }} />
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <p style={{ color: 'white', fontWeight: 800, fontSize: '14px', margin: 0, letterSpacing: '-0.2px' }}>ICT BD Bus</p>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '9px', margin: 0, letterSpacing: '0.08em', fontWeight: 500 }}>SERVICES 🇧🇩</p>
          </div>
        </Link>

        {/* NAV LINKS */}
        {token ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexWrap: 'nowrap', overflow: 'hidden' }}>
            <NLink to="/dashboard" icon={<FaTachometerAlt />} label="Dashboard" />
            {(role === 'admin' || role === 'staff') && (
              <>
                <NLink to="/buses" icon={<FaBus />} label="Buses" />
                <NLink to="/routes" icon={<FaRoute />} label="Routes" />
                <NLink to="/schedules" icon={<FaCalendarAlt />} label="Schedules" />
                <NLink to="/walkin" icon={<FaCashRegister />} label="Walk-in" />
              </>
            )}
            <NLink to="/book" icon={<FaTicketAlt />} label="Book" />
            <NLink to="/history" icon={<FaHistory />} label="Bookings" />
            {(role === 'admin' || role === 'staff') && (
              <NLink to="/reports" icon={<FaChartBar />} label="Reports" />
            )}
            {role === 'admin' && (
              <NLink to="/staff" icon={<FaUserTie />} label="Staff" />
            )}
          </div>
        ) : (
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontStyle: 'italic' }}>
            Serving Bangladesh with pride 🇧🇩
          </p>
        )}

        {/* RIGHT SIDE */}
        {token ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>

            {/* Bell */}
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button
                onClick={() => { if (!notifOpen) fetchNotifications(); setNotifOpen(!notifOpen); }}
                style={{
                  width: '36px', height: '36px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '9px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}>
                <FaBell style={{ color: 'white', fontSize: '15px' }} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '-5px', right: '-5px',
                    background: '#F42A41', color: 'white',
                    fontSize: '9px', fontWeight: 700,
                    borderRadius: '20px', minWidth: '16px', height: '16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1.5px solid #006A4E',
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown */}
              {notifOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: '44px',
                  width: '310px', background: 'white',
                  borderRadius: '14px',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
                  zIndex: 200, overflow: 'hidden',
                  border: '1px solid rgba(0,0,0,0.06)',
                }}>
                  <div style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #f3f4f6',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <p style={{ fontWeight: 700, color: '#006A4E', fontSize: '14px', margin: 0 }}>🔔 Notifications</p>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} style={{
                        fontSize: '11px', color: '#F42A41',
                        background: 'none', border: 'none',
                        cursor: 'pointer', fontWeight: 600,
                      }}>
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>
                        <FaBell style={{ fontSize: '24px', marginBottom: '8px', opacity: 0.3, display: 'block', margin: '0 auto 8px' }} />
                        <p style={{ fontSize: '13px', margin: 0 }}>No notifications yet</p>
                      </div>
                    ) : notifications.map(n => (
                      <div key={n.id} onClick={() => handleMarkRead(n.id)}
                        style={{
                          padding: '11px 16px',
                          borderBottom: '1px solid #f9fafb',
                          cursor: 'pointer',
                          background: n.is_read ? 'white' : '#f0fdf4',
                          display: 'flex', alignItems: 'flex-start', gap: '10px',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f0fdf4'}
                        onMouseLeave={e => e.currentTarget.style.background = n.is_read ? 'white' : '#f0fdf4'}>
                        <div style={{
                          width: '7px', height: '7px', borderRadius: '50%',
                          flexShrink: 0, marginTop: '5px',
                          background: n.is_read ? '#d1d5db' : (n.type === 'cancellation' ? '#F42A41' : '#006A4E'),
                        }} />
                        <div>
                          <p style={{ fontSize: '12px', color: '#374151', fontWeight: n.is_read ? 400 : 600, lineHeight: 1.4, margin: 0 }}>
                            {n.message}
                          </p>
                          <p style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px', margin: '3px 0 0' }}>
                            {n.type === 'confirmation' ? '✅ Confirmed' : '❌ Cancelled'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User avatar + name */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '9px', padding: '5px 10px',
            }}>
              <div style={{
                width: '26px', height: '26px',
                background: 'linear-gradient(135deg, #F42A41, #c0152a)',
                borderRadius: '7px', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 800, color: 'white',
                flexShrink: 0,
              }}>
                {name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ lineHeight: 1.2 }}>
                <p style={{ color: 'white', fontSize: '12px', fontWeight: 600, margin: 0, whiteSpace: 'nowrap' }}>{name?.split(' ')[0]}</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px', margin: 0, textTransform: 'capitalize' }}>{role}</p>
              </div>
            </div>

            {/* Logout */}
            <button onClick={logout} style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              background: 'linear-gradient(135deg, #F42A41, #c0152a)',
              color: 'white', border: 'none', borderRadius: '9px',
              padding: '7px 13px', fontSize: '12px', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(244,42,65,0.35)',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              <FaSignOutAlt style={{ fontSize: '11px' }} />
              Logout
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <Link to="/login" style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              color: 'rgba(255,255,255,0.85)', fontSize: '13px', fontWeight: 600,
              padding: '7px 13px', borderRadius: '9px',
              border: '1px solid rgba(255,255,255,0.2)',
              textDecoration: 'none', whiteSpace: 'nowrap',
            }}>
              <FaSignInAlt /> Login
            </Link>
            <Link to="/register" style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              background: 'linear-gradient(135deg, #F42A41, #c0152a)',
              color: 'white', fontSize: '13px', fontWeight: 600,
              padding: '7px 13px', borderRadius: '9px',
              textDecoration: 'none', whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(244,42,65,0.35)',
            }}>
              <FaUserPlus /> Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;