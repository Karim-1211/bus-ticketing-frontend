import React, { useState } from 'react';
import { FaChartBar, FaSearch } from 'react-icons/fa';
import API from '../services/api';

const Reports = () => {
  const role = localStorage.getItem('role');

  const [dailyReport, setDailyReport] = useState(null);
  const [weeklyReport, setWeeklyReport] = useState(null);
  const [monthlyReport, setMonthlyReport] = useState(null);

  const [date, setDate] = useState('');
  const [weekDate, setWeekDate] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const fetchDaily = async () => {
    try {
      const res = await API.get(`/api/reports/daily${date ? `?report_date=${date}` : ''}`);
      setDailyReport(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchWeekly = async () => {
    try {
      const res = await API.get(`/api/reports/weekly${weekDate ? `?report_date=${weekDate}` : ''}`);
      setWeeklyReport(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMonthly = async () => {
    try {
      const res = await API.get(`/api/reports/monthly?year=${year}&month=${month}`);
      setMonthlyReport(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-light p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-2 mb-6">
          <FaChartBar /> Sales Reports
        </h1>

        <div className={`grid grid-cols-1 gap-6 ${role === 'admin' ? 'md:grid-cols-3' : 'md:grid-cols-1'}`}>
          {/* Daily Report — Admin + Staff */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-bold text-primary mb-4">📅 Daily Report</h2>
            <div className="flex gap-3 mb-4">
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
              <button onClick={fetchDaily}
                className="bg-primary hover:bg-green-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition">
                <FaSearch /> Search
              </button>
            </div>
            {dailyReport && (
              <div className="space-y-3">
                <div className="bg-green-50 p-4 rounded-xl flex justify-between">
                  <span className="text-gray-600 font-semibold">Date</span>
                  <span className="font-bold text-primary">{dailyReport.date}</span>
                </div>
                <div className="bg-green-50 p-4 rounded-xl flex justify-between">
                  <span className="text-gray-600 font-semibold">Total Bookings</span>
                  <span className="font-bold text-primary text-xl">{dailyReport.total_bookings}</span>
                </div>
                <div className="bg-red-50 p-4 rounded-xl flex justify-between">
                  <span className="text-gray-600 font-semibold">Total Revenue</span>
                  <span className="font-bold text-secondary text-xl">৳{dailyReport.total_revenue}</span>
                </div>
              </div>
            )}
          </div>

          {/* Weekly Report — Admin only */}
          {role === 'admin' && (
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-xl font-bold text-primary mb-4">🗓️ Weekly Report</h2>
              <p className="text-sm text-gray-400 mb-3">Pick any day — we'll show that whole week (Mon–Sun)</p>
              <div className="flex gap-3 mb-4">
                <input type="date" value={weekDate} onChange={(e) => setWeekDate(e.target.value)}
                  className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary" />
                <button onClick={fetchWeekly}
                  className="bg-primary hover:bg-green-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition">
                  <FaSearch /> Search
                </button>
              </div>
              {weeklyReport && (
                <div className="space-y-3">
                  <div className="bg-green-50 p-4 rounded-xl flex justify-between">
                    <span className="text-gray-600 font-semibold">Week</span>
                    <span className="font-bold text-primary">{weeklyReport.week_start} → {weeklyReport.week_end}</span>
                  </div>
                  <div className="bg-green-50 p-4 rounded-xl flex justify-between">
                    <span className="text-gray-600 font-semibold">Total Bookings</span>
                    <span className="font-bold text-primary text-xl">{weeklyReport.total_bookings}</span>
                  </div>
                  <div className="bg-red-50 p-4 rounded-xl flex justify-between">
                    <span className="text-gray-600 font-semibold">Total Revenue</span>
                    <span className="font-bold text-secondary text-xl">৳{weeklyReport.total_revenue}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Monthly Report — Admin only */}
          {role === 'admin' && (
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-xl font-bold text-primary mb-4">📊 Monthly Report</h2>
              <div className="flex gap-3 mb-4">
                <input type="number" value={year} onChange={(e) => setYear(e.target.value)}
                  className="w-24 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Year" />
                <select value={month} onChange={(e) => setMonth(e.target.value)}
                  className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
                  {['January','February','March','April','May','June','July','August','September','October','November','December']
                    .map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                </select>
                <button onClick={fetchMonthly}
                  className="bg-primary hover:bg-green-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition">
                  <FaSearch /> Search
                </button>
              </div>
              {monthlyReport && (
                <div className="space-y-3">
                  <div className="bg-green-50 p-4 rounded-xl flex justify-between">
                    <span className="text-gray-600 font-semibold">Period</span>
                    <span className="font-bold text-primary">{monthlyReport.month}/{monthlyReport.year}</span>
                  </div>
                  <div className="bg-green-50 p-4 rounded-xl flex justify-between">
                    <span className="text-gray-600 font-semibold">Total Bookings</span>
                    <span className="font-bold text-primary text-xl">{monthlyReport.total_bookings}</span>
                  </div>
                  <div className="bg-red-50 p-4 rounded-xl flex justify-between">
                    <span className="text-gray-600 font-semibold">Total Revenue</span>
                    <span className="font-bold text-secondary text-xl">৳{monthlyReport.total_revenue}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;