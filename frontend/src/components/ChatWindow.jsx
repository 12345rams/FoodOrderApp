import { useState, useEffect, useRef } from 'react';

export default function ChatWindow({ customer, messages, onSend }) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [templateForm, setTemplateForm] = useState({ contentSid: '', var1: '', var2: '' });
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!customer) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-[#f0f2f5] h-full">
        <div className="w-24 h-24 mb-6 text-slate-300">
          <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 2.98.97 4.29L1 23l6.71-1.97C9.02 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.35 0-2.65-.3-3.83-.84l-.27-.12-2.85.84.76-2.77-.14-.29A7.95 7.95 0 014 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8zm4.18-5.63c-.23-.11-1.36-.67-1.57-.75-.21-.08-.36-.11-.51.11s-.59.75-.72.91c-.13.15-.26.17-.49.06-.23-.11-.97-.36-1.85-1.15-.68-.61-1.14-1.37-1.27-1.6-.13-.23-.01-.35.1-.47.11-.11.23-.27.34-.41.11-.14.15-.23.23-.39.08-.15.04-.29-.02-.41s-.51-1.24-.7-1.7c-.19-.45-.38-.39-.51-.39-.13 0-.27 0-.41 0-.14 0-.37.05-.56.26-.19.21-.73.71-.73 1.74s.75 2.02.85 2.16c.1.14 1.48 2.26 3.58 3.16.5.22.89.34 1.2.44.5.16.96.14 1.32.08.41-.06 1.36-.56 1.55-1.1.19-.54.19-1.01.13-1.1-.06-.1-.21-.16-.44-.27z"></path></svg>
        </div>
        <h2 className="text-2xl font-light text-slate-700">WhatsApp Web</h2>
        <p className="mt-2 text-sm">Select a customer from the left to start messaging.</p>
      </div>
    );
  }

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await onSend(text);
      setText('');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#efeae2] relative overflow-hidden">
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'url("https://static.whatsapp.net/rsrc.php/v3/yl/r/gi_DckOUM5a.png")', backgroundRepeat: 'repeat' }}></div>

      {/* Header */}
      <div className="h-16 bg-[#f0f2f5] border-b border-slate-200 flex items-center px-4 relative z-10 shadow-sm flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center text-slate-600 font-bold mr-3 shadow-sm">
          {(customer.name || 'C')[0].toUpperCase()}
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 leading-tight">{customer.name || 'Customer'}</h3>
          <p className="text-xs text-slate-500">{customer.whatsappNumber}</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 relative z-10 scrollbar-thin scrollbar-thumb-slate-300">
        <div className="text-center text-xs text-slate-500 bg-white/60 w-fit mx-auto px-3 py-1 rounded-md shadow-sm mb-4">
          Chat started
        </div>
        
        {messages.map((m) => {
          const isOutgoing = m.direction === 'outgoing';
          return (
            <div key={m._id} className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`relative max-w-[75%] px-3 py-2 text-[15px] shadow-sm rounded-lg ${
                  isOutgoing 
                    ? 'bg-[#d9fdd3] text-slate-900 rounded-tr-none' 
                    : 'bg-white text-slate-900 rounded-tl-none'
                }`}
              >
                {/* Bubble Tail */}
                <div className={`absolute top-0 w-3 h-3 ${isOutgoing ? '-right-2 bg-[#d9fdd3]' : '-left-2 bg-white'}`} style={{ clipPath: isOutgoing ? 'polygon(0 0, 0 100%, 100% 0)' : 'polygon(100% 0, 100% 100%, 0 0)' }}></div>
                
                <div className="whitespace-pre-wrap break-words">{m.body}</div>
                <div className={`text-[10px] text-right mt-1 ${isOutgoing ? 'text-emerald-700/80' : 'text-slate-400'}`}>
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {showTemplateForm && (
        <div className="bg-white border-t border-slate-200 p-4 relative z-10 flex-shrink-0 animate-fade-in shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Send Twilio Template
            </h4>
            <button onClick={() => setShowTemplateForm(false)} className="text-slate-400 hover:text-slate-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="flex gap-3 mb-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Content SID *</label>
              <input 
                type="text" 
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-mono" 
                placeholder="HX..." 
                value={templateForm.contentSid} 
                onChange={e => setTemplateForm(p => ({...p, contentSid: e.target.value}))}
              />
            </div>
            <div className="w-1/4">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Variable 1</label>
              <input 
                type="text" 
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" 
                placeholder="e.g. 12/1" 
                value={templateForm.var1} 
                onChange={e => setTemplateForm(p => ({...p, var1: e.target.value}))}
              />
            </div>
            <div className="w-1/4">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Variable 2</label>
              <input 
                type="text" 
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" 
                placeholder="e.g. 3pm" 
                value={templateForm.var2} 
                onChange={e => setTemplateForm(p => ({...p, var2: e.target.value}))}
              />
            </div>
          </div>
          <div className="flex justify-end">
             <button
                disabled={!templateForm.contentSid || sending}
                onClick={async () => {
                  if (!templateForm.contentSid || sending) return;
                  setSending(true);
                  try {
                    await onSend(null, templateForm.contentSid, { "1": templateForm.var1, "2": templateForm.var2 });
                    setTemplateForm({ contentSid: '', var1: '', var2: '' });
                    setShowTemplateForm(false);
                  } finally {
                    setSending(false);
                  }
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                Send Template
             </button>
          </div>
        </div>
      )}

      <div className="bg-[#f0f2f5] px-4 py-3 flex items-center gap-3 relative z-10 flex-shrink-0">
        <button
          onClick={() => setShowTemplateForm(!showTemplateForm)}
          className={`w-11 h-11 flex-shrink-0 rounded-full flex items-center justify-center transition-all ${showTemplateForm ? 'bg-purple-100 text-purple-600' : 'bg-white text-slate-500 hover:bg-slate-50 hover:text-purple-500 shadow-sm border border-slate-200'}`}
          title="Send Template"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </button>
        <div className="flex-1 bg-white rounded-xl shadow-sm flex items-end px-4 py-2 border border-slate-200 focus-within:border-emerald-400 focus-within:ring-1 focus-within:ring-emerald-400 transition-all">
          <textarea 
            className="w-full max-h-32 bg-transparent outline-none resize-none overflow-hidden" 
            rows="1"
            value={text} 
            onChange={(e) => {
              setText(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message" 
          />
        </div>
        <button
          disabled={!text.trim() || sending}
          onClick={handleSend}
          className="w-11 h-11 flex-shrink-0 rounded-full bg-[#00a884] text-white flex items-center justify-center shadow-md hover:bg-[#008f6f] transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
        >
          {sending ? (
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          ) : (
            <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
          )}
        </button>
      </div>
    </div>
  );
}
