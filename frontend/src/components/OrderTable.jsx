import { Link } from 'react-router-dom';

const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'accepted': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'preparing': return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'out_for_delivery': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const getPaymentColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'paid': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    case 'failed': return 'text-red-600 bg-red-50 border-red-200';
    default: return 'text-amber-600 bg-amber-50 border-amber-200';
  }
};

export default function OrderTable({ orders, onStatusChange }) {
  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-medium">
          <tr>
            <th className="px-5 py-4">Order ID</th>
            <th className="px-5 py-4">Customer Info</th>
            <th className="px-5 py-4">Order Summary</th>
            <th className="px-5 py-4">Amount</th>
            <th className="px-5 py-4">Order Status</th>
            <th className="px-5 py-4">Payment</th>
            <th className="px-5 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {orders.map((o) => (
            <tr key={o._id} className="hover:bg-slate-50 transition-colors group">
              <td className="px-5 py-4">
                <span className="font-mono font-medium text-slate-700">#{o._id.slice(-6).toUpperCase()}</span>
                <p className="text-xs text-slate-400 mt-1">{new Date(o.createdAt || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.964 9.964 0 001.333 4.993L2 22l5.233-1.237a9.994 9.994 0 004.779 1.217h.004c5.505 0 9.988-4.478 9.989-9.984 0-2.669-1.037-5.176-2.922-7.062A9.935 9.935 0 0012.012 2z"/></svg>
                  <span className="font-medium text-slate-700">{o.whatsappNumber}</span>
                </div>
              </td>
              <td className="px-5 py-4">
                <div className="max-w-[200px]">
                  <p className="text-slate-700 truncate" title={o.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}>
                    {o.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{o.items.length} items</p>
                </div>
              </td>
              <td className="px-5 py-4 font-semibold text-slate-800">
                Rs {o.totalAmount}
              </td>
              <td className="px-5 py-4">
                <select 
                  className={`border rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wider appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-200 transition-colors ${getStatusColor(o.status)}`} 
                  value={o.status} 
                  onChange={(e) => onStatusChange(o._id, { status: e.target.value })}
                >
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="preparing">Preparing</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </td>
              <td className="px-5 py-4">
                <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${getPaymentColor(o.paymentStatus)}`}>
                  {o.paymentStatus?.toUpperCase() || 'PENDING'}
                </span>
              </td>
              <td className="px-5 py-4 text-right">
                <Link to={`/orders/${o._id}`} className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="View Details">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
