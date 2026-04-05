import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { MessageCircle, X, ChevronLeft, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const GigChatModal = ({ isOpen, onClose, job }) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  
  const [acceptedApplicants, setAcceptedApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  
  const [selectedAppId, setSelectedAppId] = useState(null); // application ID
  const [selectedRecipientId, setSelectedRecipientId] = useState(null); // user ID of applicant
  const [selectedRecipientName, setSelectedRecipientName] = useState('');
  
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  // Fetch accepted applicants for this job whenever it opens
  useEffect(() => {
    const fetchApplicants = async () => {
      if (!job || !isOpen) return;
      setLoadingApplicants(true);
      try {
        const res = await axios.get(`${API_URL}/api/job-applicants/${job.id}`, { withCredentials: true });
        // Only get accepted applicants
        const accepted = res.data.filter(app => app.status === 'accepted');
        setAcceptedApplicants(accepted);
      } catch (err) {
        console.error("Failed to fetch applicants:", err);
      } finally {
        setLoadingApplicants(false);
      }
    };
    
    if (isOpen) {
      fetchApplicants();
    } else {
      // Clear state when closed
      setSelectedAppId(null);
      setMessages([]);
    }
  }, [isOpen, job]);

  const fetchMessages = async () => {
    if (!selectedAppId || !isOpen) return;
    try {
      const res = await axios.get(`${API_URL}/api/applications/${selectedAppId}/messages`, {
        withCredentials: true
      });
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Poll messages when a chat is selected
  useEffect(() => {
    if (selectedAppId && isOpen) {
      setLoadingMessages(true);
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedAppId, isOpen]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const content = newMessage.trim();
    if (!content || !selectedAppId) return;
    
    setSending(true);
    setNewMessage('');
    
    try {
      const res = await axios.post(`${API_URL}/api/applications/${selectedAppId}/messages`, {
        content,
        receiverId: selectedRecipientId
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

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-0 md:p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full h-[100dvh] md:w-[900px] md:h-[650px] md:max-h-[85vh] bg-white md:rounded-3xl shadow-2xl flex overflow-hidden border-0 md:border md:border-slate-200"
      >
        {/* LEFT SIDEBAR: Applicants List */}
        <div className={`w-full md:w-1/3 bg-slate-50 border-r border-slate-200 flex flex-col ${selectedAppId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-slate-100 bg-white flex flex-col gap-1 z-10">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-lg">
                {language === 'en' ? 'Job Chat' : 'ఉద్యోగ చాట్'}
              </h3>
              <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-red-500 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 font-medium truncate">{job?.title}</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {loadingApplicants ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
              </div>
            ) : acceptedApplicants.length === 0 ? (
              <div className="text-center p-6 text-slate-500 text-sm bg-white rounded-2xl border border-dashed border-slate-200 m-2">
                <UsersIcon />
                <p className="mt-2">{language === 'en' ? 'No accepted applicants yet.' : 'ఇంకా ఆమోదించబడిన దరఖాస్తుదారులు లేరు.'}</p>
              </div>
            ) : (
              acceptedApplicants.map(app => (
                <div 
                  key={app.id}
                  onClick={() => {
                    setSelectedAppId(app.id);
                    setSelectedRecipientId(app.userId);
                    setSelectedRecipientName(app.userName);
                  }}
                  className={`p-3 rounded-2xl cursor-pointer transition-all mb-1 ${
                    selectedAppId === app.id
                      ? 'bg-emerald-100/50 border border-emerald-200 shadow-sm' 
                      : 'hover:bg-white border border-transparent hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm shrink-0">
                      {app.userName?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{app.userName}</h4>
                      <p className="text-[11px] text-slate-500 truncate">{app.phone} • {app.area}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR: Chat Area */}
        <div className={`w-full md:w-2/3 flex flex-col bg-slate-50 relative ${!selectedAppId ? 'hidden md:flex' : 'flex'}`}>
          {!selectedAppId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-6 relative w-full h-full bg-white md:bg-slate-50">
              <MessageCircle className="w-16 h-16 mb-4 opacity-30 text-emerald-600" />
              <p className="font-medium">{language === 'en' ? 'Select an applicant from the left to start messaging' : 'సందేశం పంపడానికి ఎడమవైపు నుండి ఒక దరఖాస్తుదారుని ఎంచుకోండి'}</p>
            </div>
          ) : (
            <>
              {/* Message Header */}
              <div className="p-4 border-b border-slate-100 bg-white flex justify-between items-center shadow-sm relative z-10 shrink-0">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setSelectedAppId(null)}
                    className="md:hidden -ml-2 p-2 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg border border-emerald-200">
                    {selectedRecipientName?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm md:text-base leading-tight">{selectedRecipientName}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <p className="text-[11px] text-emerald-600 font-medium">Applicant</p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-red-500 rounded-full hover:bg-slate-100 transition-colors hidden md:block"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-4 md:p-5 relative bg-[#f1f5f9]">
                {loadingMessages ? (
                  <div className="flex h-full items-center justify-center">
                    <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-slate-500 text-sm bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100">
                      {language === 'en' ? `Say hello to ${selectedRecipientName}!` : `${selectedRecipientName} తో సంభాషణ ప్రారంభించడానికి నమస్తే చెప్పండి!`}
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
                              {isMe ? (language === 'en' ? 'You' : 'మీరు') : selectedRecipientName}
                            </span>
                          )}
                          <div
                            className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm md:text-base relative group shadow-sm ${
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

              {/* Message Input Box */}
              <div className="border-t border-slate-200 bg-white p-3 md:p-4 shrink-0">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={language === 'en' ? 'Type a message...' : 'సందేశాన్ని టైప్ చేయండి...'}
                    rows={1}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 outline-none focus:border-emerald-500 focus:bg-white transition-all resize-none max-h-32 text-sm md:text-base placeholder:text-slate-400 font-medium"
                    style={{ minHeight: '48px' }}
                    onInput={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white p-3 rounded-2xl flex items-center justify-center transition-all h-[48px] w-[48px] self-end shrink-0 shadow-sm active:scale-95"
                  >
                    {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

// Helper icon
const UsersIcon = () => (
  <svg className="w-10 h-10 text-slate-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

export default GigChatModal;
