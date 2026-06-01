import { useState } from 'react';

const initialState = {
  name: '',
  description: '',
  category: '',
  price: '',
  stock: '',
  imageUrl: '',
  isActive: true
};

export default function ProductForm({ onSubmit, loading }) {
  const [form, setForm] = useState(initialState);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 sticky top-24">
      <div className="mb-6 pb-4 border-b border-slate-100">
        <h3 className="font-bold text-slate-800 text-lg">Add New Product</h3>
        <p className="text-xs text-slate-500 mt-1">Fill out the details to list a new item on your menu.</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">Product Name *</label>
          <input className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-sm" placeholder="e.g. Veg Burger" value={form.name} onChange={(e) => setField('name', e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">Price *</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 text-sm">₹</span>
              <input className="w-full border border-slate-200 rounded-xl pl-7 pr-3 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-sm" placeholder="0.00" type="number" value={form.price} onChange={(e) => setField('price', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">Stock *</label>
            <input className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-sm" placeholder="Quantity" type="number" value={form.stock} onChange={(e) => setField('stock', e.target.value)} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">Category *</label>
          <div className="relative">
            <select className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-sm appearance-none text-slate-700" value={form.category} onChange={(e) => setField('category', e.target.value)}>
              <option value="" disabled>Select Category</option>
              <option value="Veg">Veg</option>
              <option value="Non-Veg">Non-Veg</option>
              <option value="Other">Other</option>
            </select>
            <svg className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">Image URL</label>
          <input className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-sm" placeholder="https://..." value={form.imageUrl} onChange={(e) => setField('imageUrl', e.target.value)} />
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">Description</label>
          <textarea className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-sm" placeholder="Brief description of the item..." rows="3" value={form.description} onChange={(e) => setField('description', e.target.value)} />
        </div>
        
        <div className="flex items-center pt-2">
          <input
            id="isActive"
            type="checkbox"
            className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
            checked={form.isActive}
            onChange={(e) => setField('isActive', e.target.checked)}
          />
          <label htmlFor="isActive" className="ml-2 block text-sm font-medium text-slate-700">
            Visible on Menu
          </label>
        </div>
      </div>
      
      <button
        className="mt-6 w-full px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-sm hover:shadow-md hover:shadow-emerald-500/20 transition-all disabled:opacity-70 flex justify-center items-center gap-2"
        disabled={loading}
        onClick={async () => {
          if(!form.name || !form.price || !form.category) return alert("Please fill out required fields.");
          await onSubmit({
            ...form,
            price: Number(form.price),
            stock: Number(form.stock)
          });
          setForm(initialState);
        }}
      >
        {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Publish Product'}
      </button>
    </div>
  );
}
