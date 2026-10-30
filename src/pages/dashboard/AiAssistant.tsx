import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Image as ImageIcon, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { askMedicalAssistant } from '../../services/geminiService';
import type { IMessage } from '../../models';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import ReactMarkdown from 'react-markdown';

export default function AiAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<IMessage[]>([
    { id: '1', text: "Hi! I'm your HealthSphere AI. How can I help you today?", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('ai_chat_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
        
      if (error) {
        console.error('Error fetching chat history:', error);
        return;
      }

      if (data && data.length > 0) {
        const historyMsgs: IMessage[] = [];
        data.forEach((row: any) => {
          historyMsgs.push({ id: row.id + '_user', text: row.user_message, sender: 'user' });
          historyMsgs.push({ id: row.id + '_ai', text: row.ai_response, sender: 'ai' });
        });
        setMessages(prev => [...prev.filter(m => m.id === '1'), ...historyMsgs]);
      }
    };
    fetchHistory();
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: IMessage = { id: Date.now().toString(), text: input.trim(), sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const responseText = await askMedicalAssistant(userMessage.text);
      const aiMessage: IMessage = { id: Date.now().toString(), text: responseText, sender: 'ai' };
      setMessages(prev => [...prev, aiMessage]);

      if (user) {
        const { error } = await supabase.from('ai_chat_history').insert({
          user_id: user.id,
          user_message: userMessage.text,
          ai_response: responseText,
        });
        if (error) console.error('Error saving chat:', error);
      }
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { id: Date.now().toString(), text: "Sorry, I'm having trouble connecting right now.", sender: 'ai' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickQuestions = [
    "What's my sleep quality?",
    "Lower blood pressure diet",
    "Explain my blood test",
    "Suggest a workout"
  ];

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center space-x-3 mb-6 flex-shrink-0">
        <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-poppins font-bold text-slate-900">HealthSphere AI</h1>
          <p className="text-gray-500 text-sm">Your personal medical companion</p>
        </div>
      </div>

      <div className="glass-card rounded-3xl flex-1 flex flex-col overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start space-x-4 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.sender === 'ai' ? 'bg-gradient-to-br from-blue-100 to-blue-50 text-primary' : 'bg-slate-100 text-slate-600'}`}>
                  {msg.sender === 'ai' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>
                <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${msg.sender === 'ai' ? 'bg-white border border-gray-100 text-slate-700' : 'bg-primary text-white'}`}>
                  {msg.sender === 'ai' ? (
                    <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:font-bold prose-a:text-blue-600">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="leading-relaxed">{msg.text}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
             <motion.div 
               initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
               className="flex items-start space-x-4"
             >
               <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm bg-gradient-to-br from-blue-100 to-blue-50 text-primary">
                 <Bot className="w-5 h-5" />
               </div>
               <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center space-x-2">
                 <span className="text-sm text-slate-500 italic mr-2">HealthSphere AI is thinking...</span>
                 <motion.div className="w-2 h-2 bg-gray-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} />
                 <motion.div className="w-2 h-2 bg-gray-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                 <motion.div className="w-2 h-2 bg-gray-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
               </div>
             </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-gray-100">
           <div className="flex space-x-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
             {quickQuestions.map((q, i) => (
               <button key={i} onClick={() => { setInput(q); }} className="whitespace-nowrap px-4 py-2 bg-blue-50 text-primary hover:bg-blue-100 rounded-full text-sm font-medium transition-colors border border-blue-100">
                 {q}
               </button>
             ))}
           </div>
           
           <form onSubmit={handleSubmit} className="flex items-center space-x-2 bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
             <button type="button" className="p-2 text-gray-400 hover:text-primary transition-colors"><Paperclip className="w-5 h-5" /></button>
             <button type="button" className="p-2 text-gray-400 hover:text-primary transition-colors"><ImageIcon className="w-5 h-5" /></button>
             <input 
               type="text" 
               value={input}
               onChange={(e) => setInput(e.target.value)}
               placeholder="Ask anything about your health..." 
               className="flex-1 bg-transparent border-none focus:outline-none text-slate-700"
             />
             <button 
               type="submit" 
               disabled={!input.trim() || isTyping}
               className="p-3 bg-primary text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               <Send className="w-5 h-5" />
             </button>
           </form>
        </div>
      </div>
    </div>
  );
}
