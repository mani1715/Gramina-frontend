import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { MessageCircle, X, ChevronLeft, Send, Loader2, Circle } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const GlobalChatWidget = () => {
  const { t, language } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeChats, setActiveChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(false);
  
  const [selectedChat, setSelectedChat] = useState(null); // { applicationId, recipientName, recipientId, jobTitle }
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef(null);
  
  const fetchActiveChats = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await axios.get(`${API_URL}/api/chats/active`, { withCredentials: true });
      // Only keep chats where the current user is the applicant
      setActiveChats(res.data.filter(c => c.isApplicant));
    } catch (err) {
      console.error("Failed to fetch chats:", err);
    } finally {
      setLoadingChats(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
      const res = await axios.get(`${API_URL}/api/applications/${selectedChat.applicationId}/messages`, {
        withCredentials: true
      });
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Poll chats periodically
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      if (activeChats.length === 0) setLoadingChats(true);
      fetchActiveChats();
      const interval = setInterval(fetchActiveChats, 10000);
      return () => clearInterval(interval);
    }
  }, [isOpen, isAuthenticated]);

  // Lock body scroll when widget is open
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

  // Poll messages when a chat is selected
  useEffect(() => {
    if (selectedChat) {
      setLoadingMessages(true);
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedChat]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const content = newMessage.trim();
    if (!content || !selectedChat) return;
    
    setSending(true);
    setNewMessage('');
    
    try {
      const res = await axios.post(`${API_URL}/api/applications/${selectedChat.applicationId}/messages`, {
        content,
        receiverId: selectedChat.recipientId
      }, { withCredentials: true });
      
      setMessages(prev => [...prev, res.data]);
    } catch (err) {
      toast.error(language === 'en' ? 'Failed to send message' : 'సందేశం పంపడం విఫలమైంది');
      setNewMessage(content);
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

  // Hide widget completely on Give Gig page as requested
  if (!isAuthenticated || location.pathname === '/give-gig') return null;

  return createPortal(
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center z-50 hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-0 md:p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full h-full md:w-[800px] md:h-[600px] md:max-h-[85vh] bg-white md:rounded-3xl shadow-2xl flex overflow-hidden border-0 md:border md:border-slate-200"
            >
            {/* LEFT SIDEBAR: Chat List */}
            <div className={`w-full md:w-1/3 bg-slate-50 border-r border-slate-200 flex flex-col ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
              <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center z-10">
                <h3 className="font-bold text-slate-800 text-lg">
                  {language === 'en' ? 'Messages' : 'సందేశాలు'}
                </h3>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="md:hidden p-2 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-2">
                {loadingChats ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
                  </div>
                ) : activeChats.length === 0 ? (
                  <div className="text-center p-6 text-slate-500 text-sm">
                    {language === 'en' ? 'No active chats found.' : 'క్రియాశీల చాట్‌లు కనుగొనబడలేదు.'}
                  </div>
                ) : (
                  activeChats.map(chat => (
                    <div 
                      key={chat.applicationId}
                      onClick={() => setSelectedChat(chat)}
                      className={`p-3 rounded-2xl cursor-pointer transition-all mb-1 ${
                        selectedChat?.applicationId === chat.applicationId 
                          ? 'bg-emerald-100/50 border border-emerald-200' 
                          : 'hover:bg-white border border-transparent'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{chat.jobTitle}</h4>
                        {chat.isApplicant && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium ml-2 shrink-0">Applied</span>}
                      </div>
                      <p className="text-xs text-emerald-600 font-semibold mb-1">{chat.recipientName}</p>
                      {chat.latestMessage && (
                        <p className="text-xs text-slate-500 line-clamp-1">{chat.latestMessage}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* RIGHT SIDEBAR: Chat Area */}
            <div className={`w-full md:w-2/3 flex flex-col bg-slate-50 relative ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
              
              {!selectedChat ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-6 relative z-10 w-full h-full">
                  <div className="absolute top-4 right-4 md:block hidden">
                     <button 
                      onClick={() => setIsOpen(false)}
                      className="p-2 text-slate-400 hover:text-red-500 rounded-full hover:bg-slate-100 transition-colors"
                     >
                      <X className="w-5 h-5" />
                     </button>
                  </div>
                  <MessageCircle className="w-16 h-16 mb-4 opacity-50" />
                  <p>{language === 'en' ? 'Select a chat from the left to start messaging' : 'సందేశం పంపడానికి ఎడమవైపు నుండి ఒక చాట్ ఎంచుకోండి'}</p>
                </div>
              ) : (
                <>
                  <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center z-10 shadow-sm relative">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setSelectedChat(null)}
                        className="md:hidden -ml-2 p-1 text-slate-500 hover:text-slate-800"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg border border-emerald-200 shadow-inner">
                        {selectedChat.recipientName?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm md:text-base leading-tight">{selectedChat.recipientName}</h3>
                        <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                          {selectedChat.jobTitle}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsOpen(false)}
                      className="p-2 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors hidden md:block"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 md:p-5 relative">
                    {loadingMessages ? (
                      <div className="flex h-full items-center justify-center">
                        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-slate-500 text-sm bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
                          {language === 'en' ? 'Say hello!' : 'నమస్తే చెప్పండి!'}
                        </p>
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
                                <span className={`text-[10px] font-semibold mb-1 px-1 text-slate-400 ${isMe ? 'mr-1' : 'ml-1'}`}>
                                  {isMe ? (language === 'en' ? 'You' : 'మీరు') : selectedChat.recipientName}
                                </span>
                              )}
                              <div
                                className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm relative group shadow-sm ${
                                  isMe
                                    ? 'bg-emerald-600 text-white rounded-br-none'
                                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                                }`}
                              >
                                <p className="whitespace-pre-wrap word-break">{msg.content}</p>
                              </div>
                            </motion.div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-200 bg-white p-3 md:p-4 z-10">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={language === 'en' ? 'Type a message...' : 'సందేశాన్ని టైప్ చేయండి...'}
                        rows={1}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 outline-none focus:border-emerald-500 focus:bg-white transition-all resize-none max-h-32 text-sm placeholder:text-slate-400 font-medium"
                        style={{ minHeight: '48px' }}
                        onInput={(e) => {
                          e.target.style.height = 'auto';
                          e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                        }}
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white p-3 rounded-2xl flex items-center justify-center transition-all h-[48px] w-[48px] self-end shrink-0 shadow-sm"
                      >
                        {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>,
    document.body
  );
};

export default GlobalChatWidget;
