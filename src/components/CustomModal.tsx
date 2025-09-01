import React from 'react';
import { X } from 'lucide-react';

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export default function CustomModal({ isOpen, onClose, title, message }: CustomModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg border shadow-xl max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="border-b border-gray-200 pb-3 mb-4">
          <h2 className="text-xl font-semibold text-blue-600">{title}</h2>
        </div>
        
        <p className="text-gray-700 text-center">{message}</p>
      </div>
    </div>
  );
}