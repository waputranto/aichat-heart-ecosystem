/**
 * ChatInterface Component
 * AI Chat with product management assistance and modern chat bubbles
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import chatService from '../services/chat';
import userService from '../services/users';
import { Send, MessageCircle, AlertCircle, Bot, User, Loader2 } from 'lucide-react';

export function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const messagesEndRef = useRef(null);

  // Initialize user
  useEffect(() => {
    const currentUser = userService.getCurrentUser();
    if (currentUser) {
      setUserId(currentUser);
      loadChatHistory(currentUser);
    }
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChatHistory = async (uid) => {
    try {
      const history = await chatService.getUserChatHistory(uid);
      setMessages(history);
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Username dan password harus diisi');
      return;
    }
    if (password.length < 8) {
      setError('Password harus minimal 8 karakter');
      return;
    }

    try {
      setLoading(true);
      const user = await userService.register({ username, password });
      userService.setCurrentUser(user.id);
      setUserId(user.id);
      setUsername('');
      setPassword('');
      setError(null);
    } catch (err) {
      setError(err.data?.message || err.message || 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !userId) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);
    setError(null);

    // Add user message immediately
    const tempMessage = {
      id: `temp-${Date.now()}`,
      message: userMessage,
      response: '',
      createdAt: new Date().toISOString(),
      isLoading: true,
    };
    setMessages((prev) => [...prev, tempMessage]);

    try {
      const result = await chatService.sendMessage(userId, userMessage);
      const chat = result?.chat || {
        id: `${Date.now()}`,
        message: userMessage,
        response: result?.aiResponse || 'Respons AI tidak valid. Silakan coba lagi.',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => prev.map(msg =>
        msg.id === tempMessage.id ? { ...chat, isLoading: false } : msg
      ));
    } catch (err) {
      setError(err.message || 'Gagal mengirim pesan');
      setMessages((prev) => prev.filter(msg => msg.id !== tempMessage.id));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    userService.logout();
    setUserId(null);
    setMessages([]);
  };

  if (!userId) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center min-h-96 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4"
      >
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center mb-6"
          >
            <MessageCircle size={32} className="text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800 ml-3">AiChat</h2>
          </motion.div>

          <form onSubmit={handleRegister} className="space-y-4">
            <motion.input
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
              disabled={loading}
            />
            <motion.input
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              type="password"
              placeholder="Password (minimal 8 karakter)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
              disabled={loading}
            />
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2"
                >
                  <AlertCircle size={20} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Loading...
                </>
              ) : (
                'Mulai Chat'
              )}
            </motion.button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-4">
            Daftar akun baru untuk memulai percakapan dengan AI
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col h-96 md:h-[500px] bg-white rounded-lg shadow-sm border border-gray-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <MessageCircle size={24} className="text-blue-600" />
          <h3 className="text-lg font-semibold">AiChat Assistant</h3>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="text-sm bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700"
        >
          Logout
        </motion.button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2"
            >
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center text-gray-500 py-8"
          >
            <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
            <p>Mulai percakapan dengan AI untuk bantuan manajemen inventaris</p>
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-2"
            >
              {/* User Message */}
              <div className="flex justify-end">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-blue-600 text-white rounded-2xl rounded-br-md px-4 py-2 max-w-xs sm:max-w-md shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <User size={16} />
                    <span className="text-xs opacity-75">You</span>
                  </div>
                  <p className="text-sm">{msg.message}</p>
                </motion.div>
              </div>

              {/* AI Response */}
              <div className="flex justify-start">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gray-100 text-gray-800 rounded-2xl rounded-bl-md px-4 py-2 max-w-xs sm:max-w-md shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Bot size={16} />
                    <span className="text-xs text-gray-600">AI Assistant</span>
                  </div>
                  {msg.isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin text-blue-600" />
                      <span className="text-sm text-gray-600">Sedang memproses...</span>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm">{msg.response}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(msg.createdAt).toLocaleString('id-ID')}
                      </p>
                    </>
                  )}
                </motion.div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4 flex gap-2">
        <input
          type="text"
          placeholder="Tanya AI tentang inventaris..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
        >
          <Send size={20} />
        </motion.button>
      </form>
    </motion.div>
  );
}

export default ChatInterface;
