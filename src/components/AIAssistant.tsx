import React, { useState, useRef, useEffect } from 'react';

type Message = { sender: 'user' | 'ai'; text: string };

const AIAssistant: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const send = async () => {
    const prompt = input.trim();
    if (!prompt) return;
    setMessages((m) => [...m, { sender: 'user', text: prompt }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3001/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      const text = data?.text || data?.result || JSON.stringify(data);
      setMessages((m) => [...m, { sender: 'ai', text }]);
    } catch (err) {
      setMessages((m) => [...m, { sender: 'ai', text: 'AI request failed. Try again later.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {open ? (
        <div className="w-80 h-96 bg-white rounded-xl shadow-lg flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <div className="font-semibold">MediFind AI Assistant</div>
            <div className="text-sm text-gray-500">🇬🇭</div>
            <button onClick={() => setOpen(false)} className="text-sm text-gray-600">Close</button>
          </div>

          <div ref={scrollRef} className="flex-1 p-3 overflow-auto space-y-3 text-sm">
            {messages.length === 0 && (
              <div className="text-gray-500">Ask the assistant to help find medicines, check availability, or get tips.</div>
            )}
            {messages.map((m, idx) => (
              <div key={idx} className={m.sender === 'user' ? 'text-right' : 'text-left'}>
                <div className={`inline-block px-3 py-2 rounded-lg ${m.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
                placeholder="Ask: Where to find Paracetamol in Accra?"
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
              />
              <button disabled={loading} onClick={send} className="px-3 py-2 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-lg text-sm">
                {loading ? '...' : 'Ask'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-full shadow-lg"
        >
          AI Assistant
        </button>
      )}
    </div>
  );
};

export default AIAssistant;
