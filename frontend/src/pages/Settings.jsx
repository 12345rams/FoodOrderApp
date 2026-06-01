import { useEffect, useState } from 'react';
import api from '../services/api';

const initialForm = {
  businessName: '',
  businessType: '',
  description: '',
  address: '',
  phone: '',
  whatsappNumber: '',
  twilioAccountSid: '',
  twilioAuthToken: '',
  twilioWhatsappNumber: '',
  geminiApiKey: '',
  chatbotEnabled: true,
  automationEnabled: true,
  razorpayEnabled: false,
  razorpayPaymentBaseUrl: ''
};

export default function Settings() {
  const [form, setForm] = useState(initialForm);
  const [businessId, setBusinessId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');

  useEffect(() => {
    api
      .get('/api/business/me')
      .then((res) => {
        setForm({ ...initialForm, ...res.data.data });
        setBusinessId(res.data.data._id);
        if (res.data.data.location?.coordinates) {
          setLng(res.data.data.location.coordinates[0]);
          setLat(res.data.data.location.coordinates[1]);
        }
      })
      .catch(() => {});
  }, []);

  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  async function save() {
    setError('');
    setMessage('');
    setSaving(true);
    try {
      if (!form.businessName?.trim()) {
        setError('Business Name is required.');
        setSaving(false);
        return;
      }

      const payload = {
        ...form,
        location: {
          type: 'Point',
          coordinates: [Number(lng) || 0, Number(lat) || 0]
        }
      };

      if (businessId) {
        await api.put(`/api/business/${businessId}`, payload);
        setMessage('Business profile updated successfully!');
      } else {
        const res = await api.post('/api/business', payload);
        setBusinessId(res.data.data._id);
        setMessage('Business profile created successfully!');
      }
      
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  const renderInput = ({ label, field, type = "text", placeholder }) => (
    <div className="group" key={field}>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5 transition-colors group-focus-within:text-emerald-600">{label}</label>
      <input 
        type={type}
        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all duration-300 shadow-sm hover:shadow-md" 
        placeholder={placeholder || label} 
        value={form[field] ?? ''} 
        onChange={(e) => setField(field, e.target.value)} 
      />
    </div>
  );

  const renderToggle = ({ label, field, desc }) => (
    <div className="flex items-center justify-between p-5 bg-white/60 backdrop-blur-sm border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300" key={field}>
      <div>
        <p className="font-bold text-slate-800 text-base">{label}</p>
        <p className="text-sm text-slate-500 mt-0.5">{desc}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer hover:scale-105 transition-transform">
        <input 
          type="checkbox" 
          className="sr-only peer" 
          checked={!!form[field]} 
          onChange={(e) => setField(field, e.target.checked)} 
        />
        <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-emerald-500 peer-checked:to-teal-500 shadow-inner"></div>
      </label>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto pb-12 animate-fade-in relative">
      {/* Decorative Background Blob */}
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl -z-10"></div>

      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 tracking-tight">Settings</h1>
          <p className="text-slate-500 text-sm mt-1.5 font-medium">Manage your business profile and integrations elegantly.</p>
        </div>
        <button 
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold px-8 py-3 rounded-2xl transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
          onClick={save} 
          disabled={saving}
        >
          {saving ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}
          {activeTab === 'twilio' ? 'Save Twilio Settings' : activeTab === 'general' ? 'Save Profile' : activeTab === 'ai' ? 'Save AI Settings' : 'Save Changes'}
        </button>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-sm flex items-center gap-2 animate-fade-in">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {message}
        </div>
      )}
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl text-sm flex items-center gap-2 animate-fade-in">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Navigation Sidebar */}
        <div className="w-full md:w-72 space-y-2 shrink-0">
          <button 
            onClick={() => setActiveTab('general')}
            className={`w-full text-left px-5 py-4 rounded-2xl transition-all duration-300 font-semibold text-sm flex items-center gap-4 ${activeTab === 'general' ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/5 shadow-sm text-emerald-700 border border-emerald-500/20 translate-x-1' : 'text-slate-600 hover:bg-slate-100 hover:translate-x-1 border border-transparent'}`}
          >
            <div className={`p-2 rounded-xl ${activeTab === 'general' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-slate-200 text-slate-500'}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            General Profile
          </button>
          <button 
            onClick={() => setActiveTab('twilio')}
            className={`w-full text-left px-5 py-4 rounded-2xl transition-all duration-300 font-semibold text-sm flex items-center gap-4 ${activeTab === 'twilio' ? 'bg-gradient-to-r from-blue-500/10 to-cyan-500/5 shadow-sm text-blue-700 border border-blue-500/20 translate-x-1' : 'text-slate-600 hover:bg-slate-100 hover:translate-x-1 border border-transparent'}`}
          >
            <div className={`p-2 rounded-xl ${activeTab === 'twilio' ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20' : 'bg-slate-200 text-slate-500'}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            WhatsApp & Twilio
          </button>
          <button 
            onClick={() => setActiveTab('ai')}
            className={`w-full text-left px-5 py-4 rounded-2xl transition-all duration-300 font-semibold text-sm flex items-center gap-4 ${activeTab === 'ai' ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/5 shadow-sm text-purple-700 border border-purple-500/20 translate-x-1' : 'text-slate-600 hover:bg-slate-100 hover:translate-x-1 border border-transparent'}`}
          >
            <div className={`p-2 rounded-xl ${activeTab === 'ai' ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20' : 'bg-slate-200 text-slate-500'}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            AI & Automation
          </button>
          <button 
            onClick={() => setActiveTab('payments')}
            className={`w-full text-left px-5 py-4 rounded-2xl transition-all duration-300 font-semibold text-sm flex items-center gap-4 ${activeTab === 'payments' ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/5 shadow-sm text-amber-700 border border-amber-500/20 translate-x-1' : 'text-slate-600 hover:bg-slate-100 hover:translate-x-1 border border-transparent'}`}
          >
            <div className={`p-2 rounded-xl ${activeTab === 'payments' ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' : 'bg-slate-200 text-slate-500'}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            </div>
            Payments
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 border border-white p-8 min-h-[500px] transition-all duration-300">
            
            {activeTab === 'general' && (
              <div className="animate-fade-in space-y-6">
                <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg></div>
                  <h2 className="text-2xl font-bold text-slate-800">Business Profile</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {renderInput({ field: "businessName", label: "Business Name" })}
                  {renderInput({ field: "businessType", label: "Business Type", placeholder: "e.g. Restaurant, Retail" })}
                  <div className="md:col-span-2 group">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 transition-colors group-focus-within:text-emerald-600">Description</label>
                    <textarea 
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all duration-300 shadow-sm hover:shadow-md" 
                      rows={3}
                      value={form.description} 
                      onChange={(e) => setField('description', e.target.value)} 
                    />
                  </div>
                  {renderInput({ field: "phone", label: "Contact Phone" })}
                  {renderInput({ field: "rating", label: "Initial Rating (0-5)", type: "number" })}
                  <div className="md:col-span-2 border-t border-slate-100 pt-8 mt-4">
                    <h3 className="text-sm font-bold text-emerald-600 mb-5 uppercase tracking-wider flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>
                      Location Settings
                    </h3>
                    <div className="space-y-5 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                      {renderInput({ field: "address", label: "Full Business Address" })}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="group">
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5 transition-colors group-focus-within:text-emerald-600">Latitude</label>
                          <input type="number" step="any" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="e.g. 28.6139" />
                        </div>
                        <div className="group">
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5 transition-colors group-focus-within:text-emerald-600">Longitude</label>
                          <input type="number" step="any" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="e.g. 77.2090" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'twilio' && (
              <div className="animate-fade-in space-y-6">
                <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg></div>
                  <h2 className="text-2xl font-bold text-slate-800">WhatsApp & Twilio</h2>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-800 p-5 rounded-2xl text-sm border border-blue-100 mb-8 shadow-inner font-medium">
                  To connect your WhatsApp number, you need an active Twilio account and your API credentials.
                </div>
                <div className="space-y-6">
                  {renderInput({ field: "whatsappNumber", label: "Your Business WhatsApp Number", placeholder: "+1234567890" })}
                  <div className="grid md:grid-cols-2 gap-6 border-t border-slate-100 pt-8 mt-4">
                    {renderInput({ field: "twilioAccountSid", label: "Twilio Account SID", type: "password" })}
                    {renderInput({ field: "twilioAuthToken", label: "Twilio Auth Token", type: "password" })}
                    {renderInput({ field: "twilioWhatsappNumber", label: "Twilio Sandbox/Sender Number", placeholder: "whatsapp:+14155238886" })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="animate-fade-in space-y-6">
                <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
                  <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div>
                  <h2 className="text-2xl font-bold text-slate-800">AI Engine & Automation</h2>
                </div>
                <div className="space-y-5 mb-10">
                  {renderToggle({ field: "chatbotEnabled", label: "Enable Auto-Replies", desc: "AI will automatically respond to incoming customer messages." })}
                  {renderToggle({ field: "automationEnabled", label: "Enable Workflow Automation", desc: "Automate order processing and status updates." })}
                </div>
                <div className="border-t border-slate-100 pt-8">
                  <h3 className="text-sm font-bold text-purple-600 mb-5 uppercase tracking-wider flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    Advanced AI Configuration
                  </h3>
                  {renderInput({ field: "geminiApiKey", label: "Google Gemini API Key (Optional Override)", type: "password", placeholder: "AI falls back to system default if empty" })}
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="animate-fade-in space-y-6">
                <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
                  <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg></div>
                  <h2 className="text-2xl font-bold text-slate-800">Payment Gateway</h2>
                </div>
                <div className="space-y-6 mb-8">
                  {renderToggle({ field: "razorpayEnabled", label: "Enable Razorpay Integration", desc: "Allow customers to complete transactions securely." })}
                </div>
                {renderInput({ field: "razorpayPaymentBaseUrl", label: "Razorpay Payment Base URL", placeholder: "https://..." })}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
