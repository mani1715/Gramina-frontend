import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { X, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const ENV_API_URL = process.env.REACT_APP_BACKEND_URL;
const API_URL = ENV_API_URL === 'undefined' || !ENV_API_URL ? '' : ENV_API_URL;

const ChatModal = ({ isOpen, onClose, applicationId, recipientName, recipientId }) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  
  const fetchMessages = async () => {
    if (!applicationId || !isOpen) return;
    try {
      const res = await axios.get(`${API_URL}/api/applications/${applicationId}/messages`, {
        withCredentials: true
      });
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      if (loading) setLoading(false);
    }
  };

  // Poll for messages
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen, applicationId]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const content = newMessage.trim();
    if (!content) return;
    
    setSending(true);
    setNewMessage(''); // optimistic clear
    
    try {
      const res = await axios.post(`${API_URL}/api/applications/${applicationId}/messages`, {
        content,
        receiverId: recipientId
      }, { withCredentials: true });
      
      setMessages(prev => [...prev, res.data]);
    } catch (err) {
      toast.error(language === 'en' ? 'Failed to send message' : 'సందేశం పంపడం విఫలమైంది');
      setNewMessage(content); // restore on fail
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center sm:p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-lg bg-white sm:rounded-3xl shadow-2xl flex flex-col h-[100dvh] sm:h-[80vh] sm:max-h-[700px] border-0 sm:border sm:border-slate-100 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-white z-10 shadow-sm relative">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg border border-emerald-200 shadow-inner">
                  {recipientName?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{recipientName}</h3>
                  <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                    {language === 'en' ? 'Online' : 'ఆన్‌లైన్ లో ఉన్నారు'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-slate-50 relative flex flex-col">
              {loading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                    <p className="text-slate-500 font-medium animate-pulse">
                      {language === 'en' ? 'Loading messages...' : 'సందేశాలను లోడ్ చేస్తోంది...'}
                    </p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100 text-center max-w-[80%]">
                    <p className="text-slate-500 text-sm">
                      {language === 'en' 
                        ? `Say hello to ${recipientName} to start the conversation!` 
                        : `${recipientName} తో సంభాషణ ప్రారంభించడానికి నమస్తే చెప్పండి!`}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pb-2">
                  {messages.map((msg, idx) => {
                    const isMe = msg.senderId === user.id;
                    const prevMsg = idx > 0 ? messages[idx - 1] : null;
                    const showHeader = !prevMsg || prevMsg.senderId !== msg.senderId;
                    
                    return (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`} 
                        key={msg.id}
                      >
                        {showHeader && (
                          <span className={`text-[11px] font-semibold mb-1 px-1 text-slate-400 ${isMe ? 'mr-1' : 'ml-1'}`}>
                            {isMe ? (language === 'en' ? 'You' : 'మీరు') : recipientName}
                          </span>
                        )}
                        <div
                          className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm sm:text-base relative group shadow-sm ${
                            isMe
                              ? 'bg-emerald-600 text-white rounded-br-none'
                              : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                          }`}
                        >
                          <p className="whitespace-pre-wrap word-break tracking-wide">{msg.content}</p>
                          
                          {/* Timestamp tooltip on hover */}
                          <div className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] whitespace-nowrap text-slate-400 bg-white/90 px-2 py-1 rounded shadow-sm border border-slate-100 ${
                            isMe ? 'right-full mr-2' : 'left-full ml-2'
                          }`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-slate-100 bg-white p-3 sm:p-4 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={language === 'en' ? 'Type a message...' : 'సందేశాన్ని టైప్ చేయండి...'}
                  rows={1}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 outline-none focus:border-emerald-500 focus:bg-white transition-all resize-none max-h-32 text-sm sm:text-base placeholder:text-slate-400 font-medium"
                  style={{ 
                    minHeight: '48px',
                    height: 'auto',
                  }}
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                  }}
                />
                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white p-3 rounded-2xl flex items-center justify-center transition-all h-[48px] w-[48px] self-end shrink-0 shadow-sm active:scale-95 disabled:active:scale-100"
                >
                  {sending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5 ml-0.5" />
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatModal;
