import { useEffect, useState } from 'react';
import api from '../services/api';
import ProductForm from '../components/ProductForm';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const load = async () => {
    try {
      const res = await api.get('/api/products');
      setProducts(res.data.data);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Products Menu</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your restaurant items, stock, and pricing.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1">
          <ProductForm
            loading={loading}
            onSubmit={async (payload) => {
              setLoading(true);
              try {
                await api.post('/api/products', payload);
                await load();
              } finally {
                setLoading(false);
              }
            }}
          />
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="font-semibold text-slate-800">Menu Items ({products.length})</h2>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  className="pl-9 pr-4 py-1.5 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-48 shadow-sm bg-white"
                />
                <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
            </div>
            
            {fetching ? (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500">Loading your menu...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                <p>Your menu is empty. Add a product to get started!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-white text-slate-500 font-medium border-b border-slate-100">
                    <tr>
                      <th className="px-5 py-3">Product Name</th>
                      <th className="px-5 py-3">Price</th>
                      <th className="px-5 py-3">Stock</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {products.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200">
                              {p.imageUrl ? (
                                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                              ) : (
                                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">{p.name}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`w-2 h-2 rounded-full ${p.category?.toLowerCase() === 'veg' ? 'bg-green-500' : p.category?.toLowerCase() === 'non-veg' ? 'bg-red-500' : 'bg-slate-400'}`}></span>
                                <span className="text-xs text-slate-500">{p.category || 'Uncategorized'}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 font-medium text-slate-700">Rs {p.price}</td>
                        <td className="px-5 py-3">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${p.stock > 10 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : p.stock > 0 ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                            {p.stock} units
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          {p.isActive ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-medium"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>Active</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-slate-400 text-xs font-medium"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>Hidden</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Product"
                            onClick={async () => {
                              if(window.confirm('Are you sure you want to delete this product?')) {
                                await api.delete(`/api/products/${p._id}`);
                                await load();
                              }
                            }}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
