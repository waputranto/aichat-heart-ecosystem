/**
 * ChatInterface Component
 * AI Chat with product management assistance
 */

import { useState, useEffect, useRef } from 'react';
import chatService from '../services/chat';
import userService from '../services/users';
import { Send, MessageCircle, AlertCircle } from 'lucide-react';

export function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
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
      setIsRegistering(false);
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

    try {
      const result = await chatService.sendMessage(userId, userMessage);
      const chat = result?.chat || {
        id: `${Date.now()}`,
        message: userMessage,
        response: result?.aiResponse || 'Respons AI tidak valid. Silakan coba lagi.',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, chat]);
    } catch (err) {
      setError(err.message || 'Gagal mengirim pesan');
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
      <div className="flex items-center justify-center min-h-96 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-center mb-6">
            <MessageCircle size={32} className="text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800 ml-3">AiChat</h2>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Password (minimal 8 karakter)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
              disabled={loading}
            />
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertCircle size={20} />
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Mulai Chat'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-4">
            Daftar akun baru untuk memulai percakapan dengan AI
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-96 bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <MessageCircle size={24} className="text-blue-600" />
          <h3 className="text-lg font-semibold">AiChat Assistant</h3>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
            <p>Mulai percakapan dengan AI untuk bantuan manajemen inventaris</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id}>
            {/* User Message */}
            <div className="flex justify-end mb-2">
              <div className="bg-blue-600 text-white rounded-lg px-4 py-2 max-w-xs lg:max-w-md">
                <p className="text-sm">{msg.message}</p>
              </div>
            </div>
            {/* AI Response */}
            <div className="flex justify-start mb-4">
              <div className="bg-gray-200 text-gray-800 rounded-lg px-4 py-2 max-w-xs lg:max-w-md">
                <p className="text-sm">{msg.response}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {new Date(msg.createdAt).toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </div>
        ))}

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
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}

export default ChatInterface;
