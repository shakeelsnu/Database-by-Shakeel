import React, { useState } from 'react';
import { Eye, EyeOff, Shield } from 'lucide-react';

interface AdminLoginProps {
  onLogin: () => void;
  onClose: () => void;
}

export default function AdminLogin({ onLogin, onClose }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (username.toLowerCase().trim() === 'shakeel' && password.toLowerCase().trim() === '9332') {
      onLogin();
      onClose();
      setError('');
    } else {
      setError('Incorrect username or password.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="bg-pink-50 p-6 rounded-lg shadow-md border border-pink-200">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-blue-600">Admin Login</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        
        {error && (
          <div className="text-red-500 text-sm font-medium">{error}</div>
        )}
        
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Login
        </button>
      </div>
    </div>
  );
}