import { useEffect, useState } from 'react';
import api from '../services/api';
import ChatWindow from '../components/ChatWindow';

export default function Chats() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState('');

  async function loadCustomers() {
    const res = await api.get('/api/customers');
    setCustomers(res.data.data);
  }

  async function loadMessages(customerId) {
    const res = await api.get(`/api/messages/${customerId}`);
    setMessages(res.data.data);
  }

  useEffect(() => {
    loadCustomers().catch(() => {});
  }, []);

  const filteredCustomers = customers.filter(c => 
    (c.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (c.whatsappNumber || '').includes(search)
  );

  return (
    <div className="flex h-[85vh] bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
      {/* Sidebar - Customer List */}
      <div className="w-1/3 flex flex-col border-r border-slate-100 bg-slate-50/50">
        <div className="p-4 border-b border-slate-100 bg-white">
          <h2 className="text-xl font-bold text-slate-800 mb-3">Messages</h2>
          <div className="relative">
            <svg className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input 
              type="text" 
              placeholder="Search chats..." 
              className="w-full bg-slate-100 text-sm rounded-full pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-200">
          {filteredCustomers.length === 0 ? (
             <div className="text-center text-slate-400 text-sm mt-10">No customers found</div>
          ) : (
            filteredCustomers.map((c) => (
              <button
                key={c._id}
                className={`w-full flex items-center gap-3 p-3 rounded-xl mb-1 transition-all duration-200 ${selectedCustomer?._id === c._id ? 'bg-emerald-50 shadow-sm border border-emerald-100/50' : 'hover:bg-white border border-transparent'}`}
                onClick={async () => {
                  setSelectedCustomer(c);
                  await loadMessages(c._id);
                }}
              >
                <div className="w-12 h-12 flex-shrink-0 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  {(c.name || 'C')[0].toUpperCase()}
                </div>
                <div className="flex-1 text-left overflow-hidden">
                  <p className="font-semibold text-slate-800 truncate">{c.name || 'Customer'}</p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{c.whatsappNumber}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="w-2/3 bg-[#efeae2] flex flex-col relative">
        <ChatWindow
          customer={selectedCustomer}
          messages={messages}
          onSend={async (body, contentSid, contentVariables) => {
            if (!selectedCustomer) return;
            await api.post(`/api/messages/${selectedCustomer._id}/reply`, { body, contentSid, contentVariables });
            await loadMessages(selectedCustomer._id);
          }}
        />
      </div>
    </div>
  );
}
