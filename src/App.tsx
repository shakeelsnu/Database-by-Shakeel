import React, { useState } from 'react';
import { BarChart3, Settings, Calendar } from 'lucide-react';
import AdminLogin from './components/AdminLogin';
import FileUpload from './components/FileUpload';
import SearchSection from './components/SearchSection';
import CustomModal from './components/CustomModal';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useIPAddress } from './hooks/useIPAddress';
import { FileData } from './types';

function App() {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [files, setFiles] = useLocalStorage<FileData[]>('excelFilesData', []);
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '' });
  const [pageLoadTime] = useState(new Date().toLocaleString());
  const userIP = useIPAddress();

  const toggleAdmin = () => {
    setShowAdminLogin(!showAdminLogin);
  };

  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
  };

  const showAlert = (message: string, title: string = 'Notification') => {
    setModal({ isOpen: true, title, message });
  };

  const closeModal = () => {
    setModal({ isOpen: false, title: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-cyan-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-blue-600 drop-shadow-sm">
              Excel Search Dashboard
            </h1>
          </div>
          <p className="text-lg text-gray-600">By Shakeel</p>
        </div>

        {/* Admin Toggle Button */}
        <div className="mb-6">
          <button
            onClick={toggleAdmin}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 shadow-md"
          >
            <Settings className="w-4 h-4" />
            Admin Mode
          </button>
        </div>

        {/* Admin Login */}
        {showAdminLogin && !isAdminLoggedIn && (
          <div className="mb-6">
            <AdminLogin 
              onLogin={handleAdminLogin} 
              onClose={() => setShowAdminLogin(false)} 
            />
          </div>
        )}

        {/* Admin Panel */}
        {isAdminLoggedIn && (
          <div className="mb-6">
            <FileUpload 
              files={files} 
              onFilesUpdate={setFiles} 
              userIP={userIP} 
            />
          </div>
        )}

        {/* Timestamp */}
        <div className="mb-6 flex items-center gap-2 text-gray-500 italic">
          <Calendar className="w-4 h-4" />
          <span>Page loaded: {pageLoadTime}</span>
        </div>

        {/* Search Section */}
        <SearchSection files={files} />

        {/* Custom Modal */}
        <CustomModal
          isOpen={modal.isOpen}
          onClose={closeModal}
          title={modal.title}
          message={modal.message}
        />
      </div>
    </div>
  );
}

export default App;