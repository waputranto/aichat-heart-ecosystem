import { useState } from 'react'
import ProductInventory from './components/ProductInventory'
import ChatInterface from './components/ChatInterface'
import { Package, MessageSquare } from 'lucide-react'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('inventory')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-gray-800">AiChat Heart Ecosystem</h1>
          <p className="text-gray-600 mt-1">Manajemen Inventaris dengan Bantuan AI</p>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`py-4 px-2 font-semibold flex items-center gap-2 border-b-2 transition ${
                activeTab === 'inventory'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <Package size={20} />
              Inventaris
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`py-4 px-2 font-semibold flex items-center gap-2 border-b-2 transition ${
                activeTab === 'chat'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <MessageSquare size={20} />
              AI Chat
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'inventory' && <ProductInventory />}
        {activeTab === 'chat' && <ChatInterface />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm text-gray-600">
          <p>&copy; 2026 AiChat Heart Ecosystem. All rights reserved.</p>
          <p className="mt-2">Decoupled SPA dengan REST API | Node.js v24.11.1 | Prisma ORM</p>
        </div>
      </footer>
    </div>
  )
}

export default App

