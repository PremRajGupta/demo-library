import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Loader2, Sparkles, MessageCircle, ArrowUp } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

interface Message {
  text: string;
  isBot: boolean;
}

const SYSTEM_PROMPT = `You are the official AI Assistant for Demo Library.
Be helpful, polite, and concise. 
IMPORTANT FORMATTING: Do NOT use markdown symbols like ** or * or #. Use plain text and real newlines to separate lists and points.
IMPORTANT LANGUAGE RULE: ALWAYS reply in the exact language the user uses. If the user asks in pure English, reply strictly in English. If the user asks in Hindi or Hinglish (e.g. "kaise ho"), reply in friendly Hinglish.
Here is the information you know:
- Library Name: Demo Library
- Address: Tehta, Jehanabad
- Timing: 24 Hours Open
- Contact Number: 7488252019
- Naksha Ghar Contact Number: 7985434308
- Services: Premium seating, Free Wi-Fi, Daily Newspapers, Magazines, AC environment, RO Water, Solar Power.
- Fees/Shift Pricing: 
  * 4 Hours: ₹300/month
  * 6 Hours: ₹400/month
  * 8 Hours: ₹500/month
  * 12 Hours: ₹600/month
  * 24 Hours: ₹800/month
  * Night Shift: ₹350/month
Do not make up any information. If you don't know, ask the user to call the Contact Number.`;

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: 'Hello! I am the Demo Library Assistant. How can I help you today?', isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { text: userText, isBot: false }]);
    setIsLoading(true);

    try {
      if (!apiKey) {
        throw new Error("API Key is missing.");
      }

      const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
      
      // Construct prompt with history
      const historyText = messages.map(m => `${m.isBot ? 'Assistant' : 'User'}: ${m.text}`).join('\n');
      const fullPrompt = `${SYSTEM_PROMPT}\n\nChat History:\n${historyText}\nUser: ${userText}\nAssistant:`;

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const botText = response.text();

      setMessages(prev => [...prev, { text: botText, isBot: true }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        text: 'Sorry, I am having trouble connecting right now. Please try again later or contact 7488252019.', 
        isBot: true 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Buttons */}
      {!isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col gap-4">
          <a
            href="https://wa.me/917488252019?text=Hi! I want to know more about Demo Library."
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 sm:p-4 bg-gradient-to-tr from-green-500 to-emerald-600 text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(34,197,94,0.5)] transition-all transform hover:scale-110 flex items-center justify-center animate-bounce group"
            style={{ animationDuration: '3.5s' }}
            title="Chat on WhatsApp"
          >
            <MessageCircle size={28} className="group-hover:rotate-12 transition-transform duration-300" />
          </a>

          <button
            onClick={() => setIsOpen(true)}
            className="p-3 sm:p-4 bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(99,102,241,0.5)] transition-all transform hover:scale-110 flex items-center justify-center animate-bounce group"
            style={{ animationDuration: '3s' }}
            title="Ask AI Assistant"
          >
            <Bot size={28} className="group-hover:rotate-12 transition-transform duration-300" />
            <Sparkles size={14} className="absolute top-2 right-2 text-yellow-300 animate-pulse" />
          </button>

          {showScrollTop && (
            <button
              onClick={scrollToTop}
              className="w-12 h-12 sm:w-14 sm:h-14 mx-auto bg-white/90 dark:bg-[#1e293b]/90 backdrop-blur-xl text-slate-700 dark:text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(59,130,246,0.4)] border border-slate-200/50 dark:border-slate-700/50 hover:bg-gradient-to-tr hover:from-blue-600 hover:to-indigo-600 hover:text-white hover:border-transparent transition-all duration-300 transform hover:-translate-y-1.5 flex items-center justify-center group animate-fade-in"
              title="Scroll to Top"
            >
              <ArrowUp size={24} className="group-hover:-translate-y-1 transition-transform duration-300" />
            </button>
          )}
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 w-[calc(100vw-32px)] sm:w-[350px] h-[80vh] sm:h-[500px] max-h-[800px] sm:bottom-6 sm:right-6 bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-slate-200 dark:border-slate-800">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-2 rounded-full">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm">Galaxy Assistant</h3>
                <p className="text-[10px] text-blue-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-pulse"></span>
                  Online
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-[#0b1120]">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex gap-2 max-w-[85%] ${msg.isBot ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.isBot ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600'}`}>
                  {msg.isBot ? <Bot size={16} /> : <User size={16} />}
                </div>
                <div 
                  className={`p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.isBot 
                      ? 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-tl-none shadow-sm' 
                      : 'bg-blue-600 text-white rounded-tr-none shadow-md'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-2 max-w-[85%] mr-auto">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
                  <Bot size={16} />
                </div>
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-tl-none shadow-sm flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-blue-600" />
                  <span className="text-xs text-slate-500">Typing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form 
            onSubmit={handleSend}
            className="p-3 bg-white dark:bg-[#0f172a] border-t border-slate-200 dark:border-slate-800 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={18} className="ml-0.5" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
