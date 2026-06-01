import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({ totalOrders: 0, pendingOrders: 0, completedOrders: 0, revenue: 0 });
  const [customerCount, setCustomerCount] = useState(0);

  useEffect(() => {
    Promise.all([api.get('/api/orders/analytics/summary'), api.get('/api/customers')])
      .then(([orderRes, customerRes]) => {
        setStats(orderRes.data.data);
        setCustomerCount(customerRes.data.data.length);
      })
      .catch(() => {});
  }, []);

  const cards = [
    { label: 'Total Revenue', value: `Rs ${stats.revenue || 0}`, icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'from-emerald-400 to-teal-500', shadow: 'shadow-emerald-500/20' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'from-amber-400 to-orange-500', shadow: 'shadow-amber-500/20' },
    { label: 'Completed Orders', value: stats.completedOrders, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'from-blue-400 to-indigo-500', shadow: 'shadow-blue-500/20' },
    { label: 'Total Orders', value: stats.totalOrders, icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z', color: 'from-purple-400 to-fuchsia-500', shadow: 'shadow-purple-500/20' },
    { label: 'Total Customers', value: customerCount, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', color: 'from-rose-400 to-pink-500', shadow: 'shadow-rose-500/20' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard Overview</h1>
        <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl shadow-sm hover:bg-slate-50 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm card-hover relative overflow-hidden group">
            {/* Background decorative glow */}
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${card.color} opacity-10 group-hover:opacity-20 transition-opacity blur-2xl`}></div>
            
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{card.label}</p>
                <p className="text-3xl font-bold text-slate-800 tracking-tight">{card.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-lg ${card.shadow}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={card.icon}></path></svg>
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs font-medium text-emerald-500 relative z-10">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
              Updated just now
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Revenue Analytics</h2>
          <div className="h-64 flex items-center justify-center bg-slate-50 rounded-xl border border-slate-100 border-dashed">
             <p className="text-slate-400 font-medium">Chart visualization will appear here</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Recent Activity</h2>
          <div className="space-y-4">
             <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20"></div>
                <div>
                  <p className="text-sm font-medium text-slate-800">New Order #1024 placed</p>
                  <p className="text-xs text-slate-500">2 minutes ago</p>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-amber-500 ring-4 ring-amber-500/20"></div>
                <div>
                  <p className="text-sm font-medium text-slate-800">Order #1023 preparing</p>
                  <p className="text-xs text-slate-500">15 minutes ago</p>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-blue-500 ring-4 ring-blue-500/20"></div>
                <div>
                  <p className="text-sm font-medium text-slate-800">New customer registered</p>
                  <p className="text-xs text-slate-500">1 hour ago</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
