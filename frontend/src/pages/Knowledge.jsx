import { useEffect, useState } from 'react';
import api from '../services/api';

const initialForm = {
  title: '',
  content: '',
  tags: '',
  isActive: true
};

export default function Knowledge() {
  const [form, setForm] = useState(initialForm);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function loadItems() {
    const res = await api.get('/api/knowledge');
    setItems(res.data.data);
  }

  useEffect(() => {
    loadItems().catch(() => setError('Unable to load knowledge data'));
  }, []);

  async function createItem() {
    setError('');
    if (!form.title.trim() || !form.content.trim()) {
      setError('Title and content are required');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/knowledge', {
        title: form.title,
        content: form.content,
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        isActive: form.isActive
      });
      setForm(initialForm);
      await loadItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create knowledge item');
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(item) {
    try {
      await api.put(`/api/knowledge/${item._id}`, {
        isActive: !item.isActive
      });
      await loadItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update knowledge item');
    }
  }

  async function remove(itemId) {
    try {
      await api.delete(`/api/knowledge/${itemId}`);
      await loadItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete knowledge item');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">AI Knowledge Base</h1>
          <p className="text-slate-500 text-sm mt-1">Train your AI with custom business rules, FAQs, and delivery policies.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-24">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Add New Training Data</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                  placeholder="e.g. Delivery Zones"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tags</label>
                <input
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-sm"
                  placeholder="delivery, shipping, areas"
                  value={form.tags}
                  onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Training Content</label>
                <textarea
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors text-sm min-h-[120px]"
                  placeholder="We deliver to Area A, B, and C. Delivery charges are Rs 50."
                  value={form.content}
                  onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                />
              </div>

              <div className="flex items-center mt-2">
                <input
                  id="isActive"
                  type="checkbox"
                  className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                  checked={form.isActive}
                  onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                />
                <label htmlFor="isActive" className="ml-2 block text-sm font-medium text-slate-700">
                  Active in AI Context
                </label>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm flex items-start gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  {error}
                </div>
              )}

              <button
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl px-4 py-3 mt-4 transition-all shadow-md hover:shadow-lg disabled:opacity-70 flex justify-center items-center gap-2"
                onClick={createItem}
                disabled={loading}
              >
                {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Inject to AI Model'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Cards */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 mb-2">Trained Data ({items.length})</h2>
          {items.length === 0 ? (
             <div className="bg-white rounded-2xl border border-slate-100 border-dashed p-12 text-center text-slate-500">
               No knowledge data added yet. Start by adding rules on the left!
             </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {items.map((item) => (
                <div key={item._id} className={`bg-white rounded-2xl border p-5 shadow-sm transition-all relative overflow-hidden ${item.isActive ? 'border-emerald-100 hover:border-emerald-300 hover:shadow-md' : 'border-slate-200 opacity-60'}`}>
                  {item.isActive && <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-bl-full -z-0"></div>}
                  
                  <div className="flex justify-between items-start mb-3 relative z-10">
                    <h3 className="font-bold text-slate-800 truncate pr-2">{item.title}</h3>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleActive(item)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title={item.isActive ? 'Disable' : 'Enable'}>
                        {item.isActive ? 
                          <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> :
                          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        }
                      </button>
                      <button onClick={() => remove(item._id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-600 mb-4 line-clamp-3 relative z-10">{item.content}</p>
                  
                  <div className="flex flex-wrap gap-2 relative z-10">
                    {(item.tags || []).map((tag, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
