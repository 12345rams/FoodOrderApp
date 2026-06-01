import { useState } from 'react';
import api from '../services/api';

export default function AdminTemplateSender() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    to: '',
    contentSid: 'HXb5b62575e6e4ff6129ad7c8efe1f983e',
    var1: '12/1',
    var2: '3pm'
  });

  const setField = (field, value) => setForm(p => ({ ...p, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const payload = {
        to: form.to,
        contentSid: form.contentSid,
        contentVariables: JSON.stringify({
          "1": form.var1,
          "2": form.var2
        })
      };

      const res = await api.post('/api/admin/send-template', payload);
      setSuccess(`Template sent successfully! SID: ${res.data.data.sid}`);
      setForm(p => ({ ...p, to: '' })); // clear just the phone number for easy re-sending
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send template. Ensure you are an Admin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 shadow-sm border border-purple-200">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Admin Template Blaster</h1>
          <p className="text-slate-500 text-sm mt-1">Send pre-approved Twilio Content Templates (with buttons/lists) directly to users.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="font-semibold text-slate-800">Send Template Message</h2>
        </div>
        
        <div className="p-6 space-y-6">
          {success && (
            <div className="p-4 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-sm flex items-start gap-2">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {success}
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl text-sm flex items-start gap-2">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Customer WhatsApp Number *</label>
            <input 
              type="text" 
              required
              className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors" 
              placeholder="+919569592952" 
              value={form.to} 
              onChange={(e) => setField('to', e.target.value)} 
            />
            <p className="text-xs text-slate-500 mt-1">Must include country code.</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Twilio Content SID *</label>
            <input 
              type="text" 
              required
              className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors font-mono text-sm" 
              value={form.contentSid} 
              onChange={(e) => setField('contentSid', e.target.value)} 
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Template Variable 1</label>
              <input 
                type="text" 
                className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors" 
                placeholder="e.g. 12/1" 
                value={form.var1} 
                onChange={(e) => setField('var1', e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Template Variable 2</label>
              <input 
                type="text" 
                className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors" 
                placeholder="e.g. 3pm" 
                value={form.var2} 
                onChange={(e) => setField('var2', e.target.value)} 
              />
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button 
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-70"
          >
            {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>}
            Blast Template
          </button>
        </div>
      </form>
    </div>
  );
}
