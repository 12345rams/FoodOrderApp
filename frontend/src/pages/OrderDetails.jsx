import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/api/orders/${id}`).then((res) => setOrder(res.data.data)).catch(() => {});
  }, [id]);

  if (!order) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link to="/orders" className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-slate-500 hover:text-slate-700">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Order #{order._id.slice(-6).toUpperCase()}</h1>
          <p className="text-slate-500 text-sm mt-1">{new Date(order.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="font-semibold text-slate-800">Order Items</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {order.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between items-center pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-bold border border-slate-200">
                        {i.quantity}x
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{i.productName}</p>
                        <p className="text-sm text-slate-500">Rs {i.price} each</p>
                      </div>
                    </div>
                    <p className="font-bold text-slate-800">Rs {i.price * i.quantity}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-50 p-6 border-t border-slate-100 flex justify-between items-center">
              <p className="text-slate-500 font-medium">Grand Total</p>
              <p className="text-2xl font-bold text-emerald-600">Rs {order.totalAmount}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="font-semibold text-slate-800 mb-4 pb-4 border-b border-slate-100">Customer Info</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">WhatsApp Number</p>
                <div className="flex items-center gap-2 text-slate-800 font-medium">
                  <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.964 9.964 0 001.333 4.993L2 22l5.233-1.237a9.994 9.994 0 004.779 1.217h.004c5.505 0 9.988-4.478 9.989-9.984 0-2.669-1.037-5.176-2.922-7.062A9.935 9.935 0 0012.012 2z"/></svg>
                  {order.whatsappNumber}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Delivery Address</p>
                <p className="text-slate-800">{order.address}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="font-semibold text-slate-800 mb-4 pb-4 border-b border-slate-100">Order Status</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Fulfillment</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-bold uppercase tracking-wider ${
                  order.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                  order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {order.status}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Payment</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-bold uppercase tracking-wider ${
                  order.paymentStatus?.toLowerCase() === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {order.paymentStatus || 'PENDING'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
