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

  const Input = ({ label, field, type = "text", placeholder }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input 
        type={type}
        className="w-full border border-slate-200 rounded-xl px-4 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" 
        placeholder={placeholder || label} 
        value={form[field] ?? ''} 
        onChange={(e) => setField(field, e.target.value)} 
      />
    </div>
  );

  const Toggle = ({ label, field, desc }) => (
    <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
      <div>
        <p className="font-medium text-slate-800">{label}</p>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          className="sr-only peer" 
          checked={!!form[field]} 
          onChange={(e) => setField(field, e.target.checked)} 
        />
        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
      </label>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your business profile and third-party integrations.</p>
        </div>
        <button 
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-2 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-70"
          onClick={save} 
          disabled={saving}
        >
          {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}
          Save Changes
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

      <div className="flex flex-col md:flex-row gap-6">
        {/* Navigation Sidebar */}
        <div className="w-full md:w-64 space-y-1">
          <button 
            onClick={() => setActiveTab('general')}
            className={`w-full text-left px-4 py-3 rounded-xl transition-colors font-medium text-sm flex items-center gap-3 ${activeTab === 'general' ? 'bg-white shadow-sm text-emerald-600 border border-slate-100' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            General Profile
          </button>
          <button 
            onClick={() => setActiveTab('twilio')}
            className={`w-full text-left px-4 py-3 rounded-xl transition-colors font-medium text-sm flex items-center gap-3 ${activeTab === 'twilio' ? 'bg-white shadow-sm text-emerald-600 border border-slate-100' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            WhatsApp & Twilio
          </button>
          <button 
            onClick={() => setActiveTab('ai')}
            className={`w-full text-left px-4 py-3 rounded-xl transition-colors font-medium text-sm flex items-center gap-3 ${activeTab === 'ai' ? 'bg-white shadow-sm text-emerald-600 border border-slate-100' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            AI & Automation
          </button>
          <button 
            onClick={() => setActiveTab('payments')}
            className={`w-full text-left px-4 py-3 rounded-xl transition-colors font-medium text-sm flex items-center gap-3 ${activeTab === 'payments' ? 'bg-white shadow-sm text-emerald-600 border border-slate-100' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            Payments
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 min-h-[400px]">
            
            {activeTab === 'general' && (
              <div className="animate-fade-in space-y-6">
                <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-4">Business Profile</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <Input field="businessName" label="Business Name" />
                  <Input field="businessType" label="Business Type" placeholder="e.g. Restaurant, Retail" />
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <textarea 
                      className="w-full border border-slate-200 rounded-xl px-4 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" 
                      rows={3}
                      value={form.description} 
                      onChange={(e) => setField('description', e.target.value)} 
                    />
                  </div>
                  <Input field="phone" label="Contact Phone" />
                  <Input field="rating" label="Initial Rating (0-5)" type="number" />
                  <div className="md:col-span-2 border-t border-slate-100 pt-6 mt-2">
                    <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Location Settings</h3>
                    <div className="space-y-4">
                      <Input field="address" label="Full Business Address" />
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Latitude</label>
                          <input type="number" step="any" className="w-full border border-slate-200 rounded-xl px-4 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="e.g. 28.6139" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Longitude</label>
                          <input type="number" step="any" className="w-full border border-slate-200 rounded-xl px-4 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="e.g. 77.2090" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'twilio' && (
              <div className="animate-fade-in space-y-6">
                <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-4">WhatsApp & Twilio Integration</h2>
                <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm border border-blue-100 mb-6">
                  To connect your WhatsApp number, you need an active Twilio account and your API credentials.
                </div>
                <div className="space-y-6">
                  <Input field="whatsappNumber" label="Your Business WhatsApp Number" placeholder="+1234567890" />
                  <div className="grid md:grid-cols-2 gap-6 border-t border-slate-100 pt-6">
                    <Input field="twilioAccountSid" label="Twilio Account SID" type="password" />
                    <Input field="twilioAuthToken" label="Twilio Auth Token" type="password" />
                    <Input field="twilioWhatsappNumber" label="Twilio Sandbox/Sender Number" placeholder="whatsapp:+14155238886" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="animate-fade-in space-y-6">
                <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-4">AI Engine & Automation</h2>
                <div className="space-y-4 mb-8">
                  <Toggle field="chatbotEnabled" label="Enable Auto-Replies" desc="AI will automatically respond to incoming customer messages." />
                  <Toggle field="automationEnabled" label="Enable Workflow Automation" desc="Automate order processing and status updates." />
                </div>
                <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Advanced</h3>
                <Input field="geminiApiKey" label="Google Gemini API Key (Optional Override)" type="password" placeholder="AI falls back to system default if empty" />
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="animate-fade-in space-y-6">
                <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-4">Payment Gateway (Razorpay)</h2>
                <div className="space-y-6 mb-6">
                  <Toggle field="razorpayEnabled" label="Enable Razorpay" desc="Allow customers to pay via Razorpay links." />
                </div>
                <Input field="razorpayPaymentBaseUrl" label="Razorpay Payment Base URL" placeholder="https://..." />
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
